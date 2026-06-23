import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function Analysis() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => { fetchAnalysis(); }, []);

  const fetchAnalysis = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/room/analysis/${roomCode}`, { headers: { Authorization: token } });
      setAnalysis(res.data);
    } catch (err) { console.log(err); }
  };

  if (!analysis) {
    return (
      <div className="page">
        <Navbar />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: "1rem" }}>
          <div className="spinner" />
          <p style={{ color: "var(--text2)" }}>Loading analysis…</p>
        </div>
      </div>
    );
  }

  const accuracyColor = analysis.accuracy >= 70 ? "var(--accent)" : analysis.accuracy >= 40 ? "var(--warn)" : "var(--danger)";
  const correctCount = analysis.questions.filter(q => q.isCorrect).length;
  const wrongCount = analysis.questions.length - correctCount;

  return (
    <div className="page">
      <Navbar />

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div className="glow-mesh" style={{ width: 500, height: 500, top: 0, right: 0, background: `${accuracyColor}08` }} />
      </div>

      <div className="container-md page-content">
        {/* Header */}
        <div className="fade-up" style={{ marginBottom: "2rem" }}>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", fontSize: "0.85rem", marginBottom: "1rem", padding: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
            ← Back
          </button>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.75rem, 5vw, 2.5rem)", letterSpacing: "-0.03em", marginBottom: "0.4rem" }}>
            Your Analysis
          </h1>
          <p style={{ color: "var(--text2)" }}>Room · {roomCode}</p>
        </div>

        {/* Stats */}
        <div className="fade-up stagger" style={{ animationDelay: "0.1s", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "2rem" }}>
          <div className="stat-card" style={{ borderColor: `${accuracyColor}40` }}>
            <p className="label">Score</p>
            <p className="value">{analysis.score}<span style={{ fontSize: "1rem", color: "var(--text3)", fontWeight: 400 }}>/{analysis.totalQuestions}</span></p>
          </div>
          <div className="stat-card" style={{ borderColor: `${accuracyColor}40` }}>
            <p className="label">Accuracy</p>
            <p className="value" style={{ color: accuracyColor }}>{analysis.accuracy}%</p>
          </div>
          <div className="stat-card">
            <p className="label">Rank</p>
            <p className="value">#{analysis.rank}</p>
          </div>
          <div className="stat-card">
            <p className="label">Participants</p>
            <p className="value">{analysis.participants}</p>
          </div>
        </div>

        {/* Accuracy ring visual */}
        <div className="fade-up card" style={{ animationDelay: "0.2s", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap", padding: "1.5rem 2rem" }}>
          <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
            <svg viewBox="0 0 100 100" style={{ width: 100, height: 100, transform: "rotate(-90deg)" }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--surface2)" strokeWidth="10" />
              <circle cx="50" cy="50" r="40" fill="none" stroke={accuracyColor} strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - analysis.accuracy / 100)}`}
                strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: accuracyColor }}>{analysis.accuracy}%</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: "0.75rem" }}>Performance Summary</h3>
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent)" }} />
                <span style={{ fontSize: "0.85rem", color: "var(--text2)" }}>{correctCount} correct</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--danger)" }} />
                <span style={{ fontSize: "0.85rem", color: "var(--text2)" }}>{wrongCount} incorrect</span>
              </div>
            </div>
            <div style={{ marginTop: "0.75rem", height: 6, background: "var(--surface2)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${analysis.accuracy}%`, background: `linear-gradient(90deg, var(--accent), var(--accent2))`, borderRadius: 99, transition: "width 1s ease" }} />
            </div>
          </div>
        </div>

        {/* Questions */}
        <h2 className="fade-up" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.25rem", marginBottom: "1.25rem", animationDelay: "0.25s" }}>
          Question Breakdown
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {analysis.questions.map((q, index) => (
            <div
              key={index}
              className="fade-up card"
              style={{
                animationDelay: `${0.05 * index + 0.25}s`,
                border: q.isCorrect ? "1px solid rgba(0,229,160,0.25)" : "1px solid rgba(255,77,109,0.25)",
                background: q.isCorrect ? "rgba(0,229,160,0.03)" : "rgba(255,77,109,0.03)",
              }}
            >
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", marginBottom: "1rem" }}>
                <span style={{
                  minWidth: 28, height: 28, borderRadius: 8,
                  background: q.isCorrect ? "rgba(0,229,160,0.15)" : "rgba(255,77,109,0.15)",
                  color: q.isCorrect ? "var(--accent)" : "var(--danger)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.85rem", fontWeight: 700,
                }}>
                  {q.isCorrect ? "✓" : "✗"}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, marginBottom: "0.1rem", lineHeight: 1.5 }}>Q{index + 1}. {q.question}</p>
                </div>
              </div>

              {/* Options */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1rem" }}>
                {q.options.map((opt, i) => {
                      const isCorrectOpt = opt.trim()[0] === q.correctAnswer;
                      const isUserOpt = opt.trim() === q.userAnswer?.trim();
                  return (
                    <div key={i} style={{
                      padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", fontSize: "0.85rem",
                      border: `1px solid ${isCorrectOpt ? "rgba(0,229,160,0.3)" : isUserOpt && !isCorrectOpt ? "rgba(255,77,109,0.3)" : "var(--border)"}`,
                      background: isCorrectOpt ? "rgba(0,229,160,0.08)" : isUserOpt && !isCorrectOpt ? "rgba(255,77,109,0.08)" : "var(--surface2)",
                      color: isCorrectOpt ? "var(--accent)" : isUserOpt && !isCorrectOpt ? "var(--danger)" : "var(--text2)",
                      fontWeight: (isCorrectOpt || isUserOpt) ? 600 : 400,
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                      {opt}
                      {isCorrectOpt && <span style={{ fontSize: "0.75rem" }}>✓ Correct</span>}
                      {isUserOpt && !isCorrectOpt && <span style={{ fontSize: "0.75rem" }}>Your answer</span>}
                    </div>
                  );
                })}
              </div>

              {/* Crowd stat */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text3)", whiteSpace: "nowrap" }}>
                  {q.correctPercentage}% of participants got this right
                </span>
                <div style={{ flex: 1, height: 4, background: "var(--surface2)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${q.correctPercentage}%`, background: q.correctPercentage > 50 ? "var(--accent)" : "var(--warn)", borderRadius: 99 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}