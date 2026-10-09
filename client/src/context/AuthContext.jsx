import { useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContext.js";

function getStoredUser() {
  const storedUser = sessionStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Failed to parse stored user:", error);
    sessionStorage.removeItem("user");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const authRequestVersionRef = useRef(0);

  useEffect(() => {
    let active = true;
    const requestVersion = authRequestVersionRef.current;

    fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Authentication required");
        }

        const data = await response.json();
        if (active && requestVersion === authRequestVersionRef.current) {
          sessionStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user);
        }
      })
      .catch(() => {
        if (active && requestVersion === authRequestVersionRef.current) {
          sessionStorage.removeItem("user");
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setIsAuthLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function login(email, password) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    authRequestVersionRef.current += 1;
    // Save session
    sessionStorage.setItem("user", JSON.stringify(data.user));

    // Update React state
    setUser(data.user);

    return data;
  }

  function syncAuthenticatedUser(currentUser) {
    if (!currentUser) {
      return;
    }

    sessionStorage.setItem("user", JSON.stringify(currentUser));
    setUser(currentUser);
  }

  async function register({ username, email, password, confirmPassword }) {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          confirmPassword,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    return data;
  }

  async function logout() {
    authRequestVersionRef.current += 1;

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    }

    sessionStorage.removeItem("user");

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthLoading,
        isAuthenticated: !!user,
        syncAuthenticatedUser,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
