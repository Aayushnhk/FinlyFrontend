import React, { useState, useEffect } from "react";
import { useBudgets } from "../contexts/BudgetContext";
import { useTransactions } from "../contexts/TransactionContext";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./react-datepicker-custom.css";
import Alert from "../components/Alert";
import { format, parse } from 'date-fns';
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';

function Budgets() {
    const {
        budgets,
        addBudget,
        fetchBudgets,
        loading,
        error,
        editBudget: editBudgetAction,
        deleteBudget: deleteBudgetAction,
    } = useBudgets();
    const { transactions } = useTransactions();
    const [budgetName, setBudgetName] = useState("");
    const [budgetAmount, setBudgetAmount] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [editBudgetId, setEditBudgetId] = useState(null);
    const [alert, setAlert] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBudgets();
    }, []);

    const calculateSpentAmount = (budget) => {
        if (!transactions || !budget) return 0;
        
        const budgetStartDate = parse(budget.startDate, 'dd/MM/yyyy', new Date());
        const budgetEndDate = parse(budget.endDate, 'dd/MM/yyyy', new Date());
        
        return transactions
            .filter(t => t.type === 'expense' && t.category?.id === budget.category.id)
            .filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate >= budgetStartDate && transactionDate <= budgetEndDate;
            })
            .reduce((sum, t) => sum + t.amount, 0);
    };

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => {
            setAlert(null);
        }, 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            showAlert("Please select valid dates.", "error");
            return;
        }

        if (!budgetName.trim() || !budgetAmount.trim()) {
            showAlert("Please fill in all fields.", "error");
            return;
        }

        const newBudget = {
            amount: parseFloat(budgetAmount),
            startDate: formatDateForBackend(startDate),
            endDate: formatDateForBackend(endDate),
            categoryName: budgetName,
        };

        try {
            if (editBudgetId) {
                await editBudgetAction(editBudgetId, newBudget);
                showAlert("Budget updated successfully!");
            } else {
                await addBudget(newBudget);
                showAlert("Budget added successfully!");
            }

            setBudgetName("");
            setBudgetAmount("");
            setStartDate(null);
            setEndDate(null);
            setEditBudgetId(null);
            fetchBudgets();
        } catch (err) {
            console.error("Error in handleSubmit", err);
            showAlert(
                "Failed to add/edit budget. Please check the console for details.",
                "error"
            );
        }
    };

    const handleEdit = (budgetId) => {
        setEditBudgetId(budgetId);
        const budgetToEdit = budgets.find((budget) => budget.id === budgetId);
        if (budgetToEdit) {
            setBudgetName(budgetToEdit.category.name);
            setBudgetAmount(budgetToEdit.amount.toString());

            const parsedStartDate = parse(budgetToEdit.startDate, 'dd/MM/yyyy', new Date());
            const parsedEndDate = parse(budgetToEdit.endDate, 'dd/MM/yyyy', new Date());

            setStartDate(isNaN(parsedStartDate.getTime()) ? null : parsedStartDate);
            setEndDate(isNaN(parsedEndDate.getTime()) ? null : parsedEndDate);
        }
    };

    const handleDelete = async (budgetId) => {
        try {
            await deleteBudgetAction(budgetId);
            showAlert("Budget deleted successfully!");
            fetchBudgets();
        } catch (error) {
            console.error("Error deleting budget:", error);
            showAlert("Failed to delete budget.", "error");
        }
    };

    const formatDateForBackend = (date) => {
        if (!date || isNaN(date.getTime())) return null;
        return format(date, 'dd/MM/yyyy');
    };

    const displayDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = parse(dateString, 'dd/MM/yyyy', new Date());
            if (isNaN(date.getTime())) {
                return "Invalid date";
            }
            return format(date, 'dd/MM/yyyy');
        } catch (error) {
            console.error("Error parsing date:", error);
            return "Invalid date format";
        }
    };

    if (loading) {
        return (
            <div className="bg-black flex items-center justify-center">
                <p className="text-gray-300 text-lg">Loading budgets...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-black flex items-center justify-center">
                <p className="text-red-500 text-lg">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className={`bg-black py-8`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {alert && <Alert message={alert.message} type={alert.type} />}
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold text-teal-500 mb-2">
                        Budgets
                    </h1>
                    <p className="text-gray-400 text-md">
                        Manage and track your budgets to stay in control of your finances
                    </p>
                </div>

                <div className="mt-6 flex flex-col md:flex-row items-start gap-8">
                    <div className="bg-gray-900 shadow-md rounded-xl p-6 w-full md:w-1/3">
                        <h3 className="text-lg font-medium text-white mb-4">
                            {editBudgetId ? "Edit Budget" : "Add New Budget"}
                        </h3>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label
                                    htmlFor="budgetName"
                                    className="block text-sm font-medium text-gray-300"
                                >
                                    Category
                                </label>
                                <input
                                    type="text"
                                    id="budgetName"
                                    value={budgetName}
                                    onChange={(e) => setBudgetName(e.target.value)}
                                    className="mt-1 w-full rounded-md border border-gray-700 bg-gray-800 text-white px-3 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="e.g., Food, Housing, Travel"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="budgetAmount"
                                    className="block text-sm font-medium text-gray-300"
                                >
                                    Amount
                                </label>
                                <div className="relative mt-1">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                        ₹
                                    </span>
                                    <input
                                        type="number"
                                        id="budgetAmount"
                                        value={budgetAmount}
                                        onChange={(e) => setBudgetAmount(e.target.value)}
                                        className="pl-7 w-full rounded-md border border-gray-700 bg-gray-800 text-white py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">
                                        Start Date
                                    </label>
                                    <DatePicker
                                        selected={startDate}
                                        onChange={(date) => setStartDate(date)}
                                        dateFormat="dd/MM/yyyy"
                                        className="mt-1 w-full rounded-md border border-gray-700 bg-gray-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                                        placeholderText="Select start date"
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        isClearable
                                        withPortal
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">
                                        End Date
                                    </label>
                                    <DatePicker
                                        selected={endDate}
                                        onChange={(date) => setEndDate(date)}
                                        dateFormat="dd/MM/yyyy"
                                        className="mt-1 w-full rounded-md border border-gray-700 bg-gray-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                                        placeholderText="Select end date"
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        isClearable
                                        withPortal
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 cursor-pointer"
                            >
                                {editBudgetId ? "Update Budget" : "Add Budget"}
                            </button>
                        </form>
                    </div>

                    <div className="bg-gray-900 shadow-md rounded-xl p-6 w-full md:flex-1 max-h-[70vh] overflow-y-auto">
                        <h3 className="text-lg font-medium text-white mb-4">
                            Your Budgets
                        </h3>
                        <div className="space-y-4">
                            {budgets && budgets.length > 0 ? (
                                budgets.map((budget) => {
                                    const spentAmount = calculateSpentAmount(budget);
                                    const remainingAmount = budget.amount - spentAmount;
                                    const progressPercentage = (spentAmount / budget.amount) * 100;

                                    return (
                                        <div key={budget.id} className="bg-black-800 rounded-lg p-4">
                                            <div className="flex flex-col">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-3 h-3 bg-teal-500 rounded-full"></span>
                                                        <p className="text-white text-lg font-medium capitalize">
                                                            {budget.category.name}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(budget.id)}
                                                            className="flex items-center gap-1 bg-yellow-300 text-black text-sm px-3 py-1 rounded-md hover:bg-yellow-400 transition cursor-pointer"
                                                        >
                                                            <FaPencilAlt className="mr-1" /> <span>Edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(budget.id)}
                                                            className="flex items-center gap-1 bg-red-500 text-white text-sm px-3 py-1 rounded-md hover:bg-red-600 transition cursor-pointer"
                                                        >
                                                            <FaTrashAlt className="mr-1" /> <span>Delete</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                <p className="text-gray-400 text-sm mb-2">
                                                    Period:{" "}
                                                    <span className="text-white">
                                                        {displayDate(budget.startDate)} -{" "}
                                                        {displayDate(budget.endDate)}
                                                    </span>
                                                </p>

                                                <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                                                    <div
                                                        className="bg-teal-500 h-2.5 rounded-full"
                                                        style={{
                                                            width: `${progressPercentage}%`,
                                                        }}
                                                    ></div>
                                                </div>

                                                <div className="flex justify-between text-sm text-gray-400">
                                                    <div>
                                                        Spent:{" "}
                                                        <span className="text-yellow-300">
                                                            ₹{spentAmount.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        Remaining:{" "}
                                                        <span className="text-green-300">
                                                            ₹{remainingAmount.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        Budget:{" "}
                                                        <span className="text-blue-300">
                                                            ₹{budget.amount.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="bg-black-800 rounded-lg p-8 text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-500"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                        />
                                    </svg>
                                    <h3 className="mt-2 text-lg font-medium text-white">
                                        No budgets created
                                    </h3>
                                    <p className="mt-1 text-gray-400">
                                        Get started by adding your first budget
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Budgets;