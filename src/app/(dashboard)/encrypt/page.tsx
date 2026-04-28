"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dropzone } from "@/components/ui/Dropzone";
import { ShieldCheck, Lock, Download, Loader2, AlertCircle } from "lucide-react";
import { encryptFile, downloadFile } from "@/lib/crypto";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function EncryptPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptedBlob, setEncryptedBlob] = useState<Blob | null>(null);

  const handleEncrypt = async () => {
    if (!file || !password) return;
    
    setIsEncrypting(true);
    try {
      // 1. Perform client-side encryption
      const encrypted = await encryptFile(file, password);
      setEncryptedBlob(encrypted);

      // 2. Store metadata in Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: dbError } = await supabase.from('files_metadata').insert({
          user_id: user.id,
          filename: file.name,
          original_size: file.size,
          encrypted_size: encrypted.size,
          file_type: file.type || 'application/octet-stream',
          status: 'encrypted'
        });
        
        if (dbError) {
          console.error("Supabase Error:", dbError);
          toast.error(`Encrypted, but failed to save metadata: ${dbError.message}`);
          return; // Stop if DB failed
        }
      }

      toast.success("File encrypted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Encryption failed");
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleDownload = () => {
    if (encryptedBlob && file) {
      downloadFile(encryptedBlob, `${file.name}.enc`);
      toast.success("Download started");
    }
  };

  const reset = () => {
    setFile(null);
    setPassword("");
    setEncryptedBlob(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Encrypt File</h1>
          <p className="text-muted-foreground">Secure your files locally using AES-256-GCM.</p>
        </div>
        <div className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20 flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3" /> Zero-Knowledge
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Content</CardTitle>
              <CardDescription>Select the file you want to protect.</CardDescription>
            </CardHeader>
            <CardContent>
              <Dropzone onFileSelect={setFile} selectedFile={file} />
            </CardContent>
          </Card>

          <AnimatePresence>
            {file && !encryptedBlob && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lock className="w-5 h-5 text-primary" />
                      Set Encryption Password
                    </CardTitle>
                    <CardDescription>This password is required to decrypt the file. Do not lose it.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      type="password"
                      placeholder="Enter a strong password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12"
                    />
                    <Button 
                      className="w-full h-12 text-lg" 
                      onClick={handleEncrypt}
                      disabled={!password || isEncrypting}
                    >
                      {isEncrypting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Encrypting...
                        </>
                      ) : (
                        "Encrypt Now"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {encryptedBlob && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 soft-shadow">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-emerald-900">Successfully Encrypted!</h2>
                    <p className="text-emerald-700 max-w-sm mx-auto">
                      Your file has been secured with AES-256-GCM. You can now safely download and share it.
                    </p>
                    <div className="flex gap-4 justify-center pt-4">
                      <Button onClick={handleDownload} className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700">
                        <Download className="mr-2 h-5 w-5" />
                        Download .enc File
                      </Button>
                      <Button variant="outline" onClick={reset} className="h-12 px-8 border-emerald-200 hover:bg-white text-emerald-700">
                        Encrypt Another
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="bg-slate-900 text-white border-none">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                Security Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-300 text-sm">
              <p>• <strong>Browser-Only:</strong> All crypto operations happen on your CPU. We never see your password.</p>
              <p>• <strong>Metadata Only:</strong> Our database only stores the filename and size for your records.</p>
              <p>• <strong>Password Strength:</strong> Use at least 8 characters with numbers and symbols for maximum security.</p>
              <div className="pt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs font-mono text-slate-500 uppercase mb-2">Technical Specs</p>
                <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                  <span>Algorithm</span>
                  <span className="text-emerald-400 text-right">AES-256-GCM</span>
                  <span>Derivation</span>
                  <span className="text-emerald-400 text-right">PBKDF2-SHA256</span>
                  <span>Iterations</span>
                  <span className="text-emerald-400 text-right">100,000</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Why encrypt?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>Storage providers like Drive or Dropbox can scan your files. Encryption ensures only YOU can read them.</p>
              <p>Portable Encryptor creates standard .enc files that work with our CLI tool too.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
