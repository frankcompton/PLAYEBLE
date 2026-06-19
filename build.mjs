import { build as esbuildBuild, transform } from "esbuild";
import { readFile, writeFile, rm, mkdir, cp, readdir } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const assetsDir = path.join(distDir, "assets");

async function main() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  await cp(path.join(rootDir, "assets"), assetsDir, { recursive: true });
  await cp(
    path.join(rootDir, "public", "assets", "pixi.min.js"),
    path.join(assetsDir, "pixi.min.js")
  );

  await removeDsStoreFiles(distDir);

  await esbuildBuild({
    entryPoints: [path.join(rootDir, "main.js")],
    bundle: true,
    format: "iife",
    platform: "browser",
    target: ["es2018"],
    minify: true,
    outfile: path.join(assetsDir, "app.js")
  });

  const cssSource = await readFile(path.join(rootDir, "style.css"), "utf8");
  const cssResult = await transform(cssSource, {
    loader: "css",
    minify: true
  });

  const htmlSource = await readFile(path.join(rootDir, "index.html"), "utf8");
  const htmlOutput = htmlSource
    .replace(
      /<link rel="stylesheet" href="style\.css">/,
      `<style>${cssResult.code}</style>`
    )
    .replace(
      /<script type="module" src="main\.js"><\/script>/,
      `<script src="./assets/app.js"></script>`
    );

  await writeFile(path.join(distDir, "index.html"), htmlOutput, "utf8");
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
