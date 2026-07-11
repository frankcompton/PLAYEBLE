import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, renameSync, readFileSync } from "node:fs";

loadLocalEnv();

const host = process.env.VPS_HOST || "132.243.19.25";
const user = process.env.VPS_USER;
const password = process.env.VPS_PASSWORD;
const port = process.env.VPS_PORT || "22";
const targetRoot = process.env.VPS_TARGET_ROOT || "/var/www/playeble";
const chown = process.env.VPS_CHOWN ?? "www-data:www-data";
const branch = getCurrentBranch();
const dryRun = process.argv.includes("--dry-run");
const keyPath = resolveKeyPath();

if (!branch) {
    fail("Could not detect the current git branch.");
}

const safeBranch = toSafeBranch(branch);
const url = getDeployUrl(branch);
const remote = `${user || "<VPS_USER>"}@${host}`;
const remoteTemp = `/tmp/playeble-local-${Date.now()}`;
const remoteTarget = `${targetRoot}/${safeBranch}`;

if (dryRun) {
    console.log("Would run npm run single.");
    console.log("Would publish dist/index.single.html as dist/index.html.");
    console.log(keyPath ? `Would authenticate with SSH key ${keyPath}.` : "Would authenticate with SSH key agent or password.");
    console.log(`Would upload dist to ${remote}:${remoteTemp}`);
    console.log(`Would publish ${remoteTemp} to ${remoteTarget}`);
    console.log(url);
    process.exit(0);
}

if (!user) {
    fail("Set VPS_USER in .env.local or in the terminal environment.");
}

run("npm", ["run", "single"]);
renameSync("dist/index.single.html", "dist/index.html");

runRemote(`rm -rf ${quote(remoteTemp)} && mkdir -p ${quote(remoteTemp)}`);
runUpload();
runRemote(buildPublishScript());

console.log(url);

function getDeployUrl(branchName) {
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

function buildPublishScript() {
    const lines = [
        "set -e",
        `source_dir=${quote(remoteTemp)}`,
        `target_dir=${quote(remoteTarget)}`,
        'tmp_dir="${target_dir}.tmp"',
        'rm -rf "$tmp_dir"',
        'mkdir -p "$tmp_dir"',
        'cp -a "$source_dir/." "$tmp_dir/"',
        'rm -rf "$target_dir"',
        'mv "$tmp_dir" "$target_dir"',
        'rm -rf "$source_dir"'
    ];

    if (chown) {
        lines.push(`chown -R ${quote(chown)} "$target_dir"`);
    }

    return lines.join("\n");
}

function runRemote(script) {
    runWithPassword("ssh", [
        "-p",
        port,
        "-o",
        "StrictHostKeyChecking=accept-new",
        ...keyArgs(),
        remote,
        script
    ]);
}

function runUpload() {
    runWithPassword("scp", [
        "-P",
        port,
        "-o",
        "StrictHostKeyChecking=accept-new",
        ...keyArgs(),
        "-r",
        "dist/.",
        `${remote}:${remoteTemp}/`
    ]);
}

function runWithPassword(command, args) {
    if (keyPath) {
        return run(command, args, { interactive: true });
    }

    if (!password) {
        return run(command, args, { interactive: true });
    }

    const sshpass = spawnSync("sshpass", ["-V"], {
        encoding: "utf8"
    });

    if (sshpass.status !== 0) {
        fail("VPS_PASSWORD is set, but sshpass is not installed. Install sshpass or use SSH key auth.");
    }

    return run("sshpass", ["-e", command, ...args], {
        env: { ...process.env, SSHPASS: password },
        interactive: true
    });
}

function resolveKeyPath() {
    const explicitPath = process.env.VPS_SSH_KEY_PATH;

    if (explicitPath) {
        if (!existsSync(explicitPath)) {
            fail(`VPS_SSH_KEY_PATH does not exist: ${explicitPath}`);
        }

        chmodSync(explicitPath, 0o600);
        return explicitPath;
    }

    const candidates = [
        ".secrets/vps_key",
        ".secrets/playable_handoff"
    ];

    const found = candidates.find((candidate) => existsSync(candidate));

    if (!found) {
        return "";
    }

    chmodSync(found, 0o600);
    return found;
}

function keyArgs() {
    return keyPath
        ? ["-i", keyPath, "-o", "IdentitiesOnly=yes"]
        : [];
}

function loadLocalEnv() {
    let envFile = "";

    try {
        envFile = readFileSync(".env.local", "utf8");
    } catch {
        return;
    }

    for (const line of envFile.split(/\r?\n/)) {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith("#")) {
            continue;
        }

        const separator = trimmed.indexOf("=");

        if (separator === -1) {
            continue;
        }

        const key = trimmed.slice(0, separator).trim();
        const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");

        if (key && !process.env[key]) {
            process.env[key] = value;
        }
    }
}

function run(command, args, options = {}) {
    const result = spawnSync(command, args, {
        encoding: "utf8",
        env: options.env || process.env,
        stdio: options.interactive ? "inherit" : "pipe"
    });

    if (!options.silent && !options.interactive) {
        process.stdout.write(result.stdout || "");
        process.stderr.write(result.stderr || "");
    }

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        process.exitCode = result.status ?? 1;
        throw new Error(`${command} failed.`);
    }

    return result;
}

function quote(value) {
    return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function fail(message) {
    console.error(message);
    process.exitCode = 1;
    throw new Error(message);
}
