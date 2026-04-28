"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dropzone } from "@/components/ui/Dropzone";
import { 
  ShieldCheck, 
  Unlock, 
  Download, 
  Loader2, 
  AlertCircle, 
  RefreshCcw,
  Sparkles,
  Copy,
  Check,
  BrainCircuit
} from "lucide-react";
import { decryptFile, downloadFile } from "@/lib/crypto";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function DecryptPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedData, setDecryptedData] = useState<Uint8Array | null>(null);
  
  // AI Summary States
  const [showSummaryOption, setShowSummaryOption] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDecrypt = async () => {
    if (!file || !password) return;
    
    setIsDecrypting(true);
    try {
      const decrypted = await decryptFile(file, password);
      setDecryptedData(decrypted);
      toast.success("File decrypted successfully!");
      setShowSummaryOption(true);
    } catch (err: any) {
      toast.error(err.message || "Decryption failed. Check your password.");
    } finally {
      setIsDecrypting(false);
    }
  };

  const getMimeType = (fileName: string) => {
    const name = fileName.toLowerCase();
    if (name.includes('.pdf')) return 'application/pdf';
    if (name.includes('.jpg') || name.includes('.jpeg')) return 'image/jpeg';
    if (name.includes('.png')) return 'image/png';
    if (name.includes('.webp')) return 'image/webp';
    if (name.includes('.txt') || name.includes('.md')) return 'text/plain';
    return 'application/octet-stream';
  };

  const uint8ArrayToBase64 = (bytes: Uint8Array): Promise<string> => {
    return new Promise((resolve) => {
      const blob = new Blob([bytes]);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:mime/type;base64,
      };
      reader.readAsDataURL(blob);
    });
  };

  const handleSummarize = async () => {
    if (!decryptedData || !file) return;
    
    setIsSummarizing(true);
    setShowSummaryOption(false);
    
    try {
      const mimeType = getMimeType(file.name);
      
      // Efficiently get Base64
      const base64Data = await uint8ArrayToBase64(decryptedData);
      
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          base64Data, 
          mimeType, 
          fileName: file.name.replace('.enc', '') 
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setSummary(data.summary);
      toast.success("AI Analysis Complete");
    } catch (err: any) {
      console.error(err);
      toast.error("AI Analysis failed: " + err.message);
      setSummary("Could not analyze file content. This might be due to an unsupported file format or API limitations.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleDownload = () => {
    if (decryptedData && file) {
      const originalName = file.name.endsWith('.enc') 
        ? file.name.slice(0, -4) 
        : `decrypted_${file.name}`;
      downloadFile(decryptedData, originalName);
      toast.success("Download started");
      setShowSummaryOption(false);
    }
  };

  const copyToClipboard = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied!");
    }
  };

  const reset = () => {
    setFile(null);
    setPassword("");
    setDecryptedData(null);
    setSummary(null);
    setShowSummaryOption(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Decrypt File</h1>
        <p className="text-muted-foreground">Restore and analyze your secure files.</p>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Encrypted File</CardTitle>
              <CardDescription>Select the .enc file you want to decrypt.</CardDescription>
            </CardHeader>
            <CardContent>
              <Dropzone onFileSelect={setFile} selectedFile={file} />
            </CardContent>
          </Card>

          <AnimatePresence mode="wait">
            {file && !decryptedData && (
              <motion.div
                key="key-input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="border-primary/20 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Unlock className="w-5 h-5 text-primary" />
                      Security Key
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      type="password"
                      placeholder="Enter decryption password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12"
                    />
                    <Button 
                      className="w-full h-12 text-lg premium-gradient border-none" 
                      onClick={handleDecrypt}
                      disabled={!password || isDecrypting}
                    >
                      {isDecrypting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Decrypt Now"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {decryptedData && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="bg-primary/5 border-primary/20 overflow-hidden">
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 soft-shadow">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Decryption Successful</h2>
                    
                    {showSummaryOption && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-2xl border border-primary/20 soft-shadow mt-6 text-left"
                      >
                        <div className="flex items-center gap-2 mb-2 text-primary font-bold">
                          <Sparkles className="w-5 h-5" />
                          Multi-modal AI Analysis
                        </div>
                        <p className="text-sm text-slate-600 mb-4">
                          Our AI can now "read" your PDF or "see" your image to provide a real content summary.
                        </p>
                        <div className="flex gap-3">
                          <Button onClick={handleSummarize} className="flex-1 premium-gradient border-none">
                            Analyze Content
                          </Button>
                          <Button variant="outline" onClick={() => setShowSummaryOption(false)} className="flex-1">
                            Just Download
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {isSummarizing && (
                      <div className="py-8 flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-sm font-medium text-primary tracking-wide">AI is reading the file content...</p>
                      </div>
                    )}

                    {(!showSummaryOption && !summary && !isSummarizing) && (
                      <div className="flex gap-4 justify-center pt-4">
                        <Button onClick={handleDownload} className="h-12 px-8 premium-gradient border-none">
                          <Download className="mr-2 h-5 w-5" />
                          Download Original
                        </Button>
                        <Button variant="outline" onClick={reset} className="h-12 px-8">
                          <RefreshCcw className="mr-2 h-5 w-5" />
                          Reset
                        </Button>
                      </div>
                    )}

                    {summary && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-left mt-8 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold flex items-center gap-2">
                            <BrainCircuit className="w-5 h-5 text-primary" />
                            AI Content Summary
                          </h3>
                          <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <Card className="bg-white border-primary/10 border-l-4 border-l-emerald-500">
                          <CardContent className="p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                            {summary}
                          </CardContent>
                        </Card>
                        <div className="flex gap-3 pt-2">
                          <Button onClick={handleDownload} className="flex-1 premium-gradient border-none">
                            <Download className="mr-2 h-4 w-4" />
                            Download File
                          </Button>
                          <Button onClick={reset} className="flex-1" variant="outline">
                            New Decryption
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="bg-indigo-50 border-indigo-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
                <BrainCircuit className="w-5 h-5 text-indigo-600" />
                Multi-modal AI
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-indigo-800 space-y-3">
              <p>Unlike basic systems, our AI analyzes the actual visual or document data within your secure files.</p>
            </CardContent>
          </Card>

          <Card className="soft-shadow border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Privacy Guarantee
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <p>Our <strong>Zero-Knowledge</strong> architecture ensures that even our AI analysis happens only on your decrypted data within this secure session.</p>
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Enterprise Grade Security
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
