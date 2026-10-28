# MEW HARVEST — Ocean Secrets integration (108)

## Enter the ocean
- Pan to the south beach and tap **Ocean Secrets** above the small dock.
- Or use **Menu → Explore → Ocean Secrets & beach → Enter Ocean Secrets**.
- Tap shells/relics to swim and collect. Drag to pan; pinch or use +/- to zoom.
- Use air stations to refill oxygen. **Return to farm** restores the farm view.

## Matching presentation
This area uses the same painted/isometric presentation and cream/brown/green labels as the uploaded farm. It is an in-game Canvas 2D area, not the separate Three.js prototype. New original reef and diver illustrations accompany the existing turtle, shell and dock assets.

## Progress and compatibility
- Existing save key and farm fields are unchanged.
- Ocean progress is stored in `S.oceanSecrets` alongside the farm save and is included in normal backups.
- Twelve pearls, three relics, a turtle rescue and sanctuary completion provide one-time coin/XP rewards.
- The original production MEW HARVEST website has not been deployed or modified.
- A different test origin starts with its own save. Use existing Settings backup/import to transfer progress if wanted.
- Service-worker cache revision updated; both new images and module files are precached.

## Files changed
index.html, world.js, coast.js, ui.js, navigation.js, sw.js.
New: ocean.js, ocean.css, art/ocean-reef.webp, art/ocean-diver.webp.

## Validation
JavaScript syntax checks; scripted collection, duplicate-reward protection, completion and exit/re-entry checks. Browser verified farm startup, beach marker, ocean entry, rendering, pearl collection and retained coin reward after reload. Physical Android performance was not measured.

## Art production
Built-in image generation was used for `art/ocean-reef.webp` and `art/ocean-diver.webp`, with the supplied game artwork as style reference.
Reef brief: detailed painted 2.5D isometric underwater map, turquoise water, cream sand, coral gardens, stone arch, wooden wreck and sanctuary; open paths; no UI or characters.
Diver brief: original orange tabby matching the farm cat, blue overalls, teal goggles and tank, flippers, transparent background, three-quarter swimming pose.
