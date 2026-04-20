import { text } from "./styles/layout";

export const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
    color: "white"
  },

  card: {
    background: "#1e293b",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    textAlign: "center",
    width: "350px"
  },

  title: {
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "600"
  },

  section: {
    marginBottom: "20px"
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    marginBottom: "10px",
    width: "365px",
    display: "flex",
    textAlign: "center",
    boxSizing: "border-box" 
  },

  button: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#334155",
    color: "white",
    cursor: "pointer",
    marginBottom: "10px"
  },

  buttonPrimary: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#3b82f6",
    color: "white",
    cursor: "pointer",
    marginBottom: "10px"
  },

  buttonSecondary: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#64748b",
    color: "white",
    cursor: "pointer"
  },

  buttonSmall: {
    padding: "6px 10px",
    borderRadius: "6px",
    border: "none",
    background: "#3b82f6",
    color: "white",
    cursor: "pointer"
  },

  menuButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "20px"
  },

  buttonRow: {
    width: "365px",
    display: "flex",
    gap: "10px",
    marginTop: "10px"
  },

  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "15px"
  },

  divider: {
    margin: "20px 0",
    borderColor: "#334155"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 150px)",
    gap: "10px",
    justifyContent: "center",
    margin: "20px 0px"
  },

  cell: {
    height: "150px",
    fontSize: "28px",
    borderRadius: "12px",
    border: "none",
    background: "#334155",
    color: "white",
    cursor: "pointer",
    fontWeight: "5px"
  },

  status: {
    marginBottom: "10px",
    fontSize: "16px"
  },

  roomList: {
    marginTop: "10px"
  },

  roomCard: {
    background: "#334155",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  roomMeta: {
    fontSize: "12px",
    color: "#cbd5f5"
  }
};