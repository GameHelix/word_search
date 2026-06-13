# Word Search

A polished, fully playable Word Search puzzle game built with Next.js and TypeScript. Hidden words are placed across a 12x12 grid in all eight directions (horizontal, vertical, and diagonal, including reversed), with the remaining cells filled by random letters. Select words by dragging across the grid to find them all.

## Features

- 12x12 grid with words placed in 8 directions, forwards and backwards
- Multiple themed word lists (Animals, Space, Fruits, Ocean)
- Drag-to-select or click-start / click-end selection
- Found words are highlighted permanently and crossed off the list
- Live progress tracking and a win message when every word is found
- "New Puzzle" button to generate a fresh grid instantly
- Responsive, modern UI styled with Tailwind CSS

## How to Play

1. Pick a theme from the dropdown (or keep the default).
2. Find a hidden word by dragging from its first letter to its last letter.
   - You can also click the starting cell, then click the ending cell.
3. Valid words can run horizontally, vertically, or diagonally, in either direction.
4. When a word matches, it turns green and is crossed off the word list.
5. Find every word to win. Use "New Puzzle" any time for a fresh board.

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- ESLint

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play.

## Build

```bash
npm run build
npm run start
```
