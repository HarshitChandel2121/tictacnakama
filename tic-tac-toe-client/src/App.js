import React, { useEffect, useState, useRef } from "react";
import { Client } from "@heroiclabs/nakama-js";

import MenuScreen from "./screens/MenuScreen";
import GameScreen from "./screens/GameScreen";
import CreateRoomScreen from "./screens/CreateRoomScreen";
import JoinRoomScreen from "./screens/JoinRoomScreen";

import { layout, text, layoutHelpers} from "./styles/layout";

const client = new Client("defaultkey", "localhost", "7350", false);

function App() {
  const [screen, setScreen] = useState("menu");

  const [socket, setSocket] = useState(null);
  const [session, setSession] = useState(null);

  const [matchId, setMatchId] = useState(null);

  const [board, setBoard] = useState(Array(9).fill(null));
  const [playerId, setPlayerId] = useState(null);
  const [turn, setTurn] = useState(null);
  const [winner, setWinner] = useState(null);

  const [username, setUsername] = useState("");

  const [roomName, setRoomName] = useState("");
  const [mode, setMode] = useState("relaxed");
  const [isPrivate, setIsPrivate] = useState(false);

  const [rooms, setRooms] = useState([]);

  const hasStarted = useRef(false);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    const start = async () => {
      if (hasStarted.current) return;
      hasStarted.current = true;

      const deviceId = Math.random().toString();
      const session = await client.authenticateDevice(deviceId);

      setSession(session);
      setPlayerId(session.user_id);

      const socket = client.createSocket(false, true);
      await socket.connect(session, true);

      socket.onmatchmakermatched = async (matched) => {
        const match = await socket.joinMatch(matched.match_id);
        setMatchId(match.match_id);
        setScreen("game");
      };

      socket.onmatchdata = (msg) => {
        const decoded = new TextDecoder().decode(msg.data);
        const state = JSON.parse(decoded);

        setBoard(state.board);
        setTurn(state.turn);
        setWinner(state.winner);
      };

      setSocket(socket);
    };

    start();
  }, []);

  /* ---------------- ACTIONS ---------------- */

  const saveUsername = async () => {
    if (!session || !username) return;
    await client.updateAccount(session, { username });
    alert("Username saved");
  };

  const quickGame = async () => {
    await socket.addMatchmaker("*", 2, 2);
  };

  const createRoom = async () => {
    const payload = { "roomName": roomName, "isPrivate":isPrivate, "gameMode":mode };
    const rpcid = "createMatchRPC";
    console.log("creating a match..")
    var match = await client.rpc(session, rpcid, payload);
    console.log("created :: ", match)
    match = await socket.joinMatch(match.payload.matchId);
    setMatchId(match.match_id);
    setScreen("game");
  };

  const fetchRooms = async () => {
    const payload = { "limit": 10 };
    const rpcid = "listMatchesRPC";
    const res = await client.rpc(session, rpcid, payload);
    
    console.log("match list : ")
    console.log(res)

    if (!res.payload) {
      console.log("No matches found");
      setRooms([]);
      return;
    }
    
    const parsed = res.payload.map(m => {
      let label = {};
      try {
        label = JSON.parse(m.label);
      } catch {}

      return {
        matchId: m.matchId,
        roomName: label.roomName || "Unnamed",
        gameMode: label.gameMode || "relaxed",
        isPrivate: label.isPrivate || false,
        creator: label.creator || "Unknown",
        playerCount: m.size
      };
    });

    setRooms(parsed.filter(r => !r.isPrivate));
  };

  const joinRoom = async (id) => {
    const match = await socket.joinMatch(id);
    console.log("joined match ",match)
    setMatchId(match.match_id);
    setScreen("game");
  };

  const makeMove = (pos) => {
    if (!socket || !matchId) return;
    if (winner) return;
    if (turn !== playerId) return;
    if (board[pos] !== null) return;

    socket.sendMatchState(matchId, 1, JSON.stringify({ pos }));
  };

  const reset = () => {
    setScreen("menu");
    setBoard(Array(9).fill(null));
    setTurn(null);
    setWinner(null);
    setMatchId(null);
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div style={layout.container}>
      <div style={layout.card}>
        <h1 style={text.title}>🎮 Tic Tac Toe</h1>
        <div style={layoutHelpers.section}>
          {screen === "menu" && (
            <MenuScreen
              username={username}
              setUsername={setUsername}
              onSave={saveUsername}
              onQuickGame={quickGame}
              onCreate={() => setScreen("create")}
              onJoin={() => {
                setScreen("join");
                fetchRooms();
              }}
            />
          )}

          {screen === "create" && (
            <CreateRoomScreen
              roomName={roomName}
              setRoomName={setRoomName}
              mode={mode}
              setMode={setMode}
              isPrivate={isPrivate}
              setIsPrivate={setIsPrivate}
              onCreate={createRoom}
              goBack={() => setScreen("menu")}
            />
          )}

          {screen === "join" && (
            <JoinRoomScreen
              rooms={rooms}
              onRefresh={fetchRooms}
              onJoin={joinRoom}
              goBack={() => setScreen("menu")}
            />
          )}

          {screen === "game" && (
            <GameScreen
              board={board}
              turn={turn}
              winner={winner}
              playerId={playerId}
              makeMove={makeMove}
              goBack={reset}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;