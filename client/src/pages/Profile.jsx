import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/auth/me", { headers: { Authorization: token } });
      setProfile(res.data);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const logout = () => { localStorage.clear(); navigate("/login"); };

  if (loading) {
    return (
      <div className="page">
        <Navbar />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: "1rem" }}>
          <div className="spinner" />
          <p style={{ color: "var(--text2)" }}>Loading profile…</p>
        </div>
      </div>
    );
  }

  const initials = profile?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const stats = [
    { label: "Quizzes Created", value: profile?.createdQuizzes || 0, color: "var(--accent2)" },
    { label: "Quizzes Attempted", value: profile?.attemptedQuizzes || 0, color: "var(--accent)" },
    { label: "Rooms Hosted", value: profile?.roomsHosted || 0,  color: "var(--warn)" },
    { label: "Rooms Joined", value: profile?.roomsJoined || 0, color: "var(--accent2)" },
    { label: "Best Score", value: `${profile?.bestScore || 0}%`, color: "var(--accent)" },
    { label: "Average Score", value: `${profile?.averageScore || 0}%`, color: "var(--accent2)" },
  ];
  return (
    <div className="page">
      <Navbar />

      {/* Background glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div className="glow-mesh" style={{ width: 500, height: 500, top: 0, left: "30%", background: "rgba(0,229,160,0.05)" }} />
        <div className="glow-mesh" style={{ width: 400, height: 400, bottom: 0, right: "10%", background: "rgba(0,184,255,0.04)" }} />
      </div>

      <div className="container page-content">

        {/* Profile hero card */}
        <div className="fade-up card" style={{
          marginBottom: "1.5rem",
          padding: "2.5rem",
          position: "relative",
          overflow: "hidden",
        }}>
          {}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 4,
            background: "linear-gradient(90deg, var(--accent), var(--accent2), var(--accent))",
          }} />

          {/* Subtle bg shape */}
          <div style={{
            position: "absolute", top: -60, right: -60, width: 200, height: 200,
            borderRadius: "50%", background: "rgba(0,229,160,0.04)", filter: "blur(40px)",
          }} />

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
            {/* Avatar */}
            <div style={{
              width: 80, height: 80, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, var(--accent), var(--accent2))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.75rem",
              color: "#001a12",
              boxShadow: "0 0 0 4px var(--surface), 0 0 0 6px rgba(0,229,160,0.25)",
            }}>
              {initials}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontFamily: "var(--font-display)", fontWeight: 800,
                fontSize: "clamp(1.5rem, 4vw, 2rem)", letterSpacing: "-0.03em",
                marginBottom: "0.25rem",
              }}>
                {profile?.name}
              </h1>
              <p style={{ color: "var(--text2)", fontSize: "0.9rem", marginBottom: "0.75rem" }}>
                {profile?.email}
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <span className="badge badge-green">Active</span>
                
              </div>
            </div>

            {/* Logout button */}
            <button onClick={logout} className="btn btn-ghost" style={{ flexShrink: 0, alignSelf: "flex-start" }}>
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats grid */}
        <h2 className="fade-up" style={{
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: "1.1rem", color: "var(--text2)",
          letterSpacing: "0.05em", textTransform: "uppercase",
          marginBottom: "1rem", animationDelay: "0.1s",
        }}>
          Statistics
        </h2>

        <div className="stagger fade-up" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "0.75rem",
          marginBottom: "2rem",
          animationDelay: "0.12s",
        }}>
          {stats.map(({ label, value, icon, color }) => (
            <div key={label} className="stat-card" style={{ position: "relative", overflow: "hidden" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 0 20px ${color}20`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{
                position: "absolute", top: -20, right: -20, width: 80, height: 80,
                borderRadius: "50%", background: color, opacity: 0.06, filter: "blur(20px)",
              }}/>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `${color}18`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
                }}>{icon}</span>
                <p className="label" style={{ marginBottom: 0 }}>{label}</p>
              </div>
              <p style={{
                fontFamily: "var(--font-display)", fontWeight: 800,
                fontSize: "1.75rem", color: "var(--text)", lineHeight: 1,
              }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Account info */}
        <h2 className="fade-up" style={{
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: "1.1rem", color: "var(--text2)",
          letterSpacing: "0.05em", textTransform: "uppercase",
          marginBottom: "1rem", animationDelay: "0.2s",
        }}>
          Account Information
        </h2>

        <div className="fade-up card" style={{ animationDelay: "0.22s", padding: "1.75rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
            {[
              { label: "Full Name", value: profile?.name,  },
              { label: "Email Address", value: profile?.email,},
            ].map(({ label, value, icon }) => (
              <div key={label}>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                  {icon} {label}
                </p>
                <p style={{ fontWeight: 600, fontSize: "1rem", color: "var(--text)" }}>{value}</p>
              </div>
            ))}
          </div>

        </div>

        {/* Performance snapshot */}
        {(profile?.averageScore > 0 || profile?.bestScore > 0) && (
          <div className="fade-up card" style={{ marginTop: "1.5rem", animationDelay: "0.3s", padding: "1.75rem" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: "1.25rem" }}>
              Performance
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[{ label: "Average Score", value: profile?.averageScore || 0, color: "var(--accent2)" },
                { label: "Best Score", value: profile?.bestScore || 0, color: "var(--accent)" },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text2)", fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: "0.85rem", color, fontWeight: 700 }}>{value}%</span>
                  </div>
                  <div style={{ height: 8, background: "var(--border2)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${value}%`,
                      background: `linear-gradient(90deg, ${color}, ${color})`,
                      borderRadius: 99,
                      transition: "width 1s ease",
                      boxShadow: `0 0 8px ${color}`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}