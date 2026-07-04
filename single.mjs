import { build as esbuildBuild, transform } from "esbuild";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const outputPath = path.join(distDir, "index.single.html");
const singleAppPath = path.join(distDir, "single-app.tmp.js");

const mimeTypes = {
    ".webp": "image/webp",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf"
};

const forbiddenPatterns = [
    /\bfetch\s*\(/i,
    /\bXMLHttpRequest\b/i,
    /https?:\/\//i,
    /<script\b[^>]*\bsrc\s*=/i,
    /<link\b[^>]*\bhref\s*=/i
];

async function main() {
    await rm(distDir, { recursive: true, force: true });
    await mkdir(distDir, { recursive: true });

    await esbuildBuild({
        entryPoints: [path.join(rootDir, "main.js")],
        bundle: true,
        format: "iife",
        platform: "browser",
        target: ["es2018"],
        minify: true,
        outfile: singleAppPath
    });

    const cssSource = await readFile(path.join(rootDir, "style.css"), "utf8");
    const cssWithAssets = await inlineAssetPaths(cssSource);
    const cssResult = await transform(cssWithAssets, {
        loader: "css",
        minify: true
    });

    const appSource = await readFile(singleAppPath, "utf8");
    const appWithAssets = await inlineAssetPaths(appSource);

    const htmlSource = await readFile(path.join(rootDir, "index.html"), "utf8");
    const htmlOutput = htmlSource
        .replace(/<link rel="stylesheet" href="style\.css">/, `<style>${cssResult.code}</style>`)
        .replace(/\s*<script src="assets\/pixi\.min\.js"><\/script>/, "")
        .replace(/<script type="module" src="main\.js"><\/script>/, `<script>${appWithAssets}</script>`);

    assertSingleHtml(htmlOutput);

    await writeFile(outputPath, htmlOutput, "utf8");
    await rm(singleAppPath, { force: true });

    const outputStats = await stat(outputPath);
    const outputSizeMb = outputStats.size / 1024 / 1024;

    console.log(`Single HTML: ${path.relative(rootDir, outputPath)}`);
    console.log(`Size: ${outputSizeMb.toFixed(2)} MB`);

    if (outputStats.size >= 5 * 1024 * 1024) {
        throw new Error("Single HTML is larger than 5 MB.");
    }
}

async function inlineAssetPaths(source) {
    const assetPathPattern = /assets\/[A-Za-z0-9._/-]+\.(?:webp|png|jpe?g|gif|svg|mp3|wav|ogg|woff2?|ttf)/gi;
    const matches = Array.from(new Set(source.match(assetPathPattern) || []));
    let output = source;

    for (const assetPath of matches) {
        const dataUri = await fileToDataUri(path.join(rootDir, assetPath));
        output = output.split(assetPath).join(dataUri);
    }

    return output;
}

async function fileToDataUri(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    const mimeType = mimeTypes[extension];

    if (!mimeType) {
        throw new Error(`Unsupported asset type: ${filePath}`);
    }

    const fileBuffer = await readFile(filePath);
    return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
}

function assertSingleHtml(html) {
    const failures = forbiddenPatterns
        .filter((pattern) => pattern.test(html))
        .map((pattern) => pattern.toString());

    if (failures.length > 0) {
        throw new Error(`Single HTML contains forbidden patterns: ${failures.join(", ")}`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
