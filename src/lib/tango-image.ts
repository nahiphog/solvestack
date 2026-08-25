import { drawUrlFooter } from "@/components/sudoku-copy-controls";

type Grid = number[][];

function drawTango(
  ctx: CanvasRenderingContext2D,
  grid: Grid,
  hRel: number[][],
  vRel: number[][],
  ox: number,
  oy: number,
  cell: number,
  gap: number,
) {
  const N = grid.length;
  const step = cell + gap;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = ox + c * step;
      const y = oy + r * step;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y, cell, cell);
      ctx.strokeStyle = "#9ca3af";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, cell, cell);
      const v = grid[r][c];
      if (v === 1 || v === 2) {
        ctx.beginPath();
        ctx.arc(x + cell / 2, y + cell / 2, cell * 0.33, 0, Math.PI * 2);
        ctx.fillStyle = v === 1 ? "#f97316" : "#3b82f6";
        ctx.fill();
        ctx.strokeStyle = v === 1 ? "#c2410c" : "#1e40af";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }
  ctx.fillStyle = "#111111";
  ctx.font = `bold ${Math.round(cell * 0.4)}px ui-sans-serif, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N - 1; c++) {
      const rel = hRel[r]?.[c];
      if (!rel) continue;
      ctx.fillText(rel === 1 ? "=" : "✕", ox + c * step + cell + gap / 2, oy + r * step + cell / 2);
    }
  }
  for (let r = 0; r < N - 1; r++) {
    for (let c = 0; c < N; c++) {
      const rel = vRel[r]?.[c];
      if (!rel) continue;
      ctx.fillText(rel === 1 ? "=" : "✕", ox + c * step + cell / 2, oy + r * step + cell + gap / 2);
    }
  }
}

async function tangoBlob(grids: Grid[], hRel: number[][], vRel: number[][]): Promise<Blob> {
  const cell = 34;
  const gap = 14;
  const pad = 14;
  const label = 20;
  const N = grids[0]?.length ?? 6;
  const gridSize = cell * N + gap * (N - 1);
  const cols = Math.min(grids.length, 3);
  const rows = Math.ceil(grids.length / cols);
  const cw = gridSize + pad * 2;
  const ch = gridSize + label + pad * 2;
  const footer = 26;
  const canvas = document.createElement("canvas");
  canvas.width = cw * cols;
  canvas.height = ch * rows + footer;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  grids.forEach((g, i) => {
    const ox = (i % cols) * cw + pad;
    const oy = Math.floor(i / cols) * ch + pad;
    ctx.fillStyle = "#374151";
    ctx.font = "bold 14px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`Solution #${i + 1}`, ox, oy + label / 2);
    drawTango(ctx, g, hRel, vRel, ox, oy + label, cell, gap);
  });
  drawUrlFooter(ctx, canvas.width, ch * rows + footer / 2, pad, "Solved via ");
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("blob failed"))), "image/png");
  });
}

/** Copies all Tango solutions as one PNG (falls back to download). Returns a status message. */
export async function copyTangoSolutionsAsImage(
  grids: Grid[],
  hRel: number[][],
  vRel: number[][],
): Promise<string> {
  const download = async () => {
    const blob = await tangoBlob(grids, hRel, vRel);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tango-solutions.png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const supported =
    typeof ClipboardItem !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.clipboard?.write;
  if (!supported) {
    await download();
    return "Image copy unsupported — downloaded";
  }
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": tangoBlob(grids, hRel, vRel) }),
    ]);
    return "Copied as image";
  } catch (err) {
    console.error("Copy Tango image failed", err);
    try {
      await download();
      return "Copy blocked — downloaded";
    } catch (e2) {
      console.error("Image download failed", e2);
      return "Copy failed";
    }
  }
}
