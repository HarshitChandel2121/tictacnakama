export const layout = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
    color: "white"
  },

  wrapper: {
    padding: "10px"
  },

  header: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
    gap: "10px"
  },

  card: {
    width: "100%",
    background: "#1e293b",
    padding: "25px 25px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    textAlign: "center",
    boxSizing: "border-box",
    gap: "20px"
  }
};

export const text = {
  title: {
    marginTop: "10px",
    marginBottom: "40px",
    fontSize: "24px",
    fontWeight: "600"
  },

  status: {
    marginBottom: "10px",
    fontSize: "16px"
  }
};

export const layoutHelpers = {
  section: {
    marginBottom: "10px"
  },

  menuButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "10px"
  },

  buttonRow: {
    display: "flex",
    gap: "10px",
    marginTop: "10px"
  },

  divider: {
    margin: "20px 0",
    borderColor: "#334155"
  }
};

export const nav = {
  backButton: {
    background: "#1e293b",
    border: "none",
    color: "white",
    fontSize: "18px",
    borderRadius: "16px",
    padding: "6px 10px",
    cursor: "pointer"
  },

  disabled: {
    opacity: 0.3,
    cursor: "not-allowed"
  }
};