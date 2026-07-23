import { access, cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { bundleLocalScripts } from "./local-build-utils.mjs";

const rootDir = process.cwd();
const handoffDir = path.join(rootDir, "handoff");
const pixiSourcePath = await resolvePixiSourcePath();

const files = [
    "index.html",
    "style.css",
    "config.js",
    "sfx.js",
    "fx.js",
    "script.js",
    "main.js",
    "build.mjs",
    "local-build-utils.mjs",
    "package-lock.json"
];

const directories = [
    "assets"
];

async function main() {
    await rm(handoffDir, { recursive: true, force: true });
    await mkdir(handoffDir, { recursive: true });

    for (const file of files) {
        await cp(path.join(rootDir, file), path.join(handoffDir, file));
    }

    for (const directory of directories) {
        await cp(
            path.join(rootDir, directory),
            path.join(handoffDir, directory),
            { recursive: true }
        );
    }

    await cp(
        pixiSourcePath,
        path.join(handoffDir, "assets", "pixi.min.js")
    );

    await mkdir(path.join(handoffDir, "public", "assets"), { recursive: true });

    await cp(
        pixiSourcePath,
        path.join(handoffDir, "public", "assets", "pixi.min.js")
    );

    await cp(
        path.join(rootDir, "node_modules"),
        path.join(handoffDir, "node_modules"),
        { recursive: true }
    );

    await copyWindowsNodeRuntime(handoffDir);
    await writeLaunchers(handoffDir, false);

    await writeFile(
        path.join(handoffDir, "package.json"),
        JSON.stringify({
            name: "playeble-handoff",
            private: true,
            version: "1.0.0",
            type: "module",
            scripts: {
                build: "node build.mjs"
            },
            devDependencies: {
                vite: "^6.0.0"
            }
        }, null, 2) + "\n",
        "utf8"
    );

    await writeFile(
        path.join(handoffDir, "assets", "app.js"),
        await bundleLocalScripts(rootDir),
        "utf8"
    );

    const htmlSource = await readFile(path.join(rootDir, "index.html"), "utf8");
    const htmlOutput = htmlSource.replace(
        /<script type="module" src="main\.js"><\/script>/,
        `<script src="assets/app.js"></script>`
    );

    await writeFile(path.join(handoffDir, "index.html"), htmlOutput, "utf8");

    await writeFile(
        path.join(handoffDir, "README.md"),
        [
            "# PLAYEBLE handoff",
            "",
            "This folder contains the clean creative source for design handoff.",
            "",
            "Open `index.html` in a browser to preview the creative.",
            "",
            "Editable files:",
            "",
            "- `index.html`",
            "- `style.css`",
            "- `config.js`",
            "- `sfx.js`",
            "- `fx.js`",
            "- `script.js`",
            "- `main.js`",
            "- `build.mjs`",
            "- `package.json`",
            "- `assets/`",
            "- `node_modules/`",
            "- `tools/node-win-x64/node.exe`",
            "- `build.cmd`",
            "- `build.sh`",
            "- `assets/app.js` is a readable, non-minified browser bundle used by `index.html`.",
            "",
            "To rebuild the production `dist/` folder inside this handoff:",
            "",
            "Windows:",
            "",
            "```bat",
            "build.cmd",
            "```",
            "",
            "macOS:",
            "",
            "```bash",
            "./build.sh",
            "```",
            "",
            "The launchers use system Node.js first. On Windows, if Node.js is not installed, they use `tools/node-win-x64/node.exe`.",
            "",
            "Deployment, GitHub Actions, Git metadata, local tokens, and build tooling are intentionally excluded."
        ].join("\n"),
        "utf8"
    );

    await removeDsStoreFiles(handoffDir);
    console.log(`Created ${path.relative(rootDir, handoffDir)}`);
}

async function copyWindowsNodeRuntime(targetDir) {
    if (process.platform !== "win32") {
        return;
    }

    await mkdir(path.join(targetDir, "tools", "node-win-x64"), { recursive: true });
    await cp(process.execPath, path.join(targetDir, "tools", "node-win-x64", "node.exe"));
}

async function writeLaunchers(targetDir, includeDeploy) {
    const windowsLines = [
        "@echo off",
        "setlocal",
        "cd /d \"%~dp0\"",
        "where node >nul 2>nul",
        "if %ERRORLEVEL% EQU 0 (",
        "  node build.mjs",
        "  goto done",
        ")",
        "set \"NODE_BIN=%~dp0tools\\node-win-x64\\node.exe\"",
        "if not exist \"%NODE_BIN%\" (",
        "  echo Node.js was not found. Install Node.js or keep tools\\node-win-x64\\node.exe in this folder.",
        "  exit /b 1",
        ")",
        "\"%NODE_BIN%\" build.mjs",
        ":done",
        "pause"
    ];

    await writeFile(path.join(targetDir, "build.cmd"), windowsLines.join("\r\n") + "\r\n", "utf8");

    const shellLines = [
        "#!/usr/bin/env bash",
        "set -e",
        "cd \"$(dirname \"$0\")\"",
        "if ! command -v node >/dev/null 2>&1; then",
        "  echo \"Node.js was not found. Install Node.js for macOS to build this handoff.\" >&2",
        "  exit 1",
        "fi",
        "node build.mjs"
    ];

    await writeFile(path.join(targetDir, "build.sh"), shellLines.join("\n") + "\n", "utf8");
    await chmodIfAvailable(path.join(targetDir, "build.sh"));

    if (!includeDeploy) {
        return;
    }
}

async function chmodIfAvailable(filePath) {
    try {
        const { chmod } = await import("node:fs/promises");
        await chmod(filePath, 0o755);
    } catch {
        // Windows can ignore chmod failures for handoff shell helpers.
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

async function resolvePixiSourcePath() {
    const candidates = [
        path.join(rootDir, "assets", "pixi.min.js"),
        path.join(rootDir, "public", "assets", "pixi.min.js")
    ];

    for (const candidate of candidates) {
        try {
            await access(candidate);
            return candidate;
        } catch {
            // Try the next known project layout.
        }
    }

    throw new Error("Could not find pixi.min.js in assets/ or public/assets/.");
}

async function removeDsStoreFiles(dir) {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            await removeDsStoreFiles(fullPath);
            continue;
        }

        if (entry.name === ".DS_Store") {
            await rm(fullPath, { force: true });
        }
    }
}
