import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import Alert from "../components/Alert";

// Set base API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// Helper function for frontend password complexity check
const isPasswordComplexFrontend = (password) => {
    const hasNumber = /[0-9]/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    return password.length >= 8 && hasNumber && hasLetter;
};

function Auth() {
    const [searchParams, setSearchParams] = useSearchParams();
    const mode = searchParams.get("mode");
    const [isLogin, setIsLogin] = useState(mode !== "signup");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        ...(mode === "signup" && { firstName: "", lastName: "" }),
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        setIsLogin(mode !== "signup");
        setFormData((prev) => ({
            ...prev,
            ...(mode === "signup" && !prev.firstName && { firstName: "" }),
            ...(mode === "signup" && !prev.lastName && { lastName: "" }),
        }));
        setErrorMessage("");
        setSuccessMessage("");
        setPasswordError("");
        setShowPassword(false);
    }, [mode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (mode === "signup" && name === "password") {
            if (!isPasswordComplexFrontend(value)) {
                setPasswordError("Your password must be a minimum of 8 characters and include a combination of both letters and numbers.");
            } else {
                setPasswordError("");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");
        setPasswordError("");

        if (mode === "signup" && !isPasswordComplexFrontend(formData.password)) {
            setPasswordError("Password does not meet the requirements.");
            return;
        }

        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
        const fullUrl = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;

        try {
            const response = await fetch(fullUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
                credentials: "include",
            });

            const data = await response.json();

            if (response.ok) {
                console.log(isLogin ? "Login successful:" : "Signup successful:", data);
                if (isLogin && data.token && data.userId) {
                    localStorage.setItem("authToken", data.token);
                    localStorage.setItem("userId", data.userId);
                    login({ token: data.token, user: { id: data.userId } });
                    setSuccessMessage("Login successful!");
                    setTimeout(() => navigate("/"), 1500);
                } else if (!isLogin && data.id) {
                    localStorage.setItem("userId", data.id);
                    setSuccessMessage("Signup successful! Redirecting to login...");
                    setTimeout(() => setSearchParams({ mode: "login" }), 1500);
                } else if (isLogin && !data.token) {
                    setErrorMessage("Login successful, but no token received.");
                }
            } else {
                console.error(isLogin ? "Login failed:" : "Signup failed:", data);
                setErrorMessage(data.error || "Authentication failed");
            }
        } catch (error) {
            console.error("There was an error during authentication:", error);
            setErrorMessage(error.message || "Failed to connect to the server");
        }
    };

    const handleCloseErrorAlert = () => {
        setErrorMessage("");
    };

    const handleCloseSuccessAlert = () => {
        setSuccessMessage("");
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="bg-black-900 flex items-start justify-center p-4 pt-24">
            <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8 transition-all duration-300 ease-in-out hover:shadow-xl">
                <h2 className="text-center text-2xl font-bold text-white mb-6">
                    {isLogin ? "Sign in to your account" : "Create a new account"}
                </h2>

                {successMessage && (
                    <Alert
                        message={successMessage}
                        type="login"
                        onClose={handleCloseSuccessAlert}
                    />
                )}

                {errorMessage && (
                    <Alert
                        message={errorMessage}
                        type="error"
                        onClose={handleCloseErrorAlert}
                    />
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <input type="hidden" name="remember" defaultValue="true" />
                    {mode === "signup" && (
                        <>
                            <div>
                                <label htmlFor="firstName" className="sr-only">
                                    First Name
                                </label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    autoComplete="given-name"
                                    required
                                    className="w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-700 text-white"
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="sr-only">
                                    Last Name
                                </label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    autoComplete="family-name"
                                    required
                                    className="w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-700 text-white"
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                            </div>
                        </>
                    )}
                    <div className="relative"> {/* Add relative positioning here */}
                        <label htmlFor="email-address" className="sr-only">
                            Email address
                        </label>
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-700 text-white"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="relative"> {/* Add relative positioning here */}
                        <label htmlFor="password" className="sr-only">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete={isLogin ? "current-password" : "new-password"}
                            required
                            className="w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-700 text-white"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        {mode === "signup" && passwordError && (
                            <p className="mt-1 text-sm text-red-500 absolute bottom-[-20px] left-0">{passwordError}</p> 
                        )}
                    </div>

                    {isLogin && (
                        <div className="flex items-center justify-between">
                            <label className="flex items-center text-sm text-gray-400">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-teal-600 border-gray-600 rounded focus:ring-teal-500"
                                />
                                <span className="ml-2">Remember me</span>
                            </label>
                            <a href="#" className="text-sm text-teal-500 hover:underline">
                                Forgot your password?
                            </a>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full flex justify-center items-center gap-2 py-2 px-4 text-white bg-teal-600 hover:bg-teal-700 font-medium rounded-md transition-colors duration-200 cursor-pointer"
                    >
                        <FaLock />
                        {isLogin ? "Sign in" : "Sign up"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    {isLogin ? (
                        <>
                            Don&apos;t have an account?{" "}
                            <button
                                onClick={() => setSearchParams({ mode: "signup" })}
                                className="text-teal-500 hover:underline font-medium cursor-pointer"
                            >
                                Sign up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}
                            <button
                                onClick={() => setSearchParams({ mode: "login" })}
                                className="text-teal-500 hover:underline font-medium cursor-pointer"
                            >
                                Sign in
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Auth;