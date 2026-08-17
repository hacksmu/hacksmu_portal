import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const navigationItems = [
  { label: 'FAQ', href: '#', isTemporary: true },
  { label: 'Meet the Team', href: '#', isTemporary: true },
  { label: 'Schedule', href: '/schedule', isTemporary: false },
  { label: 'Dashboard', href: '/dashboard', isTemporary: false },
  { label: 'Resources', href: '#', isTemporary: true },
  { label: 'About', href: '#', isTemporary: true },
];

const BOARD_COLUMNS = 20;
const BOARD_ROWS = 16;
const GAME_TICK_MS = 320;

type Coordinate = [number, number];
type Board = Array<Array<string | null>>;
type GamePhase = 'playing' | 'clearing' | 'resetting';

type ActivePiece = {
  cells: Coordinate[];
  color: string;
  x: number;
  y: number;
};

type GameState = {
  board: Board;
  activePiece: ActivePiece | null;
  clearingRows: number[];
  phase: GamePhase;
  phaseTicks: number;
  pieceIndex: number;
};

const pieceDefinitions: Array<{ cells: Coordinate[]; color: string }> = [
  {
    cells: [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ],
    color: '#32e6ff',
  },
  {
    cells: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    color: '#f3bd3d',
  },
  {
    cells: [
      [0, 0],
      [1, 0],
      [2, 0],
      [1, 1],
    ],
    color: '#9c6cff',
  },
  {
    cells: [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
    ],
    color: '#ff4fd8',
  },
  {
    cells: [
      [1, 0],
      [1, 1],
      [1, 2],
      [0, 2],
    ],
    color: '#f08a3e',
  },
  {
    cells: [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ],
    color: '#6de59b',
  },
  {
    cells: [
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
    ],
    color: '#32e6ff',
  },
];

const seedPattern = [
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '...PP.......GG......',
  'CC.PP..YY...GG..OO..',
  'CC.MMM.YY.CCC..OO.PP',
];

const seedColors: Record<string, string> = {
  C: '#32e6ff',
  G: '#6de59b',
  M: '#ff4fd8',
  O: '#f08a3e',
  P: '#9c6cff',
  Y: '#f3bd3d',
};

function createSeedBoard(): Board {
  return seedPattern.map((row) => row.split('').map((cell) => seedColors[cell] || null));
}

function normalizeCells(cells: Coordinate[]): Coordinate[] {
  const minimumX = Math.min(...cells.map(([x]) => x));
  const minimumY = Math.min(...cells.map(([, y]) => y));

  return cells
    .map(([x, y]) => [x - minimumX, y - minimumY] as Coordinate)
    .sort(([xA, yA], [xB, yB]) => yA - yB || xA - xB);
}

function getRotations(cells: Coordinate[]): Coordinate[][] {
  const rotations: Coordinate[][] = [];
  const signatures = new Set<string>();
  let currentRotation = normalizeCells(cells);

  for (let turn = 0; turn < 4; turn += 1) {
    const signature = JSON.stringify(currentRotation);

    if (!signatures.has(signature)) {
      signatures.add(signature);
      rotations.push(currentRotation);
    }

    currentRotation = normalizeCells(currentRotation.map(([x, y]) => [-y, x]));
  }

  return rotations;
}

const gamePieces = pieceDefinitions.map((piece) => ({
  color: piece.color,
  rotations: getRotations(piece.cells),
}));

function collides(board: Board, cells: Coordinate[], pieceX: number, pieceY: number): boolean {
  return cells.some(([cellX, cellY]) => {
    const boardX = pieceX + cellX;
    const boardY = pieceY + cellY;

    return (
      boardX < 0 ||
      boardX >= BOARD_COLUMNS ||
      boardY >= BOARD_ROWS ||
      (boardY >= 0 && board[boardY][boardX] !== null)
    );
  });
}

function lockPiece(board: Board, piece: ActivePiece): Board | null {
  const nextBoard = board.map((row) => [...row]);

  for (const [cellX, cellY] of piece.cells) {
    const boardX = piece.x + cellX;
    const boardY = piece.y + cellY;

    if (boardY < 0) return null;
    nextBoard[boardY][boardX] = piece.color;
  }

  return nextBoard;
}

function getBoardMetrics(board: Board) {
  const heights: number[] = [];
  let holes = 0;

  for (let column = 0; column < BOARD_COLUMNS; column += 1) {
    let firstBlock = BOARD_ROWS;

    for (let row = 0; row < BOARD_ROWS; row += 1) {
      if (board[row][column] !== null) {
        firstBlock = row;
        break;
      }
    }

    heights.push(BOARD_ROWS - firstBlock);

    for (let row = firstBlock + 1; row < BOARD_ROWS; row += 1) {
      if (board[row][column] === null) holes += 1;
    }
  }

  const bumpiness = heights
    .slice(1)
    .reduce((total, height, index) => total + Math.abs(height - heights[index]), 0);

  return {
    aggregateHeight: heights.reduce((total, height) => total + height, 0),
    bumpiness,
    holes,
    maximumHeight: Math.max(...heights),
  };
}

function choosePlacement(board: Board, pieceIndex: number): ActivePiece | null {
  const piece = gamePieces[pieceIndex % gamePieces.length];
  let bestPlacement: ActivePiece | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const cells of piece.rotations) {
    const pieceWidth = Math.max(...cells.map(([x]) => x)) + 1;
    const pieceHeight = Math.max(...cells.map(([, y]) => y)) + 1;

    for (let pieceX = 0; pieceX <= BOARD_COLUMNS - pieceWidth; pieceX += 1) {
      let landingY = -pieceHeight;

      while (!collides(board, cells, pieceX, landingY + 1)) landingY += 1;
      if (cells.some(([, cellY]) => landingY + cellY < 0)) continue;

      const candidate: ActivePiece = { cells, color: piece.color, x: pieceX, y: landingY };
      const candidateBoard = lockPiece(board, candidate);
      if (!candidateBoard) continue;

      const completedRows = candidateBoard.filter((row) => row.every(Boolean)).length;
      const metrics = getBoardMetrics(candidateBoard);
      const centerDistance = Math.abs(pieceX + pieceWidth / 2 - BOARD_COLUMNS / 2);
      const score =
        completedRows * 1200 -
        metrics.holes * 150 -
        metrics.maximumHeight * 14 -
        metrics.aggregateHeight * 3 -
        metrics.bumpiness * 4 -
        centerDistance * 0.1;

      if (score > bestScore) {
        bestScore = score;
        bestPlacement = { ...candidate, y: -pieceHeight };
      }
    }
  }

  return bestPlacement;
}

function shouldResetBoard(board: Board): boolean {
  const occupiedCells = board.reduce(
    (total, row) => total + row.filter((cell) => cell !== null).length,
    0,
  );
  const nearTop = board.slice(0, 3).some((row) => row.some((cell) => cell !== null));

  return nearTop || occupiedCells > BOARD_COLUMNS * BOARD_ROWS * 0.62;
}

function createInitialGame(): GameState {
  const board = createSeedBoard();

  return {
    board,
    activePiece: choosePlacement(board, 0),
    clearingRows: [],
    phase: 'playing',
    phaseTicks: 0,
    pieceIndex: 1,
  };
}

function advanceGame(current: GameState): GameState {
  if (current.phase === 'resetting') {
    return current.phaseTicks >= 3
      ? createInitialGame()
      : { ...current, phaseTicks: current.phaseTicks + 1 };
  }

  if (current.phase === 'clearing') {
    if (current.phaseTicks < 1) return { ...current, phaseTicks: current.phaseTicks + 1 };

    const board = current.board.filter((_, rowIndex) => !current.clearingRows.includes(rowIndex));
    while (board.length < BOARD_ROWS) board.unshift(Array(BOARD_COLUMNS).fill(null));

    if (shouldResetBoard(board)) {
      return { ...current, board, clearingRows: [], phase: 'resetting', phaseTicks: 0 };
    }

    const activePiece = choosePlacement(board, current.pieceIndex);
    if (!activePiece) {
      return { ...current, board, clearingRows: [], phase: 'resetting', phaseTicks: 0 };
    }

    return {
      board,
      activePiece,
      clearingRows: [],
      phase: 'playing',
      phaseTicks: 0,
      pieceIndex: current.pieceIndex + 1,
    };
  }

  if (!current.activePiece) return { ...current, phase: 'resetting', phaseTicks: 0 };

  if (
    !collides(
      current.board,
      current.activePiece.cells,
      current.activePiece.x,
      current.activePiece.y + 1,
    )
  ) {
    return { ...current, activePiece: { ...current.activePiece, y: current.activePiece.y + 1 } };
  }

  const lockedBoard = lockPiece(current.board, current.activePiece);
  if (!lockedBoard) return { ...current, activePiece: null, phase: 'resetting', phaseTicks: 0 };

  const clearingRows = lockedBoard.reduce<number[]>((rows, row, rowIndex) => {
    if (row.every(Boolean)) rows.push(rowIndex);
    return rows;
  }, []);

  if (clearingRows.length > 0) {
    return {
      ...current,
      board: lockedBoard,
      activePiece: null,
      clearingRows,
      phase: 'clearing',
      phaseTicks: 0,
    };
  }

  if (shouldResetBoard(lockedBoard)) {
    return { ...current, board: lockedBoard, activePiece: null, phase: 'resetting', phaseTicks: 0 };
  }

  const activePiece = choosePlacement(lockedBoard, current.pieceIndex);
  if (!activePiece) {
    return { ...current, board: lockedBoard, activePiece: null, phase: 'resetting', phaseTicks: 0 };
  }

  return {
    ...current,
    board: lockedBoard,
    activePiece,
    pieceIndex: current.pieceIndex + 1,
  };
}

const reducedMotionBoard = createSeedBoard();

function ArcadeBlockBoard() {
  const [game, setGame] = useState<GameState>(createInitialGame);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setPrefersReducedMotion(motionQuery.matches);

    updateMotionPreference();
    if (motionQuery.addEventListener)
      motionQuery.addEventListener('change', updateMotionPreference);
    else motionQuery.addListener(updateMotionPreference);

    return () => {
      if (motionQuery.removeEventListener)
        motionQuery.removeEventListener('change', updateMotionPreference);
      else motionQuery.removeListener(updateMotionPreference);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const gameTimer = window.setInterval(
      () => setGame((current) => advanceGame(current)),
      GAME_TICK_MS,
    );
    return () => window.clearInterval(gameTimer);
  }, [prefersReducedMotion]);

  const visibleCells = useMemo(() => {
    const board = prefersReducedMotion ? reducedMotionBoard : game.board;
    const cells = board.map((row) => row.map((color) => ({ color, isActive: false })));

    if (!prefersReducedMotion && game.activePiece) {
      for (const [cellX, cellY] of game.activePiece.cells) {
        const boardX = game.activePiece.x + cellX;
        const boardY = game.activePiece.y + cellY;

        if (boardY >= 0 && boardY < BOARD_ROWS) {
          cells[boardY][boardX] = { color: game.activePiece.color, isActive: true };
        }
      }
    }

    return cells;
  }, [game.activePiece, game.board, prefersReducedMotion]);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      data-decoration-layer="falling-block-board"
      aria-hidden="true"
    >
      <div className="arcade-grid-board">
        <div
          className={`arcade-grid-cells ${
            !prefersReducedMotion && game.phase === 'resetting' ? 'arcade-board-resetting' : ''
          }`}
        >
          {visibleCells.flatMap((row, rowIndex) =>
            row.map((cell, columnIndex) => (
              <span
                key={`${rowIndex}-${columnIndex}`}
                className={`arcade-grid-cell ${cell.color ? 'arcade-grid-cell-occupied' : ''} ${
                  cell.isActive ? 'arcade-grid-cell-active' : ''
                } ${
                  !prefersReducedMotion && game.clearingRows.includes(rowIndex)
                    ? 'arcade-row-clearing'
                    : ''
                }`}
                style={{ backgroundColor: cell.color || 'transparent' }}
              />
            )),
          )}
        </div>
      </div>

      <style jsx global>{`
        .arcade-grid-board {
          position: absolute;
          top: 0;
          left: 50%;
          height: 100%;
          width: auto;
          max-width: 100%;
          aspect-ratio: 5 / 4;
          transform: translateX(-50%);
        }

        .arcade-grid-cells {
          display: grid;
          height: 100%;
          width: 100%;
          grid-template-columns: repeat(${BOARD_COLUMNS}, minmax(0, 1fr));
          grid-template-rows: repeat(${BOARD_ROWS}, minmax(0, 1fr));
          opacity: 0.34;
          will-change: transform, opacity;
        }

        .arcade-grid-cell {
          margin: 1px;
          min-height: 0;
          min-width: 0;
        }

        .arcade-grid-cell-occupied {
          border: 1px solid rgba(255, 255, 255, 0.42);
          box-shadow: inset -3px -3px 0 rgba(0, 0, 0, 0.28),
            inset 2px 2px 0 rgba(255, 255, 255, 0.3), 0 0 5px rgba(50, 230, 255, 0.16);
        }

        .arcade-grid-cell-active {
          opacity: 0.88;
          filter: brightness(1.25);
        }

        .arcade-row-clearing {
          animation: arcade-row-clear 640ms ease-in-out;
        }

        .arcade-board-resetting {
          animation: arcade-board-reset 1280ms ease-in forwards;
        }

        @keyframes arcade-row-clear {
          0%,
          100% {
            filter: brightness(1);
            opacity: 1;
          }
          50% {
            filter: brightness(1.8);
            opacity: 0.25;
          }
        }

        @keyframes arcade-board-reset {
          0%,
          18% {
            opacity: 0.34;
            transform: translate3d(0, 0, 0);
          }
          100% {
            opacity: 0;
            transform: translate3d(0, 34%, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .arcade-grid-cells,
          .arcade-grid-cell {
            animation: none !important;
            will-change: auto;
          }
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Head>
        <title>HackSMU VIII</title>
        <meta name="description" content="HackSMU VIII" />
        <link rel="icon" href="/icons/favicon.v3.ico" />
      </Head>

      <main className="hacksmu-home-page relative overflow-hidden bg-[#05020d] px-2 py-2 text-white sm:px-4 sm:py-3">
        <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col rounded-b-xl rounded-t-[2.5rem] border-[6px] border-[#f3bd3d] bg-[#351052] p-1 shadow-[0_0_24px_rgba(255,64,220,0.45)]">
          <div className="flex min-h-0 flex-1 flex-col rounded-b-md rounded-t-[2rem] border-4 border-[#ff4fd8] bg-[#12051f] p-2 shadow-[inset_0_0_24px_rgba(0,0,0,0.9)] sm:p-3">
            <div className="shrink-0 border-4 border-[#32e6ff] bg-[#05020d] p-1 shadow-[0_0_12px_rgba(50,230,255,0.65)]">
              <section
                className="w-full overflow-hidden border-2 border-[#f3bd3d] bg-[#18072b] px-3 py-2 text-center"
                aria-label="Announcements"
              >
                <p className="font-pixel text-xs uppercase tracking-widest text-[#ffe56b] sm:text-sm">
                  Announcements will appear here.
                </p>
              </section>
            </div>

            <section className="relative my-2 flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-hidden border-4 border-[#24113d] bg-[#080d21] px-3 py-4 text-center shadow-[inset_0_0_28px_rgba(50,230,255,0.2)] sm:gap-5 sm:px-6">
              <ArcadeBlockBoard />

              <div className="relative z-10">
                <p className="font-orbitron text-xs uppercase tracking-[0.35em] text-[#32e6ff] sm:text-sm">
                  Player One Ready
                </p>
                <h1 className="mt-3 font-pixel text-3xl leading-tight text-white drop-shadow-[4px_4px_0_#ff2fb3] sm:text-5xl lg:text-6xl">
                  HACKSMU VIII
                </h1>
                <p className="mt-3 font-orbitron text-lg font-bold tracking-widest text-[#ffe56b] sm:text-2xl">
                  October 10–11, 2026
                </p>
              </div>

              <Link href="/auth">
                <a className="relative z-10 border-4 border-white bg-[#f3bd3d] px-8 py-3 font-pixel text-sm uppercase text-[#160622] shadow-[5px_5px_0_#ff2fb3] sm:px-12 sm:text-base">
                  Apply Here
                </a>
              </Link>

              <nav aria-label="Homepage navigation" className="relative z-10 w-full max-w-3xl">
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {navigationItems.map(({ label, href, isTemporary }) => (
                    <li key={label}>
                      <Link href={href}>
                        <a
                          className="block border-2 border-[#32e6ff] bg-[#111d3d] px-3 py-2 font-pixel text-xs uppercase leading-relaxed text-white shadow-[4px_4px_0_#743fc7] hover:border-[#ffe56b] hover:text-[#ffe56b] sm:text-sm"
                          data-temporary-route={isTemporary || undefined}
                          title={isTemporary ? 'Temporary route placeholder' : undefined}
                        >
                          <span className="mr-2 text-[#ff4fd8]">▶</span>
                          {label}
                        </a>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </section>

            <div className="relative h-20 shrink-0 origin-bottom border-[6px] border-[#743fc7] bg-[#160822] shadow-[0_9px_0_#07020d,0_14px_18px_rgba(0,0,0,0.75)] [transform:perspective(700px)_rotateX(7deg)] sm:h-24">
              <div className="absolute inset-x-1 top-1 bottom-4 border-2 border-[#b476ff] bg-[linear-gradient(180deg,_#4b2366_0%,_#2b123f_58%,_#180922_100%)] shadow-[inset_0_4px_0_rgba(255,255,255,0.16),inset_0_-5px_8px_rgba(0,0,0,0.7)]" />
              <div className="absolute inset-x-0 bottom-0 h-4 border-t-4 border-[#ff4fd8] bg-[#100518] shadow-[inset_0_3px_0_#5c2677]" />

              <div className="relative z-10 grid h-[calc(100%-1rem)] grid-cols-3 items-center px-3 sm:px-8">
                <div className="flex items-center justify-start" aria-hidden="true">
                  <div className="relative h-16 w-20 sm:h-20 sm:w-24">
                    <div className="absolute bottom-0 left-1/2 h-4 w-16 -translate-x-1/2 rounded-[50%] bg-[#05020d] opacity-80 blur-[1px] sm:w-20" />
                    <div className="absolute bottom-2 left-1/2 h-5 w-16 -translate-x-1/2 rounded-[50%] border-4 border-[#32e6ff] bg-[radial-gradient(ellipse_at_40%_25%,_#8cf4ff,_#126879_60%,_#07182b)] shadow-[0_5px_0_#06121f,0_7px_8px_rgba(0,0,0,0.65)] sm:w-20" />
                    <div className="absolute bottom-6 left-1/2 h-9 w-3 -translate-x-1/2 -rotate-3 border-x-2 border-[#fff1a8] bg-[linear-gradient(90deg,_#8a6514,_#ffe56b_42%,_#f3bd3d_65%,_#6c4b08)] shadow-[4px_3px_4px_rgba(0,0,0,0.65)] sm:h-11" />
                    <div className="absolute top-0 left-1/2 h-9 w-9 -translate-x-1/2 -rotate-3 rounded-full border-4 border-[#8a185f] bg-[radial-gradient(circle_at_35%_25%,_#ffd1f2_0%,_#ff4fd8_28%,_#a51d75_72%,_#4b0a36_100%)] shadow-[4px_5px_0_#4b0a36,0_8px_9px_rgba(0,0,0,0.7)] sm:h-10 sm:w-10">
                      <span className="absolute top-1 left-2 h-2 w-2 rounded-full bg-white/70" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="relative flex h-16 w-20 items-center justify-center border-4 border-[#ff4fd8] bg-[#090617] p-1 shadow-[inset_0_0_0_2px_#32e6ff,0_5px_0_#08030d,0_8px_10px_rgba(0,0,0,0.7)] sm:h-20 sm:w-24">
                    <span className="absolute top-1 left-1 h-1.5 w-1.5 rounded-full bg-[#ffe56b] shadow-[inset_1px_1px_0_white]" />
                    <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#ffe56b] shadow-[inset_1px_1px_0_white]" />
                    <span className="absolute bottom-1 left-1 h-1.5 w-1.5 rounded-full bg-[#ffe56b] shadow-[inset_1px_1px_0_white]" />
                    <span className="absolute right-1 bottom-1 h-1.5 w-1.5 rounded-full bg-[#ffe56b] shadow-[inset_1px_1px_0_white]" />
                    <div className="flex h-full w-full items-center justify-center overflow-hidden border border-[#743fc7] bg-white">
                      <Image
                        src="/assets2026/hacksmu-logo.png"
                        alt="HackSMU VIII arcade logo"
                        width={80}
                        height={80}
                        objectFit="contain"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end" aria-hidden="true">
                  <div className="relative h-14 w-28 sm:h-16 sm:w-36">
                    <span className="absolute bottom-0 left-0 h-9 w-9 rounded-full border-4 border-[#6d104d] bg-[#8a185f] shadow-[0_6px_0_#3b0929,0_9px_7px_rgba(0,0,0,0.65)] sm:h-11 sm:w-11">
                      <span className="absolute inset-x-1 top-0.5 h-6 rounded-full border-2 border-[#ff9be7] bg-[radial-gradient(circle_at_35%_20%,_#ffd1f2,_#ff4fd8_38%,_#a51d75_100%)] sm:h-7" />
                    </span>
                    <span className="absolute top-0 left-1/2 h-9 w-9 -translate-x-1/2 rounded-full border-4 border-[#126879] bg-[#167f91] shadow-[0_6px_0_#073d47,0_9px_7px_rgba(0,0,0,0.65)] sm:h-11 sm:w-11">
                      <span className="absolute inset-x-1 top-0.5 h-6 rounded-full border-2 border-[#c8fbff] bg-[radial-gradient(circle_at_35%_20%,_#e7fdff,_#32e6ff_38%,_#168396_100%)] sm:h-7" />
                    </span>
                    <span className="absolute right-0 bottom-1 h-9 w-9 rounded-full border-4 border-[#8a6514] bg-[#ad8018] shadow-[0_6px_0_#4e3908,0_9px_7px_rgba(0,0,0,0.65)] sm:h-11 sm:w-11">
                      <span className="absolute inset-x-1 top-0.5 h-6 rounded-full border-2 border-[#fff1a8] bg-[radial-gradient(circle_at_35%_20%,_#fffbe0,_#f3bd3d_40%,_#a87510_100%)] sm:h-7" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx global>{`
          #__next > .min-h-screen.mt-5 {
            min-height: calc(100vh - 1.25rem);
          }

          .hacksmu-home-page {
            height: calc(100vh - 2.75rem);
          }

          @supports (height: 100dvh) {
            #__next > .min-h-screen.mt-5 {
              min-height: calc(100dvh - 1.25rem);
            }

            .hacksmu-home-page {
              height: calc(100dvh - 2.75rem);
            }
          }
        `}</style>
      </main>
    </>
  );
}
