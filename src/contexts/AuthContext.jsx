import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import Alert from "../components/Alert"; // Import the Alert component

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("authUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem("authToken") || null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("authToken")
  );
  const [activityTimestamp, setActivityTimestamp] = useState(Date.now());
  const timeoutDuration = 60 * 60 * 1000; // 1 hour
  const [logoutAlert, setLogoutAlert] = useState(null); // State for the custom logout alert
  const [isInactiveLogout, setIsInactiveLogout] = useState(false); // Track if logout was due to inactivity

  const resetActivityTimeout = useCallback(() => {
    setActivityTimestamp(Date.now());
  }, []);

  const login = (authData) => {
    setUser(authData.user);
    setToken(authData.token);
    setIsAuthenticated(true);
    localStorage.setItem("authToken", authData.token);
    localStorage.setItem("authUser", JSON.stringify(authData.user));
    resetActivityTimeout(); // Reset timer on login
    setIsInactiveLogout(false); // Reset inactive logout flag on login
  };

  const logout = useCallback((inactive = true) => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setIsInactiveLogout(inactive);
    setLogoutAlert({
      message: inactive
        ? "You have been logged out due to inactivity."
        : "Logged out successfully.",
      type: "logout",
    });
  }, []);

  const clearLogoutAlert = useCallback(() => {
    setLogoutAlert(null);
    setIsInactiveLogout(false); // Clear the flag when the alert is closed
  }, []);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "authToken") {
        setToken(localStorage.getItem("authToken") || null);
        setIsAuthenticated(!!localStorage.getItem("authToken"));
      }
      if (event.key === "authUser") {
        const storedUser = localStorage.getItem("authUser");
        setUser(storedUser ? JSON.parse(storedUser) : null);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");

    if (storedToken && !user) {
      setToken(storedToken);
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
          withCredentials: true,
        })
        .then((response) => {
          setUser(response.data);
          setIsAuthenticated(true);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem("authToken");
          localStorage.removeItem("authUser");
        });
    } else if (!storedToken) {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []); // ✅ no dependencies causing infinite loop

  useEffect(() => {
    if (!isAuthenticated) return;

    const timer = setTimeout(() => {
      logout(); // Logout due to inactivity (default inactive=true)
    }, timeoutDuration);

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keypress",
      "scroll",
      "touchstart",
    ];
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetActivityTimeout);
    });

    return () => {
      clearTimeout(timer);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetActivityTimeout);
      });
    };
  }, [isAuthenticated, logout, resetActivityTimeout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        logout: () => logout(false),
      }} // Override logout to pass inactive=false
    >
                       {" "}
      {logoutAlert && (
        <Alert
          message={logoutAlert.message}
          type={logoutAlert.type}
          onClose={clearLogoutAlert}
        />
      )}
                  {children}       {" "}
    </AuthContext.Provider>
  );
};
