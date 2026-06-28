"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth, isFirebaseConfigured } from "@/lib/firebaseClient";

export interface HealthProfile {
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  medicalHistory: string;
  allergies: string;
  healthGoals: string;
}

export interface User {
  email: string;
  name: string;
  role?: string;
  profile?: HealthProfile;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  saveOnboardingProfile: (profile: Omit<HealthProfile, "name">) => Promise<void>;
  deleteUserAccount: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load user session on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("unicare_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setIsLoading(false);
    }
  }, []);

  // Simple auth routing guards
  useEffect(() => {
    if (isLoading) return;

    const publicPages = ["/", "/login", "/signup", "/privacy", "/terms"];
    const isPublicPage = publicPages.includes(pathname);

    if (!user) {
      // Redirect unauthenticated user attempting to access private routes
      if (!isPublicPage) {
        router.push("/login");
      }
    } else {
      // Authenticated user
      const hasCompletedOnboarding = !!user.profile;
      
      if (!hasCompletedOnboarding) {
        // Force onboarding if profile is missing, unless they are already there or logging out
        if (pathname !== "/onboarding" && pathname !== "/privacy" && pathname !== "/terms") {
          router.push("/onboarding");
        }
      } else {
        // Reroute authenticated & onboarded users away from login/signup/onboarding to dashboard
        if (pathname === "/login" || pathname === "/signup" || pathname === "/onboarding") {
          router.push("/dashboard");
        }
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      let token = "";
      if (isFirebaseConfigured && auth) {
        const { signInWithEmailAndPassword } = await import("firebase/auth");
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        token = await userCredential.user.getIdToken();
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      const finalToken = token || data.token;
      localStorage.setItem("unicare_user", JSON.stringify(data.user));
      if (finalToken) {
        localStorage.setItem("unicare_token", finalToken);
      }
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      console.error("Login fetch error:", err);
      return { success: false, error: err.message || "Unable to connect to the login server." };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      let token = "";
      if (isFirebaseConfigured && auth) {
        const { createUserWithEmailAndPassword } = await import("firebase/auth");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        token = await userCredential.user.getIdToken();
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || "Signup failed" };
      }

      const finalToken = token || data.token;
      localStorage.setItem("unicare_user", JSON.stringify(data.user));
      if (finalToken) {
        localStorage.setItem("unicare_token", finalToken);
      }
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      console.error("Signup fetch error:", err);
      return { success: false, error: err.message || "Unable to connect to the registration server." };
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        const { signOut } = await import("firebase/auth");
        await signOut(auth);
      } catch (err) {
        console.error("Firebase logout error:", err);
      }
    }
    localStorage.removeItem("unicare_user");
    localStorage.removeItem("unicare_token");
    setUser(null);
    router.push("/login");
  };

  const saveOnboardingProfile = async (profileData: Omit<HealthProfile, "name">) => {
    if (!user) return;

    try {
      const token = localStorage.getItem("unicare_token");
      const response = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ""}`
        },
        body: JSON.stringify({
          email: user.email,
          ...profileData
        })
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Onboarding API error:", data.error);
        return;
      }

      localStorage.setItem("unicare_user", JSON.stringify(data.user));
      setUser(data.user);
      router.push("/dashboard");
    } catch (err) {
      console.error("Onboarding fetch error:", err);
    }
  };

  const deleteUserAccount = async () => {
    if (!user) return { success: false, error: "Not logged in" };

    try {
      const token = localStorage.getItem("unicare_token");
      const response = await fetch("/api/auth/delete", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token || ""}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || "Delete failed" };
      }

      // If in Firebase mode, delete current Firebase user credentials too
      if (isFirebaseConfigured && auth && auth.currentUser) {
        try {
          const { deleteUser } = await import("firebase/auth");
          await deleteUser(auth.currentUser);
        } catch (fbErr) {
          console.warn("Could not delete Firebase user directly from client (might require reauthentication):", fbErr);
        }
      }

      localStorage.removeItem("unicare_user");
      localStorage.removeItem("unicare_token");
      setUser(null);
      router.push("/login");
      return { success: true };
    } catch (err: any) {
      console.error("Delete account error:", err);
      return { success: false, error: err.message || "Failed to contact deletion server." };
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, saveOnboardingProfile, deleteUserAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
