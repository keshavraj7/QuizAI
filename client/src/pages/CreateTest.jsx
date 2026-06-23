import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const difficulties = [
  { label: "Easy", color: "var(--accent)", bg: "var(--accent-dim)", icon: "🟢" },
  { label: "Medium", color: "var(--warn)", bg: "var(--warn-dim)", icon: "🟡" },
  { label: "Hard", color: "var(--danger)", bg: "var(--danger-dim)", icon: "🔴" },
];

export default function CreateTest() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [files,setFiles] =useState([]);
const [instructions, setInstructions] =useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [loadingDot, setLoadingDot] = useState(0);

  const handleGenerate = async () => {
    if (!title.trim() || (!subject.trim() && files.length===0)) return;
    try {
      setLoading(true);
      const interval = setInterval(() =>setLoadingDot(d=>(d+1)%3), 500);
      const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("title",
          title
        );
        formData.append("difficulty",
          difficulty
        );
        formData.append("numberOfQuestions",numberOfQuestions);
        formData.append("instructions",instructions);
        if(files.length > 0){
          files.forEach(file=>{
              formData.append("files",file);
          });
      }
        else{
          formData.append("subject",subject);
        }
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/quiz/generate`,formData,
          {
            headers:{
              Authorization:token
            }
          }
        );
      clearInterval(interval);
      navigate(`/quiz/${res.data.quiz._id}`);
    } catch (err) {
      setLoading(false);
      alert("Generation failed. Please try again.");
    }
  };

  const qOptions = [5, 10, 15, 20, 25];

  return (
    <div className="page">
      <Navbar />

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div className="glow-mesh" style={{ width: 500, height: 500, top: 0, right: -100, background: "rgba(0,229,160,0.05)" }} />
        <div className="glow-mesh" style={{ width: 400, height: 400, bottom: 0, left: -100, background: "rgba(0,184,255,0.05)" }} />
      </div>

      <div className="container-sm page-content">
        {/* Header */}
        <div className="fade-up" style={{ marginBottom: "2rem" }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "linear-gradient(135deg, var(--accent), var(--accent2))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem", marginBottom: "1rem",
          }}>⚡</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", letterSpacing: "-0.03em", marginBottom: "0.4rem" }}>
            Create AI Quiz
          </h1>
          <p style={{ color: "var(--text2)" }}>
            Describe your topic and let AI build the quiz.
          </p>
        </div>

        <div className="fade-up card" style={{ animationDelay: "0.1s", padding: "2rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Title */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text2)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                Quiz Title
              </label>
              <input
                type="text" placeholder="e.g. Introduction to Recursion"
                value={title} onChange={e => setTitle(e.target.value)}
                className="input"
              />
            </div>
            {/* pdf / p*/}
              <div>
            <label style={{
              display: "block", fontSize: "0.75rem", fontWeight: 700,
              color: "var(--text2)", letterSpacing: "0.06em",
              textTransform: "uppercase", marginBottom: "0.75rem",
            }}>
              PDF Notes / Lecture Slides (Optional)
            </label>

            <div>
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                border: "2px dashed var(--border2)",
                borderRadius: "var(--radius)",
                padding: "2rem 1rem",
                cursor: "pointer",
                background: "var(--surface2)"
              }}
            >

              <span style={{ fontSize: "2rem" }}>
                📄
              </span>

              <p>
                Click to upload files
              </p>

              <p
                style={{
                  color:"var(--text3)",
                  fontSize:"0.75rem"
                }}
              >
                PDF, PPT, PPTX supported
              </p>

              <input
                type="file"
                multiple
                accept=".pdf,.ppt,.pptx"
                onChange={(e)=>{

                  setFiles([
                    ...files,
                    ...Array.from(
                      e.target.files
                    )
                  ]);

                }}
                style={{
                  display:"none"
                }}
              />

            </label>

          </div>
          {
            files.length > 0 && (

              <div
                style={{
                  marginTop:"1rem",
                  display:"flex",
                  flexDirection:"column",
                  gap:"0.5rem"
                }}
              >

                {
                  files.map(
                    (file,index)=>(

                      <div
                        key={index}
                        style={{
                          display:"flex",
                          justifyContent:"space-between",
                          alignItems:"center",
                          padding:"0.8rem",
                          borderRadius:"var(--radius-sm)",
                          background:"var(--accent-dim)"
                        }}
                      >

                        <div>

                          <p>
                            {file.name}
                          </p>

                          <small>
                            {
                              (
                                file.size
                                /
                                1024
                              ).toFixed(1)
                            } KB
                          </small>

                        </div>

                        <button
                          type="button"
                          onClick={()=>{

                            setFiles(

                              files.filter(
                                (_,i)=>
                                i!==index
                              )

                            );

                          }}
                        >
                          ✕
                        </button>

                      </div>

                    )
                  )
                }

              </div>

            )
          }
          </div>
            {/* Subject */}
            {
            files.length===0 && (
              <div>
                <label
                  style={{
                    display: "block",fontSize: "0.75rem",fontWeight: 700,color: "var(--text2)",letterSpacing: "0.06em",textTransform: "uppercase",marginBottom: "0.5rem"                  }}
                >
                  Subject / Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g. Data Structures"
                  value={subject}
                  onChange={(e)=>
                    setSubject(
                      e.target.value
                    )
                  }
                  className="input"
                />
              </div>
            )
          }
            {/* Instructions to AI*/}
            <div>
              <label
                style={{
                  display: "block",fontSize: "0.75rem",
                  fontWeight: 700,color: "var(--text2)",letterSpacing: "0.06em",textTransform: "uppercase",marginBottom: "0.5rem"}}
              >
                Other Instructions
              </label>
              <textarea
                rows={4}
                value={instructions}
                onChange={(e)=>setInstructions(e.target.value)
                }
                placeholder={files.length
                  ?
                  "Focus on important topics, numerical questions, exam-oriented concepts..."
                  :
                  "Optional instructions for AI..."
                }
                className="input"
                style={{resize:"vertical"
                }}
              />
            </div>
            {/* Difficulty */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text2)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                Difficulty
              </label>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                {difficulties.map(d => (
                  <button key={d.label} onClick={() => setDifficulty(d.label)} style={{
                    flex: 1, padding: "0.75rem 0.5rem", borderRadius: "var(--radius-sm)",
                    border: `1px solid ${difficulty === d.label ? d.color : "var(--border)"}`,
                    background: difficulty === d.label ? d.bg : "var(--surface2)",
                    color: difficulty === d.label ? d.color : "var(--text2)",
                    fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.85rem",
                    cursor: "pointer", transition: "all 0.2s",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  }}>
                    <span>{d.icon}</span>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Number of questions */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text2)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                Number of Questions
              </label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {qOptions.map(n => (
                  <button key={n} onClick={() => setNumberOfQuestions(n)} style={{
                    padding: "0.5rem 1.1rem", borderRadius: "var(--radius-sm)",
                    border: `1px solid ${numberOfQuestions === n ? "var(--accent)" : "var(--border)"}`,
                    background: numberOfQuestions === n ? "var(--accent-dim)" : "var(--surface2)",
                    color: numberOfQuestions === n ? "var(--accent)" : "var(--text2)",
                    fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.9rem",
                    cursor: "pointer", transition: "all 0.2s",
                  }}>
                    {n}
                  </button>
                ))}
                <input
                  type="number" min={1} max={50} value={numberOfQuestions}
                  onChange={e => setNumberOfQuestions(Number(e.target.value))}
                  className="input"
                  style={{ width: 80, textAlign: "center" }}
                  placeholder="Custom"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleGenerate} disabled={loading || !title.trim() || (files.length === 0 &&!subject.trim())}
              className="btn btn-primary btn-full"
              style={{ padding: "0.9rem", fontSize: "1rem", marginTop: "0.5rem" }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                  <span style={{ width: 18, height: 18, border: "2px solid rgba(0,26,18,0.3)", borderTopColor: "#001a12", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                  Generating quiz{".".repeat(loadingDot + 1)}
                </span>
              ) : "⚡ Generate Quiz"}
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="fade-up" style={{ animationDelay: "0.2s", marginTop: "1.5rem", padding: "1rem 1.25rem", background: "var(--accent-dim)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: "var(--radius)" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--accent)", fontWeight: 600, marginBottom: "0.4rem" }}>Tips for better results</p>
          <ul style={{ paddingLeft: "1.2rem", color: "var(--text2)", fontSize: "0.8rem", lineHeight: 1.8 }}>
            <li>Be specific: "Binary Search Trees" beats "Data Structures"</li>
            <li>Add context: "Python decorators for beginners"</li>
            <li>For hard quizzes, use 10–15 questions for more variety</li>
          </ul>
        </div>
      </div>
    </div>
  );
}