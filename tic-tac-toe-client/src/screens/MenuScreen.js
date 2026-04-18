import { styles } from "../styles";

export default function MenuScreen({
  username,
  setUsername,
  onSave,
  onQuickGame,
  onCreate,
  onJoin
}) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🎮 Tic Tac Toe</h1>

        <div style={styles.section}>
          <input
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
          <button onClick={onSave} style={styles.buttonSecondary}>
            Save
          </button>
        </div>

        <div style={styles.menuButtons}>
          <button onClick={onQuickGame} style={styles.buttonPrimary}>
            ⚡ Quick Game
          </button>

          <button onClick={onCreate} style={styles.button}>
            🏠 Create Room
          </button>

          <button onClick={onJoin} style={styles.button}>
            🔗 Join Room
          </button>
        </div>
      </div>
    </div>
  );
}