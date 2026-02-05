import { type App, PluginSettingTab, Setting } from "obsidian";
import type OpenAntigravity from "./main";

export interface OpenAntigravitySettings {
    ribbonIcon: boolean;
    // use code command if true, otherwise open URL
    ribbonCommandUsesCode: boolean;
    showFileContextMenuItem: boolean;
    executeTemplate: string;
    openFile: boolean;
    urlProtocol: string;
    workspacePath: string;
}

export const DEFAULT_SETTINGS: OpenAntigravitySettings = {
    ribbonIcon: true,
    ribbonCommandUsesCode: true,
    showFileContextMenuItem: true,
    executeTemplate: 'antigravity "{{vaultpath}}" "{{vaultpath}}/{{filepath}}"',
    urlProtocol: "antigravity",
    openFile: true,
    workspacePath: "{{vaultpath}}",
};

export class OpenAntigravitySettingsTab extends PluginSettingTab {
    override plugin: OpenAntigravity;

    constructor(app: App, plugin: OpenAntigravity) {
        super(app, plugin);
        this.plugin = plugin;
    }

    override display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl("h3", { text: "General settings" });

        new Setting(containerEl)
            .setName("Display Ribbon Icon")
            .setDesc("Toggle this OFF if you want to hide the Ribbon Icon.")
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.ribbonIcon).onChange((value) => {
                    this.plugin.settings.ribbonIcon = value;
                    void this.plugin.saveSettings();
                    this.plugin.refreshIconRibbon();
                }),
            );

        new Setting(containerEl)
            .setName("Ribbon opens via 'antigravity' command")
            .setDesc("Toggle this OFF if you'd prefer that the Ribbon Icon opens Antigravity via URL.")
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.ribbonCommandUsesCode).onChange((value) => {
                    this.plugin.settings.ribbonCommandUsesCode = value;
                    void this.plugin.saveSettings();
                }),
            );

        new Setting(containerEl)
            .setName('Display "Open in Antigravity" option for files/folders')
            .setDesc(
                'Toggle this OFF to hide the "Open in Antigravity" option when right-clicking a file/folder.',
            )
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.showFileContextMenuItem).onChange((value) => {
                    this.plugin.settings.showFileContextMenuItem = value;
                    void this.plugin.saveSettings();
                }),
            );

        containerEl.createEl("h3", { text: "Open via 'antigravity' CLI settings" });

        new Setting(containerEl)
            .setName("Template for executing the 'antigravity' command")
            .setDesc(
                "You can use the following variables: '{{vaultpath}}' (absolute), '{{filepath}}' (relative), '{{folderpath}}' (relative), '{{line}}' and '{{ch}}'. Example template: \"'antigravity' '{{vaultpath}}' '{{vaultpath}}/{{filepath}}'\"",
            )
            .addText((text) =>
                text
                    .setPlaceholder(DEFAULT_SETTINGS.executeTemplate)
                    .setValue(this.plugin.settings.executeTemplate || DEFAULT_SETTINGS.executeTemplate)
                    .onChange((value) => {
                        value = value.trim();
                        if (value === "") value = DEFAULT_SETTINGS.executeTemplate;
                        this.plugin.settings.executeTemplate = value;
                        void this.plugin.saveData(this.plugin.settings);
                    }),
            );

        containerEl.createEl("h3", { text: "Open via 'antigravity://' URL settings" });
        containerEl.createEl("p", { text: "Use URL protocol to open Antigravity." });

        new Setting(containerEl)
            .setName("Open current file")
            .setDesc("Open the current file rather than the root of the vault.")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.openFile || DEFAULT_SETTINGS.openFile)
                    .onChange((value) => {
                        this.plugin.settings.openFile = value;
                        void this.plugin.saveData(this.plugin.settings);
                    }),
            );

        new Setting(containerEl)
            .setName("Path to Workspace")
            .setDesc(
                'Defaults to the {{vaultpath}} template variable.',
            )
            .addText((text) =>
                text
                    .setPlaceholder(DEFAULT_SETTINGS.workspacePath)
                    .setValue(this.plugin.settings.workspacePath || DEFAULT_SETTINGS.workspacePath)
                    .onChange((value) => {
                        value = value.trim();
                        if (value === "") value = DEFAULT_SETTINGS.workspacePath;
                        this.plugin.settings.workspacePath = value;
                        void this.plugin.saveData(this.plugin.settings);
                    }),
            );

        new Setting(containerEl)
            .setName("URL protocol")
            .setDesc(
                "You can override the default antigravity:// to other protocol strings",
            )
            .addText((text) =>
                text
                    .setPlaceholder(DEFAULT_SETTINGS.urlProtocol)
                    .setValue(this.plugin.settings.urlProtocol || DEFAULT_SETTINGS.urlProtocol)
                    .onChange((value) => {
                        value = value.trim();
                        if (value === "") value = DEFAULT_SETTINGS.urlProtocol;
                        this.plugin.settings.urlProtocol = value;
                        void this.plugin.saveData(this.plugin.settings);
                    }),
            );
    }
}
