"use client";
import fetcher from "@/libs/fetcher";
import { UserType } from "@/types/userTypes";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AppState {
  theme: "light" | "dark";
  toggleTheme: () => void;
  user: UserType | null;
  basicSettings: { sidebarMinimal: boolean; showFeedback: boolean };
  setBasicSettings: (settings: { sidebarMinimal: boolean; showFeedback: boolean }) => void;
  setUser: (user: UserType | null) => void;
  fetchUserDetails: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [basicSettings, setBasicSettings] = useState({
    sidebarMinimal: true,
    showFeedback: true,
  });
  const [user, setUser] = useState<UserType | null>(null);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const getUserDetails = async () => {
    try {
      const res = await fetcher.get<{ success: boolean; data: UserType }>("/users/self");
      if (res.body?.success) {
        setUser(res.body.data);
      }
    } catch {
      setUser(null);
    } finally {
    }
  };

  const value = {
    theme,
    toggleTheme,
    user,
    setUser,
    basicSettings,
    setBasicSettings,
    fetchUserDetails: getUserDetails,
  };

  useEffect(() => {
    getUserDetails();
  }, []);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
