export interface UpdateLogEntry {
  version: string;
  items: string[];
}

export const UPDATE_LOGS: UpdateLogEntry[] = [
  {
    version: "V1.5",
    items: [
      "Added **GTA V and GTA VI** cloud gaming support with lower memory presets.",
      "Introduced **Quick Resume** and window wobbly toggle controls.",
      "Glassy **Update Logs** panel with smooth minimize/maximize animation.",
      "Optimized performance and fixed WebGPU / WebAssembly memory checks."
    ]
  },
  {
    version: "V1.4",
    items: [
      "Added **Halloween Theme** toggle switch in Personalization settings.",
      "Improved **Taskbar Blur** and custom wallpaper importing.",
      "Enhanced Party voice chat and Friend activity feeds."
    ]
  },
  {
    version: "V1.3",
    items: [
      "Integrated **Firebase Authentication** and Cloud SQL backends.",
      "Added proxy management and about:blank cloak features.",
      "Upgraded window snapping and multi-instance management."
    ]
  },
  {
    version: "V1.2",
    items: [
      "Initial release of **Windows 11 Unblocked** web simulator.",
      "Added 50+ unblocked HTML5 games and web apps.",
      "Custom desktop icons, start menu, and notification center."
    ]
  }
];
