
/// <reference types="vite/client" />

declare global {
  interface Window {
    prayerTimeouts: NodeJS.Timeout[];
  }
}

export {};
