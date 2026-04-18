export const layout = {
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
  }
};

export const text = {
  title: {
    marginBottom: "20px",
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
    marginBottom: "20px"
  },

  menuButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "20px"
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