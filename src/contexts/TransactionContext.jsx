// src/contexts/TransactionContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useBudgets } from "./BudgetContext"; // Import the budget context

const TransactionContext = createContext();
export const useTransactions = () => useContext(TransactionContext);

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const { token, user } = useAuth(); // Get the token from AuthContext
  const { fetchBudgets } = useBudgets(); // Get the fetchBudgets function
  const [transactionUpdated, setTransactionUpdated] = useState(false); // New state to trigger budget re-calculation
  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (token) {
      fetch(`${API_BASE}/api/categories/getCategories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => setCategories(data))
        .catch((err) => console.error("Error fetching categories:", err));
    }
  }, [token, API_BASE]);

  useEffect(() => {
    if (user?.id && token) {
      fetch(`${API_BASE}/api/transactions/getTransactionsForUser/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => setTransactions(data))
        .catch((err) => console.error("Error fetching transactions:", err));
    }
  }, [user, token, API_BASE, transactionUpdated]); // Include transactionUpdated as a dependency

  const handleAddTransaction = async (transactionData) => {
    try {
      if (user?.id && token) {
        const res = await fetch(
          `${API_BASE}/api/transactions/createTransaction`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            body: JSON.stringify(transactionData),
          }
        );
        if (res.ok) {
          const newTransaction = await res.json();
          setTransactions((prev) => [...prev, newTransaction]);
          setTransactionUpdated((prev) => !prev); // Toggle the state to trigger re-fetch in Budgets
          return { success: true, data: newTransaction }; // Return success and data
        } else {
          const errorData = await res.json();
          return {
            success: false,
            error: errorData.error || "Failed to create transaction",
          }; // Return failure and the error message
        }
      } else {
        return { success: false, error: "User ID or token not available" };
      }
    } catch (error) {
      console.error("Error:", error);
      return {
        success: false,
        error: error.message || "An unexpected error occurred",
      };
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      if (user?.id && token) {
        const res = await fetch(
          `${API_BASE}/api/transactions/deleteTransaction/${transactionId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );
        if (res.ok) {
          setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
          setTransactionUpdated((prev) => !prev); // Toggle the state
        } else {
          alert("Error deleting transaction");
        }
      } else {
        alert("User ID or token not available");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error deleting transaction");
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
  };

  const clearEditingTransaction = () => {
    setEditingTransaction(null);
  };

  const handleUpdateTransaction = async (updatedTransaction) => {
    try {
      if (user?.id && token) {
        const res = await fetch(
          `${API_BASE}/api/transactions/editTransaction/${updatedTransaction.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            body: JSON.stringify(updatedTransaction),
          }
        );
        if (res.ok) {
          const updatedData = await res.json();
          setTransactions((prev) =>
            prev.map((t) => (t.id === updatedData.id ? updatedData : t))
          );
          setEditingTransaction(null);
          setTransactionUpdated((prev) => !prev); // Toggle the state
          return { success: true, data: updatedData };
        } else {
          const errorData = await res.json();
          return {
            success: false,
            error: errorData.error || "Failed to update transaction",
          };
        }
      } else {
        return { success: false, error: "User ID or token not available" };
      }
    } catch (error) {
      console.error("Error:", error);
      return {
        success: false,
        error: error.message || "An unexpected error occurred",
      };
    }
  };

  const resetTransactions = async () => {
    try {
      if (user?.id && token) {
        const res = await fetch(
          `${API_BASE}/api/transactions/resetTransactions/${user.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );

        if (res.ok) {
          setTransactions([]);
          setTransactionUpdated((prev) => !prev); // Toggle the state

          const budgetResetRes = await fetch(
            `${API_BASE}/api/budgets/resetBudgetSpending/${user.id}`,
            {
              method: "POST", // Or PUT, depending on your backend route
              headers: {
                Authorization: `Bearer ${token}`,
              },
              credentials: "include",
            }
          );

          if (!budgetResetRes.ok) {
            alert("Failed to reset budget spending.");
            console.error("Failed to reset budget spending:", budgetResetRes);
          }
        } else {
          alert("Failed to reset transactions");
        }
      }
    } catch (error) {
      console.error("Error resetting transactions:", error);
      alert("Error resetting transactions");
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        categories,
        editingTransaction,
        handleAddTransaction,
        handleDeleteTransaction,
        handleEditTransaction,
        handleUpdateTransaction,
        clearEditingTransaction,
        resetTransactions, // added to context
      }}
    >
            {children}   {" "}
    </TransactionContext.Provider>
  );
};

export default TransactionContext;
