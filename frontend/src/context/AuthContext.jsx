import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "food-waste-access-token";
const USER_KEY = "food-waste-user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);

      return storedUser
        ? JSON.parse(storedUser)
        : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem(TOKEN_KEY);

  const saveUser = (userData) => {
    setUser(userData);

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(userData),
    );
  };

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setUser(null);
  };

  const login = async ({ email, password }) => {
    setLoading(true);

    try {
      const response = await api.post(
        "/auth/login",
        {
          email,
          password,
        },
      );

      const accessToken =
        response.data?.data?.access_token;

      if (!accessToken) {
        throw new Error(
          "Login succeeded but no access token was returned.",
        );
      }

      localStorage.setItem(
        TOKEN_KEY,
        accessToken,
      );

      /*
       * Get the authenticated user from the backend.
       *
       * This is important because the login endpoint
       * returns the token, while /auth/me returns the
       * user's role and account information.
       */
      const meResponse = await api.get(
        "/auth/me",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const userData =
        meResponse.data?.data;

      if (!userData) {
        throw new Error(
          "Unable to retrieve account information.",
        );
      }

      saveUser(userData);

      return {
        success: true,
        user: userData,
      };
    } catch (error) {
      /*
       * If login fails, don't leave an invalid token
       * behind in localStorage.
       */
      clearAuth();

      const backendMessage =
        error.response?.data?.detail;

      throw new Error(
        backendMessage ||
          error.message ||
          "Unable to sign in. Please check your details and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
  };

  const isAuthenticated = Boolean(
    localStorage.getItem(TOKEN_KEY),
  );

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider.",
    );
  }

  return context;
}