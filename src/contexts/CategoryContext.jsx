// src/contexts/CategoryContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CategoryContext = createContext();
export const useCategories = () => useContext(CategoryContext);

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const { token } = useAuth();

  const fetchCategories = async () => {
    if (!token) {
      setCategories([]);
      return;
    }

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/categories/getCategories`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const addCategory = async (newCategory) => {
    if (!token) {
      console.warn('Token not available, cannot add category');
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/categories/createCategory`,
        { name: newCategory.name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      setCategories((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('Error adding category:', err);
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!token) {
      console.warn('Token not available, cannot delete category');
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/categories/deleteCategory/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCategories();
    } else {
      setCategories([]);
    }
  }, [token]);

  return (
    <CategoryContext.Provider
      value={{ categories, fetchCategories, addCategory, deleteCategory }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export default CategoryContext;