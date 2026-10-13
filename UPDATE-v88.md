# MEW HARVEST v88 — Farm Toolkit

## New features
- Farm Toolkit button (📊) in the top bar.
- Live farm overview: level, coins, XP, buildings, fields, cats, served orders and harvests.
- Six achievement-style milestone progress indicators (display-only; no extra rewards).
- Export your current farm save as a JSON file stored on your device.
- Restore a validated MEW HARVEST JSON backup after explicit confirmation.
- Before restoring, a safety copy of the previous save is kept in localStorage under the original SAVE_KEY plus `-before-import`.
- Network/offline status display.

## Existing functionality preserved
The original save key, 50 Island Life features, progression, world, assets and gameplay files remain unchanged. This update does not reset existing player progress.

## Deploy on GitHub Pages
Upload the two new files `farm-tools.js` and `farm-tools.css` into the repository root. Then replace `index.html` and **last** `sw.js` in the root. Do not delete any other files. Refresh the page once or twice after deployment to update the service worker.

## Verification
Node syntax checks passed for all game JS files. Island Life automated tests passed (127 assertions). Offline-update service worker test passed. These tests do not replace real mobile browser testing of save import/export, UI rendering and gameplay.
