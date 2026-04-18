function matchInit(ctx, logger, nk, params) {
  return {
    state: {
      board: Array(9).fill(null),
      players: [],
      turn: null,
      winner: null,

      // ✅ STORE METADATA
      roomName: params.roomName,
      isPrivate: params.isPrivate,
      gameMode: params.gameMode,
      creator: params.creator
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
}

function matchJoinAttempt(ctx, logger, nk, dispatcher, tick, state, presence, metadata) {
  logger.info("➡️ matchJoinAttempt: " + presence.userId);
  if (state.players.length >= 2) {
    logger.info("❌ Rejecting join, match full");
    return { state, accept: false };
  }
  return { state, accept: true };
}

function matchJoin(ctx, logger, nk, dispatcher, tick, state, presences) {
  logger.info("✅ matchJoin called");

  presences.forEach(p => {
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
    state.turn = state.players[0];
    logger.info("🎮 Game starting. Turn: " + state.turn);
    dispatcher.broadcastMessage(1, JSON.stringify(state));
  }

  return { state };
}

function matchLoop(ctx, logger, nk, dispatcher, tick, state, messages) {
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

    if (state.winner) {
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

    state.board[data.pos] = msg.sender.userId;
    logger.info("✅ Move accepted");

    const winPatterns = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];

    for (let pattern of winPatterns) {
      const [a,b,c] = pattern;
      if (
        state.board[a] &&
        state.board[a] === state.board[b] &&
        state.board[a] === state.board[c]
      ) {
        state.winner = state.board[a];
        logger.info("🏆 Winner: " + state.winner);
      }
    }

    state.turn = state.players.find(p => p !== state.turn);
    logger.info("🔄 Next turn: " + state.turn);

    dispatcher.broadcastMessage(1, JSON.stringify(state));
    logger.info("📡 State broadcasted");
  });

  if (state.winner) {
    logger.info("Ending match");
    return null;
  }
  return { state };
}

function matchLeave(ctx, logger, nk, dispatcher, tick, state, presences) {
  logger.info("🚪 Player left");

  if (!state.winner && state.players.length === 2) {
    const leftPlayer = presences[0].userId;
    state.winner = state.players.find(p => p !== leftPlayer);
    logger.info("🏆 Winner by leave: " + state.winner);
  }

  return { state };
}

function matchTerminate(ctx, logger, nk, dispatcher, tick, state, graceSeconds) {
  return { state };
}

function matchSignal(ctx, logger, nk, dispatcher, tick, state, data) {
  // not using signals → just return state
  return { state: state };
}

const onMatchmakerMatched = function (ctx,logger,nk,matches) {
  const matchId = nk.matchCreate("tic-tac-toe")
  return matchId;
};

const createMatchRPC = function (ctx, logger, nk, payload) {
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

    // ✅ ADD THIS
    creator: ctx.username || ctx.userId
  });

  return JSON.stringify({ matchId });
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
    logger.error("matchList error: %v", error);
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

