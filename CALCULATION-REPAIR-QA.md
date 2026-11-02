# Calculation repairs 2026-11-03

This is a partial repair, not acceptance of all eight methods.

## Changed

- Legacy ten-god polarity corrected for wealth, official/killing and resource relationships. Explorer definitions already matched the comparison table.
- Ziwei preserves hour index 12 at 23:xx; returned year stem now follows the lunar-year boundary rather than the Gregorian year.
- Removed the unsupported count-based strong/weak label; complete useful-god/pattern analysis is still unavailable.
- Meihua derives its year branch number from the lunar year.
- Liuren uses an explicit h23 clock.
- Qimen local civil Date API is bound to fixed UTC+08 for current Hong Kong question charts. Epoch values remain real instants; no global Date mutation.
- I Ching now uses Web Crypto to simulate three coins per line, six lines from bottom up. Records 6/7/8/9 values and changes all moving lines. It is not physical casting. Missing crypto returns an error.
- Hexagram data must finish loading (64 records) before hexagram methods or aggregation calculate.
- Aggregation includes seven underlying methods, with no claim of cross-method consensus inference.
- Published browser CPU model has not been upgraded. Pending root model experiments remain outside dist.

## Executed checks

- `node tests/calculation-regressions.cjs`: 100 ten-god pairs, 12 Ziwei hour/day boundaries, 4096 line-state patterns, lunar-year boundary, 3 device zones, seven-method dispatch.
- `node tests/night-core.cjs`: 25 astronomical/timezone checks, not an independent full Vedic reference validation.
- `node tests/chart-explorer.cjs`: 13 UI content checks including 240 sample natal charts; not a full Ziwei rule oracle.
- `node tests/browser-model.mjs`: 24 mocked lifecycle tests; no real model quality certification.
- Seat and draft-answer checks pass.
- Browser: local I Ching lobby → room → family topic → question → casting → full report. Verified recorded line values and clickable explanations.

## Still incomplete

- Full BaZi pattern, seasonal strength, useful-god, complete interactions and timed event inference.
- Full Ziwei transit/decade/year/month interpretation and all school/date boundaries.
- Classical I Ching text and 384 line statements are not fully collated; current hexagram explanations include unreviewed legacy commentary. Multi-moving-line interpretation is not implemented.
- Vedic nodes, subdivisions, subperiods and transit triggers.
- All Qimen schools and independent solar-term edge references.
- Genuine chart-specific open-ended dialogue and independent cross-method reasoning.
- Full browser acceptance for eight methods and every term/palace.

Plugin-management query `紫微 八字 astrology ephemeris` returned zero entries on this run. No plugin was installed and no external expert acceptance is claimed.
