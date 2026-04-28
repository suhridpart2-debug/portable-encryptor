"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  FileLock, 
  Unlock, 
  Database, 
  Clock, 
  Activity, 
  ShieldCheck,
  ArrowRight,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { formatBytes } from "@/lib/utils";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalFiles: 0,
    encryptedFiles: 0,
    storageUsed: 0,
    securityLevel: "Maximum"
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch all files for stats
        const { data: files, error } = await supabase
          .from('files_metadata')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (files) {
          const totalFiles = files.length;
          const encryptedFiles = files.filter(f => f.status === 'encrypted').length;
          const storageUsed = files.reduce((acc, f) => acc + (Number(f.encrypted_size) || 0), 0);

          setStats({
            totalFiles,
            encryptedFiles,
            storageUsed,
            securityLevel: "Maximum"
          });

          // Set recent 3 activities
          setRecentActivity(files.slice(0, 3));
        }
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { label: "Total Files", value: stats.totalFiles.toString(), icon: Database, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Encrypted", value: stats.encryptedFiles.toString(), icon: FileLock, color: "text-indigo-600", bg: "bg-indigo-100" },
    { label: "Storage Used", value: formatBytes(stats.storageUsed), icon: Activity, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Security Level", value: stats.securityLevel, icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  const storagePercentage = Math.min((stats.storageUsed / (1024 * 1024 * 1024)) * 100, 100); // % of 1GB

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Manage your secure vault and monitor file activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover:soft-shadow transition-all border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  {!loading && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mt-1" />
                  ) : (
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-primary/20 bg-primary/[0.02]">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <Link href="/encrypt">
                <Button className="w-full h-24 flex-col gap-2 text-lg rounded-2xl premium-gradient border-none">
                  <FileLock className="w-6 h-6" />
                  Encrypt File
                </Button>
              </Link>
              <Link href="/decrypt">
                <Button variant="outline" className="w-full h-24 flex-col gap-2 text-lg rounded-2xl border-primary/20 hover:bg-primary/5">
                  <Unlock className="w-6 h-6" />
                  Decrypt File
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <Link href="/vault">
                <Button variant="ghost" size="sm" className="text-primary">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                   <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
                   </div>
                ) : recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground italic">
                    No recent activity found.
                  </div>
                ) : (
                  recentActivity.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-border hover:bg-secondary/50 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-white transition-colors">
                          <Clock className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="max-w-[200px]">
                          <p className="text-sm font-semibold truncate">{file.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(file.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-600">{formatBytes(file.encrypted_size)}</p>
                        <Link href="/vault" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                          Details <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Storage Usage Card */}
        <div className="space-y-8">
          <Card className="overflow-hidden">
            <CardHeader className="bg-slate-900 text-white">
              <CardTitle className="text-lg">Storage Usage</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-3xl font-bold">{storagePercentage.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(stats.storageUsed)} of 1 GB used</p>
                  </div>
                  <Database className="w-8 h-8 text-slate-200" />
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${storagePercentage}%` }}
                    className="h-full bg-primary" 
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> Active Vault</span>
                    <span className="font-bold">{formatBytes(stats.storageUsed)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-300" /> Free Space</span>
                    <span className="font-bold">{formatBytes(Math.max((1024 * 1024 * 1024) - stats.storageUsed, 0))}</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full text-xs h-9">
                  Upgrade Storage
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-indigo-600 text-white border-none shadow-indigo-200 shadow-xl">
            <CardContent className="p-6 space-y-4">
              <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Pro Security</h3>
                <p className="text-indigo-100 text-sm mt-1">
                  Enable two-factor authentication for an extra layer of protection.
                </p>
              </div>
              <Button className="w-full bg-white text-indigo-600 hover:bg-white/90 border-none">
                Configure Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
