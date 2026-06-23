import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import socket from "../socket";

export default function Room() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [room, setRoom] = useState(null);
  const [duration, setDuration] = useState(30);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchRoom();
    socket.emit("join-room", roomCode);

    socket.on("participant-joined", updatedRoom => setRoom(updatedRoom));
    socket.on("duration-updated", newDuration => setDuration(newDuration));
    socket.on("quiz-started", () => navigate(`/room/${roomCode}/quiz`));
    socket.on("room-finished", () => navigate(`/room/${roomCode}/leaderboard`));

    return () => {
      socket.off("participant-joined");
      socket.off("duration-updated");
      socket.off("quiz-started");
      socket.off("room-finished");
    };
  }, [roomCode, navigate]);

  const fetchRoom = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/room/${roomCode}`, { headers: { Authorization: token } });

      const alreadySubmitted = res.data.submittedUsers?.some(user => user._id === userId);
      if (alreadySubmitted) { navigate(`/room/${roomCode}/leaderboard`); return; }

      setRoom(res.data);
      setDuration(res.data.duration || 30);

      if (res.data.status === "finished") { navigate(`/room/${roomCode}/leaderboard`); return; }
      if (res.data.status === "live") { navigate(`/room/${roomCode}/quiz`); }
    } catch (err) { console.log(err); }
  };

  const saveDuration = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/room/duration/${roomCode}`, { duration }, { headers: { Authorization: token } });
    } catch (err) { console.log(err); }
  };

  const startQuiz = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/api/room/start/${roomCode}`, {}, { headers: { Authorization: token } });
      fetchRoom();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!room) {
    return (
      <div className="page">
        <Navbar />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: "1rem" }}>
          <div className="spinner" />
          <p style={{ color: "var(--text2)" }}>Loading room…</p>
        </div>
      </div>
    );
  }

  const isHost = room.hostId._id === userId;

  return (
    <div className="page">
      <Navbar />

      {/* Glow */}
      <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: "rgba(0,229,160,0.04)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />

      <div className="container page-content">
        {/* Header */}
        <div className="fade-up" style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.5rem, 4vw, 2.25rem)", letterSpacing: "-0.02em" }}>
              QUIZ ROOM
            </h1>
            <span className="badge badge-yellow">⏳ Waiting</span>
          </div>
          <p style={{ color: "var(--text2)" }}>
            {isHost ? "You're the host. Start when everyone has joined." : "Waiting for the host to start the quiz."}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem" }}>
          {/* Room info card */}
          <div className="fade-up card" style={{ animationDelay: "0.1s" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.5rem", color: "var(--text2)", letterSpacing: "0.01em" }}>
              ROOM INFO
            </h2>

            {/* Room code */}
            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>Room Code</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <code style={{
                  fontFamily: "monospace", fontSize: "2rem", fontWeight: 800,
                  color: "var(--accent)", letterSpacing: "0.15em",
                  background: "var(--accent-dim)", padding: "0.4rem 1rem", borderRadius: 8,
                }}>
                  {room.roomCode}
                </code>
                <button onClick={copyCode} className="btn btn-ghost" style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem" }}>
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="divider" />

            {/* Host */}
            <div style={{ marginBottom: "1.25rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>Host</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--accent2))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem", color: "#001a12" }}>
                  {room.hostId.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontWeight: 600 }}>{room.hostId.name}</span>
                {isHost && <span className="badge badge-green" style={{ fontSize: "0.65rem" }}>You</span>}
              </div>
            </div>

            {/* Duration */}
            <div style={{ marginBottom: "1.75rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                Duration {isHost && <span style={{ color: "var(--accent2)", fontWeight: 400 }}>(editable)</span>}
              </p>
              {isHost ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <input
                    type="number" min={1} max={180} value={duration}
                    onChange={e => setDuration(e.target.value)}
                    onBlur={saveDuration}
                    className="input" style={{ width: 90, textAlign: "center", fontWeight: 700, fontSize: "1.1rem" }}
                  />
                  <span style={{ color: "var(--text2)", fontSize: "0.9rem" }}>minutes</span>
                </div>
              ) : (
                <p style={{ fontSize: "1.25rem", fontWeight: 700 }}>{duration} min</p>
              )}
            </div>

            {isHost ? (
              <button onClick={startQuiz} className="btn btn-primary btn-full btn-lg" style={{ boxShadow: "0 4px 24px rgba(0,229,160,0.2)" }}>
                ▶ Start Quiz
              </button>
            ) : (
              <div style={{
                padding: "1rem", borderRadius: "var(--radius-sm)",
                background: "var(--accent2-dim)", border: "1px solid rgba(0,184,255,0.2)",
                color: "var(--accent2)", fontSize: "0.9rem", fontWeight: 500,
                display: "flex", alignItems: "center", gap: "0.6rem",
              }}>
                <span style={{ display: "flex", gap: 3 }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{
                      width: 6, height: 6, borderRadius: "50%", background: "var(--accent2)",
                      animation: `pulse-glow 1.2s ${i * 0.3}s infinite`,
                      display: "inline-block",
                    }} />
                  ))}
                </span>
                Waiting for host to start…
              </div>
            )}
          </div>

          {/* Quiz + participants card */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Quiz info */}
            <div className="fade-up card" style={{ animationDelay: "0.15s" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1rem", color: "var(--text2)", letterSpacing: "0.01em" }}>
                QUIZ DETAILS
              </h2>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.3rem", marginBottom: "1rem" }}>
                {room.quizId.title}
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
                {[
                  { label: "Subject", value: room.quizId.subject },
                  { label: "Difficulty", value: room.quizId.difficulty },
                  { label: "Questions", value: room.quizId.questions?.length },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: "var(--surface2)", padding: "0.75rem", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                    <p style={{ fontSize: "0.65rem", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>{label}</p>
                    <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Participants */}
            <div className="fade-up card" style={{ animationDelay: "0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "var(--text2)", letterSpacing: "0.01em" }}>
                  PARTICIPANTS
                </h2>
                <span className="badge badge-blue">{room.participants.length} joined</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: 280, overflowY: "auto" }}>
                {room.participants.map((p) => (
                  <div key={p._id} style={{
                    display: "flex", alignItems: "center", gap: "0.65rem",
                    padding: "0.6rem 0.75rem", borderRadius: "var(--radius-sm)",
                    background: "var(--surface2)", border: "1px solid var(--border)",
                  }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: p._id === userId ? "linear-gradient(135deg, var(--accent), var(--accent2))" : "var(--surface)", border: "1px solid var(--border2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: p._id === userId ? "#001a12" : "var(--text2)" }}>
                      {p.name?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ flex: 1, fontSize: "0.9rem", fontWeight: p._id === userId ? 600 : 400 }}>{p.name}</span>
                    {p._id === room.hostId._id && <span className="badge badge-green" style={{ fontSize: "0.6rem" }}>Host</span>}
                    {p._id === userId && p._id !== room.hostId._id && <span style={{ fontSize: "0.7rem", color: "var(--text3)" }}>You</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}