"use client";

import Link from "next/link";
import { Shield, Lock, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-border/40 px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-primary p-1.5 rounded-lg">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <Link href="/" className="font-bold text-xl tracking-tight hidden sm:block">
          Portable <span className="text-primary">Encryptor</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/login">
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            Login
          </Button>
        </Link>
        <Link href="/signup">
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            Get Started
          </Button>
        </Link>
      </div>
    </nav>
  );
}
