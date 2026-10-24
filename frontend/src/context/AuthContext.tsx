"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, UserProfile, TokenResponse } from "@/lib/api";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "register";
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
  login: (credentials: { email_or_username: string; password: string }) => Promise<void>;
  register: (data: { username: string; email?: string; password: string }) => Promise<void>;
  loginWithTelegram: (tgData: {
    telegram_id: number;
    username?: string;
    first_name?: string;
    avatar_url?: string;
  }) => Promise<void>;
  setAuthSession: (access_token: string, user: UserProfile) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");

  const openAuthModal = useCallback((mode: "login" | "register" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const handleAuthSuccess = useCallback((tokenRes: TokenResponse) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lexora_auth_token", tokenRes.access_token);
      localStorage.setItem("lexora_user", JSON.stringify(tokenRes.user));
      localStorage.setItem("lexora_streak", String(tokenRes.user.streak_count));
      window.dispatchEvent(new CustomEvent("lexora-auth-changed"));
    }
    setToken(tokenRes.access_token);
    setUser(tokenRes.user);
    setIsAuthModalOpen(false);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await api.getMe();
      setUser(profile);
      if (typeof window !== "undefined") {
        localStorage.setItem("lexora_user", JSON.stringify(profile));
        localStorage.setItem("lexora_streak", String(profile.streak_count));
      }
    } catch (err) {
      console.error("Failed to refresh user profile:", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const initAuth = async () => {
      if (typeof window !== "undefined") {
        const savedToken = localStorage.getItem("lexora_auth_token");
        const savedUserStr = localStorage.getItem("lexora_user");

        if (savedToken) {
          setToken(savedToken);
          if (savedUserStr) {
            try {
              setUser(JSON.parse(savedUserStr));
            } catch {
              // ignore json parse error
            }
          }

          // Verify with backend
          try {
            const profile = await api.getMe();
            setUser(profile);
            localStorage.setItem("lexora_user", JSON.stringify(profile));
            localStorage.setItem("lexora_streak", String(profile.streak_count));
          } catch (err) {
            console.warn("Token expired or invalid, logging out:", err);
            localStorage.removeItem("lexora_auth_token");
            localStorage.removeItem("lexora_user");
            setToken(null);
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Listen to custom open modal events
    const handleOpenModal = (e: any) => {
      const mode = e.detail?.mode || "login";
      openAuthModal(mode);
    };
    window.addEventListener("open-auth-modal", handleOpenModal);

    return () => {
      window.removeEventListener("open-auth-modal", handleOpenModal);
    };
  }, [openAuthModal]);

  const login = async (credentials: { email_or_username: string; password: string }) => {
    const res = await api.login(credentials);
    handleAuthSuccess(res);
  };

  const register = async (data: { username: string; email?: string; password: string }) => {
    const res = await api.register(data);
    handleAuthSuccess(res);
  };

  const loginWithTelegram = async (tgData: {
    telegram_id: number;
    username?: string;
    first_name?: string;
    avatar_url?: string;
  }) => {
    const res = await api.loginTelegram(tgData);
    handleAuthSuccess(res);
  };

  const setAuthSession = useCallback((access_token: string, newUser: UserProfile) => {
    handleAuthSuccess({
      access_token,
      token_type: "bearer",
      user: newUser,
    });
  }, [handleAuthSuccess]);

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("lexora_auth_token");
      localStorage.removeItem("lexora_user");
      window.dispatchEvent(new CustomEvent("lexora-auth-changed"));
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        loginWithTelegram,
        setAuthSession,
        logout,
        refreshUser,
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
