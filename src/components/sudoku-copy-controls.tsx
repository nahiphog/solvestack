import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

type Board = string[][];

function boardToString(board: Board): string {
  return board.map(row => row.map(c => (c && c.trim() !== "" ? c.trim() : ".")).join("")).join("");
}

function boardToText(board: Board): string {
  return board.map(row => row.map(c => (c && c.trim() !== "" ? c.trim() : "0")).join(" ")).join("\n");
}

async function boardToImageBlob(board: Board): Promise<Blob> {
  const cell = 48;
  const pad = 8;
  const size = cell * 9 + pad * 2;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

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
    } catch {
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
