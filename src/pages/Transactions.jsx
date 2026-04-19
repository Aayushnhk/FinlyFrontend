import { useState, useEffect, useCallback } from "react";
import { useTransactions } from "../contexts/TransactionContext";
import { useCategories } from "../contexts/CategoryContext";
import { useBudgets } from "../contexts/BudgetContext";

export default function Transactions() {
  const {
    transactions, handleAddTransaction, handleUpdateTransaction,
    handleDeleteTransaction, editingTransaction, handleEditTransaction,
    clearEditingTransaction,
  } = useTransactions();
  const { categories } = useCategories();
  const { fetchBudgets } = useBudgets();

  const [formData, setFormData] = useState({
    type: "income", amount: "", categoryId: "", incomeSourceName: "", date: new Date().toISOString().split("T")[0],
  });
  const [alert, setAlert] = useState(null);

  const capitalize = useCallback((str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "", []);

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        type: editingTransaction.type,
        amount: editingTransaction.amount.toString(),
        categoryId: editingTransaction.categoryId || "",
        incomeSourceName: editingTransaction.incomeSourceName || editingTransaction.name || "",
        date: editingTransaction.date ? new Date(editingTransaction.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      });
    } else {
      setFormData({ type: "income", amount: "", categoryId: "", incomeSourceName: "", date: new Date().toISOString().split("T")[0] });
    }
  }, [editingTransaction]);

  const showAlert = (message, color) => {
    setAlert({ message, color });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { type, amount, categoryId, incomeSourceName, date } = formData;
    if (!amount || !type) { showAlert("Amount and type are required.", "#f87171"); return; }
    if (type === "expense" && !categoryId) { showAlert("Please select a category.", "#f87171"); return; }
    if (type === "income" && !incomeSourceName) { showAlert("Please provide an income source.", "#f87171"); return; }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) { showAlert("Enter a valid positive amount.", "#f87171"); return; }

    const transactionData = { type, amount: parsedAmount, date: new Date(date).toISOString() };
    if (type === "expense") {
      transactionData.categoryId = categoryId;
      const selectedCategory = categories.find(c => c.id === categoryId);
      if (selectedCategory) transactionData.category = { id: selectedCategory.id, name: selectedCategory.name };
    } else {
      transactionData.incomeSourceName = incomeSourceName;
    }

    let result;
    if (editingTransaction) {
      transactionData.id = editingTransaction.id;
      result = await handleUpdateTransaction(transactionData);
    } else {
      result = await handleAddTransaction(transactionData);
    }

    if (result?.success) {
      fetchBudgets();
      setFormData({ type: "income", amount: "", categoryId: "", incomeSourceName: "", date: new Date().toISOString().split("T")[0] });
      clearEditingTransaction();
      showAlert(editingTransaction ? "Transaction updated." : "Transaction added.", "#14b8a6");
    } else if (result?.error) {
      showAlert(result.error, "#f87171");
    }
  };

  const handleDeleteClick = async (id) => {
    await handleDeleteTransaction(id);
    fetchBudgets();
    showAlert("Transaction deleted.", "#f87171");
  };

  const incomeTransactions = transactions.filter(t => t.type === "income");
  const expenseTransactions = transactions.filter(t => t.type === "expense");

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
            income & expenses
          </div>
          <h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(1.8rem,3vw,2.2rem)", fontWeight: 400 }}>
            Transactions
          </h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>

          {/* Form */}
          <div>
            <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b6860", marginBottom: "1.2rem" }}>
              {editingTransaction ? "edit transaction" : "add transaction"}
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

              <div>
                <label style={labelStyle}>type</label>
                <select name="type" value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              {formData.type === "expense" && (
                <div>
                  <label style={labelStyle}>category</label>
                  <select name="categoryId" value={formData.categoryId} onChange={e => setFormData(p => ({ ...p, categoryId: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="">select a category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{capitalize(c.name)}</option>)}
                  </select>
                </div>
              )}

              {formData.type === "income" && (
                <div>
                  <label style={labelStyle}>source</label>
                  <input type="text" value={formData.incomeSourceName} onChange={e => setFormData(p => ({ ...p, incomeSourceName: e.target.value }))} placeholder="e.g. salary, freelance..." style={inputStyle} />
                </div>
              )}

              <div>
                <label style={labelStyle}>amount (₹)</label>
                <input type="number" value={formData.amount} onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))} min="0.01" step="0.01" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>date</label>
                <input type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} style={{ ...inputStyle, colorScheme: "dark" }} />
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button type="submit" style={{
                  flex: 1, background: "#14b8a6", color: "#0a0a0b",
                  fontFamily: "system-ui,sans-serif", fontSize: "0.72rem",
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  fontWeight: 500, padding: "0.75rem", border: "none", cursor: "pointer",
                }}>
                  {editingTransaction ? "update" : "add transaction"}
                </button>
                {editingTransaction && (
                  <button type="button" onClick={clearEditingTransaction} style={{
                    background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
                    color: "#6b6860", fontFamily: "system-ui,sans-serif",
                    fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase",
                    padding: "0.75rem 1rem", cursor: "pointer",
                  }}>cancel</button>
                )}
              </div>
            </form>
          </div>

          {/* Transaction lists */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

            {/* Income */}
            <div>
              <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#14b8a6", marginBottom: "0.8rem" }}>
                income
              </div>
              {incomeTransactions.length === 0 ? (
                <div style={{ padding: "1.5rem", border: "1px solid rgba(255,255,255,0.04)", color: "#3a3835", fontFamily: "system-ui,sans-serif", fontSize: "0.78rem", textAlign: "center" }}>
                  no income yet
                </div>
              ) : (
                <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  {incomeTransactions.map((t, i) => (
                    <div key={t.id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "0.8rem 1rem", gap: "1rem",
                      borderBottom: i < incomeTransactions.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      flexWrap: "wrap",
                    }}>
                      <div>
                        <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.85rem", color: "#e2ddd6" }}>{capitalize(t.name || t.incomeSourceName)}</div>
                        <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.68rem", color: "#6b6860", marginTop: "2px" }}>{new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontFamily: "Georgia,serif", fontSize: "0.95rem", color: "#14b8a6" }}>+₹{t.amount.toLocaleString()}</span>
                        <button onClick={() => handleEditTransaction(t)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#6b6860", fontFamily: "system-ui,sans-serif", fontSize: "0.65rem", letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.25rem 0.6rem", cursor: "pointer" }}>edit</button>
                        <button onClick={() => handleDeleteClick(t.id)} style={{ background: "transparent", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", fontFamily: "system-ui,sans-serif", fontSize: "0.65rem", letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.25rem 0.6rem", cursor: "pointer" }}>del</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expenses */}
            <div>
              <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#f87171", marginBottom: "0.8rem" }}>
                expenses
              </div>
              {expenseTransactions.length === 0 ? (
                <div style={{ padding: "1.5rem", border: "1px solid rgba(255,255,255,0.04)", color: "#3a3835", fontFamily: "system-ui,sans-serif", fontSize: "0.78rem", textAlign: "center" }}>
                  no expenses yet
                </div>
              ) : (
                <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  {expenseTransactions.map((t, i) => (
                    <div key={t.id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "0.8rem 1rem", gap: "1rem",
                      borderBottom: i < expenseTransactions.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      flexWrap: "wrap",
                    }}>
                      <div>
                        <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.85rem", color: "#e2ddd6" }}>{capitalize(t.category?.name || "uncategorized")}</div>
                        <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.68rem", color: "#6b6860", marginTop: "2px" }}>{new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontFamily: "Georgia,serif", fontSize: "0.95rem", color: "#f87171" }}>-₹{t.amount.toLocaleString()}</span>
                        <button onClick={() => handleEditTransaction(t)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#6b6860", fontFamily: "system-ui,sans-serif", fontSize: "0.65rem", letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.25rem 0.6rem", cursor: "pointer" }}>edit</button>
                        <button onClick={() => handleDeleteClick(t.id)} style={{ background: "transparent", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", fontFamily: "system-ui,sans-serif", fontSize: "0.65rem", letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.25rem 0.6rem", cursor: "pointer" }}>del</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}