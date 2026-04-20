import { layout } from "../styles/layout";
import { buttons, gridStyles } from "../styles/components";
import { Grid } from "../components/Grid"
import PlayerBar from "../components/PlayerBar";

export default function GameScreen({
  board,
  turn,
  winner,
  playerId,
  makeMove,
  match_cancelled,
  winPattern,
  playerNames,
  symbols,
  mode,
  remainingTime
}) {
  const players = Object.keys(playerNames || {});

  const opponentId = players.find(p => p !== playerId);

  let cellList = board.map((cell, i) => {
    let symbol = cell

    return (
      {
        "onClick":() => makeMove(i),
        "content":symbol,
        style: {
          ...gridStyles.cell,
          ...gridStyles.xoCell,
          ...(winPattern?.includes(i) ? (winner === playerId ? gridStyles.winCell:gridStyles.lostCell) : {})
        }
      }
    );
  });

  return (
      <div style={gridStyles.gridContainer}>
        <PlayerBar
          name={playerNames[opponentId]}
          symbol={symbols[opponentId]}
          userId={opponentId}
          turn={turn}
          playerId={playerId}
          winner={winner}
          mode={mode}
          remainingTime={(turn==opponentId)?remainingTime:30}
        />
        <Grid cellList={cellList} defaultStyle={{ ...gridStyles.cell, ...gridStyles.xoCell }}/>
        <PlayerBar
          name={playerNames[playerId]}
          symbol={symbols[playerId]}
          userId={playerId}
          turn={turn}
          playerId={playerId}
          winner={winner}
          mode={mode}
          remainingTime={(turn==playerId)?remainingTime:30}
        />
      </div>
  );
}