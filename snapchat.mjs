import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { deflateRawSync } from "node:zlib";
import { buildSingle } from "./single.mjs";

const distDir = path.join(process.cwd(), "dist", "snapchat");
const htmlFile = path.join(distDir, "index.html");
const configFile = path.join(distDir, "config.json");
const zipFile = path.join(distDir, "snapchat_playable.zip");
const maxZipBytes = 5 * 1024 * 1024;

const crcTable = Array.from({ length: 256 }, (_, index) => {
    let value = index;

    for (let bit = 0; bit < 8; bit += 1) {
        value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }

    return value >>> 0;
});

async function main() {
    await buildSingle({
        outputFileName: "snapchat/index.html",
        minifyHtml: true,
        deliveryTarget: "snapchat",
        includeMraidScript: false
    });

    await mkdir(distDir, { recursive: true });
    await writeFile(configFile, JSON.stringify({ orientation: "portrait" }, null, 2), "utf8");

    await createZip(zipFile, [
        {
            name: "index.html",
            data: await readFile(htmlFile)
        },
        {
            name: "config.json",
            data: await readFile(configFile)
        }
    ]);

    const zipStats = await stat(zipFile);
    const zipEntries = await readZipEntryNames(zipFile);
    const nestedEntry = zipEntries.find((entry) => entry.includes("/") || entry.includes("\\"));

    console.log(`Created dist/snapchat/snapchat_playable.zip`);
    console.log(`ZIP size: ${zipStats.size} bytes (${(zipStats.size / 1024 / 1024).toFixed(2)} MB)`);

    if (zipStats.size > maxZipBytes) {
        throw new Error("Snapchat ZIP is larger than 5 MB.");
    }

    if (nestedEntry) {
        throw new Error(`Snapchat ZIP contains nested entry: ${nestedEntry}`);
    }

    if (!zipEntries.includes("index.html") || !zipEntries.includes("config.json") || zipEntries.length !== 2) {
        throw new Error(`Snapchat ZIP must contain only index.html and config.json. Found: ${zipEntries.join(", ")}`);
    }

    console.log(`ZIP entries: ${zipEntries.join(", ")}`);
}

async function createZip(outputPath, entries) {
    const fileParts = [];
    const centralParts = [];
    let offset = 0;

    for (const entry of entries) {
        const nameBuffer = Buffer.from(entry.name);
        const compressedData = deflateRawSync(entry.data, { level: 9 });
        const crc = crc32(entry.data);
        const localHeader = Buffer.alloc(30);

        localHeader.writeUInt32LE(0x04034b50, 0);
        localHeader.writeUInt16LE(20, 4);
        localHeader.writeUInt16LE(0, 6);
        localHeader.writeUInt16LE(8, 8);
        localHeader.writeUInt16LE(0, 10);
        localHeader.writeUInt16LE(0, 12);
        localHeader.writeUInt32LE(crc, 14);
        localHeader.writeUInt32LE(compressedData.length, 18);
        localHeader.writeUInt32LE(entry.data.length, 22);
        localHeader.writeUInt16LE(nameBuffer.length, 26);
        localHeader.writeUInt16LE(0, 28);

        fileParts.push(localHeader, nameBuffer, compressedData);

        const centralHeader = Buffer.alloc(46);

        centralHeader.writeUInt32LE(0x02014b50, 0);
        centralHeader.writeUInt16LE(20, 4);
        centralHeader.writeUInt16LE(20, 6);
        centralHeader.writeUInt16LE(0, 8);
        centralHeader.writeUInt16LE(8, 10);
        centralHeader.writeUInt16LE(0, 12);
        centralHeader.writeUInt16LE(0, 14);
        centralHeader.writeUInt32LE(crc, 16);
        centralHeader.writeUInt32LE(compressedData.length, 20);
        centralHeader.writeUInt32LE(entry.data.length, 24);
        centralHeader.writeUInt16LE(nameBuffer.length, 28);
        centralHeader.writeUInt16LE(0, 30);
        centralHeader.writeUInt16LE(0, 32);
        centralHeader.writeUInt16LE(0, 34);
        centralHeader.writeUInt16LE(0, 36);
        centralHeader.writeUInt32LE(0, 38);
        centralHeader.writeUInt32LE(offset, 42);

        centralParts.push(centralHeader, nameBuffer);
        offset += localHeader.length + nameBuffer.length + compressedData.length;
    }

    const centralOffset = offset;
    const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
    const endRecord = Buffer.alloc(22);

    endRecord.writeUInt32LE(0x06054b50, 0);
    endRecord.writeUInt16LE(0, 4);
    endRecord.writeUInt16LE(0, 6);
    endRecord.writeUInt16LE(entries.length, 8);
    endRecord.writeUInt16LE(entries.length, 10);
    endRecord.writeUInt32LE(centralSize, 12);
    endRecord.writeUInt32LE(centralOffset, 16);
    endRecord.writeUInt16LE(0, 20);

    await writeFile(outputPath, Buffer.concat([...fileParts, ...centralParts, endRecord]));
}

async function readZipEntryNames(filePath) {
    const buffer = await readFile(filePath);
    const names = [];
    let offset = 0;

    while (offset < buffer.length - 4) {
        if (buffer.readUInt32LE(offset) !== 0x04034b50) {
            break;
        }

        const compressedSize = buffer.readUInt32LE(offset + 18);
        const nameLength = buffer.readUInt16LE(offset + 26);
        const extraLength = buffer.readUInt16LE(offset + 28);
        const nameStart = offset + 30;
        const nameEnd = nameStart + nameLength;

        names.push(buffer.subarray(nameStart, nameEnd).toString());
        offset = nameEnd + extraLength + compressedSize;
    }

    return names;
}

function crc32(buffer) {
    let crc = 0xffffffff;

    for (const byte of buffer) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
    }

    return (crc ^ 0xffffffff) >>> 0;
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
