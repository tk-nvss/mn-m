"use client";

import GameCardGrid from "./GameCardGrid";

export default function GameGrid({ games, isOutOfStock }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-6 md:gap-5 px-2 sm:px-0">
      {games.map((game, i) => (
        <GameCardGrid
          key={i}
          index={i}
          game={game}
          isOutOfStock={isOutOfStock}
        />
      ))}
    </div>
  );
}
