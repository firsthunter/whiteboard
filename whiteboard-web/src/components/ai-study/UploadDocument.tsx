'use client';

import { geminiService } from '@/lib/services/geminiService';
import { fileToBase64, isValidPDF } from '@/lib/utils/fileUtils';
import { StudyMaterial, UploadedDocument } from '@/types';
import { Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface UploadDocumentProps {
  onUploadComplete: (doc: UploadedDocument) => void;
  onDocumentProcessed: (docId: string, studyMaterial: StudyMaterial) => void;
}

export function UploadDocument({ onUploadComplete, onDocumentProcessed }: UploadDocumentProps) {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidPDF(file)) {
      toast.error('Please upload a PDF file');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title for the document');
      return;
    }

    try {
      setUploading(true);
      const loadingToast = toast.loading('Uploading document...');
      
      const pdfBase64 = await fileToBase64(file);
      
      const doc: UploadedDocument = {
        id: `doc-${Date.now()}`,
        title: title.trim(),
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date(),
        pdfBase64,
      };

      onUploadComplete(doc);
      
      toast.dismiss(loadingToast);
      toast.loading('Analyzing document with AI...', { id: 'analyzing' });
      
      processDocument(doc);
      
      setTitle('');
      setFileInputKey(prev => prev + 1);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const processDocument = async (doc: UploadedDocument) => {
    try {
      const studyMaterial = await geminiService.analyzeDocument(doc.pdfBase64);
      
      toast.dismiss('analyzing');
      toast.success('Document processed successfully!');
      
      onDocumentProcessed(doc.id, studyMaterial);
    } catch (error) {
      console.error('Processing error:', error);
      toast.dismiss('analyzing');
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to process document. Please try again.';
      toast.error(errorMessage, {
        duration: 8000, // Show longer for rate limit messages
      });
    }
  };

  return (
    <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-1.5 bg-primary/10 rounded-lg">
          <Upload className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-lg font-semibold">Upload Document</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2 text-muted-foreground">
            Document Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Chapter 5: Quantum Mechanics"
            className="w-full px-4 py-2.5 border border-border/50 rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            disabled={uploading}
          />
        </div>

        <div>
          <label htmlFor="file" className="block text-sm font-medium mb-2 text-muted-foreground">
            PDF File
          </label>
          <div className="relative">
            <input
              key={fileInputKey}
              type="file"
              id="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="w-full px-4 py-2.5 border border-border/50 rounded-lg bg-background/50 
                file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 
                file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground 
                hover:file:bg-primary/90 file:transition-colors
                focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all
                cursor-pointer"
              disabled={uploading}
            />
          </div>
        </div>

        {uploading && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Processing your document...</p>
              <p className="text-xs text-muted-foreground">This may take a few moments</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
