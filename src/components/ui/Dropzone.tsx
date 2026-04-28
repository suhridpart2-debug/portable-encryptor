"use client";

import { useState, useCallback } from "react";
import { Upload, File, X, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropzoneProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export function Dropzone({ onFileSelect, selectedFile }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-3xl p-12 transition-all flex flex-col items-center justify-center text-center cursor-pointer group",
            isDragging 
              ? "border-primary bg-primary/5 scale-[1.01]" 
              : "border-slate-200 hover:border-primary/40 hover:bg-slate-50/50"
          )}
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          <input
            id="fileInput"
            type="file"
            className="hidden"
            onChange={handleFileInput}
          />
          <div className="bg-primary/10 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Drop your file here</h3>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Drag and drop or click to browse. Your file remains on your device.
          </p>
          <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            End-to-End Encrypted
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-2xl p-6 bg-slate-50/50 flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-xl border border-border shadow-sm">
              <File className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-slate-900">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || "Unknown type"}
              </p>
            </div>
          </div>
          <button 
            onClick={() => onFileSelect(null)}
            className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-destructive border border-transparent hover:border-destructive/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
