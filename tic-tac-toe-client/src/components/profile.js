import React, { useEffect, useState, useRef } from "react";
export default function Profile({ username, onSave, editable }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(username);

  useEffect(() => {
    setTempName(username);
  }, [username]);

  const handleSave = () => {
    if (!tempName.trim()) return;
    onSave(tempName);
    setIsEditing(false);
  };

  return (
    <div style={styles.container}>
      {!isEditing ? (
        <>
          <span style={styles.name} title={username}>👤 {username}</span>
          {editable&&<span
            style={styles.edit}
            onClick={() => setIsEditing(true)}
          >
            ✏️
          </span>}
        </>
      ) : (
        <>
          <input
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            style={styles.input}
          />
          <span style={styles.save} onClick={handleSave}>
            ✔
          </span>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: "#1e293b",
    padding: "6px 10px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    maxWidth: "160px",
    overflow: "hidden"
  },
  edit: {
    cursor: "pointer"
  },
  save: {
    cursor: "pointer",
    color: "#4ade80"
  },
  input: {
    padding: "4px",
    borderRadius: "6px",
    border: "none",
    width: "100%",
    minWidth: "0"
  },
  name: {
    maxWidth: "120px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  }
};