import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.userId);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1.5rem", position: "relative", overflow: "hidden",
    }}>
      {/* Background glows */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div className="glow-mesh" style={{ width: 500, height: 500, top: -200, left: -200, background: "rgba(0,229,160,0.07)" }} />
        <div className="glow-mesh" style={{ width: 400, height: 400, bottom: -150, right: -150, background: "rgba(0,184,255,0.06)" }} />
      </div>

      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div className="fade-up" style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link to="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>⚡</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.4rem", color: "var(--text)", letterSpacing: "-0.02em" }}>
              Quiz<span style={{ color: "var(--accent)" }}>AI</span>
            </span>
          </Link>
        </div>

        <div className="fade-up card" style={{ animationDelay: "0.1s", padding: "2.5rem" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.75rem", marginBottom: "0.4rem", letterSpacing: "-0.02em" }}>
            Welcome back
          </h1>
          <p style={{ color: "var(--text2)", fontSize: "0.9rem", marginBottom: "2rem" }}>
            Sign in to continue to QuizAI
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text2)", marginBottom: "0.4rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Email
              </label>
              <input
                type="email" name="email" placeholder="you@example.com"
                value={formData.email} onChange={handleChange}
                className="input" required
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text2)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Password
                </label>
              </div>
              <input
                type="password" name="password" placeholder="••••••••"
                value={formData.password} onChange={handleChange}
                className="input" required
              />
            </div>

            {error && (
              <div style={{
                background: "var(--danger-dim)", border: "1px solid rgba(255,77,109,0.25)",
                borderRadius: 8, padding: "0.75rem 1rem", fontSize: "0.875rem",
                color: "var(--danger)", display: "flex", gap: "0.5rem", alignItems: "center",
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit" disabled={loading} className="btn btn-primary btn-full"
              style={{ marginTop: "0.5rem", padding: "0.85rem" }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(0,26,18,0.3)", borderTopColor: "#001a12", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                  Signing in…
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          <div className="divider" style={{ margin: "1.5rem 0" }} />

          <p style={{ textAlign: "center", color: "var(--text2)", fontSize: "0.9rem" }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}