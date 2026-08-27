import { createContext, useEffect, useState } from "react";
import api from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    api.get("/users").then((response) => setAccounts(response.data)).catch(() => setAccounts([]));
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post("/login", { username, password });
      setUser(response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      return response.data.user;
    } catch {
      return null;
    }
  };

  const loginWithGoogle = async (credentialUser) => {
    setUser(credentialUser);
    localStorage.setItem("user", JSON.stringify(credentialUser));
    return true;
  };

  const register = async (username, email, password) => {
    try {
      await api.post("/register", { username, email, password });
      const usersResponse = await api.get("/users");
      setAccounts(usersResponse.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        field: error.response?.data?.field,
        error: error.response?.data?.error || (error.request ? "The backend is not available. Please start the server and try again." : "Registration failed. Please try again."),
      };
    }
  };

  const deleteCustomer = async (id) => {
    await api.delete(`/users/${id}`);
    setAccounts((currentAccounts) => currentAccounts.filter((account) => account.id !== id));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === "admin",
        login,
        loginWithGoogle,
        register,
        deleteCustomer,
        customers: accounts,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
