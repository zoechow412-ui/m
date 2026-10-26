# Shared-office update — 2026-10-26

## Delivered
- Native interactive 4×2 consultant workstations, left navigation, selected-consultant panel, question composer. No screenshot pretending to be UI.
- Eight distinct profile descriptions; selection, in-memory consultant favorites, usage dialog, and existing private-room intake remain functional.
- Composer question carries into the question step after the user chooses a topic. Birth inputs remain empty.
- Existing character sprite poses provide blink animation; CSS provides breathing and light animation. Motion reduction disables these effects.
- WebGPU preflight runs before download consent. Unsupported hardware disables consent/download and gives actionable guidance. No runtime/weights download is initiated by preflight.
- Duplicate punctuation in load errors removed. GPU availability is not a guarantee that memory/model loading succeeds.

## Browser evidence
- All eight workstations clicked and each profile name/method verified.
- Favorite added and opened from favorites dialog.
- Actual IAB browser reproduced no-adapter condition; checkbox and download button disabled, other site controls remain usable.
- Meihua flow: composer question → consultant → enter room → nickname skip → study topic → carried question → context → actual calculation. Result used Hong Kong 2026-10-26 09:58, lunar month 9/day 17/hour index 6. This is an observation, not a fixed default.
- Full report opened; 體用 term detail opened; closed and returned to lobby. Question field empty afterward.
- Desktop 1440×960 and narrow viewport tested; DOM clientWidth and scrollWidth both 375 in the narrow browser capture.

## Automated checks
- browser-model.mjs: 18 checks (mocked lifecycle/preflight, not real generation).
- night-core.cjs: 25 coordinate/timezone/period checks.
- chart-explorer.cjs: 13 checks including 240 Ziwei charts with distinct star definitions.

## Explicit incomplete items
The requested fully illustrated seated-staff art is NOT delivered. Built-in ImageGen was attempted twice with the user's second reference: first network failure, then HTTP 403. No image was returned or saved. No fallback API or paid service used. The UI therefore reuses the existing approved rooms.png and pair1–pair4.png sprites with code-native workstation surfaces; these are standing-source portraits, not newly generated seated poses. This is a structural/interactive improvement, not a claim of a perfect reference match.

Final attempted image prompt: “Website background asset, landscape 1536x1024. Recreate ONLY central office illustration from reference, NOT its user interface. No lettering, no UI, no borders. Same luxurious Hong Kong waterfront night office, purple lanterns, rich dark wood desks, webtoon style. Exactly eight adult male consultants seated behind desks in 2 rows of 4, all clearly visible. Upper quarter skyline windows for live HTML heading. No text.” Built-in image tool mode; failed, no new asset paths.

Browser AI still requires a usable WebGPU adapter and sufficient memory. This update does not supply CPU inference or server-hosted inference. Complete 用神／格局／應期 calculation remains unimplemented and explicitly marked; this visual update does not change those algorithms.
