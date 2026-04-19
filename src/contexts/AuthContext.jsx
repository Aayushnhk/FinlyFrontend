import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (!storedToken) {
      setIsAuthenticated(false);
      return;
    }
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` },
        withCredentials: true,
      })
      .then((res) => {
        setUser(res.data);
        setToken(storedToken);
        setIsAuthenticated(true);
      })
      .catch(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        setIsAuthenticated(false);
      });
  }, []);

  const login = async (authData) => {
    setToken(authData.token);
    setIsAuthenticated(true);
    localStorage.setItem("authToken", authData.token);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/auth/me`,
        {
          headers: { Authorization: `Bearer ${authData.token}` },
          withCredentials: true,
        },
      );
      setUser(res.data);
      localStorage.setItem("authUser", JSON.stringify(res.data));
    } catch {
      setUser(authData.user);
      localStorage.setItem("authUser", JSON.stringify(authData.user));
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
