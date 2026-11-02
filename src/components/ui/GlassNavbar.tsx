"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { LandingNavbar } from "@/components/navigation/LandingNavbar";
import { DashboardNavbar } from "@/components/navigation/DashboardNavbar";
import { AdminNavbar } from "@/components/navigation/AdminNavbar";

export function GlassNavbar() {
  const pathname = usePathname();

  // 1. Admin route
  if (pathname.startsWith("/admin")) {
    return <AdminNavbar />;
  }

  // 2. User panel / study routes
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/review") ||
    pathname.startsWith("/decks")
  ) {
    return <DashboardNavbar />;
  }

  // 3. Auth standalone pages
  if (pathname === "/login" || pathname === "/register") {
    return null; // Auth pages have their own focused top bar
  }

  // 4. Landing page (root) and other public pages
  return <LandingNavbar />;
}
