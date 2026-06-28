import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const host = process.env.VPS_HOST || "132.243.19.25";
const branch = getCurrentBranch();

if (!branch) {
    console.error("Could not detect the current git branch.");
    process.exit(1);
}

const safeBranch = branch
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

if (!safeBranch) {
    console.error(`Could not build a deploy URL for branch: ${branch}`);
    process.exit(1);
}

const url = branch === "main"
    ? `http://${host}/`
    : `http://${host}/${safeBranch}/`;

console.log(url);

function getCurrentBranch() {
    try {
        return execFileSync("git", ["branch", "--show-current"], {
            encoding: "utf8"
        }).trim();
    } catch {
        const head = readFileSync(".git/HEAD", "utf8").trim();
        const refPrefix = "ref: refs/heads/";

        if (head.startsWith(refPrefix)) {
            return head.slice(refPrefix.length);
        }

        return "";
    }
}
