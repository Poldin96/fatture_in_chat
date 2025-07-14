"use client";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

const excluded = ["/", "/auth/login", "/auth/register", "/auth/reset-password"];

export function SidebarWrapper() {
  const pathname = usePathname();
  
  // Escludi pagine specifiche
  if (excluded.includes(pathname)) return null;
  
  // Escludi tutte le pagine della chat (/c e /c/[id])
  if (pathname.startsWith("/c")) return null;
  
  return <Sidebar />;
} 