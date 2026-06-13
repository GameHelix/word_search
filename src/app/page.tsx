"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  THEMES,
  generatePuzzle,
  cellsBetween,
  lettersFromCells,
  type Puzzle,
} from "@/lib/wordsearch";

type Coord = { row: number; col: number };

const GRID_SIZE = 12;
const THEME_NAMES = Object.keys(THEMES);

function keyOf(c: Coord) {
  return `${c.row},${c.col}`;
}

export default function Home() {
  const [theme, setTheme] = useState<string>(THEME_NAMES[0]);
  const [puzzle, setPuzzle] = useState<Puzzle>(() =>
    generatePuzzle(THEMES[THEME_NAMES[0]], GRID_SIZE)
  );
  const [found, setFound] = useState<Set<string>>(new Set());
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());

  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState<Coord | null>(null);
  const [current, setCurrent] = useState<Coord | null>(null);

  const newPuzzle = useCallback((nextTheme: string) => {
    const p = generatePuzzle(THEMES[nextTheme], GRID_SIZE);
    setPuzzle(p);
    setFound(new Set());
    setFoundCells(new Set());
    setStart(null);
    setCurrent(null);
    setDragging(false);
  }, []);

  const selection = useMemo<Coord[]>(() => {
    if (!start || !current) return [];
    return cellsBetween(start, current) ?? [];
  }, [start, current]);

  const selectionKeys = useMemo(
    () => new Set(selection.map(keyOf)),
    [selection]
  );

  const tryMatch = useCallback(
    (cells: Coord[]) => {
      if (!puzzle || cells.length < 2) return;
      const word = lettersFromCells(puzzle.grid, cells);
      const reversed = word.split("").reverse().join("");
      const match = puzzle.words.find(
        (w) =>
          !found.has(w.word) && (w.word === word || w.word === reversed)
      );
      if (match) {
        setFound((prev) => new Set(prev).add(match.word));
        setFoundCells((prev) => {
          const next = new Set(prev);
          match.cells.forEach((c) => next.add(keyOf(c)));
          return next;
        });
      }
    },
    [puzzle, found]
  );

  const beginAt = useCallback((c: Coord) => {
    setDragging(true);
    setStart(c);
    setCurrent(c);
  }, []);

  const moveTo = useCallback(
    (c: Coord) => {
      if (dragging) setCurrent(c);
    },
    [dragging]
  );

  const endSelection = useCallback(() => {
    if (selection.length > 0) tryMatch(selection);
    setDragging(false);
    setStart(null);
    setCurrent(null);
  }, [selection, tryMatch]);

  useEffect(() => {
    const onUp = () => {
      if (dragging) endSelection();
    };
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, endSelection]);

  const handleCellClick = useCallback(
    (c: Coord) => {
      // Click-start / click-end support (no drag involved)
      if (!dragging && !start) {
        setStart(c);
        setCurrent(c);
        setDragging(true);
        return;
      }
      if (dragging && start) {
        const cells = cellsBetween(start, c) ?? [];
        if (cells.length > 0) tryMatch(cells);
        setDragging(false);
        setStart(null);
        setCurrent(null);
      }
    },
    [dragging, start, tryMatch]
  );

  const totalWords = puzzle.words.length;
  const foundCount = found.size;
  const won = totalWords > 0 && foundCount === totalWords;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">
            Word Search
          </h1>
          <p className="mt-2 text-slate-300">
            Find all hidden words by dragging across the grid.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Grid */}
          <section className="flex-1 flex flex-col items-center">
            <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
              <label className="text-sm text-slate-300">Theme:</label>
              <select
                value={theme}
                onChange={(e) => {
                  setTheme(e.target.value);
                  newPuzzle(e.target.value);
                }}
                className="rounded-lg bg-slate-800 border border-slate-600 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                {THEME_NAMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <button
                onClick={() => newPuzzle(theme)}
                className="rounded-lg bg-cyan-500 hover:bg-cyan-400 px-4 py-1.5 text-sm font-semibold text-slate-900 transition-colors"
              >
                New Puzzle
              </button>
            </div>

            <div
              className="select-none rounded-xl bg-slate-800/60 p-2 sm:p-3 shadow-2xl ring-1 ring-white/10"
                onMouseLeave={() => {
                  if (dragging) endSelection();
                }}
              >
                <div
                  className="grid gap-0.5"
                  style={{
                    gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))`,
                  }}
                >
                  {puzzle.grid.map((rowArr, r) =>
                    rowArr.map((letter, c) => {
                      const k = keyOf({ row: r, col: c });
                      const isFound = foundCells.has(k);
                      const isSel = selectionKeys.has(k);
                      return (
                        <button
                          key={k}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            beginAt({ row: r, col: c });
                          }}
                          onMouseEnter={() => moveTo({ row: r, col: c })}
                          onClick={() => handleCellClick({ row: r, col: c })}
                          onTouchStart={(e) => {
                            e.preventDefault();
                            beginAt({ row: r, col: c });
                          }}
                          className={[
                            "aspect-square w-7 sm:w-9 md:w-10 flex items-center justify-center rounded-md text-sm sm:text-base font-bold uppercase transition-colors",
                            isFound
                              ? "bg-emerald-500 text-slate-900"
                              : isSel
                                ? "bg-fuchsia-500 text-white"
                                : "bg-slate-700/70 text-slate-100 hover:bg-slate-600",
                          ].join(" ")}
                        >
                          {letter}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

            {won && (
              <div className="mt-5 rounded-xl bg-emerald-500/20 border border-emerald-400 px-6 py-4 text-center">
                <p className="text-xl font-bold text-emerald-300">
                  You found all the words!
                </p>
                <button
                  onClick={() => newPuzzle(theme)}
                  className="mt-3 rounded-lg bg-emerald-400 hover:bg-emerald-300 px-4 py-1.5 text-sm font-semibold text-slate-900"
                >
                  Play Again
                </button>
              </div>
            )}
          </section>

          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="rounded-xl bg-slate-800/60 p-5 ring-1 ring-white/10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold">Words</h2>
                <span className="text-sm text-slate-300">
                  {foundCount}/{totalWords}
                </span>
              </div>
              <div className="mb-4 h-2 w-full rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all"
                  style={{
                    width: totalWords
                      ? `${(foundCount / totalWords) * 100}%`
                      : "0%",
                  }}
                />
              </div>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {puzzle.words
                  .map((w) => w.word)
                  .slice()
                  .sort()
                  .map((w) => {
                    const isFound = found.has(w);
                    return (
                      <li
                        key={w}
                        className={[
                          "text-sm font-medium tracking-wide",
                          isFound
                            ? "line-through text-emerald-400"
                            : "text-slate-200",
                        ].join(" ")}
                      >
                        {w}
                      </li>
                    );
                  })}
              </ul>
            </div>

            <div className="mt-5 rounded-xl bg-slate-800/60 p-5 ring-1 ring-white/10">
              <h2 className="text-lg font-bold mb-2">How to Play</h2>
              <ul className="list-disc list-inside text-sm text-slate-300 space-y-1.5">
                <li>Words hide in 8 directions, forwards or backwards.</li>
                <li>Drag from the first to last letter of a word.</li>
                <li>Or click the start cell, then click the end cell.</li>
                <li>Found words turn green and cross off the list.</li>
                <li>Find them all to win!</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
