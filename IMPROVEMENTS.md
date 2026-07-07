# Planned Improvements (from Riya's feedback, 2026-07-07)

All six done on 2026-07-07. Notes on what changed per item.

1. **Warm fireplace palette.** DONE. Rewrote all 7 region themes in `src/scene/regions.ts` (fog/sky/particle/accent) to one committed warm palette: morning gold to ember battlefield to firelit dusk, no greys/blues/purples. Also warmed `Lighting.ts` (sun/hemi/rim), `Terrain.ts` (snow/rock/moor/mud/track), `Sky.ts` defaults, `Props.ts` rocks, `Library.ts` book spines, and the CSS defaults + page background in `main.css`.

2. **Campfire visual anchor.** DONE. New `src/scene/Campfire.ts`: leaned logs, stone ring, layered additive flame cones that pulse, a flickering warm point light, and rising embers. Three placed in `World.ts` (road start, war camp, summit beside the hero). Removed the old bare unlit campfire PointLight from `Ambient.ts`.

3. **Explicit homepage with story flavor.** DONE. Kept "Rustom Dubash" name and tagline up front. Added a per-section `flavor` field (in-world one-liners) shown under each heading, wired through `types.ts`, `sections.ts`, `OverlayManager.ts`, `overlay.css`.

4. **Commit to First Law theming.** DONE. Covered by the flavor lines in item 3 plus the existing runes/waystones/companions.

5. **Passion legible to non-readers.** DONE. Added `profile.intro` on the Welcome card: "I like reading, and I like building things... one of my favorite worlds... scroll on, and I'll show you around." Rendered via `dispatch-intro`.

6. **Remove resume image at the end.** DONE. Deleted `GhostlyResume.ts` (the rising PDF sprite) and all its wiring in `World.ts`; removed the now-unused `pdfjs-dist` dependency. Contact card keeps only the Download Resume button.
