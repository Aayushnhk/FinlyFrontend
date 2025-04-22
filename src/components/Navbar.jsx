import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaThList,
  FaExchangeAlt,
  FaWallet,
  FaChartLine,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import Alert from "./Alert";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";

const navigation = [
  { name: "Categories", href: "/categories", current: false, icon: FaThList },
  {
    name: "Transactions",
    href: "/transactions",
    current: false,
    icon: FaExchangeAlt,
  },
  { name: "Budgets", href: "/budgets", current: false, icon: FaWallet },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated);
  const navigate = useNavigate();
  const [logoutAlertMessage, setLogoutAlertMessage] = useState("");

  useEffect(() => {
    setIsLoggedIn(isAuthenticated);
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    setLogoutAlertMessage("Logout successful!"); // Set the logout alert message
    setTimeout(() => {
      setLogoutAlertMessage(""); // Clear the message after 2 seconds
      navigate("/");
    }, 2000);
  };

  const handleCloseLogoutAlert = () => {
    setLogoutAlertMessage(""); // Function to close the logout alert
  };

  return (
    <Disclosure as="nav" className="bg-black-900 border-b border-gray-700">
      {({ open }) => (
        <>
          {logoutAlertMessage && (
            <Alert
              message={logoutAlertMessage}
              type="logout"
              onClose={() => setLogoutAlertMessage("")}
            />
          )}
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              {/* Logo on the left */}
              <div className="flex flex-shrink-0 items-center">
                <Link
                  to="/"
                  className="flex items-center font-bold text-white hover:text-teal-400 transition-colors text-xl"
                >
                  <FaChartLine className="mr-2 text-teal-400 text-2xl" />
                  <span>Finly</span>
                </Link>
              </div>

              {/* Centered navigation items - Hidden on mobile */}
              <div className="hidden sm:block absolute left-1/2 transform -translate-x-1/2">
                <div className="flex space-x-4">
                  {isLoggedIn &&
                    navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={classNames(
                          "rounded-md px-3 py-2 text-sm font-medium flex items-center gap-2",
                          "text-gray-300 hover:text-teal-400 transition-colors"
                        )}
                        aria-current={
                          window.location.pathname === item.href
                            ? "page"
                            : undefined
                        }
                      >
                        <item.icon className="h-5 w-5 text-teal-400" />
                        {item.name}
                      </Link>
                    ))}
                </div>
              </div>

              {/* Mobile Menu Button and Logout Button Container - Swapped */}
              <div className="flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <div className="flex items-center">
                  {/* Mobile Menu Button */}
                  <div className="sm:hidden ml-2">
                    <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-teal-400 focus:outline-none transition-colors">
                      <span className="absolute -inset-0.5" />
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <svg
                          className="block h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="block h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                          />
                        </svg>
                      )}
                    </DisclosureButton>
                  </div>
                  {isLoggedIn ? (
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium cursor-pointer text-gray-300 hover:text-teal-400 transition-colors ml-2 sm:ml-0"
                    >
                      <FaSignOutAlt className="h-5 w-5 text-teal-400" />
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                  ) : (
                    <div className="flex space-x-4">
                      <Link
                        to="/auth?mode=login"
                        className="text-gray-300 hover:text-teal-400 rounded-md px-3 py-2 text-sm font-medium transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        to="/auth?mode=signup"
                        className="bg-teal-500 hover:bg-teal-700 text-white rounded-md px-3 py-2 text-sm font-medium transition-colors"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <DisclosurePanel className="sm:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
              {isLoggedIn &&
                navigation.map((item) => (
                  <DisclosureButton
                    key={item.name}
                    as={Link}
                    to={item.href}
                    className={classNames(
                      "block rounded-md px-3 py-2 text-base font-medium flex items-center gap-2",
                      "text-gray-300 hover:text-teal-400 transition-colors"
                    )}
                    aria-current={
                      window.location.pathname === item.href
                        ? "page"
                        : undefined
                    }
                  >
                    <item.icon className="h-5 w-5 text-teal-400" />
                    {item.name}
                  </DisclosureButton>
                ))}
              {isLoggedIn && (
                <DisclosureButton
                  onClick={handleLogout}
                  className="w-full text-left block rounded-md px-3 py-2 text-base font-medium cursor-pointer text-gray-300 hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                  <FaSignOutAlt className="h-5 w-5 text-teal-400" />
                  Logout
                </DisclosureButton>
              )}
              {!isLoggedIn && (
                <>
                  <DisclosureButton
                    as={Link}
                    to="/auth?mode=login"
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:text-teal-400 transition-colors"
                  >
                    Login
                  </DisclosureButton>
                  <DisclosureButton
                    as={Link}
                    to="/auth?mode=signup"
                    className="block rounded-md px-3 py-2 text-base font-medium bg-teal-500 hover:bg-teal-700 text-white transition-colors"
                  >
                    Sign Up
                  </DisclosureButton>
                </>
              )}
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}

export default Navbar;