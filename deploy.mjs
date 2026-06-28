import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const workflow = "vps.yml";
const host = process.env.VPS_HOST || "132.243.19.25";
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const dryRun = process.argv.includes("--dry-run");
const forceTrigger = process.argv.includes("--force-trigger");
const branch = getCurrentBranch();

if (!branch) {
    console.error("Could not detect the current git branch.");
    process.exit(1);
}

const url = getDeployUrl(branch);

if (dryRun) {
    console.log(`Would push branch ${branch} to origin.`);
    console.log(`Would trigger ${workflow} only if push is already up to date.`);
    console.log(url);
    process.exit(0);
}

warnAboutUncommittedChanges();

const pushResult = run("git", ["push", "-u", "origin", branch]);

if (pushResult.status !== 0) {
    process.exit(pushResult.status ?? 1);
}

const pushOutput = `${pushResult.stdout}\n${pushResult.stderr}`;
const isUpToDate = /Everything up-to-date/i.test(pushOutput);

if (isUpToDate || forceTrigger) {
    await triggerWorkflow(branch);
    console.log(`Triggered ${workflow} for branch ${branch}`);
} else {
    console.log(`Pushed branch ${branch}. GitHub Actions will deploy it automatically.`);
}

console.log(url);

function getDeployUrl(branchName) {
    const safeBranch = toSafeBranch(branchName);
    return branchName === "main"
        ? `http://${host}/`
        : `http://${host}/${safeBranch}/`;
}

function toSafeBranch(branchName) {
    return branchName
        .replace(/[^A-Za-z0-9._-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function getCurrentBranch() {
    try {
        return run("git", ["branch", "--show-current"], { silent: true }).stdout.trim();
    } catch {
        const head = readFileSync(".git/HEAD", "utf8").trim();
        const refPrefix = "ref: refs/heads/";

        if (head.startsWith(refPrefix)) {
            return head.slice(refPrefix.length);
        }

        return "";
    }
}

function getRepoSlug() {
    const remote = getOriginRemote();
    const match = remote.match(/github\.com[:/](.+?)(?:\.git)?$/);

    if (!match) {
        console.error(`Could not detect GitHub repository from origin: ${remote}`);
        process.exit(1);
    }

    return match[1];
}

function getOriginRemote() {
    try {
        return run("git", ["remote", "get-url", "origin"], { silent: true }).stdout.trim();
    } catch {
        const config = readFileSync(".git/config", "utf8");
        const originSection = config.match(/\[remote "origin"\][\s\S]*?(?=\n\[|$)/);
        const urlLine = originSection?.[0].match(/^\s*url\s*=\s*(.+)$/m);

        return urlLine?.[1]?.trim() || "";
    }
}

function warnAboutUncommittedChanges() {
    const status = run("git", ["status", "--short"], { silent: true });

    if (status.stdout.trim()) {
        console.warn("Warning: there are uncommitted changes. Only committed changes can be pushed and deployed.");
    }
}

async function triggerWorkflow(branchName) {
    const gh = spawnSync("gh", ["workflow", "run", workflow, "--ref", branchName], {
        encoding: "utf8"
    });

    if (gh.status === 0) {
        return;
    }

    if (!token) {
        console.error("Push is up to date, so a manual workflow trigger is needed.");
        console.error("Install and login to GitHub CLI with `gh auth login`, or set GH_TOKEN/GITHUB_TOKEN.");
        process.exit(1);
    }

    await triggerWorkflowWithApi(getRepoSlug(), branchName, token);
}

async function triggerWorkflowWithApi(repoSlug, branchName, authToken) {
    const response = await fetch(
        `https://api.github.com/repos/${repoSlug}/actions/workflows/${workflow}/dispatches`,
        {
            method: "POST",
            headers: {
                "Accept": "application/vnd.github+json",
                "Authorization": `Bearer ${authToken}`,
                "X-GitHub-Api-Version": "2022-11-28"
            },
            body: JSON.stringify({ ref: branchName })
        }
    );

    if (response.status !== 204) {
        console.error(`GitHub API returned ${response.status}: ${await response.text()}`);
        process.exit(1);
    }
}

function run(command, args, options = {}) {
    const result = spawnSync(command, args, {
        encoding: "utf8"
    });

    if (!options.silent) {
        process.stdout.write(result.stdout || "");
        process.stderr.write(result.stderr || "");
    }

    if (result.error) {
        throw result.error;
    }

    return result;
}
