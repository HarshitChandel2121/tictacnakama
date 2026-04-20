import React, { useState } from "react";
import { buttons } from "../styles/components";

const PAGE_SIZE = 5;

export default function LeaderboardScreen({
  client,
  session,
  playerId
}) {
  const [records, setRecords] = useState([]);

  // 🔝 Top
  const goTop = async () => {
    const res = await client.listLeaderboardRecords(
      session,
      "global_leaderboard",
      undefined,
      PAGE_SIZE
    );
    setRecords(res.records || []);
  };

  // 🎯 My Rank with neighbors
  const goMyRank = async () => {
    const res = await client.listLeaderboardRecordsAroundOwner(
      session,
      "global_leaderboard",
      playerId,
      PAGE_SIZE
    );
    setRecords(res.records || []);
  };

  return (
    <div style={{width:"365px"}}>
      <h2>🏆 Leaderboard</h2>

      {/* 🔘 Controls */}
      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <button style={buttons.primary} onClick={goTop}>
          🔝 Top 5
        </button>

        <button style={buttons.primary} onClick={goMyRank}>
          🎯 My Rank
        </button>
      </div>

      <div style={{ marginTop: "15px" }}>
        {records.length === 0 && (
          <div style={{ opacity: 0.7 }}>No data yet</div>
        )}

        {records.map((p, i) => {
          const isYou = p.owner_id === playerId;
          const meta = p.metadata || {};
          const displayRank = p.rank || i + 1;
          const displayName = p.username || "Player";

          return (
            <div
              key={p.owner_id + displayRank}
              style={{
                background: isYou ? "#1d4ed8" : "#334155",
                padding: "12px",
                borderRadius: "10px",
                marginBottom: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              {/* LEFT */}
              <div>
                <div style={{ fontWeight: "600" }}>
                  #{displayRank} {displayName} {isYou && "(You)"}
                </div>

                <div style={{ fontSize: "12px", opacity: 0.8 }}>
                  ⭐ {p.score}
                </div>
              </div>

              {/* RIGHT */}
              <div style={{ fontSize: "12px", textAlign: "right" }}>
                <div>W: {meta.wins || 0}</div>
                <div>L: {meta.losses || 0}</div>
                <div>D: {meta.draws || 0}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}