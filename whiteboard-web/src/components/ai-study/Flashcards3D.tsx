'use client';

import { UploadedDocument } from '@/types';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface Flashcards3DProps {
  document: UploadedDocument;
}

export function Flashcards3D({ document }: Flashcards3DProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!document.studyMaterial) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <div className='animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Generating flashcards...</p>
        </div>
      </div>
    );
  }

  const flashcards = document.studyMaterial.flashcards;

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className='text-center py-12'>
        <Sparkles className='h-12 w-12 text-muted-foreground/50 mx-auto mb-3' />
        <p className='text-muted-foreground'>No flashcards available</p>
      </div>
    );
  }

  const card = flashcards[currentCard];

  const handleNext = () => {
    if (currentCard < flashcards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCard(currentCard + 1), 150);
    }
  };

  const handlePrevious = () => {
    if (currentCard > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCard(currentCard - 1), 150);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='p-1.5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg'>
            <Sparkles className='h-4 w-4 text-primary' />
          </div>
          <h3 className='text-lg font-semibold'>Flashcards</h3>
        </div>
        <div className='px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20'>
          <span className='text-sm font-semibold text-primary'>
            {currentCard + 1} / {flashcards.length}
          </span>
        </div>
      </div>

      {/* Flashcard */}
      <div className='perspective-1000'>
        <button
          onClick={handleFlip}
          className={`flashcard-preserve-3d relative h-80 w-full transition-transform duration-600 ${
            isFlipped ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
          }`}
            aria-label={isFlipped ? 'Show question' : 'Show answer'}
          >
            {/* Front */}
            <div className='absolute inset-0 flex items-center justify-center p-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 shadow-xl [backface-visibility:hidden]'>
              <div className='text-center max-w-md'>
                <div className='text-xs uppercase tracking-wider text-primary font-semibold mb-3'>Term</div>
                <p className='text-2xl font-bold mb-6'>{card.front}</p>
                <p className='text-sm text-muted-foreground'>Click or tap to reveal answer</p>
              </div>
            </div>

            {/* Back */}
            <div className='absolute inset-0 flex items-center justify-center p-10 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border-2 border-green-500/30 shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]'>
              <div className='text-center max-w-md'>
                <div className='text-xs uppercase tracking-wider text-green-600 font-semibold mb-3'>Definition</div>
                <p className='text-xl mb-6'>{card.back}</p>
                <p className='text-sm text-muted-foreground'>Click or tap to go back</p>
              </div>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <div className='flex items-center justify-between gap-4'>
          <button
            onClick={handlePrevious}
            disabled={currentCard === 0}
            className='flex items-center gap-2 px-5 py-2.5 border border-border/50 rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium'
          >
            <ChevronLeft className='h-4 w-4' />
            Previous
          </button>

          <div className='flex gap-1'>
            {flashcards.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsFlipped(false);
                  setTimeout(() => setCurrentCard(index), 150);
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentCard ? 'w-8 bg-primary' : 'w-2 bg-muted'
                }`}
                aria-label={`Go to flashcard ${index + 1}`}
                title={`Flashcard ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentCard === flashcards.length - 1}
            className='flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            Next
            <ChevronRight className='h-4 w-4' />
          </button>
        </div>
      </div> 
  );
}
