import { writable } from 'svelte/store';

// Toggle debug overlays via console: window.toggleDebug()
export const debugMode = writable(true); // Start enabled for debugging

// Section debug colors (semi-transparent)
export const DEBUG_COLORS: Record<string, { color: string; index: number }> = {
  hero:         { color: 'rgba(255, 0, 0, 0.3)',     index: 1 },   // Red
  logos:        { color: 'rgba(255, 165, 0, 0.3)',   index: 2 },   // Orange
  bigFilm:      { color: 'rgba(255, 255, 0, 0.3)',   index: 3 },   // Yellow
  filmStories:  { color: 'rgba(0, 255, 0, 0.3)',     index: 4 },   // Green
  photoStats:   { color: 'rgba(0, 255, 255, 0.3)',   index: 5 },   // Cyan
  about:        { color: 'rgba(0, 0, 255, 0.3)',     index: 6 },   // Blue
  services:     { color: 'rgba(128, 0, 255, 0.3)',   index: 7 },   // Purple
  finalContact: { color: 'rgba(255, 0, 255, 0.3)',   index: 8 },   // Magenta
};

// Make toggle available globally for console access
if (typeof window !== 'undefined') {
  (window as any).toggleDebug = () => {
    debugMode.update(v => {
      console.log('[debug] Debug mode:', !v ? 'ON' : 'OFF');
      return !v;
    });
  };
}
