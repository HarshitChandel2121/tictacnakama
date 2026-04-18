import { styles } from "../styles";

export default function CreateRoomScreen({
  roomName,
  setRoomName,
  mode,
  setMode,
  isPrivate,
  setIsPrivate,
  onCreate,
  goBack
}) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🏠 Create Room</h2>

        <input
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          style={styles.input}
        />

        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          style={styles.input}
        >
          <option value="relaxed">Relaxed</option>
          <option value="timed">Timed</option>
        </select>

        <label style={styles.checkboxContainer}>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
          <span style={{ marginLeft: "8px" }}>Private Room</span>
        </label>

        <div style={styles.buttonRow}>
          <button onClick={onCreate} style={styles.buttonPrimary}>
            Create
          </button>

          <button onClick={goBack} style={styles.buttonSecondary}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}