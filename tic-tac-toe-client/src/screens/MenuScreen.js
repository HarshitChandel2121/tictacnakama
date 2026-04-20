import { gridStyles } from "../styles/components";
import {Grid} from "../components/Grid"
import { useState,useEffect } from "react";

export default function MenuScreen({
  username,
  onQuickGame,
  onCreate,
  onJoin,
  openLeaderboard,
  isSearching,
  searchTime,
  onCancel,
  searchingMode
}) {
  const [decorationCell1,setDecorationCell1] = useState('O')
  const [decorationCell2,setDecorationCell2] = useState('O')
  const [decorationCell3,setDecorationCell3] = useState('X')
  useEffect(() => {
    if (!isSearching) return;

    const interval = setInterval(() => {
      const setters = [setDecorationCell1, setDecorationCell2, setDecorationCell3];
      const values = [decorationCell1, decorationCell2, decorationCell3];

      const i = Math.floor(Math.random() * 3);
      setters[i](values[i] === 'O' ? 'X' : 'O');
    }, 1000);

    return () => clearInterval(interval);
  }, [isSearching, decorationCell1, decorationCell2, decorationCell3]);
  
  const [message, setMessage] = useState(null);

  const handleBlockedAction = () => {
    setMessage("Matchmaking in progress. Cancel to continue.");
    setTimeout(() => setMessage(null), 2000);
  };

  const disableIfSearching = (handler) => {
    return isSearching ? handleBlockedAction : handler;
  };

  const getQuickGameCell = (mode) => { 
    return ((searchingMode==mode)&&(isSearching))
      ? {
          content: (
            <div style={{ textAlign: "center" }}>
              <div>Finding...</div>
              <div>⏱ {searchTime}s</div>
              <div
                onClick={(e) => {
                  e.stopPropagation(); // 🔥 IMPORTANT
                  onCancel();
                }}
                style={{ marginTop: "6px", color: "#f87171", cursor: "pointer" }}
              >
                Cancel
              </div>
            </div>
          ),
          onClick: null
        }
      : {
          onClick: disableIfSearching(() => onQuickGame(mode)),
          content: <>{mode.toUpperCase()}<br />GAME</>
        };
  }
  
  const getCreateRoomCell = () => {
    return {
      onClick: disableIfSearching(onCreate),
      content: <>CREATE<br />ROOM</>
    }
  }
  const getJoinRoomCell = () => {
    return {
      onClick: disableIfSearching(onJoin),
      content: <>JOIN<br />ROOM</>
    }
  }
  const getLeaderBoardCell = () => {
    return {
      onClick: openLeaderboard,
      content: <>LEADER<br />BOARD</>
    }
  }
  const getPlaceHolderCell = () => {
    return {
      onClick: undefined,
      content: <>MORE<br />SOON</>
    }
  }
  
  const getDecorationCell = (decorationCell,setDecorationCell) => {
    return {
      onClick: () => toggleDecorationCell(decorationCell,setDecorationCell),
      content: decorationCell,
      style: { ...gridStyles.cell, ...gridStyles.xoCell, ...(decorationCell=='O')?(gridStyles.winCell):(gridStyles.lostCell) }
    }
  }
  const toggleDecorationCell = (decorationCell,setDecorationCell) => {
    if (decorationCell == 'O') {
      setDecorationCell('X');
    } else {
      setDecorationCell('O');
    }
  }
  const cellList = [
    getQuickGameCell("relaxed"),
    getQuickGameCell("timed"),
    getDecorationCell(decorationCell1,setDecorationCell1),
    getCreateRoomCell(),
    getDecorationCell(decorationCell2,setDecorationCell2),
    getJoinRoomCell(),
    getDecorationCell(decorationCell3,setDecorationCell3),
    getLeaderBoardCell(),
    getPlaceHolderCell()
  ];
  return (
    <div>
      {message && (
        <div style={{
          position: "absolute",
          bottom: "20px",
          background: "#334155",
          padding: "10px",
          borderRadius: "8px"
        }}>
          {message}
        </div>
      )}
      <Grid cellList={cellList} defaultStyle={gridStyles.cell}/>
    </div>
  );
}