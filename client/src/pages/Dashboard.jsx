import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const difficultyColor = {
  Easy:   { bg: "rgba(0,229,160,0.12)", color: "var(--accent)" },
  Medium: { bg: "rgba(255,184,48,0.12)", color: "var(--warn)" },
  Hard:   { bg: "rgba(255,77,109,0.12)", color: "var(--danger)" },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [quizRes, roomRes] = await Promise.all([
        axios.get("http://localhost:5000/api/quiz/my-quizzes", { headers: { Authorization: token } }),
        axios.get("http://localhost:5000/api/room/my-rooms", { headers: { Authorization: token } }),
      ]);
      setQuizzes(quizRes.data);
      setRooms(roomRes.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (quizId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`http://localhost:5000/api/room/create/${quizId}`, {}, {
        headers: { Authorization: token },
      });
      navigate(`/room/${res.data.room.roomCode}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create room");
    }
  };

  const QuizCard = ({ quiz }) => {
    const dc = difficultyColor[quiz.difficulty] || difficultyColor.Medium;
    return (
      <div className="card" style={{
        display: "flex", flexDirection: "column", gap: 0,
        transition: "all 0.25s", cursor: "default",
      }}
        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
            📝
          </div>
          <span style={{ background: dc.bg, color: dc.color, padding: "0.2rem 0.6rem", borderRadius: 99, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.04em" }}>
            {quiz.difficulty}
          </span>
        </div>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", marginBottom: "0.35rem", lineHeight: 1.3 }}>
          {quiz.title}
        </h3>
        <p style={{ color: "var(--text2)", fontSize: "0.8rem", marginBottom: "0.25rem" }}>{quiz.subject}</p>
        <p style={{ color: "var(--text3)", fontSize: "0.75rem", marginBottom: "1.25rem" }}>
          {quiz.questions.length} questions
        </p>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
          <Link to={`/quiz/${quiz._id}`} className="btn btn-secondary" style={{ flex: 1, fontSize: "0.82rem", padding: "0.5rem" }}>
            Open
          </Link>
          <button onClick={() => createRoom(quiz._id)} className="btn btn-primary" style={{ flex: 1, fontSize: "0.82rem", padding: "0.5rem" }}>
            Host Room
          </button>
        </div>
      </div>
    );
  };

  const RoomCard = ({ room }) => {
    const isLive = room.status === "live";
    const isFinished = room.status === "finished";
    const isWaiting = room.status === "waiting";

    return (
      <div className="card" style={{ position: "relative", overflow: "hidden" }}>
        {isLive && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, var(--danger), #ff8fa3)" }} />
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", lineHeight: 1.3 }}>
            {room.quizId?.title}
          </h3>
          {isLive && <span className="badge badge-red">🔴 Live</span>}
          {isFinished && <span className="badge badge-green">✓ Done</span>}
          {isWaiting && <span className="badge badge-yellow">⏳ Waiting</span>}
        </div>
        <p style={{ color: "var(--text2)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>{room.quizId?.subject}</p>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text3)" }}>Code:</span>
          <code style={{
            fontFamily: "monospace", fontSize: "0.9rem", fontWeight: 700,
            color: "var(--accent)", letterSpacing: "0.12em",
          }}>{room.roomCode}</code>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {isLive && (
            <button onClick={() => navigate(`/room/${room.roomCode}`)} className="btn btn-danger" style={{ fontSize: "0.82rem", padding: "0.5rem 1rem" }}>
              Resume →
            </button>
          )}
          {isFinished && (
            <>
              <button onClick={() => navigate(`/room/${room.roomCode}/leaderboard`)} className="btn btn-primary" style={{ fontSize: "0.82rem", padding: "0.5rem 1rem" }}>
                Leaderboard
              </button>
              <button onClick={() => navigate(`/quiz/${room.quizId._id}`)} className="btn btn-secondary" style={{ fontSize: "0.82rem", padding: "0.5rem 1rem" }}>
                Retry
              </button>
            </>
          )}
          {isWaiting && (
            <button onClick={() => navigate(`/room/${room.roomCode}`)} className="btn btn-secondary" style={{ fontSize: "0.82rem", padding: "0.5rem 1rem" }}>
              Enter Lobby
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="page">
      <Navbar />
      <div className="container">
        {/* Header */}
        <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.75rem, 4vw, 2.5rem)", letterSpacing: "-0.03em", marginBottom: "0.3rem" }}>
              Dashboard
            </h1>
            <p style={{ color: "var(--text2)" }}>Manage your quizzes and rooms</p>
          </div>
          <Link to="/create-test" className="btn btn-primary" style={{ gap: "0.4rem" }}>
            <span>⚡</span> Create Quiz
          </Link>
        </div>

        {/* My Quizzes */}
        <section className="fade-up" style={{ animationDelay: "0.1s", marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.35rem", letterSpacing: "-0.01em" }}>
              My Quizzes
            </h2>
            <span style={{ color: "var(--text3)", fontSize: "0.85rem" }}>{quizzes.length} total</span>
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
              {[1,2,3].map(i => (
                <div key={i} className="skeleton" style={{ height: 180, borderRadius: "var(--radius-lg)" }} />
              ))}
            </div>
          ) : quizzes.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📭</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: "0.5rem" }}>No quizzes yet</h3>
              <p style={{ color: "var(--text2)", marginBottom: "1.5rem" }}>Create your first AI-generated quiz</p>
              <Link to="/create-test" className="btn btn-primary">Create Quiz →</Link>
            </div>
          ) : (
            <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
              {quizzes.map(quiz => <QuizCard key={quiz._id} quiz={quiz} />)}
            </div>
          )}
        </section>

        {/* Recent Rooms */}
        <section className="fade-up" style={{ animationDelay: "0.2s" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.35rem", letterSpacing: "-0.01em" }}>
              Recent Rooms
            </h2>
            <span style={{ color: "var(--text3)", fontSize: "0.85rem" }}>{rooms.length} total</span>
          </div>

          {rooms.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🚪</div>
              <p style={{ color: "var(--text2)" }}>No rooms joined yet</p>
            </div>
          ) : (
            <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
              {rooms.map(room => <RoomCard key={room._id} room={room} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}