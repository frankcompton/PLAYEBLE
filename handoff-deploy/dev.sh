#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js was not found. Install Node.js for macOS to run the local server." >&2
  exit 1
fi
node node_modules/vite/bin/vite.js --host 127.0.0.1
