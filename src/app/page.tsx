"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Shield, Lock, Zap, HardDrive, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const features = [
  {
    title: "AES-256-GCM Encryption",
    description: "Military-grade encryption standard to keep your sensitive files completely unreadable without the correct key.",
    icon: Shield,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Client-Side Security",
    description: "Files are encrypted in your browser. Your password and secret keys never touch our servers.",
    icon: Lock,
    color: "bg-indigo-500/10 text-indigo-600",
  },
  {
    title: "Browser-Based Decryption",
    description: "Decrypt your files instantly in any modern browser without installing extra software.",
    icon: Zap,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "Portable Access",
    description: "Securely share encrypted files across different platforms and access them on the go.",
    icon: HardDrive,
    color: "bg-emerald-500/10 text-emerald-600",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              CLIENT-SIDE ENCRYPTION
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              Secure your files <br className="hidden md:block" /> 
              before storing or sharing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              The professional standard for web-based encryption. Portable Encryptor uses military-grade AES-256-GCM to ensure your privacy remains absolute.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="h-14 px-10 text-lg">
                  Start Encrypting <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/decrypt">
                <Button variant="outline" size="lg" className="h-14 px-10 text-lg">
                  Decrypt a File
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-32">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-border/50 hover:border-primary/30 transition-all hover:soft-shadow">
                  <CardContent className="pt-6">
                    <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-5`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Social Proof/Trust Section */}
        <section className="bg-secondary/30 mt-32 py-20 border-y border-border/50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Built for the Security-Conscious</h2>
                <div className="space-y-4">
                  {[
                    "No storage of plain-text files or secret keys",
                    "Full transparency with Web Crypto API",
                    "Independent of server-side vulnerabilities",
                    "Zero-knowledge architecture by design"
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="bg-emerald-500/10 text-emerald-600 rounded-full p-1">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass rounded-3xl p-8 soft-shadow border border-white/40">
                <div className="bg-slate-900 rounded-xl p-6 text-white font-mono text-sm overflow-hidden">
                  <div className="flex gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <p className="text-emerald-400"># portable-encryptor --encrypt</p>
                  <p className="text-slate-400 mt-2">Deriving key using PBKDF2...</p>
                  <p className="text-slate-400">Algorithm: AES-256-GCM</p>
                  <p className="text-emerald-400 mt-2">✓ Encryption Complete</p>
                  <p className="text-slate-400 mt-2">Output: confidential_data.enc</p>
                  <p className="text-slate-400">Key: saved to vault.key</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-bold">Portable Encryptor</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; 2024 Portable Encryptor. Final Year PBL Project.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Documentation</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
