# Fix "Copy board → Image" in the Sudoku solvers

## Diagnosis

Both Sudoku solvers share one component (`src/components/sudoku-copy-controls.tsx`). The String and Text options work; only Image fails, for two reasons visible in the current code:

1. **The image blob is created before the clipboard write.** The handler awaits `canvas.toBlob(...)` first, then calls `navigator.clipboard.write(...)`. By that point the browser no longer treats the call as part of the button click ("transient user activation" has expired), so Safari and iOS reject the write. This is the main failure on the device you're previewing on (mobile Safari).
2. **No fallback when image clipboard isn't supported.** Firefox and older browsers don't implement `ClipboardItem`/image writes at all. The `catch` block only shows "Copy failed" with no alternative, so the button looks broken.

Also, failures are swallowed silently apart from the generic message, so there's no clue which of the two causes hit.

## Fix

- Pass a **promise** of the blob directly into `ClipboardItem` (`new ClipboardItem({ "image/png": blobPromise })`) and call `navigator.clipboard.write` immediately inside the click handler, so the write happens while the click is still "active". Safari supports promise-valued clipboard items.
- Feature-detect: if `ClipboardItem` / `navigator.clipboard.write` is unavailable, fall back to **downloading the PNG** of the board instead, with status text "Image downloaded" so the user still gets the picture.
- Improve the status message on real failures ("Image copy not supported — downloaded instead" vs "Copy failed") and log the underlying error to the console for future debugging.
- No change to the board drawing itself; String/Text copy paths stay as they are.

## Verification

- Confirm in the preview that the Image option produces a clipboard image (or a downloaded PNG on browsers without support) for both the standard and variation Sudoku solvers.

## Technical notes

Only `src/components/sudoku-copy-controls.tsx` changes; `src/routes/index.tsx` keeps using `<SudokuCopyBoard board={board} />` unchanged.
