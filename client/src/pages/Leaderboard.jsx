// Leaderboard.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

const medals = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const { id } = useParams();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  useEffect(() => { fetchLeaderboard(); }, []);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/quiz/${id}/leaderboard`, { headers: { Authorization: token } });
      setLeaders(res.data);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="container-md">
        <div className="fade-up" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🏆</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.75rem, 5vw, 2.5rem)", letterSpacing: "-0.03em" }}>Leaderboard</h1>
          <p style={{ color: "var(--text2)", marginTop: "0.4rem" }}>{leaders.length} attempts</p>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}><div className="spinner" /></div>
        ) : leaders.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📭</div>
            <p style={{ color: "var(--text2)" }}>No attempts yet. Be the first!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {leaders.map((user, index) => {
              const pct = Math.round((user.score / user.totalQuestions) * 100);
              const isMe = user.userId?._id === userId || user.userId === userId;
              const isTop3 = index < 3;
              return (
                <div key={user._id} className="fade-up card" style={{
                  animationDelay: `${index * 0.04}s`,
                  border: isMe ? "1px solid rgba(0,229,160,0.3)" : "1px solid var(--border)",
                  background: isMe ? "rgba(0,229,160,0.04)" : "var(--surface)",
                  padding: "1rem 1.25rem",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ minWidth: 40, textAlign: "center" }}>
                      {isTop3 ? (
                        <span style={{ fontSize: "1.5rem" }}>{medals[index]}</span>
                      ) : (
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text3)" }}>#{index + 1}</span>
                      )}
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: isMe ? "linear-gradient(135deg, var(--accent), var(--accent2))" : "var(--surface2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem", color: isMe ? "#001a12" : "var(--text2)" }}>
                      {user.userId?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                        <span style={{ fontWeight: 600, color: isMe ? "var(--accent)" : "var(--text)" }}>{user.userId?.name || "Anonymous"}</span>
                        {isMe && <span className="badge badge-green" style={{ fontSize: "0.6rem" }}>You</span>}
                      </div>
                      <div style={{ height: 4, background: "var(--surface2)", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: isMe ? "var(--accent)" : isTop3 ? "var(--accent2)" : "var(--border2)", borderRadius: 99 }} />
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: isMe ? "var(--accent)" : "var(--text)" }}>{pct}%</p>
                      <p style={{ fontSize: "0.7rem", color: "var(--text3)" }}>{user.score}/{user.totalQuestions}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}