import { useState } from "react";
import { styles } from "../styles";

export default function JoinRoomScreen({
  rooms,
  onRefresh,
  onJoin,
  goBack
}) {
  const [roomId, setRoomId] = useState("");

  return (
    <div>
      <h2 style={styles.title}>🔗 Join Room</h2>

      {/* Join by ID */}
      <input
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        style={styles.input}
      />

      <button
        onClick={() => onJoin(roomId)}
        style={styles.buttonPrimary}
      >
        Join by ID
      </button>

      <hr style={styles.divider} />

      {/* Public rooms */}
      <button onClick={onRefresh} style={styles.button}>
        🔄 Refresh
      </button>

      <div style={styles.roomList}>
        {rooms.map((room) => (
          <div key={room.matchId} style={styles.roomCard}>
            <div>
              <b>{room.roomName}</b>
              <div style={styles.roomMeta}>
                🎮 {room.gameMode} | 👤 {room.creator}
              </div>
              <div style={styles.roomMeta}>
                👥 {room.playerCount}/2
              </div>
            </div>

            <button
              onClick={() => onJoin(room.matchId)}
              style={styles.buttonSmall}
            >
              Join
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}