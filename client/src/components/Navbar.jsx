import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const menuRef   = useRef(null);

  const [user,       setUser]       = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [dark,       setDark]       = useState(() => localStorage.getItem("theme") !== "light");

  const token = localStorage.getItem("token");

  /* ── theme ── */
  useEffect(() => {
    document.documentElement.classList.toggle("light", !dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  /* ── close menu on navigate ── */
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  /* ── outside-click ── */
  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (token) { fetchUser(); fetchActiveRoom(); }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/me", { headers: { Authorization: token } });
      setUser(res.data);
    } catch {}
  };

  const fetchActiveRoom = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/active-room", { headers: { Authorization: token } });
      setActiveRoom(res.data);
    } catch { setActiveRoom(null); }
  };

  const logout = () => { localStorage.clear(); navigate("/login"); };
  const isActive = (path) => location.pathname === path;

  /* nav bg adapts per theme */
  const navBg = dark ? "rgba(10,13,20,0.88)" : "rgba(255,255,255,0.90)";

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      style={{
        color: isActive(to) ? "var(--accent)" : "var(--text2)",
        fontWeight: isActive(to) ? 600 : 400,
        textDecoration: "none",
        fontSize: "0.9rem",
        transition: "color 0.2s",
        position: "relative",
        paddingBottom: 2,
      }}
      onMouseEnter={e => { if (!isActive(to)) e.currentTarget.style.color = "var(--text)"; }}
      onMouseLeave={e => { if (!isActive(to)) e.currentTarget.style.color = "var(--text2)"; }}
    >
      {children}
      {isActive(to) && (
        <span style={{
          position: "absolute", bottom: -4, left: 0, right: 0,
          height: 2, background: "var(--accent)", borderRadius: 99,
        }} />
      )}
    </Link>
  );

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      height: "4.25rem",
      background: navBg,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", width: "100%",
        padding: "0 1.5rem", height: "100%",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
      }}>

        {/* ── Logo ── */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
          <span style={{
            width: 32, height: 32, borderRadius: 8,
            background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem",
          }}>⚡</span>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.25rem", color: "var(--text)", letterSpacing: "-0.02em" }}>
            Quiz<span style={{ color: "var(--accent)" }}>AI</span>
          </span>
        </Link>

        {/* ── Desktop links ── */}
        {token ? (
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/create-test">Create</NavLink>
            <NavLink to="/join-test">Join</NavLink>

            {activeRoom && (
              <Link to={`/room/${activeRoom.roomCode}`} style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                background: "var(--danger-dim)", border: "1px solid var(--danger)",
                color: "var(--danger)", padding: "0.35rem 0.85rem",
                borderRadius: 99, fontSize: "0.8rem", fontWeight: 700,
                textDecoration: "none",
              }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--danger)", display: "inline-block" }} />
                Live Room
              </Link>
            )}

            {/* Theme toggle */}
            <button onClick={() => setDark(!dark)} style={{
              background: "var(--surface2)", border: "1px solid var(--border)",
              borderRadius: 99, width: 36, height: 36, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1rem", flexShrink: 0, transition: "all 0.2s",
            }}>
              {dark ? "☀️" : "🌙"}
            </button>

            {user && (
              <Link to="/profile" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9rem",
                  color: dark ? "#001a12" : "#fff", flexShrink: 0,
                }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ lineHeight: 1.2 }}>
                  <p style={{ color: "var(--text)", fontSize: "0.85rem", fontWeight: 600 }}>{user.name}</p>
                  <p style={{ color: "var(--text3)", fontSize: "0.7rem" }}>{user.email}</p>
                </div>
              </Link>
            )}

            <button onClick={logout} className="btn btn-danger" style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}>
              Logout
            </button>
          </div>
        ) : (
          <div className="desktop-nav" style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button onClick={() => setDark(!dark)} style={{
              background: "var(--surface2)", border: "1px solid var(--border)",
              borderRadius: 99, width: 36, height: 36, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
            }}>
              {dark ? "☀️" : "🌙"}
            </button>
            <Link to="/login"  className="btn btn-ghost">Login</Link>
            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
          </div>
        )}

        {/* ── Mobile right-side cluster ── */}
        <div className="mobile-nav" style={{ display: "none", alignItems: "center", gap: "0.6rem" }}>
          {/* Only show Live badge on mobile, nothing else */}
          {activeRoom && (
            <Link to={`/room/${activeRoom.roomCode}`} style={{
              display: "flex", alignItems: "center", gap: "0.35rem",
              background: "var(--danger-dim)", border: "1px solid var(--danger)",
              color: "var(--danger)", padding: "0.3rem 0.7rem", borderRadius: 99,
              fontSize: "0.75rem", fontWeight: 700, textDecoration: "none",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--danger)", display: "inline-block" }} />
              Live
            </Link>
          )}

          <button onClick={() => setDark(!dark)} style={{
            background: "var(--surface2)", border: "1px solid var(--border)",
            borderRadius: 8, width: 36, height: 36, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
          }}>
            {dark ? "☀️" : "🌙"}
          </button>

          <button onClick={() => setMenuOpen(o => !o)} style={{
            background: "var(--surface2)", border: "1px solid var(--border)",
            borderRadius: 8, width: 36, height: 36, cursor: "pointer",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 4, padding: "0.5rem",
          }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: "block", width: 18, height: 2,
                background: "var(--text)", borderRadius: 99, transition: "all 0.2s",
                transform: menuOpen
                  ? i === 0 ? "translateY(6px) rotate(45deg)"
                  : i === 2 ? "translateY(-6px) rotate(-45deg)"
                  : "none"
                  : "none",
                opacity: menuOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      {menuOpen && (
        <div ref={menuRef} className="mobile-only" style={{
          position: "absolute", top: "4.25rem", left: 0, right: 0,
          background: "var(--surface)", borderBottom: "1px solid var(--border)",
          padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.2rem",
          animation: "fadeUp 0.2s ease both", boxShadow: "var(--shadow-lg)",
        }}>
          {token ? (
            <>
              {user && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 0", borderBottom: "1px solid var(--border)", marginBottom: "0.4rem" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--accent2))", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, color: dark ? "#001a12" : "#fff" }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: "var(--text)" }}>{user.name}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text3)" }}>{user.email}</p>
                  </div>
                </div>
              )}
              {[["Home", "/"], ["Dashboard", "/dashboard"], ["Create Quiz", "/create-test"], ["Join Room", "/join-test"], ["Profile", "/profile"]].map(([label, path]) => (
                <Link key={path} to={path} style={{
                  padding: "0.75rem 0.5rem",
                  color: isActive(path) ? "var(--accent)" : "var(--text)",
                  fontWeight: isActive(path) ? 600 : 400,
                  textDecoration: "none", fontSize: "1rem",
                  borderBottom: "1px solid var(--border)",
                }}>
                  {label}
                </Link>
              ))}
              <button onClick={logout} className="btn btn-danger btn-full" style={{ marginTop: "0.75rem" }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"  className="btn btn-ghost btn-full"   style={{ marginBottom: "0.5rem" }}>Login</Link>
              <Link to="/signup" className="btn btn-primary btn-full">Sign Up</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav  { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
    </nav>
  );
}