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
            updateLeaderboard(nk,logger,state.players[0],state.players[1],state.winner,state.playerNames)
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
        updateLeaderboard(nk,logger,state.players[0],state.players[1],state.winner,state.playerNames)
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
          updateLeaderboard(nk,logger,state.players[0],state.players[1],state.winner,state.playerNames)
          state.winPattern = pattern
          logger.info("🏆 Winner: " + state.winner);
        }
      }

      if (!state.winner && state.board.every(cell => cell !== null)) {
        state.winner = "draw";
        updateLeaderboard(nk,logger,state.players[0],state.players[1],state.winner,state.playerNames)
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

const getPlayerRecord = (nk, logger, userId) => {
  try {
    logger.info("getting records for userId : "+userId)
    const records = nk.leaderboardRecordsList(
      "global_leaderboard",
      [userId],
      1
    );
    
    // logger.info(records)

    if (records.ownerRecords.length > 0) {
      return records.ownerRecords[0];
    }
  } catch(error) {
    logger.error("error in getPlayerRecord : "+ JSON.stringify(error));
  }

  return {
    score: 500,
    metadata: {
      wins: 0,
      losses: 0,
      draws:0,
      streak: 0,
      bestStreak: 0
    }
  };
};

const calculateElo = (logger, ratingA, ratingB, scoreA, K = 32) => {
  try {
    const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));

    const diff = Math.abs(ratingA - ratingB);

    // 🔥 amplify factor for large rating gaps
    const factor = diff > 200 ? 1.5 : diff > 100 ? 1.2 : 1;
    if (scoreA === 0.5) {
      factor *= 0.5;
    }

    return Math.round(ratingA + K * factor * (scoreA - expectedA));
  } catch(error) {
    logger.error("error in calculateElo : "+ JSON.stringify(error))
    return ratingA
  }
};

const updateLeaderboard = (nk, logger, user1Id, user2Id, winner,playerNames) => {
  try {
    const user1Name = playerNames[user1Id]
    const user2Name = playerNames[user2Id]

    const user1Record = getPlayerRecord(nk,logger, user1Id);
    const user2Record = getPlayerRecord(nk,logger, user2Id);

    const user1Rating = user1Record.score;
    const user2Rating = user2Record.score;

    const user1ScoreA = (winner=="draw")?0.5:((winner==user1Id)?1:0);
    const user2ScoreA = (winner=="draw")?0.5:((winner==user2Id)?1:0);
    const user1NewRating = calculateElo(logger,user1Rating, user2Rating, user1ScoreA);
    const user2NewRating = calculateElo(logger,user2Rating, user1Rating, user2ScoreA);

    // update metadata
    const user1Meta = { ...(user1Record.metadata || {
      wins: 0,
      losses: 0,
      streak: 0,
      bestStreak: 0
    }) };
    const user2Meta = { ...(user2Record.metadata || {
      wins: 0,
      losses: 0,
      streak: 0,
      bestStreak: 0
    }) };

    if (winner=="draw") {
      user1Meta.draws += 1;
      user1Meta.streak = 0;

      user2Meta.draws += 1;
      user2Meta.streak = 0;
    }
    else {
      if (winner==user1Id) {
        user1Meta.wins += 1;
        user1Meta.streak += 1;
        user1Meta.bestStreak = Math.max(user1Meta.bestStreak, user1Meta.streak);

        user2Meta.losses += 1;
        user2Meta.streak = 0;
      } else
      {
        user2Meta.wins += 1;
        user2Meta.streak += 1;
        user2Meta.bestStreak = Math.max(user2Meta.bestStreak, user2Meta.streak);

        user1Meta.losses += 1;
        user1Meta.streak = 0;
      }
    }

    logger.info("saving updated record")
    // write leaderboard
    nk.leaderboardRecordWrite(
      "global_leaderboard",
      user1Id,
      user1Name,
      user1NewRating,
      0,
      user1Meta
    );

    nk.leaderboardRecordWrite(
      "global_leaderboard",
      user2Id,
      user2Name,
      user2NewRating,
      0,
      user2Meta
    );
    logger.info("saved updated record")
  } catch(error) {
    logger.error("error in updateLeaderboard : " + JSON.stringify(error));
  }
};


var InitModule = function (ctx, logger, nk, initializer) {
  logger.info("🔥 InitModule called");

  // Create leaderboard once
  try {
    nk.leaderboardCreate(
      "global_leaderboard",
      true, // authoritative
      "desc",
      "set"
    );
    logger.info("Leaderboard created");
  } catch (err) {
    logger.info("Leaderboard already exists or error: " + err);
  }

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

