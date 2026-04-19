import React, { useState, useEffect, useMemo } from "react";
import { useTransactions } from "../contexts/TransactionContext";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#14b8a6", "#f87171", "#60a5fa", "#fbbf24", "#a78bfa", "#34d399"];

function Dashboard() {
  const { transactions } = useTransactions();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated !== null) setIsLoading(false);
  }, [isAuthenticated]);

  const income = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;
  const savingsRate = income > 0 ? (((income - expense) / income) * 100).toFixed(1) : 0;

  // Monthly bar chart data
  const monthlyData = useMemo(() => {
    const months = {};
    transactions.forEach(t => {
      const date = new Date(t.date);
      const key = date.toLocaleString("default", { month: "short", year: "numeric" });
      if (!months[key]) months[key] = { month: key, income: 0, expense: 0 };
      if (t.type === "income") months[key].income += t.amount;
      else months[key].expense += t.amount;
    });
    return Object.values(months).slice(-6);
  }, [transactions]);

  // Pie chart data — spending by category
  const categoryData = useMemo(() => {
    const cats = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      const name = t.category?.name || "Other";
      cats[name] = (cats[name] || 0) + t.amount;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (isLoading) {
    return (
      <div style={{ background: "#0a0a0b", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#6b6860", fontFamily: "system-ui,sans-serif", fontSize: "0.88rem" }}>loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div style={{ background: "#0a0a0b", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ maxWidth: "420px", width: "100%", textAlign: "center" }}>
          <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b6860", marginBottom: "1rem" }}>
            personal finance
          </div>
          <h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 400, color: "#e2ddd6", marginBottom: "1rem", lineHeight: 1.2 }}>
            Take control of your <em style={{ color: "#14b8a6" }}>finances</em>
          </h1>
          <p style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.88rem", color: "#6b6860", lineHeight: 1.7, marginBottom: "2.5rem" }}>
            Track income, expenses, and budgets in one clean dashboard.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/auth?mode=login" style={{
              fontFamily: "system-ui,sans-serif", fontSize: "0.75rem", letterSpacing: "0.08em",
              textTransform: "uppercase", background: "#14b8a6", color: "#0a0a0b",
              padding: "0.75rem 2rem", textDecoration: "none",
            }}>sign in</Link>
            <Link to="/auth?mode=signup" style={{
              fontFamily: "system-ui,sans-serif", fontSize: "0.75rem", letterSpacing: "0.08em",
              textTransform: "uppercase", color: "#6b6860",
              padding: "0.75rem 2rem", textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>create account</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0a0a0b", minHeight: "100vh", color: "#e2ddd6", padding: "clamp(2rem,5vw,4rem) clamp(1.5rem,4vw,3rem)" }}>

      {/* Header */}
      <div style={{ marginBottom: "2.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1.5rem" }}>
        <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b6860", marginBottom: "0.5rem" }}>
          welcome back
        </div>
        <h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(1.8rem,3vw,2.2rem)", fontWeight: 400, color: "#e2ddd6" }}>
          {user?.firstName || user?.email}
        </h1>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "2.5rem", border: "1px solid rgba(255,255,255,0.06)" }}>
        {[
          { label: "total income", value: `₹${income.toLocaleString()}`, color: "#14b8a6" },
          { label: "total expenses", value: `₹${expense.toLocaleString()}`, color: "#f87171" },
          { label: "net balance", value: `₹${balance.toLocaleString()}`, color: balance >= 0 ? "#14b8a6" : "#f87171" },
          { label: "savings rate", value: `${savingsRate}%`, color: "#60a5fa" },
        ].map((card, i) => (
          <div key={i} style={{ background: "#0a0a0b", padding: "1.5rem 1.8rem" }}>
            <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b6860", marginBottom: "0.6rem" }}>
              {card.label}
            </div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: "clamp(1.4rem,3vw,1.8rem)", color: card.color, fontWeight: 400 }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "2.5rem", border: "1px solid rgba(255,255,255,0.06)" }}>

        {/* Bar chart */}
        <div style={{ background: "#0a0a0b", padding: "1.5rem" }}>
          <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b6860", marginBottom: "1.2rem" }}>
            income vs expenses
          </div>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} barGap={4}>
                <XAxis dataKey="month" tick={{ fill: "#6b6860", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b6860", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip
                  contentStyle={{ background: "#0f0f10", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 0, color: "#e2ddd6", fontSize: "0.78rem" }}
                  formatter={v => `₹${v.toLocaleString()}`}
                />
                <Bar dataKey="income" fill="#14b8a6" radius={0} />
                <Bar dataKey="expense" fill="#f87171" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: "#3a3835", fontFamily: "system-ui,sans-serif", fontSize: "0.82rem" }}>
              no data yet — add transactions to see chart
            </div>
          )}
        </div>

        {/* Pie chart */}
        <div style={{ background: "#0a0a0b", padding: "1.5rem" }}>
          <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b6860", marginBottom: "1.2rem" }}>
            spending by category
          </div>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#0f0f10", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 0, color: "#e2ddd6", fontSize: "0.78rem" }}
                  formatter={v => `₹${v.toLocaleString()}`}
                />
                <Legend wrapperStyle={{ fontSize: "0.72rem", color: "#6b6860" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: "#3a3835", fontFamily: "system-ui,sans-serif", fontSize: "0.82rem" }}>
              no expenses yet — add expense transactions
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b6860" }}>
            recent transactions
          </div>
          <Link to="/transactions" style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#14b8a6", textDecoration: "none" }}>
            view all →
          </Link>
        </div>
        {recentTransactions.length > 0 ? (
          recentTransactions.map((t, i) => (
            <div key={t.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.9rem 1.5rem",
              borderBottom: i < recentTransactions.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              background: "#0a0a0b",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: t.type === "income" ? "#14b8a6" : "#f87171", flexShrink: 0,
                }} />
                <div>
                  <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.85rem", color: "#e2ddd6" }}>
                    {t.type === "income" ? (t.incomeSourceName || t.name || "Income") : (t.category?.name || "Expense")}
                  </div>
                  <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.7rem", color: "#6b6860", marginTop: "2px" }}>
                    {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
              </div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: "0.95rem", color: t.type === "income" ? "#14b8a6" : "#f87171" }}>
                {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: "3rem", textAlign: "center", color: "#3a3835", fontFamily: "system-ui,sans-serif", fontSize: "0.82rem" }}>
            no transactions yet —{" "}
            <Link to="/transactions" style={{ color: "#14b8a6", textDecoration: "none" }}>add your first one →</Link>
          </div>
        )}
      </div>

    </div>
  );
}

export default Dashboard;