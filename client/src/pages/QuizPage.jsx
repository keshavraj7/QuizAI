import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function QuizPage() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [activeQ, setActiveQ] = useState(null);

  useEffect(() => { fetchQuiz(); }, []);

  const fetchQuiz = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/quiz/${id}`, { headers: { Authorization: token } });
      setQuiz(res.data);
    } catch (err) { console.log(err); }
  };

  const handleOptionSelect = (questionIndex, option) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[questionIndex] = option;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    let currentScore = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index]?.trim()[0] === question.answer) currentScore++;
    });
    setScore(currentScore);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const answered = answers.filter(Boolean).length;
  const total = quiz?.questions.length || 0;
  const accuracy = total ? Math.round((score / total) * 100) : 0;

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
      <div className="container-md">

        {/* Quiz header */}
        <div className="fade-up" style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.5rem, 4vw, 2.25rem)", letterSpacing: "-0.02em", marginBottom: "0.4rem" }}>
            {quiz.title}
          </h1>
          <p style={{ color: "var(--text2)", marginBottom: "1rem" }}>{quiz.subject}</p>

          {/* Progress bar */}
          {!submitted && (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ flex: 1, height: 6, background: "var(--surface2)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 99,
                  width: `${(answered / total) * 100}%`,
                  background: "linear-gradient(90deg, var(--accent), var(--accent2))",
                  transition: "width 0.4s ease",
                }} />
              </div>
              <span style={{ color: "var(--text2)", fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                {answered}/{total} answered
              </span>
            </div>
          )}
        </div>

        {/* Score panel */}
        {submitted && (
          <div className="fade-up" style={{
            marginBottom: "2rem", padding: "2rem",
            background: accuracy >= 70 ? "var(--accent-dim)" : accuracy >= 40 ? "var(--warn-dim)" : "var(--danger-dim)",
            border: `1px solid ${accuracy >= 70 ? "rgba(0,229,160,0.25)" : accuracy >= 40 ? "rgba(255,184,48,0.25)" : "rgba(255,77,109,0.25)"}`,
            borderRadius: "var(--radius-lg)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
              <div>
                <p style={{ color: "var(--text2)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>Score</p>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "3rem", fontWeight: 800, lineHeight: 1, color: "var(--text)" }}>
                  {score}<span style={{ fontSize: "1.5rem", color: "var(--text2)" }}>/{total}</span>
                </p>
              </div>
              <div style={{ height: 60, width: 1, background: "var(--border)" }} />
              <div>
                <p style={{ color: "var(--text2)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>Accuracy</p>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "3rem", fontWeight: 800, lineHeight: 1, color: accuracy >= 70 ? "var(--accent)" : accuracy >= 40 ? "var(--warn)" : "var(--danger)" }}>
                  {accuracy}%
                </p>
              </div>
              <div style={{ marginLeft: "auto", fontSize: "3rem" }}>
                {accuracy >= 70 ? "🎉" : accuracy >= 40 ? "📚" : "💪"}
              </div>
            </div>
          </div>
        )}

        {/* Questions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {quiz.questions.map((q, index) => {
            const userAnswer = answers[index];
            const isAnswered = !!userAnswer;
            const isCorrect = submitted && userAnswer?.trim()[0] === q.answer;
            const isIncorrect = submitted && isAnswered && !isCorrect;

            return (
              <div key={index} className="fade-up card" style={{
                animationDelay: `${index * 0.04}s`,
                border: submitted
                  ? isCorrect ? "1px solid rgba(0,229,160,0.3)" : isIncorrect ? "1px solid rgba(255,77,109,0.3)" : "1px solid var(--border)"
                  : "1px solid var(--border)",
                background: submitted
                  ? isCorrect ? "rgba(0,229,160,0.04)" : isIncorrect ? "rgba(255,77,109,0.04)" : "var(--surface)"
                  : "var(--surface)",
              }}>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                  <span style={{
                    minWidth: 28, height: 28, borderRadius: 8,
                    background: submitted
                      ? isCorrect ? "rgba(0,229,160,0.2)" : isIncorrect ? "rgba(255,77,109,0.2)" : "var(--surface2)"
                      : isAnswered ? "var(--accent2-dim)" : "var(--surface2)",
                    color: submitted
                      ? isCorrect ? "var(--accent)" : isIncorrect ? "var(--danger)" : "var(--text2)"
                      : isAnswered ? "var(--accent2)" : "var(--text3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.8rem", fontWeight: 700,
                  }}>
                    {submitted ? (isCorrect ? "✓" : isIncorrect ? "✗" : index + 1) : index + 1}
                  </span>
                  <h2 style={{ fontSize: "1rem", fontWeight: 600, lineHeight: 1.5, flex: 1 }}>
                    {q.question}
                  </h2>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {q.options.map((option, i) => {
                    const isSelected = userAnswer === option;
                    const isCorrectOption = submitted && option.trim()[0] === q.answer;
                    const isWrongSelected = submitted && isSelected && !isCorrectOption;

                    return (
                      <button
                        key={i}
                        disabled={submitted}
                        onClick={() => handleOptionSelect(index, option)}
                        style={{
                          width: "100%", textAlign: "left", padding: "0.7rem 1rem",
                          borderRadius: "var(--radius-sm)", cursor: submitted ? "default" : "pointer",
                          border: `1px solid ${
                            isCorrectOption ? "rgba(0,229,160,0.4)"
                            : isWrongSelected ? "rgba(255,77,109,0.4)"
                            : isSelected ? "var(--accent2)"
                            : "var(--border)"
                          }`,
                          background: isCorrectOption ? "rgba(0,229,160,0.1)"
                            : isWrongSelected ? "rgba(255,77,109,0.1)"
                            : isSelected ? "var(--accent2-dim)"
                            : "var(--surface2)",
                          color: isCorrectOption ? "var(--accent)"
                            : isWrongSelected ? "var(--danger)"
                            : isSelected ? "var(--accent2)"
                            : "var(--text)",
                          fontFamily: "var(--font-body)", fontSize: "0.9rem",
                          transition: "all 0.15s",
                          fontWeight: (isSelected || isCorrectOption) ? 600 : 400,
                        }}
                      >
                        <span style={{ marginRight: "0.5rem", opacity: 0.5 }}>
                          {String.fromCharCode(65 + i)}.
                        </span>
                        {option}
                        {isCorrectOption && submitted && <span style={{ float: "right" }}>✓</span>}
                        {isWrongSelected && <span style={{ float: "right" }}>✗</span>}
                      </button>
                    );
                  })}
                </div>

                {submitted && !isAnswered && (
                  <div style={{ marginTop: "0.75rem", padding: "0.6rem 0.9rem", background: "var(--surface2)", borderRadius: 8, fontSize: "0.8rem", color: "var(--text3)" }}>
                    Not attempted — Correct answer: {q.options.find(o => o.startsWith(q.answer))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit */}
        {!submitted && (
          <div className="fade-up" style={{ marginTop: "2rem", position: "sticky", bottom: "1.5rem" }}>
            <button
              onClick={handleSubmit}
              className="btn btn-primary btn-full btn-lg"
              disabled={answered === 0}
              style={{ boxShadow: "0 8px 32px rgba(0,229,160,0.25)", fontSize: "1rem" }}
            >
              Submit Quiz {answered < total && `(${answered}/${total} answered)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}