import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("worship_token") || null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authConfig, setAuthConfig] = useState({ googleConfigured: false, supabaseConfigured: false });

  // Load public auth configuration
  useEffect(() => {
    fetch("/api/auth/config")
      .then((res) => res.json())
      .then((data) => setAuthConfig(data))
      .catch(() => {});
  }, []);

  // Restore authenticated session on mount
  useEffect(() => {
    async function loadSession() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Token expired or invalid
          localStorage.removeItem("worship_token");
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error("Session restoration error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, [token]);

  // Sign In
  const signIn = async (email, password, rememberMe = false) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in.");
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("worship_token", data.token);
      return data.user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up
  const signUp = async ({ name, email, password, confirmPassword, churchName }) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword, churchName })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account.");
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("worship_token", data.token);
      return data.user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch {}
    localStorage.removeItem("worship_token");
    setToken(null);
    setUser(null);
  };

  // Update Profile
  const updateProfile = async (updates) => {
    if (!token) throw new Error("Not signed in");
    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update profile.");
    setUser(data.user);
    return data.user;
  };

  // Change Password
  const changePassword = async (oldPassword, newPassword) => {
    if (!token) throw new Error("Not signed in");
    const res = await fetch("/api/auth/password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ oldPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to change password.");
    return true;
  };

  // Forgot Password
  const forgotPassword = async (email) => {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to process request.");
    return data;
  };

  // Reset Password
  const resetPassword = async (resetToken, newPassword) => {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: resetToken, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to reset password.");
    return true;
  };

  // Add Workspace
  const addWorkspace = async (name) => {
    if (!token) throw new Error("Not signed in");
    const res = await fetch("/api/auth/workspace", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add workspace.");
    setUser(data.user);
    return data.user;
  };

  // Switch Workspace
  const switchWorkspace = async (workspaceId) => {
    if (!token) throw new Error("Not signed in");
    const res = await fetch("/api/auth/workspace/switch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ workspaceId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to switch workspace.");
    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        isLoading,
        authError,
        authConfig,
        signIn,
        signUp,
        signOut,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        addWorkspace,
        switchWorkspace
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

