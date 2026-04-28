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
import * as pdfjs from "pdfjs-dist";

// Use a stable worker for visual rendering
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function DecryptPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedData, setDecryptedData] = useState<Uint8Array | null>(null);
  
  const [showSummaryOption, setShowSummaryOption] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [hasConsented, setHasConsented] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
  const [isChatting, setIsChatting] = useState(false);

  const handleDecrypt = async () => {
    if (!file || !password) return;
    setIsDecrypting(true);
    try {
      const decrypted = await decryptFile(file, password);
      setDecryptedData(decrypted);
      toast.success("File decrypted successfully!");
      setShowSummaryOption(true);
    } catch (err: any) {
      toast.error(err.message || "Decryption failed.");
    } finally {
      setIsDecrypting(false);
    }
  };

  const getMimeType = (fileName: string) => {
    const name = fileName.toLowerCase();
    if (name.includes('.pdf')) return 'application/pdf';
    if (name.includes('.jpg') || name.includes('.jpeg')) return 'image/jpeg';
    if (name.includes('.png')) return 'image/png';
    return 'application/octet-stream';
  };

  const uint8ArrayToBase64 = (bytes: Uint8Array): Promise<string> => {
    return new Promise((resolve) => {
      const blob = new Blob([bytes as any]);
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(blob);
    });
  };

  const getPDFSnapshot = async (data: Uint8Array): Promise<string> => {
    try {
      const loadingTask = pdfjs.getDocument({ data: data as any });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return "";
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Fix for Typescript error: add canvas to the render parameters
      await page.render({ 
        canvasContext: context, 
        viewport: viewport
      } as any).promise;
      
      return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    } catch (err) {
      console.error("PDF Snapshot Error:", err);
      return "";
    }
  };

  const handleSummarize = async () => {
    if (!decryptedData || !file) return;
    setIsSummarizing(true);
    setSummaryError(false);
    setShowSummaryOption(false);
    
    try {
      const mimeType = getMimeType(file.name);
      let base64Data = "";

      if (mimeType === 'application/pdf') {
        base64Data = await getPDFSnapshot(decryptedData);
        if (!base64Data) throw new Error("Could not capture PDF snapshot");
      } else {
        base64Data = await uint8ArrayToBase64(decryptedData);
      }
      
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          base64Data,
          mimeType: mimeType === 'application/pdf' ? 'image/jpeg' : mimeType,
          fileName: file.name.replace('.enc', '') 
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setSummary(data.summary);
      setChatHistory([{ role: 'assistant', content: data.summary }]);
      toast.success("AI Analysis Complete");
    } catch (err: any) {
      toast.error("AI Analysis failed: " + err.message);
      setSummaryError(true);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleChat = async () => {
    if (!chatMessage || !decryptedData || isChatting) return;
    setIsChatting(true);
    const newHistory = [...chatHistory, { role: 'user', content: chatMessage }];
    setChatHistory(newHistory);
    const currentMsg = chatMessage;
    setChatMessage("");

    try {
      const mimeType = getMimeType(file!.name);
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          history: newHistory,
          mimeType: mimeType === 'application/pdf' ? 'image/jpeg' : mimeType,
          fileName: file!.name.replace('.enc', '')
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setChatHistory([...newHistory, { role: 'assistant', content: data.summary }]);
      setSummary(data.summary);
    } catch (err: any) {
      toast.error("Chat failed: " + err.message);
    } finally {
      setIsChatting(false);
    }
  };

  const handleDownload = () => {
    if (decryptedData && file) {
      const originalName = file.name.endsWith('.enc') ? file.name.slice(0, -4) : `decrypted_${file.name}`;
      downloadFile(decryptedData, originalName);
      toast.success("Download started");
      setShowSummaryOption(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPassword("");
    setDecryptedData(null);
    setSummary(null);
    setSummaryError(false);
    setShowSummaryOption(false);
    setHasConsented(false);
    setChatHistory([]);
    setChatMessage("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Decrypt File</h1>
        <p className="text-muted-foreground">Restore and analyze your secure files.</p>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-6">
          <Card className="border-none soft-shadow">
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="border-primary/20 shadow-sm overflow-hidden">
                  <CardHeader className="bg-primary/5 border-b border-primary/10">
                    <CardTitle className="text-lg flex items-center gap-2 text-primary">
                      <Unlock className="w-5 h-5" />
                      Security Key
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <Input
                      type="password"
                      placeholder="Enter decryption password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 text-lg focus-visible:ring-primary"
                    />
                    <Button 
                      className="w-full h-12 text-lg premium-gradient border-none hover:opacity-90 transition-opacity" 
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="bg-white border-emerald-100 shadow-xl overflow-hidden">
                  <CardContent className="p-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto soft-shadow pulse-animation">
                      <ShieldCheck className="w-10 h-10" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Decryption Successful</h2>
                      <p className="text-slate-500">Your file has been restored securely.</p>
                    </div>
                    
                    {showSummaryOption && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-left"
                      >
                        <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold">
                          <Sparkles className="w-5 h-5" />
                          Visual AI Analysis
                        </div>
                        <p className="text-sm text-indigo-800 mb-6 leading-relaxed">
                          Our Vision AI can now "see" your file's content (even scanned PDFs) to provide a real analysis.
                        </p>
                        <div className="flex gap-3">
                          <Button onClick={() => setHasConsented(true)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white border-none h-11">
                            Analyze Content
                          </Button>
                          <Button variant="outline" onClick={() => { setShowSummaryOption(false); setHasConsented(false); }} className="flex-1 h-11 border-indigo-200 text-indigo-700">
                            Skip & Download
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {hasConsented && !summary && !isSummarizing && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-amber-50 p-6 rounded-2xl border border-amber-200 text-left"
                      >
                        <div className="flex items-center gap-2 mb-3 text-amber-700 font-bold">
                          <AlertCircle className="w-5 h-5" />
                          Privacy Hand-off
                        </div>
                        <p className="text-sm text-amber-800 mb-6 leading-relaxed">
                          Consent required to securely process the decrypted snapshot with our AI. No data is stored permanently.
                        </p>
                        <div className="flex gap-3">
                          <Button onClick={handleSummarize} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white border-none h-11">
                            I Consent, Proceed
                          </Button>
                          <Button variant="outline" onClick={() => { setHasConsented(false); setShowSummaryOption(false); }} className="flex-1 h-11 border-amber-200 text-amber-700">
                            Reject
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {isSummarizing && (
                      <div className="py-12 flex flex-col items-center gap-4">
                        <div className="relative">
                          <Loader2 className="w-12 h-12 animate-spin text-primary" />
                          <Sparkles className="w-5 h-5 text-indigo-500 absolute -top-1 -right-1 animate-pulse" />
                        </div>
                        <p className="text-sm font-medium text-slate-600 tracking-wide animate-pulse">AI is visually analyzing the content...</p>
                      </div>
                    )}

                    {(!showSummaryOption && !summary && !isSummarizing) && (
                      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Button onClick={handleDownload} className="h-12 px-8 premium-gradient border-none">
                          <Download className="mr-2 h-5 w-5" />
                          Download Original
                        </Button>
                        <Button variant="outline" onClick={reset} className="h-12 px-8 border-slate-200">
                          <RefreshCcw className="mr-2 h-5 w-5" />
                          Reset Page
                        </Button>
                      </div>
                    )}

                    {summary && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-left mt-8 space-y-6"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <BrainCircuit className="w-5 h-5 text-indigo-600" />
                            Visual Content Analysis
                          </h3>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => {
                              navigator.clipboard.writeText(summary);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                              toast.success("Copied!");
                            }}>
                              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                            {summary}
                          </p>
                        </div>

                        <div className="space-y-4 pt-2">
                          <div className="relative group">
                            <Input 
                              placeholder="Ask anything about the file..."
                              value={chatMessage}
                              onChange={(e) => setChatMessage(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                              className="pr-14 h-14 bg-white border-slate-200 rounded-2xl shadow-sm focus-visible:ring-indigo-500 text-lg"
                              disabled={isChatting}
                            />
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="absolute right-2 top-2 h-10 w-10 text-indigo-600 hover:bg-indigo-50 rounded-xl"
                              onClick={handleChat}
                              disabled={isChatting || !chatMessage}
                            >
                              {isChatting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Unlock className="w-5 h-5" />}
                            </Button>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button onClick={handleDownload} className="flex-1 h-12 premium-gradient border-none text-lg">
                            <Download className="mr-2 h-5 w-5" />
                            Download
                          </Button>
                          <Button onClick={reset} variant="outline" className="flex-1 h-12 text-lg border-slate-200">
                            Reset
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
          <Card className="bg-indigo-600 text-white border-none shadow-lg overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Visual AI Technology
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-indigo-100 space-y-4">
              <p>Our system uses <strong>Computer Vision</strong> to analyze the visual representation of your documents. This ensures we can read:</p>
              <ul className="space-y-2 list-disc list-inside">
                <li>Scanned paper documents</li>
                <li>Handwritten notes</li>
                <li>Complex data tables</li>
                <li>Image-heavy slides</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-none soft-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Zero-Knowledge Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 space-y-4">
              <p>Everything stays encrypted until you provide the key. AI analysis only happens <strong>after</strong> local decryption and <strong>with</strong> your explicit consent.</p>
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                <ShieldCheck className="w-3 h-3" />
                AES-256 SECURED
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
