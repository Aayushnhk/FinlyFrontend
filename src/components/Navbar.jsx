import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const navLinks = [
  { name: "Categories", href: "/categories" },
  { name: "Transactions", href: "/transactions" },
  { name: "Budgets", href: "/budgets" },
];

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <nav style={{
      background: "#0a0a0b",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1rem clamp(1.5rem,4vw,2.5rem)",
        maxWidth: "1200px", margin: "0 auto",
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: "6px" }}>
          <span style={{ fontFamily: "system-ui,sans-serif", fontSize: "1rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#e2ddd6", fontWeight: 500 }}>
            Finly
          </span>
          <span style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.65rem", color: "#6b6860", letterSpacing: "0.08em" }}>
            personal finance
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }} className="desktop-nav">
          {isAuthenticated && navLinks.map(link => (
            <Link key={link.href} to={link.href} style={{
              fontFamily: "system-ui,sans-serif", fontSize: "0.78rem",
              letterSpacing: "0.05em", textDecoration: "none",
              color: location.pathname === link.href ? "#e2ddd6" : "#6b6860",
              transition: "color 0.2s",
            }}>
              {link.name.toLowerCase()}
            </Link>
          ))}

          {isAuthenticated ? (
            <button onClick={handleLogout} style={{
              fontFamily: "system-ui,sans-serif", fontSize: "0.72rem",
              letterSpacing: "0.08em", textTransform: "uppercase",
              background: "transparent", color: "#6b6860",
              padding: "0.45rem 1.1rem", border: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
            }}>sign out</button>
          ) : (
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <Link to="/auth?mode=login" style={{
                fontFamily: "system-ui,sans-serif", fontSize: "0.78rem",
                letterSpacing: "0.05em", color: "#6b6860", textDecoration: "none",
              }}>sign in</Link>
              <Link to="/auth?mode=signup" style={{
                fontFamily: "system-ui,sans-serif", fontSize: "0.72rem",
                letterSpacing: "0.08em", textTransform: "uppercase",
                background: "#14b8a6", color: "#0a0a0b",
                padding: "0.45rem 1.1rem", textDecoration: "none",
              }}>get started</Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-btn" style={{
          display: "none", background: "none", border: "none",
          color: "#e2ddd6", fontSize: "1.2rem", cursor: "pointer", padding: "0.25rem",
        }}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "1rem clamp(1.5rem,4vw,2.5rem)",
          display: "flex", flexDirection: "column", gap: "1rem",
          background: "#0a0a0b",
        }}>
          {isAuthenticated && navLinks.map(link => (
            <Link key={link.href} to={link.href} onClick={() => setMenuOpen(false)} style={{
              fontFamily: "system-ui,sans-serif", fontSize: "0.88rem",
              color: location.pathname === link.href ? "#e2ddd6" : "#6b6860",
              textDecoration: "none",
            }}>
              {link.name.toLowerCase()}
            </Link>
          ))}
          {isAuthenticated ? (
            <button onClick={handleLogout} style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "system-ui,sans-serif", fontSize: "0.82rem",
              color: "#6b6860", textAlign: "left", padding: 0,
            }}>sign out</button>
          ) : (
            <>
              <Link to="/auth?mode=login" onClick={() => setMenuOpen(false)} style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.88rem", color: "#6b6860", textDecoration: "none" }}>sign in</Link>
              <Link to="/auth?mode=signup" onClick={() => setMenuOpen(false)} style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.88rem", color: "#14b8a6", textDecoration: "none" }}>get started</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;