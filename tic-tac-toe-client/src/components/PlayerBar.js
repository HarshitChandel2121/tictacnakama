import { player } from "../styles/components";

export default function PlayerBar({
  name,
  symbol,
  userId,
  turn,
  playerId,
  winner,
  mode,
  remainingTime
}) {
  const isYou = userId === playerId;
  const isActive = turn === userId;
  const isWinner = winner && userId === winner;
  const isLoser = winner && winner !== "draw" && userId !== winner;

  return (
    <div
      style={{
        ...player.container,
        ...(isActive ? player.active : {}),
        ...(isWinner ? player.winner : {}),
        ...(isLoser ? player.loser : {})
      }}
    >
      {/* LEFT: Name + symbol */}
      <div style={player.left}>
        <div style={player.symbol}>{symbol}</div>
        <div style={player.name}>
          {name} {isYou && "(You)"}
        </div>
      </div>

      {/* RIGHT: Status */}
      <div style={player.right}>
        {winner && winner !== "draw" && (
          <div style={player.result}>
            {isWinner ? "🏆 Winner" : "❌ Lost"}
          </div>
        )}

        {winner === "draw" && (
          <div style={player.result}>🤝 Draw</div>
        )}

        {mode === "timed" && isActive && remainingTime !== null && (
          <div
            style={{
              ...player.timer,
              color: remainingTime <= 5 ? "#ef4444" : "#facc15"
            }}
          >
            ⏱ {remainingTime}s
          </div>
        )}
      </div>
    </div>
  );
}