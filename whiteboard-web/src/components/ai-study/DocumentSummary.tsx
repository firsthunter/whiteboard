'use client';

import { UploadedDocument } from '@/types';
import { Sparkles } from 'lucide-react';

interface DocumentSummaryProps {
  document: UploadedDocument;
}

export function DocumentSummary({ document }: DocumentSummaryProps) {
  console.log('📄 DocumentSummary render:', {
    docId: document.id,
    hasStudyMaterial: !!document.studyMaterial,
    studyMaterial: document.studyMaterial
  });

  if (!document.studyMaterial) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <div className='animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Generating AI summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2 mb-4'>
        <div className='p-1.5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg'>
          <Sparkles className='h-4 w-4 text-primary' />
        </div>
        <h3 className='text-lg font-semibold'>AI-Generated Summary</h3>
      </div>

      <div className='prose prose-sm max-w-none'>
        <div className='p-6 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50'>
          <p className='text-foreground/90 leading-relaxed whitespace-pre-wrap'>
            {document.studyMaterial.summary}
          </p>
        </div>
      </div>
    </div>
  );
}
