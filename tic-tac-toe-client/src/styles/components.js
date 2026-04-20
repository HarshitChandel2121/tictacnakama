export const form = {
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    marginBottom: "10px"
  },

  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "15px"
  }
};

export const buttons = {
  default: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#334155",
    color: "white",
    cursor: "pointer",
    marginBottom: "10px"
  },

  primary: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#3b82f6",
    color: "white",
    cursor: "pointer",
    marginBottom: "10px"
  },

  secondary: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#64748b",
    color: "white",
    cursor: "pointer"
  },

  small: {
    padding: "6px 10px",
    borderRadius: "6px",
    border: "none",
    background: "#3b82f6",
    color: "white",
    cursor: "pointer"
  }
};

export const gridStyles = {

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 115px)",
    gap: "10px",
    justifyContent: "center",
    marginTop: "20px",
    marginBottom: "20px"
  },

  cell: {
    height: "115px",
    borderRadius: "12px",
    border: "none",
    background: "#334155",
    color: "white",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: "15px"
  },

  xoCell: {
    fontSize: "40px",
    fontWeight: 500,
    fontFamily: "'Poppins', sans-serif"
  },

  winCell: {
    background: "#22c55e",   // green highlight
    color: "white"
  },

  lostCell: {
    background: "#dc1f1f",   // green highlight
    color: "white"
  }
};

export const room = {
  list: {
    marginTop: "10px"
  },

  card: {
    background: "#334155",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  meta: {
    fontSize: "12px",
    color: "#cbd5f5"
  }
};

export const player = {
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#334155",
    padding: "10px",
    borderRadius: "10px",
    marginBottom: "10px",
    transition: "0.2s"
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },

  right: {
    textAlign: "right",
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },

  name: {
    fontSize: "14px",
    fontWeight: "500"
  },

  symbol: {
    fontSize: "18px",
    fontWeight: "bold"
  },

  timer: {
    fontSize: "13px"
  },

  result: {
    fontSize: "13px",
    fontWeight: "600"
  },

  active: {
    boxShadow: "inset 0 0 0 2px #3b82f6"
  },

  winner: {
    background: "#22c55e"
  },

  loser: {
    background: "#dc2626"
  }
};