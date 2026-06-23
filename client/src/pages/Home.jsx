import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="page" style={{ overflow: "hidden" }}>
      <Navbar />

      {/* Glow meshes */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div className="glow-mesh" style={{ width: 600, height: 600, top: -200, left: -150, background: "rgba(0,229,160,0.06)" }} />
        <div className="glow-mesh" style={{ width: 500, height: 500, top: 100, right: -200, background: "rgba(0,184,255,0.06)" }} />
        <div className="glow-mesh" style={{ width: 400, height: 400, bottom: -100, left: "40%", background: "rgba(0,229,160,0.04)" }} />
      </div>

      <div className="page-content" style={{ position: "relative" }}>
        {/* Hero */}
        <section style={{ padding: "6rem 1.5rem 4rem", textAlign: "center", maxWidth: 860, margin: "0 auto" }}>
          <div className="fade-up" style={{ animationDelay: "0s" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              background: "var(--accent-dim)", border: "1px solid rgba(0,229,160,0.25)",
              color: "var(--accent)", borderRadius: 99, padding: "0.3rem 1rem",
              fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.06em",
              textTransform: "uppercase", marginBottom: "1.5rem",
            }}>
              <span>⚡</span> Powered by AI
            </span>
          </div>

          <h1 className="fade-up" style={{
            fontFamily: "var(--font-display)", fontWeight: 800,
            fontSize: "clamp(2.5rem, 7vw, 5.5rem)", lineHeight: 1.05,
            letterSpacing: "-0.03em", color: "var(--text)",
            animationDelay: "0.08s",
          }}>
            The smarter way<br />
            to <span style={{
              background: "linear-gradient(135deg, var(--accent), var(--accent2))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>quiz & compete</span>
          </h1>

          <p className="fade-up" style={{
            marginTop: "1.5rem", fontSize: "1.15rem", color: "var(--text2)",
            maxWidth: 540, margin: "1.5rem auto 0", lineHeight: 1.7,
            animationDelay: "0.16s",
          }}>
            Generate quizzes with AI, host live multiplayer rooms, race against friends,
            and track your rankings - all in one place.
          </p>

          <div className="fade-up" style={{
            display: "flex", gap: "1rem", justifyContent: "center",
            flexWrap: "wrap", marginTop: "2.5rem", animationDelay: "0.22s",
          }}>
            <Link to="/create-test" className="btn btn-primary btn-lg" style={{ gap: "0.5rem" }}>
              <span>⚡</span> Create a Quiz
            </Link>
            <Link to="/join-test" className="btn btn-secondary btn-lg">
              Join a Room →
            </Link>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: "3rem 1.5rem 6rem", maxWidth: 1100, margin: "0 auto" }}>
          <h2 className="fade-up" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(1.5rem, 4vw, 2.25rem)", textAlign: "center", marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>
            Everything you need to learn & compete
          </h2>
          <p className="fade-up" style={{ color: "var(--text2)", textAlign: "center", marginBottom: "3rem", animationDelay: "0.1s" }}>
            No configuration. Just create, invite, and play.
          </p>

          <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
            {[
              {  title: "AI Generation", desc: "Describe any topic and get a full quiz in seconds. Adjust difficulty and question count.", accent: "var(--accent)" },
              {  title: "Live Rooms", desc: "Host real-time multiplayer rooms with a shared timer. Watch scores update live.", accent: "var(--accent2)" },
              { title: "Leaderboards", desc: "Ranked results, accuracy stats, and per-question breakdowns after every session.", accent: "var(--warn)" },
              { title: "Deep Analysis", desc: "See where you went wrong, compare against other participants, track your progress.", accent: "var(--danger)" },
            ].map((f, i) => (
              <div key={i} className="fade-up card" style={{
                animationDelay: `${0.05 * i}s`,
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: -30, right: -30,
                  width: 120, height: 120, borderRadius: "50%",
                  background: f.accent, opacity: 0.05, filter: "blur(20px)",
                }} />
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: "0.5rem" }}>{f.title}</h3>
                <p style={{ color: "var(--text2)", fontSize: "0.9rem", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Strip */}
        <section style={{
          margin: "0 1.5rem 6rem",
          background: "linear-gradient(135deg, rgba(0,229,160,0.08), rgba(0,184,255,0.08))",
          border: "1px solid var(--border2)",
          borderRadius: 24, padding: "3rem 2rem",
          textAlign: "center", maxWidth: 800, marginLeft: "auto", marginRight: "auto",
        }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
            Ready to challenge yourself?
          </h2>
          <p style={{ color: "var(--text2)", marginBottom: "2rem" }}>
            Free to use. Why wait?? 
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/dashboard" className="btn btn-primary btn-lg">Get Started — It's Free</Link>
            <Link to="/join-test" className="btn btn-ghost btn-lg">Join a Room</Link>
          </div>
        </section>
      </div>
    </div>
  );
}