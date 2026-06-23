import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function RoomQuiz() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [room, setRoom] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const answersRef = useRef([]);
  const [timeLeft, setTimeLeft] = useState("");
  const [timePercent, setTimePercent] = useState(100);
  const [submitting, setSubmitting] = useState(false);
  const totalDurationRef = useRef(null);

  useEffect(() => { fetchRoom(); }, []);

  const fetchRoom = async () => {
    try {
      const token = localStorage.getItem("token");
      const roomRes = await axios.get(`http://localhost:5000/api/room/${roomCode}`, { headers: { Authorization: token } });

      const alreadySubmitted = roomRes.data.submittedUsers?.some(u => u._id.toString() === userId);
      if (alreadySubmitted) { navigate(`/room/${roomCode}/leaderboard`); return; }

      setRoom(roomRes.data);

      // Store total duration
      const end = new Date(roomRes.data.endTime).getTime();
      const startApprox = end - roomRes.data.duration * 60 * 1000;
      totalDurationRef.current = end - startApprox;

      const quizRes = await axios.get(`http://localhost:5000/api/quiz/${roomRes.data.quizId._id}`, { headers: { Authorization: token } });
      setQuiz(quizRes.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    if (!room?.endTime) return;
    const interval = setInterval(() => {
      const diff = new Date(room.endTime).getTime() - Date.now();
      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft("00:00");
        setTimePercent(0);
        submitQuiz();
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, "0")}`);
      if (totalDurationRef.current) {
        setTimePercent(Math.min(100, (diff / totalDurationRef.current) * 100));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [room]);

  const handleAnswer = (index, option) => {
    const temp = [...answers];
    temp[index] = option;
    setAnswers(temp);
    answersRef.current = temp;
  };

  const submitQuiz = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/room/submit/${roomCode}`,
        { answers: answersRef.current },
        { headers: { Authorization: token } }
      );
      navigate(`/room/${roomCode}/leaderboard`);
    } catch (err) { console.log(err); }
  };

  const answered = answers.filter(Boolean).length;
  const total = quiz?.questions.length || 0;

  // Time urgency color
  const timeColor = timePercent > 50 ? "var(--accent)" : timePercent > 20 ? "var(--warn)" : "var(--danger)";

  if (!quiz) {
    return (
      <div className="page">
        <Navbar />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: "1rem" }}>
          <div className="spinner" />
          <p style={{ color: "var(--text2)" }}>Loading quiz…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Navbar />

      {/* Sticky timer bar */}
      <div style={{
        position: "sticky", top: "4.25rem", zIndex: 50,
        background: "var(--bg2)", borderBottom: "1px solid var(--border)",
        padding: "0.75rem 1.5rem",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ fontSize: "1rem" }}>⏱</span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.25rem", color: timeColor, fontVariantNumeric: "tabular-nums" }}>
                {timeLeft}
              </span>
              <span style={{ color: "var(--text3)", fontSize: "0.8rem" }}>remaining</span>
            </div>
            <span style={{ color: "var(--text2)", fontSize: "0.85rem", fontWeight: 600 }}>
              {answered}/{total} answered
            </span>
          </div>
          <div style={{ height: 4, background: "var(--surface2)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 99,
              width: `${timePercent}%`,
              background: timeColor,
              transition: "width 1s linear, background 0.5s",
            }} />
          </div>
        </div>
      </div>

      <div className="container-md">
        <div className="fade-up" style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.5rem, 3vw, 2rem)", letterSpacing: "-0.02em" }}>
            {quiz.title}
          </h1>
          <p style={{ color: "var(--text2)", fontSize: "0.9rem" }}>{quiz.subject} · {total} questions</p>
        </div>

        {/* Questions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {quiz.questions.map((q, index) => {
            const selected = answers[index];
            return (
              <div key={index} className="fade-up card" style={{
                animationDelay: `${index * 0.04}s`,
                border: selected ? "1px solid rgba(0,184,255,0.25)" : "1px solid var(--border)",
              }}>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <span style={{
                    minWidth: 28, height: 28, borderRadius: 8,
                    background: selected ? "var(--accent2-dim)" : "var(--surface2)",
                    color: selected ? "var(--accent2)" : "var(--text3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.8rem", fontWeight: 700,
                  }}>{index + 1}</span>
                  <h2 style={{ fontSize: "0.975rem", fontWeight: 600, lineHeight: 1.55, flex: 1 }}>{q.question}</h2>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {q.options.map((option, i) => (
                    <label key={i} style={{
                      display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "0.7rem 1rem", borderRadius: "var(--radius-sm)", cursor: "pointer",
                      border: `1px solid ${selected === option ? "var(--accent2)" : "var(--border)"}`,
                      background: selected === option ? "var(--accent2-dim)" : "var(--surface2)",
                      transition: "all 0.15s",
                    }}>
                      <input
                        type="radio" name={`q${index}`}
                        checked={selected === option}
                        onChange={() => handleAnswer(index, option)}
                        style={{ accentColor: "var(--accent2)", width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: "0.9rem", color: selected === option ? "var(--accent2)" : "var(--text)", fontWeight: selected === option ? 600 : 400 }}>
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ position: "sticky", bottom: "1.5rem", marginTop: "2rem", zIndex: 10 }}>
          <button
            onClick={submitQuiz} disabled={submitting}
            className="btn btn-primary btn-full btn-lg"
            style={{ boxShadow: "0 8px 32px rgba(0,229,160,0.25)", fontSize: "1rem" }}
          >
            {submitting ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                <span style={{ width: 16, height: 16, border: "2px solid rgba(0,26,18,0.3)", borderTopColor: "#001a12", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                Submitting…
              </span>
            ) : `Submit Quiz (${answered}/${total} answered)`}
          </button>
        </div>
      </div>
    </div>
  );
}