import { build as esbuildBuild } from "esbuild";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const handoffDir = path.join(rootDir, "handoff");

const files = [
    "index.html",
    "style.css",
    "config.js",
    "sfx.js",
    "fx.js",
    "script.js",
    "main.js",
    "build.mjs",
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

    await esbuildBuild({
        entryPoints: [path.join(rootDir, "main.js")],
        bundle: true,
        format: "iife",
        platform: "browser",
        target: ["es2018"],
        minify: false,
        legalComments: "inline",
        outfile: path.join(handoffDir, "assets", "app.js")
    });

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
            "- `public/assets/pixi.min.js`",
            "- `node_modules/`",
            "- `assets/app.js` is a readable, non-minified browser bundle used by `index.html`.",
            "",
            "To rebuild the production `dist/` folder inside this handoff:",
            "",
            "```bash",
            "npm run build",
            "```",
            "",
            "Deployment, GitHub Actions, Git metadata, local tokens, and build tooling are intentionally excluded."
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
