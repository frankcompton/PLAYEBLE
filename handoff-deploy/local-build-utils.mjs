import { readFile } from "node:fs/promises";
import path from "node:path";

export async function bundleLocalScripts(rootDir, entryPoint = "main.js") {
    const orderedFiles = await collectLocalScripts(rootDir, entryPoint);

    return orderedFiles
        .map(({ file, source }) => {
            const withoutImports = source.replace(/^\s*import\s+(?:[^"']+\s+from\s+)?["'].+?["'];?\s*$/gm, "");
            const transformed = transformExports(withoutImports);
            const globals = file === "config.js"
                ? ""
                : "const gameConfig = globalThis.gameConfig;\n";

            return [
                `\n;/* ${file.replace(/\\/g, "/")} */`,
                "(() => {",
                "\"use strict\";",
                globals + transformed,
                "})();"
            ].join("\n");
        })
        .join("\n");
}

export async function bundleLocalModuleScripts(rootDir, entryPoint = "main.js") {
    const orderedFiles = await collectLocalScripts(rootDir, entryPoint);

    return orderedFiles.map(({ file, source }) => {
        const withoutImports = source.replace(/^\s*import\s+(?:[^"']+\s+from\s+)?["'].+?["'];?\s*$/gm, "");
        const transformed = transformExports(withoutImports);
        const globals = file === "config.js"
            ? ""
            : "const gameConfig = globalThis.gameConfig;\n";

        return {
            file,
            source: `/* ${file.replace(/\\/g, "/")} */\n${globals}${transformed}`
        };
    });
}

async function collectLocalScripts(rootDir, entryPoint = "main.js") {
    const orderedFiles = [];
    const seen = new Set();

    async function visit(relativeFile) {
        const normalizedFile = normalizeRelativePath(relativeFile);

        if (seen.has(normalizedFile)) {
            return;
        }

        seen.add(normalizedFile);

        const fullPath = path.join(rootDir, normalizedFile);
        const source = await readFile(fullPath, "utf8");
        const imports = Array.from(source.matchAll(/^\s*import\s+(?:[^"']+\s+from\s+)?["'](.+?)["'];?\s*$/gm));

        for (const match of imports) {
            if (!match[1].startsWith(".")) {
                throw new Error(`External import is not supported by the local bundler: ${match[1]}`);
            }

            await visit(path.join(path.dirname(normalizedFile), match[1]));
        }

        orderedFiles.push({ file: normalizedFile, source });
    }

    await visit(entryPoint);

    return orderedFiles;
}

function transformExports(source) {
    return source
        .replace(/\bexport\s+const\s+([A-Za-z_$][\w$]*)\s*=/g, "const $1 = globalThis.$1 =")
        .replace(/\bexport\s+(?=(let|var|function|class)\b)/g, "");
}

export function minifyCss(source) {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\s+/g, " ")
        .replace(/\s*([{}:;,>~])\s*/g, "$1")
        .replace(/;}/g, "}")
        .trim();
}

function normalizeRelativePath(filePath) {
    let normalized = filePath.replace(/\\/g, "/");

    if (!path.extname(normalized)) {
        normalized += ".js";
    }

    return normalized.replace(/^\.\//, "");
}
