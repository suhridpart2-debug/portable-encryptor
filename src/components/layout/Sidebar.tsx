"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Lock, 
  Unlock, 
  Database, 
  Settings, 
  LogOut,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Encrypt", icon: Lock, href: "/encrypt" },
  { name: "Decrypt", icon: Unlock, href: "/decrypt" },
  { name: "File Vault", icon: Database, href: "/vault" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-white h-screen fixed left-0 top-0 pt-20 pb-6 px-4 flex flex-col justify-between">
      <div className="space-y-2">
        <Link href="/dashboard" className="px-3 mb-6 block group">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-bold text-lg">SafePortal</span>
          </div>
          <p className="text-xs text-muted-foreground">Premium Security Suite</p>
        </Link>
        
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group",
              pathname === item.href
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-colors",
              pathname === item.href ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            )} />
            {item.name}
          </Link>
        ))}
      </div>

      <div className="border-t border-border pt-4">
        <button className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
