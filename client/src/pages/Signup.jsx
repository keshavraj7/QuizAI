import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, formData);
      navigate("/login");
    } catch (error) {
      setError(error.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const p = formData.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^a-zA-Z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthColor = ["var(--danger)", "var(--warn)", "var(--accent2)", "var(--accent)"][strength - 1] || "var(--border2)";
  const strengthLabel = ["Weak", "Fair", "Good", "Strong"][strength - 1] || "";

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1.5rem", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div className="glow-mesh" style={{ width: 500, height: 500, top: -200, right: -200, background: "rgba(0,184,255,0.07)" }} />
        <div className="glow-mesh" style={{ width: 400, height: 400, bottom: -100, left: -100, background: "rgba(0,229,160,0.06)" }} />
      </div>

      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>
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
            Create account
          </h1>
          <p style={{ color: "var(--text2)", fontSize: "0.9rem", marginBottom: "2rem" }}>
            Join thousands of learners on QuizAI
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { label: "Full Name", name: "name", type: "text", placeholder: "Jane Doe" },
              { label: "Email", name: "email", type: "email", placeholder: "you@example.com" },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text2)", marginBottom: "0.4rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  {label}
                </label>
                <input
                  type={type} name={name} placeholder={placeholder}
                  value={formData[name]} onChange={handleChange}
                  className="input" required
                />
              </div>
            ))}

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text2)", marginBottom: "0.4rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Password
              </label>
              <input
                type="password" name="password" placeholder="Min. 8 characters"
                value={formData.password} onChange={handleChange}
                className="input" required
              />
              {formData.password && (
                <div style={{ marginTop: "0.5rem" }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: "0.3rem" }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 99,
                        background: i <= strength ? strengthColor : "var(--border2)",
                        transition: "background 0.3s",
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: "0.75rem", color: strengthColor, fontWeight: 600 }}>{strengthLabel}</p>
                </div>
              )}
            </div>

            {error && (
              <div style={{
                background: "var(--danger-dim)", border: "1px solid rgba(255,77,109,0.25)",
                borderRadius: 8, padding: "0.75rem 1rem", fontSize: "0.875rem",
                color: "var(--danger)",
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit" disabled={loading} className="btn btn-primary btn-full"
              style={{ marginTop: "0.5rem", padding: "0.85rem" }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(0,26,18,0.3)", borderTopColor: "#001a12", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                  Creating account…
                </span>
              ) : "Create Account →"}
            </button>
          </form>

          <div className="divider" style={{ margin: "1.5rem 0" }} />

          <p style={{ textAlign: "center", color: "var(--text2)", fontSize: "0.9rem" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}