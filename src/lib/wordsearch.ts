export type Cell = {
  row: number;
  col: number;
  letter: string;
};

export type PlacedWord = {
  word: string;
  cells: { row: number; col: number }[];
};

export type Puzzle = {
  grid: string[][];
  size: number;
  words: PlacedWord[];
};

export const THEMES: Record<string, string[]> = {
  Animals: [
    "TIGER",
    "PANDA",
    "ZEBRA",
    "EAGLE",
    "SHARK",
    "HORSE",
    "OTTER",
    "MOOSE",
    "KOALA",
    "RABBIT",
  ],
  Space: [
    "PLANET",
    "COMET",
    "GALAXY",
    "ORBIT",
    "NEBULA",
    "ROCKET",
    "METEOR",
    "COSMOS",
    "SOLAR",
    "LUNAR",
  ],
  Fruits: [
    "APPLE",
    "MANGO",
    "GRAPE",
    "LEMON",
    "PEACH",
    "MELON",
    "CHERRY",
    "BANANA",
    "ORANGE",
    "PLUM",
  ],
  Ocean: [
    "WHALE",
    "CORAL",
    "WAVES",
    "PEARL",
    "BEACH",
    "TIDES",
    "SHELL",
    "SQUID",
    "REEF",
    "DOLPHIN",
  ],
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const DIRECTIONS = [
  { dr: 0, dc: 1 }, // horizontal
  { dr: 1, dc: 0 }, // vertical
  { dr: 1, dc: 1 }, // diagonal down-right
  { dr: 1, dc: -1 }, // diagonal down-left
  { dr: 0, dc: -1 }, // horizontal reversed
  { dr: -1, dc: 0 }, // vertical reversed
  { dr: -1, dc: -1 }, // diagonal up-left
  { dr: -1, dc: 1 }, // diagonal up-right
];

function randInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function canPlace(
  grid: (string | null)[][],
  size: number,
  word: string,
  row: number,
  col: number,
  dr: number,
  dc: number
): boolean {
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    if (r < 0 || r >= size || c < 0 || c >= size) return false;
    const existing = grid[r][c];
    if (existing !== null && existing !== word[i]) return false;
  }
  return true;
}

function placeWord(
  grid: (string | null)[][],
  size: number,
  word: string
): PlacedWord | null {
  const dirs = [...DIRECTIONS].sort(() => Math.random() - 0.5);
  for (const dir of dirs) {
    for (let attempt = 0; attempt < 60; attempt++) {
      const row = randInt(size);
      const col = randInt(size);
      if (canPlace(grid, size, word, row, col, dir.dr, dir.dc)) {
        const cells: { row: number; col: number }[] = [];
        for (let i = 0; i < word.length; i++) {
          const r = row + dir.dr * i;
          const c = col + dir.dc * i;
          grid[r][c] = word[i];
          cells.push({ row: r, col: c });
        }
        return { word, cells };
      }
    }
  }
  return null;
}

export function generatePuzzle(words: string[], size = 12): Puzzle {
  const sorted = [...words]
    .map((w) => w.toUpperCase())
    .filter((w) => w.length <= size)
    .sort((a, b) => b.length - a.length);

  for (let restart = 0; restart < 30; restart++) {
    const grid: (string | null)[][] = Array.from({ length: size }, () =>
      Array<string | null>(size).fill(null)
    );
    const placed: PlacedWord[] = [];
    let ok = true;

    for (const word of sorted) {
      const result = placeWord(grid, size, word);
      if (!result) {
        ok = false;
        break;
      }
      placed.push(result);
    }

    if (ok) {
      const finalGrid: string[][] = grid.map((rowArr) =>
        rowArr.map((cell) => cell ?? ALPHABET[randInt(26)])
      );
      return { grid: finalGrid, size, words: placed };
    }
  }

  // Fallback: should rarely happen
  const grid: string[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ALPHABET[randInt(26)])
  );
  return { grid, size, words: [] };
}

export function cellsBetween(
  start: { row: number; col: number },
  end: { row: number; col: number }
): { row: number; col: number }[] | null {
  const dr = end.row - start.row;
  const dc = end.col - start.col;

  // must be a straight line: horizontal, vertical, or diagonal (45 deg)
  const isStraight =
    dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);
  if (!isStraight) return null;

  const length = Math.max(Math.abs(dr), Math.abs(dc));
  const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
  const stepC = dc === 0 ? 0 : dc / Math.abs(dc);

  const cells: { row: number; col: number }[] = [];
  for (let i = 0; i <= length; i++) {
    cells.push({ row: start.row + stepR * i, col: start.col + stepC * i });
  }
  return cells;
}

export function lettersFromCells(
  grid: string[][],
  cells: { row: number; col: number }[]
): string {
  return cells.map((c) => grid[c.row][c.col]).join("");
}
