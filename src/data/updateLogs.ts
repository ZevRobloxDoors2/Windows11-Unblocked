export interface UpdateLog {
  version: string;
  date: string;
  description: string;
  highlights: string[];
}

export const UPDATE_LOGS: UpdateLog[] = [
  {
    version: "V2.6",
    date: "October 2026",
    description: "Major Cloudflare optimization, GTA V performance controls, and theme refinements.",
    highlights: [
      "**Cloudflare Pages & CORS Headers**: Added `_headers` configuration for robust iframe asset delivery and WebGPU support.",
      "**GTA V Optimization Profiles**: Added Efficiency, Balanced, and Quality presets with graphics and FPS cap controls.",
      "**Halloween Theme Toggle**: Optional spooky wallpaper, glowing pumpkin taskbar button, and festive accents.",
      "**Local P2P File Sharing**: Direct peer-to-peer file transfers between nearby devices."
    ]
  },
  {
    version: "V2.0",
    date: "September 2026",
    description: "Discord-style Party voice channels, multi-account system, and cloud sync.",
    highlights: [
      "**Discord-Style Party & Voice**: Real-time WebRTC voice chat rooms with speaking indicators.",
      "**Multi-Account System**: Switch between user profiles with secure PIN codes.",
      "**Cloud Sync & Database**: Firebase Firestore integration for persistent friends and chats.",
      "**Window Multitasking**: Full window management with maximize, minimize, and snap."
    ]
  },
  {
    version: "V1.5",
    date: "August 2026",
    description: "Enhanced emulators, custom wallpapers, and window snapping.",
    highlights: [
      "**Retro Emulators**: Built-in console gaming support.",
      "**Custom Wallpapers**: Import images or paste URLs for custom desktop backgrounds.",
      "**Taskbar & Start Menu**: Fully interactive Windows 11 simulated desktop environment."
    ]
  }
];
