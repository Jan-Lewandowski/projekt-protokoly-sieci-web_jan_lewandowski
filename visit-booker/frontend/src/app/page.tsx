"use client";

import { useEffect, useState } from "react";
import AdminDashboard from "../components/AdminDashboard";
import AuthForm from "../components/AuthForm";
import LogoutBar from "../components/LogoutBar";
import UserDashboard from "../components/UserDashboard";

type AuthState = {
  isAuthenticated: boolean;
  error: string | null;
  role: "admin" | "user" | null;
};

const API_URL = "http://localhost:4000";

export default function Home() {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    error: null,
    role: null,
  });
  const [email, setEmail] = useState("admin@test.pl");
  const [password, setPassword] = useState("admin123");
  const [mode, setMode] = useState<"login" | "register">("login");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setAuth({
            isAuthenticated: true,
            error: null,
            role: data.role || null,
          });
          return;
        }
      } catch {
      }
      setAuth({ isAuthenticated: false, error: null, role: null });
    };

    checkAuth();
  }, []);

  const handleSubmit = async () => {
    setAuth((prev) => ({ ...prev, error: null }));

    const endpoint = mode === "login" ? "login" : "register";
    try {
      const res = await fetch(`${API_URL}/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Request failed: ${res.status}`);
      }

      const me = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include",
      });
      if (me.ok) {
        const data = await me.json();
        setAuth({
          isAuthenticated: true,
          error: null,
          role: data.role || null,
        });
      } else {
        setAuth({ isAuthenticated: true, error: null, role: null });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setAuth({ isAuthenticated: false, error: message, role: null });
    }
  };

  return (
    <>
      {auth.isAuthenticated && (
        <div>
          <LogoutBar
            onLogout={async () => {
              try {
                await fetch(`${API_URL}/api/auth/logout`, {
                  method: "POST",
                  credentials: "include",
                });
              } finally {
                setAuth({
                  isAuthenticated: false,
                  error: null,
                  role: null,
                });
              }
            }}
          />
          {auth.role === "admin" && <AdminDashboard enabled />}
          {auth.role !== "admin" && <UserDashboard enabled />}
        </div>
      )}

      {!auth.isAuthenticated && (
        <AuthForm
          mode={mode}
          email={email}
          password={password}
          error={auth.error}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleSubmit}
          onToggleMode={() => setMode(mode === "login" ? "register" : "login")}
        />
      )}
    </>
  );
}
