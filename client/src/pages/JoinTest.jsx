import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function JoinTest() {
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const joinRoom = async () => {
    if (roomCode.length < 4) return;
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/room/join",
        { roomCode },
        { headers: { Authorization: token } }
      );
      navigate(`/room/${roomCode}`);
    } catch (err) {
      setError(err.response?.data?.message || "Room not found. Check the code and try again.");
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") joinRoom(); };

  return (
    <div className="page" style={{ position: "relative", overflow: "hidden" }}>
      <Navbar />

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div className="glow-mesh" style={{ width: 500, height: 500, top: "10%", left: "50%", transform: "translateX(-50%)", background: "rgba(0,184,255,0.06)" }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 4.25rem)", padding: "2rem 1.5rem" }}>
        <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
          <div className="fade-up" style={{ textAlign: "center", marginBottom: "2rem" }}>
            
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", letterSpacing: "-0.03em", marginBottom: "0.4rem" }}>
              Join a Room
            </h1>
            <p style={{ color: "var(--text2)" }}>
              Enter the 6-character room code from your host
            </p>
          </div>

          <div className="fade-up card" style={{ animationDelay: "0.1s", padding: "2rem" }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text2)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
              Room Code
            </label>

            {/* Big code input */}
            <input
              type="text"
              placeholder="ABCDEF"
              value={roomCode}
              onChange={e => { setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)); setError(""); }}
              onKeyDown={handleKey}
              maxLength={8}
              style={{
                width: "100%", background: "var(--surface2)",
                border: `1px solid ${error ? "var(--danger)" : roomCode ? "var(--accent2)" : "var(--border)"}`,
                borderRadius: "var(--radius-sm)", padding: "1rem 1.25rem",
                color: "var(--text)", fontFamily: "monospace",
                fontSize: "1.75rem", fontWeight: 700, letterSpacing: "0.15em",
                outline: "none", textAlign: "center", textTransform: "uppercase",
                transition: "all 0.2s",
                boxShadow: roomCode && !error ? "0 0 0 3px rgba(0,184,255,0.12)" : "none",
              }}
            />

            {error && (
              <div style={{
                marginTop: "0.75rem", padding: "0.6rem 0.9rem",
                background: "var(--danger-dim)", border: "1px solid rgba(255,77,109,0.25)",
                borderRadius: 8, fontSize: "0.8rem", color: "var(--danger)",
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={joinRoom}
              disabled={loading || roomCode.length < 4}
              className="btn btn-primary btn-full"
              style={{ marginTop: "1.25rem", padding: "0.9rem", fontSize: "1rem" }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(0,26,18,0.3)", borderTopColor: "#001a12", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                  Joining…
                </span>
              ) : "Join Room →"}
            </button>
          </div>

          <p className="fade-up" style={{ textAlign: "center", color: "var(--text3)", fontSize: "0.8rem", marginTop: "1.5rem", animationDelay: "0.2s" }}>
            Ask the host to share the room code with you.
          </p>
        </div>
      </div>
    </div>
  );
}