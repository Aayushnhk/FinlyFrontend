import React, { useState } from "react";
import { useCategories } from "../contexts/CategoryContext";

function Categories() {
  const { categories, deleteCategory, addCategory } = useCategories();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [alert, setAlert] = useState(null);

  const showAlert = (message, color) => {
    setAlert({ message, color });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    await addCategory({ name: newCategoryName.trim() });
    setNewCategoryName("");
    showAlert("Category added successfully.", "#14b8a6");
  };

  const handleDelete = async (id) => {
    await deleteCategory(id);
    showAlert("Category deleted.", "#f87171");
  };

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

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

      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1.5rem" }}>
          <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b6860", marginBottom: "0.5rem" }}>
            expense categories
          </div>
          <h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(1.8rem,3vw,2.2rem)", fontWeight: 400 }}>
            Categories
          </h1>
        </div>

        {/* Add form */}
        <form onSubmit={handleAdd} style={{ display: "flex", gap: "0.75rem", marginBottom: "2.5rem", flexWrap: "wrap" }}>
          <input
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            placeholder="e.g. food, travel, rent..."
            style={{
              flex: 1, minWidth: "200px",
              background: "#0f0f10", border: "1px solid rgba(255,255,255,0.08)",
              padding: "0.75rem 1rem", color: "#e2ddd6",
              fontFamily: "system-ui,sans-serif", fontSize: "0.88rem", outline: "none",
            }}
          />
          <button type="submit" style={{
            background: "#14b8a6", color: "#0a0a0b",
            fontFamily: "system-ui,sans-serif", fontSize: "0.72rem",
            letterSpacing: "0.08em", textTransform: "uppercase",
            fontWeight: 500, padding: "0.75rem 1.5rem", border: "none", cursor: "pointer",
          }}>
            add category
          </button>
        </form>

        {/* Category list */}
        {categories.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", border: "1px solid rgba(255,255,255,0.04)", color: "#3a3835", fontFamily: "system-ui,sans-serif", fontSize: "0.82rem" }}>
            no categories yet — add your first one above
          </div>
        ) : (
          <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            {categories.map((cat, i) => (
              <div key={cat.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.9rem 1.2rem",
                borderBottom: i < categories.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                background: "#0a0a0b",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#14b8a6" }} />
                  <span style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.88rem", color: "#e2ddd6" }}>
                    {capitalize(cat.name)}
                  </span>
                </div>
                <button onClick={() => handleDelete(cat.id)} style={{
                  background: "transparent", border: "1px solid rgba(248,113,113,0.2)",
                  color: "#f87171", fontFamily: "system-ui,sans-serif",
                  fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase",
                  padding: "0.3rem 0.8rem", cursor: "pointer", transition: "all 0.15s",
                }}>
                  delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Categories;