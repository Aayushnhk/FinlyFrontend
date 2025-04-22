import React, { useState, useEffect } from "react";
import { useTransactions } from "../contexts/TransactionContext";
import { useAuth } from "../contexts/AuthContext";
import Alert from "../components/Alert";
import {
  FaChartLine,
  FaMoneyBillWave,
  FaMoneyCheckAlt,
  FaPiggyBank,
  FaArrowUp,
  FaArrowDown,
  FaBalanceScale,
  FaUndoAlt,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

function Dashboard() {
  const { transactions, resetTransactions } = useTransactions();
  const { user, isAuthenticated, logout } = useAuth();
  const [showResetAlert, setShowResetAlert] = useState(false);
  const [resetAlertMessage, setResetAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [logoutAlertMessage, setLogoutAlertMessage] = useState("");

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;

  const isDarkMode = true;
  const bgColor = isDarkMode ? "bg-black-900" : "bg-white";
  const textColor = isDarkMode ? "text-gray-100" : "text-gray-800";
  const cardBg = isDarkMode ? "bg-black-800" : "bg-black-100";
  const accentColor = isDarkMode ? "text-teal-400" : "text-teal-600";
  const cardShadow = isDarkMode ? "shadow-lg shadow-black-500/20" : "shadow-md";
  const borderColor = isDarkMode ? "border-gray-700" : "border-gray-200";

  const handleReset = () => {
    if (transactions.length > 0) {
      resetTransactions();
      setResetAlertMessage("Your dashboard overview has been reset.");
      setShowResetAlert(true);
      setTimeout(() => setShowResetAlert(false), 3000);
    } else {
      setResetAlertMessage("No transactions to reset.");
      setShowResetAlert(true);
      setTimeout(() => setShowResetAlert(false), 3000);
    }
  };

  const handleCloseLogoutAlert = () => {
    setLogoutAlertMessage("");
  };

  useEffect(() => {
    if (isAuthenticated !== null) {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className={`${bgColor}  flex items-center justify-center`}>
        <div className={`text-2xl ${textColor}`}>Loading your dashboard...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className={`${bgColor}  flex items-center justify-center p-4 relative overflow-hidden`}>
        <div
          className={`max-w-md w-full p-8 rounded-xl ${cardBg} ${cardShadow} text-center relative z-10 border ${borderColor} transition-all duration-300 hover:shadow-xl`}
        >
          <div className="mb-8">
            <div className="relative inline-block">
              <FaChartLine className={`text-6xl mx-auto mb-2 ${accentColor} animate-pulse`} />
              <div className="absolute -inset-4 rounded-full bg-teal-400/10 animate-ping opacity-20"></div>
            </div>
            <h1 className={`text-4xl font-bold mb-4 animate-gradient bg-gradient-to-r from-white to-teal-400 bg-clip-text text-transparent bg-300% animate-shimmer`}>
              Welcome to Finly
            </h1>
            <p className={`text-lg ${textColor} mb-8`}>
              Take control of your finances with our intuitive dashboard
            </p>
          </div>

          <div className="flex flex-col space-y-4">
            <Link
              to="/auth?mode=login"
              className={`px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-teal-500/30`}
            >
              <FaSignInAlt /> Login
            </Link>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${borderColor}`}></div>
              </div>
              <div className="relative flex justify-center">
                <span className={`px-2 ${textColor} ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} text-sm`}>or</span>
              </div>
            </div>
            <Link
              to="/auth?mode=signup"
              className={`px-6 py-3 rounded-lg font-medium ${textColor} border-2 border-teal-400 hover:bg-teal-400/10 transition-all flex items-center justify-center gap-2 cursor-pointer hover:border-teal-300`}
            >
              <FaUserPlus /> Create Account
            </Link>
          </div>

          <div className={`mt-8 pt-6 border-t ${borderColor}`}>
            <p className={`text-sm ${textColor} opacity-70`}>
              Join thousands of users managing their finances with Finly
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bgColor} p-4 `}>
      {logoutAlertMessage && (
        <div className="mb-4">
          <Alert
            message={logoutAlertMessage}
            type="logout"
            onClose={handleCloseLogoutAlert}
          />
        </div>
      )}
      <div
        className={`max-w-4xl mx-auto ${cardBg} rounded-xl p-6 ${cardShadow}`}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <FaChartLine className={`text-3xl mr-3 ${accentColor}`} />
            <h1 className={`text-2xl font-bold md-2 ${textColor}`}>Dashboard</h1>
          </div>
          <button
            onClick={handleReset}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold ${
              isDarkMode
                ? "bg-gray-800 text-white hover:bg-red-700"
                : "bg-gray-200 text-gray-700 hover:bg-red-300"
            } shadow-sm hover:shadow-md transition duration-200 cursor-pointer`}
          >
            <FaUndoAlt className="w-5 h-5" />
            Reset
          </button>
        </div>

        {showResetAlert && (
          <div className="mb-6">
            <Alert
              message={resetAlertMessage}
              type={transactions.length > 0 ? "reset" : "info"}
              onClose={() => setShowResetAlert(false)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Income Card */}
          <Link to="/transactions#income" className={`bg-green-600/80 p-6 rounded-lg ${cardShadow} transition-transform transform hover:scale-105 cursor-pointer`}>
            <div className="flex items-center mb-3 ml-6">
              {" "}
              <div className="p-2 rounded-full bg-green-500/30 mr-3">
                <FaMoneyBillWave className="text-xl text-white" />
              </div>
              <h2 className={`text-2xl font-bold ${textColor}`}>Income</h2>
            </div>
            <div className="flex items-center pl-8">
              <FaArrowUp className="text-green-50 mr-2" />
              <div className="ml-4" />
              <p className={`text-2xl font-bold ${textColor}`}>
                ₹{income.toFixed(0)}
              </p>
            </div>
          </Link>

          {/* Expense Card */}
          <Link to="/transactions#expense" className={`bg-red-600/80 p-6 rounded-lg ${cardShadow} transition-transform transform hover:scale-105 cursor-pointer`}>
            <div className="flex items-center mb-3 ml-6">
              {" "}
              <div className="p-2 rounded-full bg-red-500/30 mr-3">
                <FaMoneyCheckAlt className="text-xl text-white" />
              </div>
              <h2 className={`text-2xl font-bold ${textColor}`}>
                Expenses
              </h2>
            </div>
            <div className="flex items-center pl-8">
              {" "}
              <FaArrowDown className="text-red-50 mr-2" />
              <div className="ml-4" />
              <p className={`text-2xl font-bold ${textColor}`}>
                ₹{expense.toFixed(0)}
              </p>
            </div>
          </Link>

          {/* Balance Card */}
          <Link to="/transactions" className={`bg-blue-600/80 p-6 rounded-lg ${cardShadow} transition-transform transform hover:scale-105 cursor-pointer`}>
            <div className="flex items-center mb-3 ml-6">
              {" "}
              <div className="p-2 rounded-full bg-blue-800/30 mr-3">
                <FaPiggyBank className="text-xl text-white" />
              </div>
              <h2 className={`text-2xl font-bold ${textColor}`}>Balance</h2>
            </div>
            <div className="flex items-center pl-9">
              {" "}
              <FaBalanceScale className="text-blue-50 mr-2" />
              <div className="ml-4" />
              <p className={`text-2xl font-bold ${textColor}`}>
                ₹{balance.toFixed(0)}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;