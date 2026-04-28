"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Shield, Bell, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
      }
    };
    checkUser();
  }, [router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#fdfdfd]">
      <Sidebar />
      
      <div className="ml-64">
        {/* Dashboard Header */}
        <header className="h-16 border-b border-border bg-white flex items-center justify-between px-8 sticky top-0 z-40">
          <h2 className="font-semibold text-lg">
            {user.email?.split('@')[0].charAt(0).toUpperCase() + user.email?.split('@')[0].slice(1)}&apos;s Vault
          </h2>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => toast.success("No new notifications")}
              className="p-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-white" />
            </button>
            <Link href="/settings" title="Profile Settings">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer">
                {user.email?.[0].toUpperCase()}
              </div>
            </Link>
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
