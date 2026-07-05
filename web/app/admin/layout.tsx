"use client";

import { AdminAuthProvider, useAdminAuth } from "@/components/AdminAuth";
import { AdminLoginForm } from "@/components/AdminLoginForm";

function Gate({ children }: { children: React.ReactNode }) {
  const { session, ready, logout } = useAdminAuth();

  if (!ready) return null; // avoid a login-form flash while sessionStorage is checked
  if (!session) return <AdminLoginForm />;

  return (
    <main className="wrap">
      <div className="admin-bar">
        <span className="eyebrow" style={{ margin: 0 }}>Admin</span>
        <span className="admin-bar__who">
          {session.username} · <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>Sign out</a>
        </span>
      </div>
      {children}
    </main>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <Gate>{children}</Gate>
    </AdminAuthProvider>
  );
}
