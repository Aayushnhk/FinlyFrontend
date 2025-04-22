import { useState, useEffect, useCallback } from 'react';
import { useTransactions } from '../contexts/TransactionContext';
import { useCategories } from '../contexts/CategoryContext';
import { useBudgets } from '../contexts/BudgetContext';
import Alert from '../components/Alert';
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';

export default function Transactions() {
    const {
        transactions,
        handleAddTransaction,
        handleUpdateTransaction,
        handleDeleteTransaction,
        editingTransaction,
        handleEditTransaction,
        clearEditingTransaction,
    } = useTransactions();
    const { categories } = useCategories();
    const { fetchBudgets } = useBudgets();

    const [formData, setFormData] = useState({
        type: 'income',
        amount: '',
        categoryId: '',
        incomeSourceName: '',
    });
    const [alert, setAlert] = useState(null);

    const capitalizeFirstLetter = useCallback((str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }, []);

    useEffect(() => {
        if (editingTransaction) {
            setFormData({
                type: editingTransaction.type,
                amount: editingTransaction.amount.toString(),
                categoryId: editingTransaction.categoryId || '',
                incomeSourceName: editingTransaction.incomeSourceName || editingTransaction.name || '',
            });
        } else {
            setFormData({
                type: 'income',
                amount: '',
                categoryId: '',
                incomeSourceName: '',
            });
        }
    }, [editingTransaction]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { type, amount, categoryId, incomeSourceName } = formData;

        if (!amount || !type) {
            setAlert({ message: 'Amount and Type are required!', type: 'error' });
            return;
        }

        if (type === 'expense' && !categoryId) {
            setAlert({ message: 'Please select a category for the expense', type: 'error' });
            return;
        }

        if (type === 'income' && !incomeSourceName) {
            setAlert({ message: 'Please provide an Income Source!', type: 'error' });
            return;
        }

        const transactionData = {
            type,
            amount: parseFloat(amount),
            date: new Date().toISOString(),
        };

        if (type === 'expense') {
            transactionData.categoryId = categoryId;
            const selectedCategory = categories.find(cat => cat.id === categoryId);
            if (selectedCategory) {
                transactionData.category = {
                    id: selectedCategory.id,
                    name: selectedCategory.name
                };
            }
        } else if (type === 'income') {
            transactionData.incomeSourceName = incomeSourceName;
            delete transactionData.name;
        }

        try {
            if (editingTransaction) {
                transactionData.id = editingTransaction.id;
                await handleUpdateTransaction(transactionData);
                setAlert({ message: 'Transaction updated successfully!', type: 'success' });
            } else {
                await handleAddTransaction(transactionData);
                setAlert({ message: 'Transaction added successfully!', type: 'transactionAdded' });
            }
            
            fetchBudgets();
        } catch (error) {
            console.error("Error in transaction operation:", error);
            const errorMessage = error.response?.data?.message || 
                (editingTransaction ? 'Error updating transaction!' : 'Error adding transaction!');
            setAlert({ message: errorMessage, type: 'error' });
        }

        setFormData({
            type: 'income',
            amount: '',
            categoryId: '',
            incomeSourceName: '',
        });
        clearEditingTransaction();
    };

    const handleDeleteClick = async (id) => {
        try {
            await handleDeleteTransaction(id);
            setAlert({ message: 'Transaction deleted successfully!', type: 'success' });
            fetchBudgets();
        } catch (error) {
            console.error("Error deleting transaction:", error);
            const errorMessage = error.response?.data?.message || 'Error deleting transaction!';
            setAlert({ message: errorMessage, type: 'error' });
        }
    };

    const incomeTransactions = transactions.filter((t) => t.type === 'income');
    const expenseTransactions = transactions.filter((t) => t.type === 'expense');

    const handleEditClick = (transaction) => {
        handleEditTransaction(transaction);
    };

    const getCategoryName = (transaction) => {
        if (transaction.category?.name) return transaction.category.name;
        if (transaction.categoryId) {
            const category = categories.find(cat => cat.id === transaction.categoryId);
            return category?.name || 'Uncategorized';
        }
        return 'Uncategorized';
    };

    return (
        <div className="container mx-auto p-2 mt-16 text-white">
            <div className="mb-4">
                <h1 className="text-3xl font-semibold text-teal-500 mb-2">
                    Transactions
                </h1>
                <p className="text-gray-400 text-md">Manage and track your financial transactions, recording both income and expenses</p>
            </div>

            {alert && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
                    <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />
                </div>
            )}

            <div className="flex flex-wrap lg:flex-nowrap gap-12">
                <div className="w-full lg:w-1/2">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-gray-800 shadow-md rounded-lg p-6 border border-gray-700"
                    >
                        <h2 className="text-lg font-semibold mb-3 text-teal-400">
                            {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
                        </h2>

                        <div className="mb-3">
                            <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                required
                                className="bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full py-2 px-3 sm:text-sm cursor-pointer"
                            >
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>

                        {formData.type === 'expense' && (
                            <div className="mb-3">
                                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-300 mb-1">
                                    Category
                                </label>
                                <select
                                    id="categoryId"
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleInputChange}
                                    required
                                    className="bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full py-2 px-3 sm:text-sm cursor-pointer"
                                >
                                    <option value="">Select a Category</option>
                                    {categories && categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {capitalizeFirstLetter(category.name)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {formData.type === 'income' && (
                            <div className="mb-3">
                                <label htmlFor="incomeSourceName" className="block text-sm font-medium text-gray-300 mb-1">
                                    Source
                                </label>
                                <input
                                    type="text"
                                    id="incomeSourceName"
                                    name="incomeSourceName"
                                    value={formData.incomeSourceName}
                                    onChange={handleInputChange}
                                    className="bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full py-2 px-3 sm:text-sm"
                                    placeholder="Enter income source"
                                    required
                                />
                            </div>
                        )}

                        <div className="mb-3">
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                value={formData.amount}
                                onChange={handleInputChange}
                                required
                                min="0.01"
                                step="0.01"
                                className="bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full py-2 px-3 sm:text-sm"
                            />
                        </div>

                        <div className="flex items-center justify-start mt-4">
                            <button
                                type="submit"
                                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                            >
                                {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                            </button>
                            {editingTransaction && (
                                <button
                                    type="button"
                                    onClick={clearEditingTransaction}
                                    className="ml-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="w-full lg:w-2/3 flex flex-col gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-green-400 mb-1">Income</h2>
                        {incomeTransactions.length > 0 ? (
                            <ul className="shadow overflow-hidden rounded-md border border-gray-700">
                                <li className="bg-gray-800 px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider grid grid-cols-4">
                                    <span className="text-left">Source</span>
                                    <span className="text-right">Amount</span>
                                    <span className="text-center">Date</span>
                                    <span className="text-right pr-10">Actions</span>
                                </li>
                                {incomeTransactions.map((transaction) => (
                                    <li key={transaction.id} className="px-4 py-3 bg-gray-700 grid grid-cols-4 hover:bg-gray-600 border-b border-gray-700 last:border-b-0 items-center">
                                        <span className="text-left">{capitalizeFirstLetter(transaction.name)}</span>
                                        <span className="text-green-400 text-right">+₹{transaction.amount.toFixed(2)}</span>
                                        <span className="text-gray-300 text-center">{new Date(transaction.date).toLocaleDateString('en-GB')}</span>
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleEditClick(transaction)}
                                                className="bg-yellow-300 hover:bg-yellow-400 text-gray-800 font-semibold py-1 px-2 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-yellow-200 cursor-pointer flex items-center"
                                            >
                                                <FaPencilAlt className="mr-1" /> <span>Edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(transaction.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer flex items-center"
                                            >
                                                <FaTrashAlt className="mr-1" /> <span>Delete</span>
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400">No Income transactions yet</p>
                        )}
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-red-400 mb-1">Expenses</h2>
                        {expenseTransactions.length > 0 ? (
                            <ul className="shadow overflow-hidden rounded-md border border-gray-700">
                                <li className="bg-gray-800 px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider grid grid-cols-4">
                                    <span className="text-left">Category</span>
                                    <span className="text-right">Amount</span>
                                    <span className="text-center">Date</span>
                                    <span className="text-right pr-10">Actions</span>
                                </li>
                                {expenseTransactions.map((transaction) => (
                                    <li key={transaction.id} className="px-4 py-3 bg-gray-700 grid grid-cols-4 hover:bg-gray-600 border-b border-gray-700 last:border-b-0 items-center">
                                        <span className="text-left">{capitalizeFirstLetter(getCategoryName(transaction))}</span>
                                        <span className="text-red-400 text-right">-₹{transaction.amount.toFixed(2)}</span>
                                        <span className="text-gray-300 text-center">{new Date(transaction.date).toLocaleDateString('en-GB')}</span>
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleEditClick(transaction)}
                                                className="bg-yellow-300 hover:bg-yellow-400 text-gray-800 font-semibold py-1 px-2 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-yellow-200 cursor-pointer flex items-center"
                                            >
                                                <FaPencilAlt className="mr-1" /> <span>Edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(transaction.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer flex items-center"
                                            >
                                                <FaTrashAlt className="mr-1" /> <span>Delete</span>
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400">No Expense transactions yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}