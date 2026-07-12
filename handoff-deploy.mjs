import { chmod, cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const handoffDir = path.join(rootDir, "handoff-deploy");
const sourceKeyPath = path.join(rootDir, ".secrets", "playable_handoff");

const files = [
    "index.html",
    "style.css",
    "config.js",
    "sfx.js",
    "fx.js",
    "script.js",
    "main.js",
    "build.mjs",
    "single.mjs",
    "deploy-project.mjs",
    "local-build-utils.mjs",
    "ssh-key-permissions.mjs",
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

    await mkdir(path.join(handoffDir, "public", "assets"), { recursive: true });
    await mkdir(path.join(handoffDir, ".secrets"), { recursive: true });

    await cp(
        path.join(rootDir, "public", "assets", "pixi.min.js"),
        path.join(handoffDir, "assets", "pixi.min.js")
    );

    await cp(
        path.join(rootDir, "public", "assets", "pixi.min.js"),
        path.join(handoffDir, "public", "assets", "pixi.min.js")
    );

    await cp(
        path.join(rootDir, "node_modules"),
        path.join(handoffDir, "node_modules"),
        { recursive: true }
    );

    await copyWindowsNodeRuntime(handoffDir);
    await writeLaunchers(handoffDir);

    await cp(sourceKeyPath, path.join(handoffDir, ".secrets", "vps_key"));
    await chmod(path.join(handoffDir, ".secrets", "vps_key"), 0o600);

    await writeFile(
        path.join(handoffDir, "package.json"),
        JSON.stringify({
            name: "playeble-designer-deploy",
            private: true,
            version: "1.0.0",
            type: "module",
            scripts: {
                dev: "vite --host 127.0.0.1",
                build: "node build.mjs",
                single: "node single.mjs",
                deploy: "node deploy-project.mjs"
            },
            devDependencies: {
                vite: "^6.0.0"
            }
        }, null, 2) + "\n",
        "utf8"
    );

    await writeFile(
        path.join(handoffDir, ".env.example"),
        [
            "VPS_HOST=132.243.19.25",
            "VPS_USER=playeble_deploy",
            "VPS_SSH_KEY_PATH=.secrets/vps_key",
            "# VPS_PASSWORD=your_ssh_password",
            "VPS_PORT=22",
            "VPS_TARGET_ROOT=/var/www/playeble",
            "VPS_CHOWN=",
            "",
            "# Optional: skip the interactive project-name prompt.",
            "# PROJECT_NAME=my-project"
        ].join("\n") + "\n",
        "utf8"
    );

    await writeFile(
        path.join(handoffDir, ".env.local"),
        [
            "VPS_HOST=132.243.19.25",
            "VPS_USER=playeble_deploy",
            "VPS_SSH_KEY_PATH=.secrets/vps_key",
            "VPS_PORT=22",
            "VPS_TARGET_ROOT=/var/www/playeble",
            "VPS_CHOWN="
        ].join("\n") + "\n",
        "utf8"
    );

    await writeFile(
        path.join(handoffDir, "README.md"),
        [
            "# PLAYEBLE designer deploy handoff",
            "",
            "This folder contains the creative source and a direct SSH deploy command.",
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
            "- `assets/`",
            "- `node_modules/`",
            "- `tools/node-win-x64/node.exe`",
            "- `dev.cmd`",
            "- `build.cmd`",
            "- `single.cmd`",
            "- `deploy.cmd`",
            "- `dev.sh`",
            "- `build.sh`",
            "- `deploy.sh`",
            "",
            "Run a local preview server:",
            "",
            "Windows:",
            "",
            "```bat",
            "dev.cmd",
            "```",
            "",
            "macOS:",
            "",
            "```bash",
            "./dev.sh",
            "```",
            "",
            "Build the production `dist/` folder:",
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
            "Deploy to the VPS:",
            "",
            "Windows:",
            "",
            "```bat",
            "deploy.cmd",
            "```",
            "",
            "macOS:",
            "",
            "```bash",
            "./deploy.sh",
            "```",
            "",
            "The launchers use system Node.js first. On Windows, if Node.js is not installed, they use `tools/node-win-x64/node.exe`.",
            "",
            "The deploy command asks for a project name. That name becomes the URL folder:",
            "",
            "```text",
            "Project name for URL: casino-demo",
            "http://132.243.19.25/casino-demo/",
            "```",
            "",
            "The SSH key and `.env.local` are already included in this handoff.",
            "Keep `.secrets/vps_key` private: anyone with this file can deploy to the VPS.",
            "",
            "You can also skip the prompt:",
            "",
            "```bash",
            "./deploy.sh --project casino-demo",
            "```"
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

async function writeLaunchers(targetDir) {
    await writeFile(
        path.join(targetDir, "dev.cmd"),
        [
            "@echo off",
            "setlocal",
            "cd /d \"%~dp0\"",
            "call \"%~dp0run-node.cmd\" node_modules\\vite\\bin\\vite.js --host 127.0.0.1",
            "pause"
        ].join("\r\n") + "\r\n",
        "utf8"
    );

    await writeFile(
        path.join(targetDir, "build.cmd"),
        [
            "@echo off",
            "setlocal",
            "cd /d \"%~dp0\"",
            "call \"%~dp0run-node.cmd\" build.mjs",
            "pause"
        ].join("\r\n") + "\r\n",
        "utf8"
    );

    await writeFile(
        path.join(targetDir, "single.cmd"),
        [
            "@echo off",
            "setlocal",
            "cd /d \"%~dp0\"",
            "call \"%~dp0run-node.cmd\" single.mjs",
            "pause"
        ].join("\r\n") + "\r\n",
        "utf8"
    );

    await writeFile(
        path.join(targetDir, "deploy.cmd"),
        [
            "@echo off",
            "setlocal",
            "cd /d \"%~dp0\"",
            "if exist \".secrets\\vps_key\" (",
            "  if not exist \"%USERPROFILE%\\.ssh\" mkdir \"%USERPROFILE%\\.ssh\" >nul 2>nul",
            "  copy /Y \".secrets\\vps_key\" \"%USERPROFILE%\\.ssh\\playeble_deploy_key\" >nul 2>nul",
            "  if exist \"%USERPROFILE%\\.ssh\\playeble_deploy_key\" (",
            "    icacls \"%USERPROFILE%\\.ssh\\playeble_deploy_key\" /inheritance:r >nul 2>nul",
            "    icacls \"%USERPROFILE%\\.ssh\\playeble_deploy_key\" /grant:r \"%USERDOMAIN%\\%USERNAME%:F\" >nul 2>nul",
            "    set \"VPS_SSH_KEY_PATH=%USERPROFILE%\\.ssh\\playeble_deploy_key\"",
            "  )",
            ")",
            "call \"%~dp0run-node.cmd\" deploy-project.mjs %*",
            "pause"
        ].join("\r\n") + "\r\n",
        "utf8"
    );

    await writeFile(
        path.join(targetDir, "run-node.cmd"),
        [
            "@echo off",
            "where node >nul 2>nul",
            "if %ERRORLEVEL% EQU 0 (",
            "  node %*",
            "  exit /b %ERRORLEVEL%",
            ")",
            "set \"NODE_BIN=%~dp0tools\\node-win-x64\\node.exe\"",
            "if not exist \"%NODE_BIN%\" (",
            "  echo Node.js was not found. Install Node.js or keep tools\\node-win-x64\\node.exe in this folder.",
            "  exit /b 1",
            ")",
            "\"%NODE_BIN%\" %*",
            "exit /b %ERRORLEVEL%"
        ].join("\r\n") + "\r\n",
        "utf8"
    );

    await writeFile(
        path.join(targetDir, "dev.sh"),
        [
            "#!/usr/bin/env bash",
            "set -e",
            "cd \"$(dirname \"$0\")\"",
            "if ! command -v node >/dev/null 2>&1; then",
            "  echo \"Node.js was not found. Install Node.js for macOS to run the local server.\" >&2",
            "  exit 1",
            "fi",
            "node node_modules/vite/bin/vite.js --host 127.0.0.1"
        ].join("\n") + "\n",
        "utf8"
    );

    await writeFile(
        path.join(targetDir, "build.sh"),
        [
            "#!/usr/bin/env bash",
            "set -e",
            "cd \"$(dirname \"$0\")\"",
            "if ! command -v node >/dev/null 2>&1; then",
            "  echo \"Node.js was not found. Install Node.js for macOS to build this handoff.\" >&2",
            "  exit 1",
            "fi",
            "node build.mjs"
        ].join("\n") + "\n",
        "utf8"
    );

    await writeFile(
        path.join(targetDir, "deploy.sh"),
        [
            "#!/usr/bin/env bash",
            "set -e",
            "cd \"$(dirname \"$0\")\"",
            "if ! command -v node >/dev/null 2>&1; then",
            "  echo \"Node.js was not found. Install Node.js for macOS to deploy this handoff.\" >&2",
            "  exit 1",
            "fi",
            "node deploy-project.mjs \"$@\""
        ].join("\n") + "\n",
        "utf8"
    );

    await chmod(path.join(targetDir, "dev.sh"), 0o755);
    await chmod(path.join(targetDir, "build.sh"), 0o755);
    await chmod(path.join(targetDir, "deploy.sh"), 0o755);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

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
