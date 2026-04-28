"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, Lock, Bell, Shield, Smartphone, Globe, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";

type Tab = "General" | "Security" | "Notifications" | "Devices";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Security");
  const [offlineMode, setOfflineMode] = useState(false);
  const [clientPassword, setClientPassword] = useState(true);

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and security configuration.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        <aside className="md:col-span-1 space-y-1">
          {[
            { name: "General", icon: User },
            { name: "Security", icon: Shield },
            { name: "Notifications", icon: Bell },
            { name: "Devices", icon: Smartphone },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name as Tab)}
              className={`flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm font-medium transition-all ${
                activeTab === item.name 
                  ? "bg-primary/10 text-primary shadow-sm" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </button>
          ))}
        </aside>

        <div className="md:col-span-3 space-y-6">
          {activeTab === "Security" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Security Settings</CardTitle>
                  <CardDescription>Configure how your data is protected.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                          <Lock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Client-Side Password</p>
                          <p className="text-xs text-muted-foreground">Require password for every encryption.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setClientPassword(!clientPassword)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${clientPassword ? 'bg-primary' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${clientPassword ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                          <Globe className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Offline Mode</p>
                          <p className="text-xs text-muted-foreground">Work without internet connection.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setOfflineMode(!offlineMode)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${offlineMode ? 'bg-primary' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${offlineMode ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-bold">Update Account Password</h4>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Current Password</label>
                        <Input type="password" placeholder="••••••••" className="bg-slate-50/50" />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New Password</label>
                          <Input type="password" placeholder="••••••••" className="bg-slate-50/50" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Confirm Password</label>
                          <Input type="password" placeholder="••••••••" className="bg-slate-50/50" />
                        </div>
                      </div>
                      <Button onClick={handleSave} className="w-fit px-8 mt-2 premium-gradient border-none">Save Changes</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/20 bg-destructive/[0.01]">
                <CardHeader>
                  <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions for your account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">Delete Account</p>
                      <p className="text-xs text-muted-foreground">Permanently remove your account and vault data.</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/10">Delete Account</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "General" && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader>
                <CardTitle className="text-lg">General Settings</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Display Name</label>
                    <Input placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
                    <Input disabled placeholder="user@example.com" />
                  </div>
                </div>
                <Button onClick={handleSave} className="w-fit px-8 premium-gradient border-none">Update Profile</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "Notifications" && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader>
                <CardTitle className="text-lg">Notification Preferences</CardTitle>
                <CardDescription>Choose what updates you want to receive.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  "Email alerts for new logins",
                  "Weekly security reports",
                  "Feature updates and tips",
                  "Storage limit warnings"
                ].map((pref) => (
                  <div key={pref} className="flex items-center justify-between p-3 border-b border-border last:border-0">
                    <span className="text-sm">{pref}</span>
                    <div className="w-10 h-5 bg-primary rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === "Devices" && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader>
                <CardTitle className="text-lg">Connected Devices</CardTitle>
                <CardDescription>Manage devices that have access to your vault.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-bold">This Device (Chrome / Windows)</p>
                      <p className="text-xs text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Online Now
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive">Revoke</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
