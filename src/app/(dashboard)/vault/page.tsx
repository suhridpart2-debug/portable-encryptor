"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  FileText, 
  Download, 
  Trash2,
  Calendar,
  HardDrive,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import { formatBytes } from "@/lib/utils";
import { toast } from "react-hot-toast";

export default function VaultPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchFiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('files_metadata')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to load vault data");
    } else {
      setFiles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('files_metadata')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete record");
    } else {
      toast.success("Record deleted");
      fetchFiles();
    }
  };

  const filteredFiles = files.filter(file => 
    file.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">File Vault</h1>
          <p className="text-muted-foreground">Manage your encrypted file metadata and history.</p>
        </div>
        <Button onClick={fetchFiles} variant="outline" size="sm">
          Refresh Vault
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b border-border bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search files..." 
                className="pl-10 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="bg-white">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-slate-50/30">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">File Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Size</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date Encrypted</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-8 h-16 bg-slate-50/20" />
                    </tr>
                  ))
                ) : filteredFiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="bg-slate-100 p-4 rounded-full">
                          <FileText className="w-8 h-8 text-slate-400" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900">No files found</p>
                          <p className="text-sm text-muted-foreground">Your vault is currently empty.</p>
                        </div>
                        <Button size="sm">Encrypt your first file</Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 rounded-lg">
                            <FileText className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{file.filename}</p>
                            <p className="text-xs text-muted-foreground">{file.file_type || 'Unknown type'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {file.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{formatBytes(file.encrypted_size)}</span>
                          <span className="text-[10px] text-muted-foreground">Encrypted Size</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(file.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDelete(file.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Footer */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-border soft-shadow">
          <div className="bg-blue-50 p-3 rounded-xl">
            <HardDrive className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Vault Usage</p>
            <p className="text-xl font-bold">{formatBytes(files.reduce((acc, f) => acc + (f.encrypted_size || 0), 0))}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-border soft-shadow">
          <div className="bg-indigo-50 p-3 rounded-xl">
            <FileText className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Records</p>
            <p className="text-xl font-bold">{files.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-border soft-shadow">
          <div className="bg-emerald-50 p-3 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Security Score</p>
            <p className="text-xl font-bold">100/100</p>
          </div>
        </div>
      </div>
    </div>
  );
}
