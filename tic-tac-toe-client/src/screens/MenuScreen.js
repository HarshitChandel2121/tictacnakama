import { gridStyles } from "../styles/components";
import {Grid} from "../components/Grid"

export default function MenuScreen({
  username,
  setUsername,
  onSave,
  onQuickGame,
  onCreate,
  onJoin
}) {
  const cellList = [
    {
      onClick: onQuickGame,
      content: "⚡ Quick Game"
    },
    {
      onClick: onCreate,
      content: "🏠 Create Room"
    },
    {
      onClick: onJoin,
      content: "🔗 Join Room"
    },
    {
      onClick: onQuickGame,
      content: "⚡ Quick Game"
    },
    {
      onClick: onCreate,
      content: "🏠 Create Room"
    },
    {
      onClick: onJoin,
      content: "🔗 Join Room"
    },
    {
      onClick: onQuickGame,
      content: "⚡ Quick Game"
    },
    {
      onClick: onCreate,
      content: "🏠 Create Room"
    },
    {
      onClick: onJoin,
      content: "🔗 Join Room"
    }
  ];
  return (<Grid cellList={cellList} defaultStyle={gridStyles.cell}/>);
}