# Reconstruction fixes and brutalist refresh

## Reconstruction algorithm
- Prioritize the 77 entries in `flippableCommonWords.json` as first-row candidates.
- Keep the existing sequential Wordle filtering for every later row.
- If no complete sequence is found from those preferred first words, rerun with the full word list so valid results are not lost.

## Validation and result isolation
- Before solving, reject grids where the combined green-and-yellow count decreases from one row to the next.
- Reject grids where any green column stops being green in a later row; include the final all-green answer row in validation.
- Show clear row-specific error messages and do not start the search when validation fails.
- Render Reconstruction results only while Reconstruction is active, and clear its results, selections, page, and errors when switching solvers.

## Visual direction
- Make all button boxes square-cornered, including shared and page-specific controls.
- Shift the shared palette and surfaces toward a high-contrast brutalist style: strong borders, flat fills, hard-edged controls, and restrained hard shadows.
- Preserve puzzle-specific shapes that carry meaning, such as Tango’s colored circles.

## Verification
- Check preferred-first-word solving and fallback behavior.
- Check both validation failures and a valid grid.
- Confirm Reconstruction output disappears after switching solvers.
- Review desktop and mobile views for legibility and non-overlap.

## Technical details
- Import the common-word JSON into the solver module and pass a restricted first-row pool into backtracking before the full-pool fallback.
- Guard the Reconstruction result section with `mode === "reconstruction"` in addition to clearing state in `switchMode`.
- Apply the brutalist foundation through semantic tokens and shared button styling, with minimal route-level overrides for raw controls.
