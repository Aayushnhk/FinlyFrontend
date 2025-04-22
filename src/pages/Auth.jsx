import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import Alert from "../components/Alert";

function Auth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const [isLogin, setIsLogin] = useState(mode !== 'signup');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    ...(mode === 'signup' && { firstName: '', lastName: '' }), // Add name fields for signup
  });
  const [errorMessage, setErrorMessage] = useState(''); // State for error messages
  const [successMessage, setSuccessMessage] = useState(''); // State for success messages
  const navigate = useNavigate();
  const { login } = useAuth(); // Access the login function from the context

  useEffect(() => {
    setIsLogin(mode !== 'signup');
    setFormData(prev => ({
      ...prev,
      ...(mode === 'signup' && !prev.firstName && { firstName: '' }), // Ensure name fields exist on mode change
      ...(mode === 'signup' && !prev.lastName && { lastName: '' }),
    }));
    setErrorMessage(''); // Clear any previous errors on mode change
    setSuccessMessage(''); // Clear any previous success messages
  }, [mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear any previous error message
    setSuccessMessage(''); // Clear any previous success message

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(isLogin ? 'Login successful:' : 'Signup successful:');
        if (isLogin && data.token && data.userId) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userId', data.userId);
          login({ token: data.token, user: { id: data.userId } });
          setSuccessMessage('Login successful!'); // Set success message
          setTimeout(() => navigate('/'), 1500); // Navigate after a short delay
        } else if (!isLogin && data.id) {
          localStorage.setItem('userId', data.id);
          setSuccessMessage('Signup successful! Redirecting to login...'); // Set success message
          setTimeout(() => setSearchParams({ mode: 'login' }), 1500); // Redirect to login after signup
        } else if (isLogin && !data.token) {
          setErrorMessage('Login successful, but no token received.');
        }
      } else {
        console.error(isLogin ? 'Login failed:' : 'Signup failed:', data);
        setErrorMessage(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('There was an error during authentication:', error);
      setErrorMessage('Failed to connect to the server');
    }
  };

  const handleCloseErrorAlert = () => {
    setErrorMessage('');
  };

  const handleCloseSuccessAlert = () => {
    setSuccessMessage('');
  };

  return (
    <div className="bg-black-900 flex items-start justify-center p-4 pt-24">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8 transition-all duration-300 ease-in-out hover:shadow-xl">
        <h2 className="text-center text-2xl font-bold text-white mb-6">
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </h2>

        {successMessage && (
          <Alert message={successMessage} type="login" onClose={handleCloseSuccessAlert} />
        )}

        {errorMessage && (
          <Alert message={errorMessage} type="error" onClose={handleCloseErrorAlert} />
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          {mode === 'signup' && (
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
          <div>
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

          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
              className="w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-700 text-white"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
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
            {isLogin ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          {isLogin ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => setSearchParams({ mode: 'signup' })}
                className="text-teal-500 hover:underline font-medium cursor-pointer"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setSearchParams({ mode: 'login' })}
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