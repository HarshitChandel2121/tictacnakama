import { layout } from "../styles/layout";
import { buttons, gridStyles } from "../styles/components";
import { Grid } from "../components/Grid"

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

  let cellList = board.map((cell, i) => {
    let symbol = cell
      ? (cell === playerId ? "X" : "O")
      : "";

    return (
      {
        "onClick":() => makeMove(i),
        "content":symbol
      }
    );
  });

  return (
      <div>
        <h3 style={layout.status}>{getStatus()}</h3>
        <Grid cellList={cellList} defaultStyle={{ ...gridStyles.cell, ...gridStyles.xoCell }}/>
        <button onClick={goBack} style={buttons.secondary}>
          ⬅ Back
        </button>
      </div>
  );
}