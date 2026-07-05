"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { verifyCredentials } from "@/lib/adminApi";

interface AdminSession { header: string; username: string; }
interface AdminAuthValue {
  session: AdminSession | null;
  ready: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

// sessionStorage, not localStorage: cleared when the tab closes rather than
// persisting indefinitely. There's no server session — the browser just
// resends this header on every admin request.
const STORAGE_KEY = "vc_admin_session";

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) setSession(JSON.parse(stored));
    setReady(true);
  }, []);

  async function login(username: string, password: string): Promise<boolean> {
    const header = "Basic " + btoa(`${username}:${password}`);
    const ok = await verifyCredentials(header);
    if (!ok) return false;
    const next = { header, username };
    setSession(next);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return true;
  }

  function logout() {
    setSession(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AdminAuthContext.Provider value={{ session, ready, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
