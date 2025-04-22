// src/pages/Categories.jsx
import React, { useState } from 'react';
import { useCategories } from '../contexts/CategoryContext';
import Alert from '../components/Alert'; // Assuming Alert.jsx is in the components folder
import { FaTrashAlt } from 'react-icons/fa'; // Import the trash icon

function CategoryList({ categories, onDeleteCategory }) {
  const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <ul className="space-y-3">
      {categories.map((category) => (
        <li
          key={category.id}
          className="group bg-black-800 rounded-lg p-4 transition-all duration-200 ease-in-out flex items-center justify-between border border-gray-700 shadow-sm"
        >
          <span className="text-gray-100 font-medium tracking-wide">
            {capitalizeFirstLetter(category.name)}
          </span>
          <button
            onClick={() => onDeleteCategory(category.id)}
            className="flex items-center gap-2 bg-red-600/90 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded-md transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            <FaTrashAlt className="h-3.5 w-3.5" /> {/* Use FaTrashAlt here */}
            <span>Delete</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Categories() {
  const { categories, deleteCategory } = useCategories();
  const [alert, setAlert] = useState(null);

  const handleDeleteCategory = (id) => {
    deleteCategory(id);
    setAlert({ type: 'categoryDeleted', message: 'Category deleted successfully.' });
    // Optionally, set a timeout to clear the alert
    setTimeout(() => setAlert(null), 3000);
  };

  const handleCloseAlert = () => {
    setAlert(null);
  };

  return (
    <div className=" bg-black-900 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-teal-500 mb-2">
            Categories
          </h1>
          <p className="text-gray-400 text-md">
            Manage your expense categories
          </p>
        </div>

        {alert && <Alert {...alert} onClose={handleCloseAlert} />}

        {categories.length === 0 ? (
          <div className="bg-gray-800/50 rounded-lg border border-dashed border-gray-700 p-8 text-center">
            <p className="text-gray-400">
              No categories created yet
            </p>
          </div>
        ) : (
          <CategoryList categories={categories} onDeleteCategory={handleDeleteCategory} />
        )}
      </div>
    </div>
  );
}

export default Categories;