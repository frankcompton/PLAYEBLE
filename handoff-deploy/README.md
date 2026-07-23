# PLAYEBLE designer deploy handoff

This folder contains the creative source and a direct SSH deploy command.

Open `index.html` in a browser to preview the creative.

Editable files:

- `index.html`
- `style.css`
- `config.js`
- `sfx.js`
- `fx.js`
- `script.js`
- `main.js`
- `assets/`
- `node_modules/`
- `tools/node-win-x64/node.exe`
- `dev.cmd`
- `build.cmd`
- `single.cmd`
- `deploy.cmd`
- `dev.sh`
- `build.sh`
- `deploy.sh`

Run a local preview server:

Windows:

```bat
dev.cmd
```

macOS:

```bash
./dev.sh
```

Build the production `dist/` folder:

Windows:

```bat
build.cmd
```

macOS:

```bash
./build.sh
```

Deploy to the VPS:

Windows:

```bat
deploy.cmd
```

macOS:

```bash
./deploy.sh
```

The launchers use system Node.js first. On Windows, if Node.js is not installed, they use `tools/node-win-x64/node.exe`.

The deploy command asks for a project name. That name becomes the URL folder:

```text
Project name for URL: casino-demo
http://132.243.19.25/casino-demo/
```

The SSH key and `.env.local` are already included in this handoff.
Keep `.secrets/vps_key` private: anyone with this file can deploy to the VPS.

You can also skip the prompt:

```bash
./deploy.sh --project casino-demo
```