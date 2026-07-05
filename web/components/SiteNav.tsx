"use client";

import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

// The admin dashboard has its own header (AdminLayout) — never show the
// public nav there, same reasoning WordPress keeps /wp-admin off the site menu.
export default function SiteNav() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="site-nav">
      <a className="site-nav__brand" href="/">ViralCrime</a>
      <nav className="site-nav__links" aria-label="Primary">
        <a href="/">Feed</a>
        <a href="/towns">Towns</a>
        <a href="/about">About</a>
        <a href="/search" className="site-nav__search" aria-label="Search">⌕ Search</a>
        <ThemeToggle />
      </nav>
    </header>
  );
}
