import { exec } from "child_process";
import { addIcon, FileSystemAdapter, MarkdownView, type Menu, Plugin, type TAbstractFile } from "obsidian";
import type { } from "obsidian-typings";
import { DEFAULT_SETTINGS, type OpenAntigravitySettings, OpenAntigravitySettingsTab } from "./settings";

type HotReloadPlugin = Plugin & {
    // https://github.com/pjeby/hot-reload/blob/0.1.11/main.js#L70
    enabledPlugins: Set<string>;
};

export default class OpenAntigravity extends Plugin {
    static iconId = "antigravity-logo";
    // Using a generic rocket icon for antigravity
    static iconSvgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
  <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
  <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
</svg>
`;

    DEV = false;

    ribbonIcon?: HTMLElement;
    settings!: OpenAntigravitySettings;

    readonly logTag = `[${this.manifest.id}]`;

    override async onload(): Promise<void> {
        console.log(`Loading ${this.manifest.name} plugin`);
        addIcon(OpenAntigravity.iconId, OpenAntigravity.iconSvgContent);
        await this.loadSettings();
        this.refreshIconRibbon();

        this.addSettingTab(new OpenAntigravitySettingsTab(this.app, this));

        this.addCommand({
            id: "open-antigravity",
            name: "Open as Antigravity workspace",
            callback: this.openAntigravity.bind(this),
        });

        this.addCommand({
            id: "open-antigravity-via-url",
            name: "Open as Antigravity workspace using a antigravity:// URL",
            callback: this.openAntigravityUrl.bind(this),
        });

        this.registerEvent(this.app.workspace.on("file-menu", this.fileMenuHandler.bind(this)));

        const hotReloadPlugin = this.app.plugins.getPlugin("hot-reload") as HotReloadPlugin | null;
        this.DEV = hotReloadPlugin?.enabledPlugins.has(this.manifest.id) ?? false;

        if (this.DEV) {
            this.addCommand({
                id: "open-antigravity-reload",
                name: "Reload the plugin in dev",
                callback: this.reload.bind(this),
            });

            this.addCommand({
                id: "open-antigravity-reset-settings",
                name: "Reset plugins settings to default in dev",
                callback: this.resetSettings.bind(this),
            });
        }
    }

    openAntigravity(file: TAbstractFile | null = this.app.workspace.getActiveFile()): void {
        if (!(this.app.vault.adapter instanceof FileSystemAdapter)) {
            return;
        }
        const { executeTemplate } = this.settings;

        const vaultPath = this.app.vault.adapter.getBasePath();
        const filePath = file?.path ?? "";
        const folderPath = file?.parent?.path ?? "";

        const cursor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor.getCursor();
        const line = (cursor?.line ?? 0) + 1;
        const ch = (cursor?.ch ?? 0) + 1;

        let command = executeTemplate.trim() === "" ? DEFAULT_SETTINGS.executeTemplate : executeTemplate;
        command = command
            .replaceAll("{{vaultpath}}", vaultPath)
            .replaceAll("{{filepath}}", filePath)
            .replaceAll("{{folderpath}}", folderPath)
            .replaceAll("{{line}}", line.toString())
            .replaceAll("{{ch}}", ch.toString());

        if (this.DEV) console.log(this.logTag, { command });
        exec(command, (error) => {
            if (error) {
                console.error(`${this.logTag} exec error: ${error.message}`);
            }
        });
    }

    openAntigravityUrl(): void {
        if (!(this.app.vault.adapter instanceof FileSystemAdapter)) {
            return;
        }

        const path = this.app.vault.adapter.getBasePath();
        const file = this.app.workspace.getActiveFile();
        const filePath = file?.path ?? "";
        if (this.DEV) console.log(this.logTag, { settings: this.settings, path, filePath });

        let url = `${this.settings.urlProtocol}://file/${path}`;

        if (this.settings.openFile) {
            url += `/${filePath}`;

            // Similar logic to VSCode: try to open workspace first then file
            const workspacePath = this.settings.workspacePath.replaceAll("{{vaultpath}}", path);
            window.open(`${this.settings.urlProtocol}://file/${workspacePath}`);

            setTimeout(() => {
                if (this.DEV) console.log(this.logTag, { url });
                window.open(url);
            }, 200);
        } else {
            if (this.DEV) console.log(this.logTag, { url });
            window.open(url);
        }
    }

    async loadSettings(): Promise<void> {
        const savedSettings = (await this.loadData()) as OpenAntigravitySettings | null;
        this.settings = Object.assign({}, DEFAULT_SETTINGS, savedSettings);
    }

    async saveSettings(settings: OpenAntigravitySettings = this.settings): Promise<void> {
        await this.saveData(settings);
    }

    refreshIconRibbon(): void {
        this.ribbonIcon?.remove();
        if (this.settings.ribbonIcon) {
            this.ribbonIcon = this.addRibbonIcon(OpenAntigravity.iconId, "Antigravity", () => {
                if (this.settings.ribbonCommandUsesCode) this.openAntigravity();
                else this.openAntigravityUrl();
            });
        }
    }

    fileMenuHandler(menu: Menu, file: TAbstractFile): void {
        if (!this.settings.showFileContextMenuItem) {
            return;
        }

        menu.addItem((item) => {
            item.setTitle("Open in Antigravity")
                .setIcon(OpenAntigravity.iconId)
                .onClick(() => {
                    this.openAntigravity(file);
                });
        });
    }

    async reload(): Promise<void> {
        const id = this.manifest.id;
        const plugins = this.app.plugins;
        await plugins.disablePlugin(id);
        await plugins.enablePlugin(id);
        console.log(`${this.logTag} reloaded`, this);
    }

    async resetSettings(): Promise<void> {
        console.log(this.logTag, { old: this.settings, default: DEFAULT_SETTINGS });
        this.settings = DEFAULT_SETTINGS;
        await this.saveData(this.settings);
    }
}
