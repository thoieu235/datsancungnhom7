import React from 'react';

interface QrCodeSvgProps {
  value: string;
  size?: number;
  className?: string;
  label?: string;
}

export const QrCodeSvg: React.FC<QrCodeSvgProps> = ({
  value,
  size = 180,
  className = '',
  label = 'VietQR'
}) => {
  // Deterministic pseudo-random matrix generator based on input string to render realistic QR patterns
  const hash = Array.from(value).reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);
  const gridSize = 25;
  const cells: boolean[][] = Array(gridSize).fill(false).map(() => Array(gridSize).fill(false));

  // Helper to draw corner finder patterns (7x7)
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          cells[startY + r][startX + c] = true;
        } else {
          cells[startY + r][startX + c] = false;
        }
      }
    }
  };

  drawFinder(0, 0); // top-left
  drawFinder(gridSize - 7, 0); // top-right
  drawFinder(0, gridSize - 7); // bottom-left

  // Fill alignment and data modules
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // skip finder zones
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= gridSize - 8;
      const inBottomLeft = r >= gridSize - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft) continue;

      // Timing tracks
      if (r === 6 || c === 6) {
        cells[r][c] = (r + c) % 2 === 0;
        continue;
      }

      // Seed data cells
      const seed = (hash * 31 + r * 17 + c * 43) % 100;
      cells[r][c] = seed > 48;
    }
  }

  const cellSize = size / (gridSize + 2);

  return (
    <div className={`relative flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 shadow-xs ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${(gridSize + 2) * cellSize} ${(gridSize + 2) * cellSize}`}
        className="block"
      >
        <rect width="100%" height="100%" fill="#ffffff" />
        {cells.map((row, r) =>
          row.map((active, c) =>
            active ? (
              <rect
                key={`${r}-${c}`}
                x={(c + 1) * cellSize}
                y={(r + 1) * cellSize}
                width={cellSize - 0.2}
                height={cellSize - 0.2}
                fill="#0f172a"
                rx={cellSize * 0.15}
              />
            ) : null
          )
        )}
      </svg>
      {label && (
        <span className="mt-1 text-[11px] font-semibold text-slate-700 tracking-wider uppercase">
          {label}
        </span>
      )}
    </div>
  );
};
