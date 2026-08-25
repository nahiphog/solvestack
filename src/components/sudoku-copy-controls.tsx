import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

type Board = string[][];

function boardToString(board: Board): string {
  return board.map(row => row.map(c => (c && c.trim() !== "" ? c.trim() : ".")).join("")).join("");
}

function boardToText(board: Board): string {
  return board.map(row => row.map(c => (c && c.trim() !== "" ? c.trim() : "0")).join(" ")).join("\n");
}

export function siteUrl(): string {
  try {
    return typeof window !== "undefined" ? window.location.href : "";
  } catch {
    return "";
  }
}

/** Draws the site URL at the bottom-right of the canvas inside the given footer band. */
export function drawUrlFooter(ctx: CanvasRenderingContext2D, width: number, baselineY: number, rightPad: number, prefix = "") {
  const url = siteUrl();
  if (!url) return;
  const text = prefix ? `${prefix}${url}` : url;
  ctx.fillStyle = "#6b7280";
  ctx.font = "14px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText(text, width - rightPad, baselineY);
}

async function boardToImageBlob(board: Board): Promise<Blob> {
  const cell = 48;
  const pad = 8;
  const footer = 26;
  const size = cell * 9 + pad * 2;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size + footer;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);


  // Numbers
  ctx.fillStyle = "#111111";
  ctx.font = "bold 26px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = board[r]?.[c];
      if (v && v.trim() !== "") {
        ctx.fillText(v.trim(), pad + c * cell + cell / 2, pad + r * cell + cell / 2);
      }
    }
  }

  // Thin lines
  ctx.strokeStyle = "#9ca3af";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 9; i++) {
    ctx.beginPath();
    ctx.moveTo(pad + i * cell, pad);
    ctx.lineTo(pad + i * cell, pad + 9 * cell);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pad, pad + i * cell);
    ctx.lineTo(pad + 9 * cell, pad + i * cell);
    ctx.stroke();
  }

  // Thick lines (3x3 + outer)
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  for (let i = 0; i <= 9; i += 3) {
    ctx.beginPath();
    ctx.moveTo(pad + i * cell, pad);
    ctx.lineTo(pad + i * cell, pad + 9 * cell);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pad, pad + i * cell);
    ctx.lineTo(pad + 9 * cell, pad + i * cell);
    ctx.stroke();
  }

  drawUrlFooter(ctx, canvas.width, size + footer / 2, pad);

  return await new Promise<Blob>((resolve, reject) => {

    canvas.toBlob(b => (b ? resolve(b) : reject(new Error("blob failed"))), "image/png");
  });
}

export function SudokuCopyBoard({ board }: { board: Board }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string>("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const downloadImage = async () => {
    const blob = await boardToImageBlob(board);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sudoku-board.png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const copy = async (kind: "String" | "Text" | "Image") => {
    try {
      if (kind === "Image") {
        const supported =
          typeof ClipboardItem !== "undefined" &&
          typeof navigator !== "undefined" &&
          !!navigator.clipboard?.write;
        if (!supported) {
          await downloadImage();
          setStatus("Image copy unsupported — downloaded");
          setTimeout(() => setStatus(""), 2500);
          setOpen(false);
          return;
        }
        // Pass a promise so the write starts inside the click's user activation.
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": boardToImageBlob(board) }),
        ]);
      } else {
        const text = kind === "String" ? boardToString(board) : boardToText(board);
        await navigator.clipboard.writeText(text);
      }
      setStatus(`Copied as ${kind.toLowerCase()}`);
      setTimeout(() => setStatus(""), 1500);
      setOpen(false);
    } catch (err) {
      console.error("Copy board failed", err);
      if (kind === "Image") {
        try {
          await downloadImage();
          setStatus("Copy blocked — downloaded");
          setTimeout(() => setStatus(""), 2500);
          setOpen(false);
          return;
        } catch (e2) {
          console.error("Image download failed", e2);
        }
      }
      setStatus("Copy failed");
      setTimeout(() => setStatus(""), 1500);
    }
  };

  return (
    <div ref={wrapRef} className="relative inline-block">
      <Button type="button" variant="outline" size="lg" onClick={() => setOpen(o => !o)}>
        Copy board
      </Button>
      {open && (
        <div className="absolute left-0 z-50 mt-1 w-36 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
          {(["String", "Text", "Image"] as const).map(opt => (
            <button
              key={opt}
              type="button"
              className="block w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => copy(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
      {status && (
        <span className="ml-2 text-xs text-muted-foreground">{status}</span>
      )}
    </div>
  );
}

function drawBoard(ctx: CanvasRenderingContext2D, board: Board, ox: number, oy: number, cell: number) {
  ctx.fillStyle = "#111111";
  ctx.font = `bold ${Math.round(cell * 0.55)}px ui-sans-serif, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = board[r]?.[c];
      if (v && String(v).trim() !== "") {
        ctx.fillText(String(v).trim(), ox + c * cell + cell / 2, oy + r * cell + cell / 2);
      }
    }
  }
  ctx.strokeStyle = "#9ca3af";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 9; i++) {
    ctx.beginPath(); ctx.moveTo(ox + i * cell, oy); ctx.lineTo(ox + i * cell, oy + 9 * cell); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox, oy + i * cell); ctx.lineTo(ox + 9 * cell, oy + i * cell); ctx.stroke();
  }
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  for (let i = 0; i <= 9; i += 3) {
    ctx.beginPath(); ctx.moveTo(ox + i * cell, oy); ctx.lineTo(ox + i * cell, oy + 9 * cell); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox, oy + i * cell); ctx.lineTo(ox + 9 * cell, oy + i * cell); ctx.stroke();
  }
}

async function boardsToImageBlob(boards: Board[], labels: string[]): Promise<Blob> {
  const cell = 36;
  const pad = 14;
  const label = 20;
  const gridSize = cell * 9;
  const cols = Math.min(boards.length, 3);
  const rows = Math.ceil(boards.length / cols);
  const cw = gridSize + pad * 2;
  const ch = gridSize + label + pad * 2;
  const footer = 26;
  const canvas = document.createElement("canvas");
  canvas.width = cw * cols;
  canvas.height = ch * rows + footer;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  boards.forEach((b, i) => {
    const ox = (i % cols) * cw + pad;
    const oy = Math.floor(i / cols) * ch + pad;
    ctx.fillStyle = "#374151";
    ctx.font = "bold 14px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(labels[i] ?? "", ox, oy + label / 2);
    drawBoard(ctx, b, ox, oy + label, cell);
  });
  drawUrlFooter(ctx, canvas.width, ch * rows + footer / 2, pad);
  return await new Promise<Blob>((resolve, reject) => {

    canvas.toBlob(b => (b ? resolve(b) : reject(new Error("blob failed"))), "image/png");
  });
}

/** Copies the given boards as one PNG image; falls back to downloading it. Returns a status message. */
export async function copyBoardsAsImage(boards: (string | number)[][][], labels: string[]): Promise<string> {
  const asStr: Board[] = boards.map(b => b.map(row => row.map(v => String(v ?? ""))));
  const download = async () => {
    const blob = await boardsToImageBlob(asStr, labels);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sudoku-solutions.png";
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
      new ClipboardItem({ "image/png": boardsToImageBlob(asStr, labels) }),
    ]);
    return "Copied as image";
  } catch (err) {
    console.error("Copy solutions image failed", err);
    try {
      await download();
      return "Copy blocked — downloaded";
    } catch (e2) {
      console.error("Image download failed", e2);
      return "Copy failed";
    }
  }
}
