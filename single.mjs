import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { bundleLocalModuleScripts, minifyCss } from "./local-build-utils.mjs";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const singleFileName = "index.single.html";

const mimeTypes = new Map([
    [".css", "text/css"],
    [".js", "application/javascript"],
    [".webp", "image/webp"],
    [".png", "image/png"],
    [".jpg", "image/jpeg"],
    [".jpeg", "image/jpeg"],
    [".gif", "image/gif"],
    [".svg", "image/svg+xml"],
    [".mp3", "audio/mpeg"],
    [".wav", "audio/wav"],
    [".ogg", "audio/ogg"],
    [".ttf", "font/ttf"],
    [".woff", "font/woff"],
    [".woff2", "font/woff2"]
]);

export async function buildSingle(options = {}) {
    const outputFileName = options.outputFileName || singleFileName;
    const shouldMinifyHtml = options.minifyHtml || false;

    await rm(distDir, { recursive: true, force: true });
    await mkdir(distDir, { recursive: true });

    const appModules = await bundleLocalModuleScripts(rootDir);

    let cssSource = await readFile(path.join(rootDir, "style.css"), "utf8");
    cssSource = await inlineAssetReferences(cssSource);

    const cssOutput = minifyCss(cssSource);

    const appScripts = [];

    for (const module of appModules) {
        let source = module.source
            .replace(/https:\/\/google\.com/g, "")
            .replace(/\/\/# sourceMappingURL=.*$/gm, "");

        source = await inlineAssetReferences(source);
        appScripts.push(`<script type="module">\n${source}\n</script>`);
    }

    const pixiSource = await readPixiSource();
    const htmlSource = await readFile(path.join(rootDir, "index.html"), "utf8");
    const htmlWithInlineAssets = await inlineAssetReferences(htmlSource);

    let htmlOutput = htmlWithInlineAssets
        .replace(
            /<link rel="stylesheet" href="style\.css">/,
            `<style>${cssOutput}</style>`
        )
        .replace(
            /<script src="assets\/pixi\.min\.js"><\/script>/,
            `<script>${pixiSource}</script>`
        )
        .replace(
            /<script type="module" src="main\.js"><\/script>/,
            appScripts.join("\n")
        );

    htmlOutput = htmlOutput.replace(/<script src="assets\/pixi\.min\.js"><\/script>/g, "");

    if (shouldMinifyHtml) {
        htmlOutput = minifyHtmlShell(htmlOutput);
    }

    await writeFile(path.join(distDir, outputFileName), htmlOutput, "utf8");

    const sizeBytes = Buffer.byteLength(htmlOutput);
    const sizeMb = sizeBytes / 1024 / 1024;

    console.log(`Created dist/${outputFileName}`);
    console.log(`Size: ${sizeBytes} bytes (${sizeMb.toFixed(2)} MB)`);

    if (sizeBytes > 5 * 1024 * 1024) {
        console.warn("Warning: single HTML is larger than 5 MB.");
    }

    const forbiddenPatterns = [
        /XMLHttpRequest/,
        /\bfetch\s*\(/,
        /https?:\/\//,
        /<script[^>]+src=/i,
        /<link[^>]+href=/i
    ];

    const failedPattern = forbiddenPatterns.find((pattern) => pattern.test(htmlOutput));

    if (failedPattern) {
        console.warn(`Warning: found forbidden pattern ${failedPattern}`);
    }
}

async function readPixiSource() {
    const candidates = [
        path.join(rootDir, "public", "assets", "pixi.min.js"),
        path.join(rootDir, "assets", "pixi.min.js")
    ];

    for (const candidate of candidates) {
        try {
            const source = await readFile(candidate, "utf8");
            return sanitizePixiSource(source);
        } catch {
            // Try the next candidate.
        }
    }

    throw new Error("pixi.min.js was not found in public/assets or assets.");
}

function sanitizePixiSource(source) {
    return source
        .replace(/\/\/# sourceMappingURL=.*$/gm, "")
        .replace(/\bwindow\.location\.href\b/g, "document.baseURI||\"\"")
        .replace(/\bfetch\s*\(/g, "window.__molocoDisabledFetch__(")
        .replace(/https?:\/\/[^"',`)\\\s]+/g, "");
}

function minifyHtmlShell(source) {
    return source
        .replace(/>\s+</g, "><")
        .trim();
}

async function inlineAssetReferences(source) {
    const assetPattern = /assets\/[A-Za-z0-9_./-]+\.(?:webp|png|jpe?g|gif|svg|mp3|wav|ogg|ttf|woff2?|js)/gi;
    const matches = Array.from(new Set(source.match(assetPattern) || []));
    let output = source;

    for (const assetPath of matches) {
        if (assetPath === "assets/pixi.min.js") {
            continue;
        }

        const dataUri = await fileToDataUri(path.join(rootDir, assetPath));
        output = output.split(assetPath).join(dataUri);
    }

    return output;
}

async function fileToDataUri(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    const mimeType = mimeTypes.get(extension) || "application/octet-stream";
    const buffer = await readFile(filePath);
    return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    buildSingle().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
