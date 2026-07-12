import { spawnSync } from "node:child_process";
import { chmodSync } from "node:fs";

export function secureSshKey(keyPath) {
    try {
        chmodSync(keyPath, 0o600);
    } catch (error) {
        if (process.platform !== "win32") {
            throw error;
        }
    }

    if (process.platform !== "win32") {
        return;
    }

    const currentUser = [process.env.USERDOMAIN, process.env.USERNAME]
        .filter(Boolean)
        .join("\\");

    if (!currentUser) {
        console.warn("Could not detect the current Windows user for SSH key permissions.");
        return;
    }

    runIcacls([keyPath, "/inheritance:r"]);
    runIcacls([keyPath, "/grant:r", `${currentUser}:F`]);
}

function runIcacls(args) {
    const result = spawnSync("icacls", args, {
        encoding: "utf8",
        stdio: "pipe"
    });

    if (result.status === 0) {
        return;
    }

    if (result.error?.code === "EPERM") {
        return;
    }

    console.warn("Could not tighten Windows ACL permissions for the SSH key.");
    console.warn((result.stderr || result.stdout || "").trim());
}
