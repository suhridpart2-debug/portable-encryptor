"use client";

import { Shield } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-12 group">
            <div className="bg-primary p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Portable Encryptor</span>
          </Link>
          {children}
        </div>
      </div>

      {/* Right side - Decoration */}
      <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-30" />
        <div className="relative z-10 text-center space-y-8">
          <div className="inline-block p-4 bg-white/10 rounded-3xl backdrop-blur-xl border border-white/10 mb-8">
            <div className="bg-white rounded-2xl p-6 soft-shadow">
              <Shield className="w-16 h-16 text-primary" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white tracking-tight">
            The standard for <br /> file security.
          </h2>
          <p className="text-slate-400 text-lg max-w-sm mx-auto leading-relaxed">
            Protecting thousands of sensitive files with client-side zero-knowledge encryption.
          </p>
          <div className="pt-12 grid grid-cols-3 gap-8">
            {[
              { label: "100%", sub: "Secure" },
              { label: "256-bit", sub: "AES" },
              { label: "Client", sub: "Side" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-white">{stat.label}</div>
                <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
