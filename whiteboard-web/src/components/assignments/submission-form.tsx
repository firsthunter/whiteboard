'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { submitAssignment } from '@/actions/assignments';
import { AlertCircle, Send, FileUp, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { MarkdownEditor } from '@/components/markdown-editor';

interface SubmissionFormProps {
  assignmentId: string;
  isOverdue: boolean;
  maxFileSize?: number; // in MB
  onSubmissionSuccess?: () => void;
  onSubmissionError?: () => void;
}

export function SubmissionForm({ 
  assignmentId, 
  isOverdue, 
  maxFileSize = 10,
  onSubmissionSuccess,
  onSubmissionError 
}: SubmissionFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Validate file size
    for (const file of selectedFiles) {
      if (file.size > maxFileSize * 1024 * 1024) {
        setError(`File "${file.name}" exceeds ${maxFileSize}MB limit`);
        return;
      }
    }

    setFiles((prev) => [...prev, ...selectedFiles]);
    setError('');
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && files.length === 0) {
      setError('Please provide either content or upload files');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // For now, we'll submit with content only
      // In a real app, you'd handle file uploads separately
      const result = await submitAssignment(assignmentId, { 
        content,
        attachments: {
          files: files.map(f => f.name),
          count: files.length
        }
      });

      if (result.success) {
        // Show submitted state briefly
        setIsSubmitted(true);
        
        toast.success('Assignment submitted successfully!', {
          description: 'Your submission has been recorded and is now available for grading.'
        });
        
        // Trigger optimistic update callback immediately
        onSubmissionSuccess?.();
        
        // Clear form after a brief delay (don't redirect - stay on the assignment page)
        setTimeout(() => {
          setContent('');
          setFiles([]);
        }, 500);
      } else {
        setError(result.error?.message || 'Failed to submit assignment');
        toast.error(result.error?.message || 'Failed to submit assignment');
        
        // Trigger error callback to rollback optimistic update
        onSubmissionError?.();
      }
    } catch {
      setError('Failed to submit assignment');
      toast.error('Failed to submit assignment');
      
      // Trigger error callback to rollback optimistic update
      onSubmissionError?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isOverdue) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium text-amber-900 dark:text-amber-100">Assignment Overdue</p>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              This assignment is past the due date. You can still submit, but it may be marked as late.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="Write your assignment submission in markdown format..."
              minHeight={200}
              maxHeight={500}
              disabled={isSubmitting}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || isSubmitted} 
            className={`w-full ${isSubmitted ? 'bg-green-600 hover:bg-green-600' : ''}`}
          >
            {isSubmitted ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Submitted ✓
              </>
            ) : isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Submitting Late...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Late Submission
              </>
            )}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <MarkdownEditor
          value={content}
          onChange={setContent}
          placeholder="Write your assignment submission in markdown format..."
          minHeight={250}
          maxHeight={600}
          disabled={isSubmitting}
        />
      </div>

      {/* File Upload Section */}
      <div className="space-y-2">
        <Label>Attachments (Optional)</Label>
        <div className="border-2 border-dashed rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={isSubmitting}
          />
          <div className="flex flex-col items-center gap-2 text-center">
            <FileUp className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Click to upload files</p>
            <p className="text-xs text-muted-foreground">
              Max {maxFileSize}MB per file
            </p>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2 mt-3">
            <p className="text-sm font-medium">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </p>
            <div className="space-y-1">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm"
                >
                  <span className="truncate">{file.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)}KB
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting || isSubmitted} 
        className={`w-full ${isSubmitted ? 'bg-green-600 hover:bg-green-600' : ''}`}
      >
        {isSubmitted ? (
          <>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Submitted ✓
          </>
        ) : isSubmitting ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Submit Assignment
          </>
        )}
      </Button>
    </form>
  );
}
