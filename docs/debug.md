● Debug overlays are working across all sections:

  - 35% (Film): Yellow overlay with "3 BIGFILM" label
  - 65% (About): Blue overlay with "6 ABOUT" label

● Done. All 8 sections now have colored debug overlays:

  | Section      | Color   | Index |
  |--------------|---------|-------|
  | hero         | Red     | 1     |
  | logos        | Orange  | 2     |
  | bigFilm      | Yellow  | 3     |
  | filmStories  | Green   | 4     |
  | photoStats   | Cyan    | 5     |
  | about        | Blue    | 6     |
  | services     | Purple  | 7     |
  | finalContact | Magenta | 8     |

  Changes made:
  1. Moved 6 section files from components/ → sections/ for consistency
  2. Updated imports in +page.svelte
  3. Fixed broken relative imports (./SectionLabel.svelte → $lib/components/...)
  4. Added DebugOverlay component to all 8 sections
  5. Fixed bug in debug.ts toggle function

  Toggle: window.toggleDebug() in browser console (starts ON by default)
