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
            "",
            "Build the production `dist/` folder:",
            "",
            "```bash",
            "npm run build",
            "```",
            "",
            "Deploy to the VPS:",
            "",
            "```bash",
            "npm run deploy",
            "```",
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
            "npm run deploy -- --project casino-demo",
            "```"
        ].join("\n"),
        "utf8"
    );

    await removeDsStoreFiles(handoffDir);
    console.log(`Created ${path.relative(rootDir, handoffDir)}`);
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
