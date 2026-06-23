import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import socket from "../socket";

const medals = ["🥇", "🥈", "🥉"];

export default function RoomLeaderboard() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [leaders, setLeaders] = useState([]);
  const [room, setRoom] = useState(null);
  const [submitted, setSubmitted] = useState(0);
  const [total, setTotal] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");
  const [timePercent, setTimePercent] = useState(100);

  useEffect(() => {
    socket.emit("join-room", roomCode);
    socket.on("room-finished", () => setRoom(prev => ({ ...prev, status: "finished" })));
    socket.on("leaderboard-updated", data => {
      setLeaders(data.leaderboard);
      setSubmitted(data.submitted);
      setTotal(data.total);
    });
    return () => {
      socket.off("leaderboard-updated");
      socket.off("room-finished");
    };
  }, [roomCode]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [leaderRes, roomRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/room/leaderboard/${roomCode}`, { headers: { Authorization: token } }),
        axios.get(`http://localhost:5000/api/room/${roomCode}`, { headers: { Authorization: token } }),
      ]);
      setLeaders(leaderRes.data);
      setRoom(roomRes.data);
      setSubmitted(roomRes.data.submittedUsers.length);
      setTotal(roomRes.data.participants.length);
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    if (!room || room.status === "finished" || !room.endTime) return;
    const end = new Date(room.endTime).getTime();
    const totalMs = room.duration * 60 * 1000;
    const interval = setInterval(() => {
      const diff = end - Date.now();
      if (diff <= 0) { setTimeLeft("00:00"); setTimePercent(0); clearInterval(interval); return; }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, "0")}`);
      setTimePercent((diff / totalMs) * 100);
    }, 1000);
    return () => clearInterval(interval);
  }, [room]);

  const myRank = leaders.findIndex(l => l.userId?._id === userId) + 1;
  const myEntry = leaders.find(l => l.userId?._id === userId);
  const timeColor = timePercent > 50 ? "var(--accent)" : timePercent > 20 ? "var(--warn)" : "var(--danger)";

  return (
    <div className="page">
      <Navbar />

      {/* Confetti-like glow for finished */}
      {room?.status === "finished" && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div className="glow-mesh" style={{ width: 400, height: 400, top: 0, left: "20%", background: "rgba(0,229,160,0.06)" }} />
          <div className="glow-mesh" style={{ width: 400, height: 400, top: 0, right: "20%", background: "rgba(0,184,255,0.05)" }} />
        </div>
      )}

      <div className="container-md page-content">
        {/* Header */}
        <div className="fade-up" style={{ marginBottom: "2rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>
            {room?.status === "finished" ? "🏆" : "⏳"}
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.75rem, 5vw, 2.5rem)", letterSpacing: "-0.03em", marginBottom: "0.4rem" }}>
            {room?.status === "finished" ? "Final Results" : "Live Leaderboard"}
          </h1>
          <p style={{ color: "var(--text2)" }}>
            {room?.status === "finished" ? "Quiz complete — here are the final standings" : "Rankings update in real-time as people submit"}
          </p>
        </div>

        {/* Stats row */}
        {room && (
          <div className="fade-up" style={{ animationDelay: "0.1s", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <div className="stat-card">
              <p className="label">Participants</p>
              <p className="value">{total}</p>
            </div>
            <div className="stat-card">
              <p className="label">Submitted</p>
              <p className="value" style={{ color: "var(--accent)" }}>{submitted}</p>
            </div>
            <div className="stat-card">
              <p className="label">Pending</p>
              <p className="value" style={{ color: "var(--warn)" }}>{total - submitted}</p>
            </div>
            {myRank > 0 && (
              <div className="stat-card" style={{ borderColor: "rgba(0,229,160,0.2)" }}>
                <p className="label">Your Rank</p>
                <p className="value" style={{ color: "var(--accent)" }}>#{myRank}</p>
              </div>
            )}
          </div>
        )}

        {/* Timer bar */}
        {room && room.status !== "finished" && (
          <div className="fade-up card" style={{ animationDelay: "0.15s", marginBottom: "1.5rem", padding: "1rem 1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text2)", fontWeight: 600 }}>⏱ Time remaining</span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: timeColor, fontSize: "1rem" }}>{timeLeft}</span>
            </div>
            <div style={{ height: 6, background: "var(--surface2)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${timePercent}%`, background: timeColor, borderRadius: 99, transition: "width 1s linear, background 0.5s" }} />
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
          {leaders.map((attempt, index) => {
            const pct = Math.round((attempt.score / attempt.totalQuestions) * 100);
            const isMe = attempt.userId?._id === userId;
            const isTop3 = index < 3;

            return (
              <div
                key={attempt._id}
                className="fade-up card"
                style={{
                  animationDelay: `${0.05 * index}s`,
                  border: isMe ? "1px solid rgba(0,229,160,0.3)" : isTop3 ? "1px solid var(--border2)" : "1px solid var(--border)",
                  background: isMe ? "rgba(0,229,160,0.04)" : "var(--surface)",
                  padding: "1rem 1.25rem",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  {/* Rank */}
                  <div style={{ minWidth: 40, textAlign: "center" }}>
                    {isTop3 ? (
                      <span style={{ fontSize: "1.5rem" }}>{medals[index]}</span>
                    ) : (
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "var(--text3)" }}>
                        #{index + 1}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: isMe
                      ? "linear-gradient(135deg, var(--accent), var(--accent2))"
                      : isTop3 ? "linear-gradient(135deg, var(--accent2), rgba(0,229,160,0.5))" : "var(--surface2)",
                    border: `1px solid ${isMe ? "var(--accent)" : "var(--border)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: "0.85rem",
                    color: isMe ? "#001a12" : "var(--text2)",
                  }}>
                    {attempt.userId?.name?.charAt(0).toUpperCase()}
                  </div>

                  {/* Name + bar */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.95rem", color: isMe ? "var(--accent)" : "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {attempt.userId?.name}
                      </span>
                      {isMe && <span className="badge badge-green" style={{ fontSize: "0.6rem" }}>You</span>}
                    </div>
                    <div style={{ height: 4, background: "var(--surface2)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${pct}%`, borderRadius: 99,
                        background: isMe ? "var(--accent)" : isTop3 ? "var(--accent2)" : "var(--border2)",
                        transition: "width 0.8s ease",
                      }} />
                    </div>
                  </div>

                  {/* Score */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: isMe ? "var(--accent)" : "var(--text)" }}>
                      {pct}%
                    </p>
                    <p style={{ fontSize: "0.7rem", color: "var(--text3)" }}>{attempt.score}/{attempt.totalQuestions}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        {room?.status === "finished" && (
          <div className="fade-up" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button onClick={() => navigate(`/room/${roomCode}/analysis`)} className="btn btn-primary btn-lg">
              📊 View Analysis
            </button>
            <button onClick={() => navigate(`/quiz/${room.quizId._id}`)} className="btn btn-secondary btn-lg">
              🔁 Reattempt Quiz
            </button>
            <button onClick={() => navigate("/dashboard")} className="btn btn-ghost btn-lg">
              ← Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}