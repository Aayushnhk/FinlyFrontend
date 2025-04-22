// Updated BudgetContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // Adjust path as needed
import { useCategories } from '../contexts/CategoryContext'; // Import useCategories

const BudgetContext = createContext();
export const useBudgets = () => useContext(BudgetContext);

export const BudgetProvider = ({ children }) => {
  const [budgets, setBudgets] = useState([]);
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { fetchCategories } = useCategories(); // Get the fetchCategories function

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      if (user?.id && token) {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/budgets/getBudgetsForUser/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setBudgets(res.data);
      } else {
        setBudgets([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch budgets');
      console.error('Error fetching budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  const addBudget = async (newBudget) => {
    try {
      setLoading(true);
      if (!user?.id || !token) {
        throw new Error('User not authenticated.');
      }
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/budgets/createBudget/${user.id}`,
        newBudget,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (res.status !== 201) {
        throw new Error(`Failed to create budget: ${res.status}`);
      }
      const addedBudget = res.data;
      setBudgets([...budgets, addedBudget]);
      // After successfully adding a budget, refetch categories
      fetchCategories();
      return addedBudget;
    } catch (err) {
      setError(err.message || 'Failed to add budget');
      console.error('Error adding budget:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editBudget = async (budgetId, updatedBudget) => {
    try {
      setLoading(true);
      if (!user?.id || !token) {
        throw new Error('User not authenticated.');
      }
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/budgets/editBudget/${budgetId}/${user.id}`,
        updatedBudget,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (res.status !== 200) {
        throw new Error(`Failed to update budget: ${res.status}`);
      }
      const updatedData = res.data;
      setBudgets(budgets.map((budget) => (budget.id === budgetId ? updatedData : budget)));
      return updatedData;
    } catch (err) {
      setError(err.message || 'Failed to update budget');
      console.error('Error updating budget:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBudget = async (budgetId) => {
    try {
      setLoading(true);
      if (!user?.id || !token) {
        throw new Error('User not authenticated.');
      }
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/budgets/deleteBudget/${budgetId}/${user.id}`, // Include userId
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (res.status !== 200) {
        throw new Error(`Failed to delete budget: ${res.status}`);
      }
      setBudgets(budgets.filter((budget) => budget.id !== budgetId));
      // After successfully deleting the budget, refetch categories
      fetchCategories();
      return res.data;
    } catch (err) {
      setError(err.message || 'Failed to delete budget');
      console.error('Error deleting budget:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && token) {
      fetchBudgets();
    } else {
      setBudgets([]);
    }
  }, [user, token]);

  const contextValue = {
    budgets,
    fetchBudgets,
    addBudget,
    editBudget,
    deleteBudget,
    loading,
    error,
  };

  return (
    <BudgetContext.Provider value={contextValue}>{children}</BudgetContext.Provider>
  );
};

export default BudgetContext;