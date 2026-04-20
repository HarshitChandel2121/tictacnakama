const OPCODES = {
  STATE_UPDATE: 1,
  TIME_UPDATE: 2,
  ERROR: 99
};

function matchInit(ctx, logger, nk, params) {
  try {
    return {
      state: {
        board: Array(9).fill(null),
        players: [],
        disconnected: {},
        playerNames: {},
        match_started: false,
        turn: null,
        winner: null,
        symbols: {},
        currentPlayerSymbol: '',
        winPattern: null,

        // ✅ STORE METADATA
        roomName: params.roomName,
        isPrivate: params.isPrivate,
        gameMode: params.gameMode,
        creator: params.creator,
        fromMatchMaker: params.fromMatchMaker,
        created_at: 0,
        match_cancelled: false,
        gameMode: params.gameMode,
        moveDeadline: null,
        moveTimeLimit: params.gameMode === "timed" ? 30 : null,
        remainingTime: null
      },

      // ✅ IMPORTANT (for listMatches)
      label: JSON.stringify({
        roomName: params.roomName,
        isPrivate: params.isPrivate,
        gameMode: params.gameMode,
        creator: params.creator
      }),

      tickRate: 1
    };
  } catch (error) {
    logger.error("matchInit error:", error);

    return {
      state: {
        board: Array(9).fill(null),
        players: [],
        disconnected: {},
        playerNames: {},
        match_started: false
      },
      tickRate: 1
    };
  }
}

function matchJoinAttempt(ctx, logger, nk, dispatcher, tick, state, presence, metadata) {
  try {
    logger.info("➡️ matchJoinAttempt: " + presence.userId);
    const isFull = state.players.length >= 2;
    const isDuplicate = state.players.includes(presence.userId);
    const isReconnect = presence.userId in state.disconnected;
    
    const name =
      (metadata?.name && metadata.name.trim() !== "")
        ? metadata.name.trim()
        : ("Player_" + presence.userId.slice(0, 4));

    state.playerNames[presence.userId] = name;
    if ((isFull || isDuplicate) && !isReconnect) {
      logger.info("Rejecting join");
      return { state, accept: false };
    }
    return { state, accept: true };
  } catch (error) {
    logger.error("matchJoinAttempt error:", error);

    return { state, accept: false };  // safest fallback
  }
}

function matchJoin(ctx, logger, nk, dispatcher, tick, state, presences) {
  try {
    logger.info("✅ matchJoin called");

    presences.forEach(p => {
      if (p.userId in state.disconnected) {
        delete state.disconnected[p.userId]
        return
      }
      if (state.players.length >= 2) {
        logger.info("⚠️ Match already full, ignoring: " + p.userId);
        return;
      }

      if (!state.players.includes(p.userId)) {
        logger.info("👤 Player joined: " + p.userId);
        state.players.push(p.userId);
      }
    });

    if (state.players.length === 2) {
      if (!state.match_started)
      {
        state.turn = state.players[0];
        logger.info("🎮 Game starting. Turn: " + state.turn);
        state.symbols = {
          [state.players[0]]: "X",
          [state.players[1]]: "O"
        };
        state.currentPlayerSymbol = state.symbols[state.turn];
        for (let id in state.playerNames) {
          if (!state.players.includes(id)) {
            delete state.playerNames[id];
          }
        }
        if (state.gameMode === "timed") {
          state.moveDeadline = tick + state.moveTimeLimit;
          state.remainingTime = 30
        }
        state.match_started=true;
      }
      logger.info("broad casting from match join")
      dispatcher.broadcastMessage(1, JSON.stringify(state));
    }

    return { state };
  } catch (error) {
    logger.error("matchJoin error:", error);
    return { state };   
  }
}

function matchLoop(ctx, logger, nk, dispatcher, tick, state, messages) {
  try {
    const DISCONNECT_TIMEOUT = 10;

    if (state.created_at==0) {
      state.created_at=tick
    }
    if (!state.match_started && state.fromMatchMaker && tick-state.created_at>DISCONNECT_TIMEOUT) {
      state.match_cancelled = true
      dispatcher.broadcastMessage(1, JSON.stringify(state));
      return null
    } 
    if (state.players.length==0 && tick-state.created_at>DISCONNECT_TIMEOUT*2) {
      logger.info("INACTIVE ROOM :: MATCH CANCELLED")
      state.match_cancelled = true
      return null
    }
    for (let playerId in state.disconnected) {
      if (tick - state.disconnected[playerId] > DISCONNECT_TIMEOUT) {
        logger.info("Player timed out: " + playerId);

        // declare winner ONLY if game ongoing
        if (!state.winner) {
          const otherPlayer = state.players.find(p => p !== playerId);

          if (otherPlayer) {
            state.winner = otherPlayer;
            logger.info("🏆 Winner (timeout): " + otherPlayer);
          }
        }

        // cleanup (optional)
        delete state.disconnected[playerId];

        dispatcher.broadcastMessage(1, JSON.stringify(state));
        return null
      }
    }

    if (
      state.gameMode === "timed" &&
      state.moveDeadline &&
      !state.winner &&
      !state.match_cancelled
    ) {
      if (tick >= state.moveDeadline) {
        const loser = state.turn;
        const winner = state.players.find(p => p !== loser);
        state.remainingTime=0;
        dispatcher.broadcastMessage(2, JSON.stringify({remainingTime:state.remainingTime}));
        state.winner = winner;
        logger.info("⏱ Time out. Winner: " + winner);

        dispatcher.broadcastMessage(1, JSON.stringify(state));
        return null;
      }
    }

    logger.info("Match Loop called")
    if (messages.length > 0) {
      logger.info("📩 Messages received: " + messages.length);
    }

    messages.forEach(msg => {
      logger.info("📨 Raw message: " + msg.data);

      let data;
      try {
        const decoded = nk.binaryToString(msg.data);  // ✅ FIX
        logger.info("🧠 Decoded: " + decoded);

        data = JSON.parse(decoded);
      } catch (e) {
        logger.error("❌ JSON parse failed");
        return;
      }

      logger.info("👉 Move from: " + msg.sender.userId + " pos: " + data.pos);

      if (state.winner || state.match_cancelled) {
        logger.info("🏁 Game already finished");
        return;
      }

      if (msg.sender.userId !== state.turn) {
        logger.info("⛔ Not your turn");
        return;
      }

      if (state.board[data.pos] !== null) {
        logger.info("⛔ Cell already filled");
        return;
      }

      state.board[data.pos] = state.symbols[msg.sender.userId];
      logger.info("✅ Move accepted");

      const winPatterns = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
      ];

      for (let pattern of winPatterns) {
        const [a,b,c] = pattern;
        if (
          state.board[a] === state.currentPlayerSymbol &&
          state.board[b] === state.currentPlayerSymbol &&
          state.board[c] === state.currentPlayerSymbol
        ) {
          state.winner = msg.sender.userId;
          state.winPattern = pattern
          logger.info("🏆 Winner: " + state.winner);
        }
      }

      if (!state.winner && state.board.every(cell => cell !== null)) {
        state.winner = "draw";
        logger.info("Game draw");
      }

      if (!state.winner) {
        state.turn = state.players.find(p => p !== state.turn);
        state.currentPlayerSymbol = state.symbols[state.turn];
        logger.info("Next turn: " + state.turn);
        if (state.gameMode === "timed") {
          state.moveDeadline = tick + state.moveTimeLimit;
        }
      }

      dispatcher.broadcastMessage(1, JSON.stringify(state));
      logger.info("State broadcasted");
    });

    if (state.winner) {
      logger.info("Ending match");
      return null;
    }
    state.remainingTime =
      state.gameMode === "timed" && state.moveDeadline
        ? Math.max(0, state.moveDeadline - tick)
        : null;
    dispatcher.broadcastMessage(2, JSON.stringify({remainingTime:state.remainingTime}));
    logger.info("State broadcasted");
    return { state };
  } catch (error) {
    logger.error("error in matchLoop : ", error);
    return { state };
  }
}

function matchLeave(ctx, logger, nk, dispatcher, tick, state, presences) {
  try {
    logger.info("🚪 Player left (temporary?)");

    presences.forEach(p => {
      state.disconnected[p.userId] = tick; // store when they left
    });

    return { state };
  } catch (error) {
    logger.error("error in matchLeave : ", error);
    return { state };
  }
}

function matchTerminate(ctx, logger, nk, dispatcher, tick, state, graceSeconds) {
  return { state };
}

function matchSignal(ctx, logger, nk, dispatcher, tick, state, data) {
  // not using signals → just return state
  return { state: state };
}

const onMatchmakerMatched = function (ctx,logger,nk,matches) {
  try {
    logger.info("MATCHE MADE MATCHES : ",JSON.stringify(matches))
    const gameMode = matches[0].properties?.gameMode || "relaxed";
    const matchId = nk.matchCreate("tic-tac-toe", {
      gameMode: gameMode,
      fromMatchMaker: true,
    });
    return matchId;
  } catch (error) {
    logger.error("error in onMatchmakerMatched : ", error);
    return null;
  }
};

const createMatchRPC = function (ctx, logger, nk, payload) {
  try {
    let data = {};

    try {
      if (payload) data = JSON.parse(payload);
    } catch (e) {
      return JSON.stringify({ error: "Invalid payload" });
    }

    const matchId = nk.matchCreate("tic-tac-toe", {
      roomName: data.roomName || "Room",
      isPrivate: data.isPrivate || false,
      gameMode: data.gameMode || "relaxed",
      fromMatchMaker: false,
      creator: data.creator || ctx.username || ctx.userId
    });

    return JSON.stringify({ matchId });
  } catch (error) {
    logger.error("error in createMatchRPC : ", error);
    return JSON.stringify({ error: "MATCH_CREATE_FAILED" });
  }
};

let listMatchesRPC = function (ctx, logger, nk, payload) {
  let payload_json = JSON.parse(payload || "{}");

  let limit = payload_json.limit ?? 10;
  let isAuthoritative = payload_json.isAuthoritative ?? null;
  let label = payload_json.label ?? null;
  let minSize = payload_json.minSize ?? null;
  let maxSize = payload_json.maxSize ?? null;
  let query = payload_json.query ?? null;

  try {
    let matches = nk.matchList(
      limit,
      isAuthoritative,
      label,
      minSize,
      maxSize,
      query
    );

    return JSON.stringify(matches);
  } catch (error) {
    logger.error("matchList error:", error);
    return JSON.stringify({ error: "Failed to fetch matches" });
  }
};

var InitModule = function (ctx, logger, nk, initializer) {
  logger.info("🔥 InitModule called");

  initializer.registerMatch("tic-tac-toe", {
    matchInit: matchInit,
    matchJoinAttempt: matchJoinAttempt,
    matchJoin: matchJoin,
    matchLeave: matchLeave,
    matchLoop: matchLoop,
    matchTerminate: matchTerminate,
    matchSignal: matchSignal 
  });

  initializer.registerMatchmakerMatched(onMatchmakerMatched)

  initializer.registerRpc("listMatchesRPC", listMatchesRPC);
  initializer.registerRpc("createMatchRPC", createMatchRPC);
};

globalThis.onMatchmakerMatched = onMatchmakerMatched;
globalThis.InitModule = InitModule;

