import React, { useState, useEffect } from "react";
import { useBudgets } from "../contexts/BudgetContext";
import { useTransactions } from "../contexts/TransactionContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./react-datepicker-custom.css";
import { format, parse } from "date-fns";

function Budgets() {
  const { budgets, addBudget, fetchBudgets, loading, editBudget: editBudgetAction, deleteBudget: deleteBudgetAction } = useBudgets();
  const { transactions } = useTransactions();
  const [budgetName, setBudgetName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [editBudgetId, setEditBudgetId] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => { fetchBudgets(); }, []);

  const showAlert = (message, color) => {
    setAlert({ message, color });
    setTimeout(() => setAlert(null), 3000);
  };

  const spentAmounts = React.useMemo(() => {
    const amounts = {};
    budgets.forEach(budget => {
      const start = parse(budget.startDate, "dd/MM/yyyy", new Date());
      const end = parse(budget.endDate, "dd/MM/yyyy", new Date());
      amounts[budget.id] = transactions
        .filter(t => t.type === "expense" && t.category?.id === budget?.category?.id)
        .filter(t => { const d = new Date(t.date); return d >= start && d <= end; })
        .reduce((sum, t) => sum + t.amount, 0);
    });
    return amounts;
  }, [transactions, budgets]);

  const formatDate = (date) => date && !isNaN(date.getTime()) ? format(date, "dd/MM/yyyy") : null;

  const displayDate = (str) => {
    if (!str) return "N/A";
    try { return format(parse(str, "dd/MM/yyyy", new Date()), "dd MMM yyyy"); }
    catch { return str; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !budgetName.trim() || !budgetAmount.trim()) {
      showAlert("Please fill in all fields.", "#f87171"); return;
    }
    const payload = { amount: parseFloat(budgetAmount), startDate: formatDate(startDate), endDate: formatDate(endDate), categoryName: budgetName };
    try {
      if (editBudgetId) { await editBudgetAction(editBudgetId, payload); showAlert("Budget updated.", "#14b8a6"); }
      else { await addBudget(payload); showAlert("Budget added.", "#14b8a6"); }
      setBudgetName(""); setBudgetAmount(""); setStartDate(null); setEndDate(null); setEditBudgetId(null);
      fetchBudgets();
    } catch { showAlert("Failed to save budget.", "#f87171"); }
  };

  const handleEdit = (id) => {
    setEditBudgetId(id);
    const b = budgets.find(x => x.id === id);
    if (b) {
      setBudgetName(b.category.name);
      setBudgetAmount(b.amount.toString());
      setStartDate(parse(b.startDate, "dd/MM/yyyy", new Date()));
      setEndDate(parse(b.endDate, "dd/MM/yyyy", new Date()));
    }
  };

  const handleDelete = async (id) => {
    await deleteBudgetAction(id);
    showAlert("Budget deleted.", "#f87171");
    fetchBudgets();
  };

  const inputStyle = {
    width: "100%", background: "#0f0f10",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "0.75rem 1rem", color: "#e2ddd6",
    fontFamily: "system-ui,sans-serif", fontSize: "0.85rem",
    outline: "none", boxSizing: "border-box",
  };

  const labelStyle = {
    fontFamily: "system-ui,sans-serif", fontSize: "0.68rem",
    letterSpacing: "0.1em", textTransform: "uppercase",
    color: "#6b6860", display: "block", marginBottom: "0.4rem",
  };

  if (loading) return (
    <div style={{ background: "#0a0a0b", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#6b6860", fontFamily: "system-ui,sans-serif", fontSize: "0.88rem" }}>loading budgets...</p>
    </div>
  );

  return (
    <div style={{ background: "#0a0a0b", minHeight: "100vh", color: "#e2ddd6", padding: "clamp(2rem,5vw,4rem) clamp(1.5rem,4vw,3rem)" }}>

      {alert && (
        <div style={{
          position: "fixed", top: "1.5rem", left: "50%", transform: "translateX(-50%)",
          background: "#0f0f10", border: `1px solid ${alert.color}`,
          padding: "0.75rem 1.5rem", zIndex: 50,
          fontFamily: "system-ui,sans-serif", fontSize: "0.82rem", color: alert.color,
        }}>
          {alert.message}
        </div>
      )}

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1.5rem" }}>
          <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b6860", marginBottom: "0.5rem" }}>
            spending limits
          </div>
          <h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(1.8rem,3vw,2.2rem)", fontWeight: 400 }}>
            Budgets
          </h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", alignItems: "start" }}>

          {/* Form */}
          <div>
            <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b6860", marginBottom: "1.2rem" }}>
              {editBudgetId ? "edit budget" : "add budget"}
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>category name</label>
                <input value={budgetName} onChange={e => setBudgetName(e.target.value)} placeholder="e.g. food, travel..." style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>amount (₹)</label>
                <input type="number" value={budgetAmount} onChange={e => setBudgetAmount(e.target.value)} placeholder="0" style={inputStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={labelStyle}>start date</label>
                  <DatePicker selected={startDate} onChange={setStartDate} dateFormat="dd/MM/yyyy"
                    className="datepicker-input" placeholderText="dd/mm/yyyy"
                    showMonthDropdown showYearDropdown dropdownMode="select" isClearable withPortal />
                </div>
                <div>
                  <label style={labelStyle}>end date</label>
                  <DatePicker selected={endDate} onChange={setEndDate} dateFormat="dd/MM/yyyy"
                    className="datepicker-input" placeholderText="dd/mm/yyyy"
                    showMonthDropdown showYearDropdown dropdownMode="select" isClearable withPortal />
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button type="submit" style={{
                  flex: 1, background: "#14b8a6", color: "#0a0a0b",
                  fontFamily: "system-ui,sans-serif", fontSize: "0.72rem",
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  fontWeight: 500, padding: "0.75rem", border: "none", cursor: "pointer",
                }}>
                  {editBudgetId ? "update" : "add budget"}
                </button>
                {editBudgetId && (
                  <button type="button" onClick={() => { setEditBudgetId(null); setBudgetName(""); setBudgetAmount(""); setStartDate(null); setEndDate(null); }} style={{
                    background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
                    color: "#6b6860", fontFamily: "system-ui,sans-serif",
                    fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase",
                    padding: "0.75rem 1rem", cursor: "pointer",
                  }}>cancel</button>
                )}
              </div>
            </form>
          </div>

          {/* Budget list */}
          <div>
            <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b6860", marginBottom: "1.2rem" }}>
              your budgets
            </div>
            {!budgets || budgets.length === 0 ? (
              <div style={{ padding: "3rem", border: "1px solid rgba(255,255,255,0.04)", color: "#3a3835", fontFamily: "system-ui,sans-serif", fontSize: "0.82rem", textAlign: "center" }}>
                no budgets yet — add your first one
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)" }}>
                {budgets.map(budget => {
                  const spent = spentAmounts[budget.id] || 0;
                  const remaining = budget.amount - spent;
                  const progress = Math.min((spent / budget.amount) * 100, 100);
                  const over = spent > budget.amount;
                  return (
                    <div key={budget.id} style={{ background: "#0a0a0b", padding: "1.2rem 1.4rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.8rem", flexWrap: "wrap", gap: "0.5rem" }}>
                        <div>
                          <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.88rem", color: "#e2ddd6", textTransform: "capitalize" }}>{budget.category.name}</div>
                          <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.68rem", color: "#6b6860", marginTop: "2px" }}>
                            {displayDate(budget.startDate)} — {displayDate(budget.endDate)}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button onClick={() => handleEdit(budget.id)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#6b6860", fontFamily: "system-ui,sans-serif", fontSize: "0.65rem", letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.25rem 0.6rem", cursor: "pointer" }}>edit</button>
                          <button onClick={() => handleDelete(budget.id)} style={{ background: "transparent", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", fontFamily: "system-ui,sans-serif", fontSize: "0.65rem", letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.25rem 0.6rem", cursor: "pointer" }}>del</button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", marginBottom: "0.8rem" }}>
                        <div style={{ height: "100%", width: `${progress}%`, background: over ? "#f87171" : "#14b8a6", transition: "width 0.3s" }} />
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "system-ui,sans-serif", fontSize: "0.72rem", flexWrap: "wrap", gap: "0.25rem" }}>
                        <span style={{ color: "#6b6860" }}>spent <span style={{ color: over ? "#f87171" : "#fbbf24" }}>₹{spent.toLocaleString()}</span></span>
                        <span style={{ color: "#6b6860" }}>remaining <span style={{ color: over ? "#f87171" : "#14b8a6" }}>₹{remaining.toLocaleString()}</span></span>
                        <span style={{ color: "#6b6860" }}>limit <span style={{ color: "#60a5fa" }}>₹{budget.amount.toLocaleString()}</span></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`.datepicker-input { width: 100%; background: #0f0f10; border: 1px solid rgba(255,255,255,0.08); padding: 0.75rem 1rem; color: #e2ddd6; font-family: system-ui,sans-serif; font-size: 0.85rem; outline: none; box-sizing: border-box; }`}</style>
    </div>
  );
}

export default Budgets;