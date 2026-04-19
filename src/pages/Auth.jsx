import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const isPasswordComplex = (password) =>
  password.length >= 8 && /[0-9]/.test(password) && /[a-zA-Z]/.test(password);

function Auth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "login";
  const isLogin = mode !== "signup";
  const [formData, setFormData] = useState({ email: "", password: "", firstName: "", lastName: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    setError(""); setSuccess(""); setPasswordError(""); setShowPassword(false); setIsSubmitting(false);
  }, [mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (!isLogin && name === "password") {
      setPasswordError(isPasswordComplex(value) ? "" : "Min 8 characters with letters and numbers.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!isLogin && !isPasswordComplex(formData.password)) {
      setPasswordError("Min 8 characters with letters and numbers.");
      return;
    }
    setIsSubmitting(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        if (isLogin && data.token) {
          login({ token: data.token, user: { id: data.userId, email: formData.email } });
          setSuccess("Welcome back!");
          setTimeout(() => navigate("/"), 1000);
        } else if (!isLogin && data.id) {
          setSuccess("Account created! Signing you in...");
          setTimeout(() => setSearchParams({ mode: "login" }), 1500);
        }
      } else {
        setError(data.error || "Authentication failed.");
      }
    } catch {
      setError("Could not connect to server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%", background: "#0f0f10",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "0.85rem 1rem",
    fontFamily: "system-ui,sans-serif", fontSize: "0.88rem",
    color: "#e2ddd6", outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ background: "#0a0a0b", minHeight: "100vh", color: "#e2ddd6", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>

      {/* Left — form */}
      <div style={{ padding: "clamp(3rem,8vw,6rem) clamp(1.5rem,5vw,4rem)", display: "flex", flexDirection: "column", justifyContent: "center", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "360px", width: "100%" }}>
          <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b6860", marginBottom: "1rem" }}>
            {isLogin ? "welcome back" : "get started"}
          </div>
          <h2 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(1.8rem,4vw,2.2rem)", fontWeight: 400, marginBottom: "2.5rem", lineHeight: 1.2 }}>
            {isLogin ? "sign in to Finly" : "create your account"}
          </h2>

          {error && (
            <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.78rem", color: "#f87171", marginBottom: "1.2rem", paddingLeft: "1rem", borderLeft: "2px solid #f87171" }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.78rem", color: "#14b8a6", marginBottom: "1.2rem", paddingLeft: "1rem", borderLeft: "2px solid #14b8a6" }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <input name="firstName" placeholder="first name" value={formData.firstName} onChange={handleChange} required style={inputStyle} />
                <input name="lastName" placeholder="last name" value={formData.lastName} onChange={handleChange} required style={inputStyle} />
              </div>
            )}

            <input name="email" type="email" placeholder="email address" value={formData.email} onChange={handleChange} required style={{ ...inputStyle, marginBottom: "0.75rem" }} />

            <div style={{ position: "relative", marginBottom: "0.5rem" }}>
              <input name="password" type={showPassword ? "text" : "password"} placeholder="password" value={formData.password} onChange={handleChange} required style={{ ...inputStyle, paddingRight: "3rem" }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6b6860", cursor: "pointer", fontSize: "0.85rem" }}>
                {showPassword ? "hide" : "show"}
              </button>
            </div>

            {passwordError && (
              <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.72rem", color: "#f87171", marginBottom: "1rem" }}>{passwordError}</div>
            )}

            <button type="submit" disabled={isSubmitting} style={{
              width: "100%", background: "#14b8a6", color: "#0a0a0b",
              fontFamily: "system-ui,sans-serif", fontSize: "0.75rem",
              letterSpacing: "0.1em", textTransform: "uppercase",
              fontWeight: 500, padding: "0.9rem", border: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.7 : 1, marginTop: "1rem", marginBottom: "1.5rem",
            }}>
              {isSubmitting ? "please wait..." : isLogin ? "sign in" : "create account"}
            </button>

            <div style={{ textAlign: "center" }}>
              <button type="button" onClick={() => setSearchParams({ mode: isLogin ? "signup" : "login" })} style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "system-ui,sans-serif", fontSize: "0.78rem", color: "#6b6860",
              }}>
                {isLogin ? "don't have an account? sign up →" : "already have an account? sign in →"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right — value prop */}
      <div style={{ padding: "clamp(3rem,8vw,6rem) clamp(1.5rem,5vw,4rem)", display: "flex", flexDirection: "column", justifyContent: "center", gap: "2.5rem" }} className="auth-right">
        {[
          { num: "01", title: "Track everything", desc: "Log income and expenses across categories. See exactly where your money goes." },
          { num: "02", title: "Budget with intention", desc: "Set budgets per category and track spending in real time against your limits." },
          { num: "03", title: "Understand your finances", desc: "Visual charts show your income vs expenses and spending breakdown at a glance." },
        ].map((f, i) => (
          <div key={i} style={{ paddingLeft: "1.5rem", borderLeft: "1px solid rgba(20,184,166,0.2)" }}>
            <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.65rem", color: "#6b6860", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>{f.num}</div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: "1rem", color: "#e2ddd6", marginBottom: "0.4rem" }}>{f.title}</div>
            <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.78rem", color: "#6b6860", lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 640px) { .auth-right { display: none !important; } }
      `}</style>
    </div>
  );
}

export default Auth;