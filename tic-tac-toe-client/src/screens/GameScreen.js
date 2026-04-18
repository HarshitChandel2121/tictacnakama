import { styles } from "../styles";

export default function GameScreen({
  board,
  turn,
  winner,
  playerId,
  makeMove,
  goBack
}) {
  const getStatus = () => {
    if (winner) {
      return winner === playerId ? "🎉 You Won!" : "😢 You Lost";
    }
    if (!turn) return "Waiting for opponent...";
    return turn === playerId ? "🟢 Your Turn" : "🟡 Opponent Turn";
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Tic Tac Toe</h2>

        <h3 style={styles.status}>{getStatus()}</h3>

        <div style={styles.grid}>
          {board.map((cell, i) => {
            let symbol = "";
            if (cell) symbol = cell === playerId ? "X" : "O";

            return (
              <button
                key={i}
                onClick={() => makeMove(i)}
                style={styles.cell}
              >
                {symbol}
              </button>
            );
          })}
        </div>

        <button onClick={goBack} style={styles.buttonSecondary}>
          ⬅ Back
        </button>
      </div>
    </div>
  );
}