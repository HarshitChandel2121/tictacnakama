import React, { useEffect, useState, useRef } from "react";
import { Client } from "@heroiclabs/nakama-js";

import MenuScreen from "./screens/MenuScreen";
import GameScreen from "./screens/GameScreen";
import CreateRoomScreen from "./screens/CreateRoomScreen";
import JoinRoomScreen from "./screens/JoinRoomScreen";
import LeaderboardScreen from "./screens/LeaderboardScreen";
import Profile from "./components/profile";
import BackButton from "./components/BackButton";

import { layout, text, layoutHelpers, nav} from "./styles/layout";

const url = process.env.REACT_APP_NAKAMA_URL;

// const client = new Client("defaultkey", "localhost", "7350", false);
const client = new Client("defaultkey", url, "7350", false);

function App() {
  const [screen, setScreen] = useState("menu");

  const [socket, setSocket] = useState(null);
  const [session, setSession] = useState(null);

  const [matchId, setMatchId] = useState(null);

  const [board, setBoard] = useState(Array(9).fill(null));
  const [playerId, setPlayerId] = useState(null);
  const [turn, setTurn] = useState(null);
  const [winner, setWinner] = useState(null);
  const [winPattern,setWinPattern] = useState([])

  const [username, setUsername] = useState("");
  const usernameRef = useRef("")

  const [roomName, setRoomName] = useState("");
  const [mode, setMode] = useState("relaxed");
  const [isPrivate, setIsPrivate] = useState(false);

  const [rooms, setRooms] = useState([]);

  const hasStarted = useRef(false);

  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const matchmakerTicket = useRef(null);
  const intervalRef = useRef(null);

  const [match_cancelled,setMatchCancelled] = useState(false)
  const [playerNames, setPlayerNames] = useState({});
  const [symbols,setSymbols] = useState({})

  const [remainingTime,setRemainingTime] = useState(null)

  const [leaderboard, setLeaderboard] = useState([]);
  const [isReady, setIsReady] = useState(false);

  /* ---------------- INIT ---------------- */
  useEffect(() => {

  },[])
  useEffect(() => {
    const start = async () => {
      if (hasStarted.current) return;
      hasStarted.current = true;

      let deviceId = sessionStorage.getItem("deviceId");

      if (!deviceId) {
        deviceId = crypto.randomUUID();
        sessionStorage.setItem("deviceId", deviceId);
      }
      const session = await client.authenticateDevice(deviceId);

      setSession(session);
      setPlayerId(session.user_id);

      const socket = client.createSocket(false, true);
      await socket.connect(session, true);

      const account = await client.getAccount(session);
      let name = account.user.display_name;

      if (!name || name.trim() === "") {
        name = "Player_" + Math.floor(Math.random() * 1000);

        await client.updateAccount(session, {
          display_name: name
        });
      }

      setUsername(name);
      usernameRef.current = name;
      console.log("user name set : ",username,":",name)

      const savedMatchId = sessionStorage.getItem("matchId");

      socket.onmatchmakermatched = async (matched) => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        setIsSearching(false);
        setSearchTime(0);

        const match = await socket.joinMatch(matched.match_id,undefined,{name: usernameRef.current});
        setMatchId(match.match_id);
        sessionStorage.setItem("matchId", match.match_id);
        setScreen("game");
      };

      socket.onmatchdata = (msg) => {
        const decoded = new TextDecoder().decode(msg.data);
        const state = JSON.parse(decoded);
        switch (msg.op_code) {
          case 1:
            console.log("on match data state : ",state)
            console.log("state : ",state)
            setMatchCancelled(state.match_cancelled)
            setPlayerNames(state.playerNames);
            setSymbols(state.symbols);
            setBoard(state.board);
            setTurn(state.turn);
            setWinner(state.winner);
            setWinPattern(state.winPattern);
            setMode(state.gameMode)
            break;
          case 2:
            setRemainingTime(state.remainingTime);
            break;
          default:
            console.log("User",msg.presence.user_id,"sent", msg.presence.user_id, state);
        }
      };

      setSocket(socket);
      setIsReady(true);
      socket.ondisconnect = async (evt) => {
        console.log("Socket disconnected:", evt);

        // try reconnect
        try {
          await socket.connect(session, true);
          console.log("Reconnected!");

          // rejoin match if needed
          if (matchId) {
            await socket.joinMatch(matchId, undefined, { name: usernameRef.current });
          }
        } catch (err) {
          console.log("Reconnect failed:", err);
        }
      };

      if (savedMatchId && savedMatchId !== "null") {
        try {
          const match = await socket.joinMatch(savedMatchId,undefined,{name: usernameRef.current});
          console.log("saved match : ", match)
          setMatchId(match.match_id);
          sessionStorage.setItem("matchId", match.match_id);
          setScreen("game");
          console.log("Rejoined match:", savedMatchId);
        } catch (err) {
          console.log("Failed to rejoin match");
          sessionStorage.removeItem("matchId");
        }
      }

    };

    start();
  }, []);

  /* ---------------- ACTIONS ---------------- */

  const saveUsername = async (name) => {
    if (!session || !name) return;
    try {
      await client.updateAccount(session, { display_name: name });
      usernameRef.current = name;
      setUsername(name)
    } catch (err) {
      console.error("error in saveUsername : ", err);
    }
  };

  const quickGame = async (gameMode) => {
    setIsSearching(true);
    setSearchTime(0);
    setMode(gameMode)

    let query = "+properties.gameMode:"+gameMode;
    let stringProperties = { "gameMode": gameMode};
    const ticket = await socket.addMatchmaker(query, 2, 2,stringProperties);
    matchmakerTicket.current = ticket;

    intervalRef.current = setInterval(() => {
      setSearchTime(prev => prev + 1);
    }, 1000);
  };

  const cancelMatchmaking = async () => {
    if (matchmakerTicket.current) {
      await socket.removeMatchmaker(matchmakerTicket.current.ticket);
      matchmakerTicket.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsSearching(false);
    setSearchTime(0);
  };

  const createRoom = async () => {
    const payload = { "roomName": roomName, "isPrivate":isPrivate, "gameMode":mode, "creator":username };
    const rpcid = "createMatchRPC";
    var match = await client.rpc(session, rpcid, payload);
    match = await socket.joinMatch(match.payload.matchId,undefined,{name: usernameRef.current});
    setMatchId(match.match_id);
    sessionStorage.setItem("matchId", match.match_id);
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
    const match = await socket.joinMatch(id,undefined,{name: usernameRef.current});
    console.log("joined match ",match)
    setMatchId(match.match_id);
    sessionStorage.setItem("matchId", match.match_id);
    setScreen("game");
  };

  const makeMove = (pos) => {
    if (!socket || !matchId) return;
    if (winner) return;
    if (turn !== playerId) return;
    if (board[pos] !== null) return;

    socket.sendMatchState(matchId, 1, JSON.stringify({ pos }));
  };

  const reset = async () => {
    if (socket && matchId) {
      await socket.leaveMatch(matchId);
    }

    setScreen("menu");
    setBoard(Array(9).fill(null));
    setTurn(null);
    setWinner(null);
    setWinPattern([]);
    setPlayerNames({})
    setSymbols({})
    setMatchId(null);
    sessionStorage.removeItem("matchId");
  };

  
  const openLeaderboard = async () => {
    setScreen("leaderboard");
  };

  /* ---------------- RENDER ---------------- */
  if (!isReady) {
    return <div style={layout.container}>Connecting to server...</div>;
  }
  return (
    <div style={layout.container}>
      <div style={layout.wrapper}>
        <div style={layout.header}>
          <BackButton
            onClick={reset}
            disabled={screen === "menu"}
          />

          <Profile
            username={username}
            onSave={saveUsername}
            editable={screen === "menu"}
          />
        </div>
        <div style={layout.card}>
          <h1 style={text.title}>🎮 Tic Tac Toe</h1>
          <div style={layoutHelpers.section}>
            {screen === "menu" && (
              <MenuScreen
                username={username}
                onQuickGame={quickGame}
                onCreate={() => setScreen("create")}
                onJoin={() => {
                  setScreen("join");
                  fetchRooms();
                }}
                isSearching = {isSearching}
                searchTime = {searchTime}
                onCancel = {cancelMatchmaking}
                searchingMode = {mode}
                openLeaderboard={openLeaderboard}
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
              />
            )}

            {screen === "join" && (
              <JoinRoomScreen
                rooms={rooms}
                onRefresh={fetchRooms}
                onJoin={joinRoom}
              />
            )}

            {screen === "game" && (
              <GameScreen
                board={board}
                turn={turn}
                winner={winner}
                playerId={playerId}
                makeMove={makeMove}
                match_cancelled={match_cancelled}
                winPattern={winPattern}
                playerNames={playerNames}
                symbols={symbols}
                mode={mode}
                remainingTime={remainingTime}
              />
            )}

            {screen === "leaderboard" && (
              <LeaderboardScreen
                client={client}
                session={session}
                playerId={playerId}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;