# Open in Antigravity

This plugin for [Obsidian](https://obsidian.md/) allows you to open your vault or specific files in **Antigravity**.

## Features

- **Ribbon Button**: One-click access to open the current vault in Antigravity.
- **Context Menu**: Right-click any file or folder in the file explorer to open it in Antigravity.
- **Commands**:
    - `Open as Antigravity workspace`: Launches Antigravity using the CLI command.
    - `Open as Antigravity workspace using a antigravity:// URL`: Launches using the URL protocol.

## Settings

- **Display Ribbon Icon**: Toggle the ribbon button.
- **Ribbon opens via 'antigravity' command**: Choose between CLI command or URL protocol for the ribbon button.
- **Display "Open in Antigravity" option for files/folders**: Toggle the context menu item.
- **Template for executing the 'antigravity' command**: Customize the CLI command.
    - Defaults to: `antigravity "{{vaultpath}}" "{{vaultpath}}/{{filepath}}"`
    - Available variables: `{{vaultpath}}`, `{{filepath}}`, `{{folderpath}}`, `{{line}}`, `{{ch}}`.
- **URL protocol**: Customize the protocol (default: `antigravity`).

## Installation

1.  Download the latest release.
2.  Extract the `main.js`, `manifest.json`, and `styles.css` (if applicable) into your vault's `.obsidian/plugins/obsidian-open-antigravity/` folder.
3.  Reload Obsidian and enable the plugin.

## Development

1.  Clone this repository.
2.  Run `npm install`.
3.  Run `npm run build` to build the plugin.


## Inspiration

This plugin is inspired by the [Open in VS Code](https://github.com/joshuajohnson/obsidian-open-in-vscode) plugin.  


## License

MIT
