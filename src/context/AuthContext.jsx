import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  getOrders,
  getUsers,
  loginRequest,
  logoutRequest,
  saveSession,
  clearSession,
  getSavedUser
} from "../lib/api";
import { mapUserFromApi } from "../lib/mapper";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getSavedUser());
  const [currentUser, setCurrentUser] = useState(() => getSavedUser());
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const fetchProtectedResources = useCallback(async (user) => {
    if (!user) {
      setUsers([]);
      setOrders([]);
      return;
    }

    if (user.permissions?.orders) {
      try {
        const ordersResponse = await getOrders();
        setOrders(ordersResponse.data || []);
      } catch (error) {
        console.error(error);
        setOrders([]);
      }
    } else {
      setOrders([]);
    }

    if (user.permissions?.users) {
      try {
        const usersResponse = await getUsers();
        setUsers((usersResponse.data || []).map(mapUserFromApi));
      } catch (error) {
        console.error(error);
        setUsers([]);
      }
    } else {
      setUsers([]);
    }
  }, []);

  const validateSavedSession = useCallback(async () => {
    try {
      const response = await getCurrentUser();
      const user = mapUserFromApi(response.user);

      saveSession(user);
      setCurrentUser(user);
      setIsLoggedIn(true);
      await fetchProtectedResources(user);
    } catch (error) {
      console.error(error);
      clearSession();
      setCurrentUser(null);
      setIsLoggedIn(false);
      setUsers([]);
      setOrders([]);
    } finally {
      setIsAuthLoading(false);
    }
  }, [fetchProtectedResources]);

  useEffect(() => {
    validateSavedSession();
  }, [validateSavedSession]);

  const login = useCallback(
    async (email, password) => {
      try {
        setAuthError("");
        const response = await loginRequest({
          email: email.trim().toLowerCase(),
          password
        });

        const user = mapUserFromApi(response.user);
        saveSession(user);

        setCurrentUser(user);
        setIsLoggedIn(true);
        await fetchProtectedResources(user);

        return { ok: true };
      } catch (error) {
        clearSession();
        setIsLoggedIn(false);
        setCurrentUser(null);
        setUsers([]);
        setOrders([]);

        return {
          ok: false,
          message: error.message || "Correo o contraseña incorrectos."
        };
      }
    },
    [fetchProtectedResources]
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.error(error);
    } finally {
      clearSession();
      setIsLoggedIn(false);
      setCurrentUser(null);
      setUsers([]);
      setOrders([]);
    }
  }, []);

  const value = {
    isLoggedIn,
    currentUser,
    setCurrentUser,
    users,
    setUsers,
    orders,
    setOrders,
    login,
    logout,
    isAuthLoading,
    authError,
    validateSavedSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}
