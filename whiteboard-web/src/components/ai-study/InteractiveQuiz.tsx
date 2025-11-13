'use client';

import { UploadedDocument } from '@/types';
import { CheckCircle, RotateCcw, Target, Trophy, XCircle } from 'lucide-react';
import { useState } from 'react';

interface InteractiveQuizProps {
  document: UploadedDocument;
}

export function InteractiveQuiz({ document }: InteractiveQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

  if (!document.studyMaterial) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <div className='animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Generating quiz questions...</p>
        </div>
      </div>
    );
  }

  const quiz = document.studyMaterial.quiz;

  if (!quiz || quiz.length === 0) {
    return (
      <div className='text-center py-12'>
        <Target className='h-12 w-12 text-muted-foreground/50 mx-auto mb-3' />
        <p className='text-muted-foreground'>No quiz questions available</p>
      </div>
    );
  }

  const question = quiz[currentQuestion];

  const handleAnswerSelect = (index: number) => {
    if (answeredQuestions.has(currentQuestion)) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    setAnsweredQuestions(prev => new Set([...prev, currentQuestion]));
    
    if (selectedAnswer === question.correctAnswerIndex) {
      setScore(score + 1);
    }
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnsweredQuestions(new Set());
  };

  const isQuizComplete = answeredQuestions.size === quiz.length;
  const percentage = Math.round((score / quiz.length) * 100);

  return (
    <div className='space-y-6'>
      {/* Header with Score */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='p-1.5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg'>
            <Target className='h-4 w-4 text-primary' />
          </div>
          <h3 className='text-lg font-semibold'>Interactive Quiz</h3>
        </div>
        <div className='px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20'>
          <span className='text-sm font-semibold text-primary'>
            {score}/{quiz.length}
          </span>
        </div>
      </div>

      {isQuizComplete ? (
        <div className='text-center py-12'>
          <div className='mb-6 inline-flex p-4 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-2xl'>
            <Trophy className='h-16 w-16 text-green-500' />
          </div>
          <h4 className='text-2xl font-bold mb-2'>Quiz Complete!</h4>
          <p className='text-lg mb-2'>
            Your score: <span className='font-bold text-primary'>{score}/{quiz.length}</span>
          </p>
          <div className='mb-6'>
            <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-primary/10'>
              <span className='text-2xl font-bold text-primary'>{percentage}%</span>
            </div>
          </div>
          <button
            onClick={resetQuiz}
            className='inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg hover:opacity-90 transition-all shadow-lg'
          >
            <RotateCcw className='h-4 w-4' />
            Retake Quiz
          </button>
        </div>
      ) : (
        <div className='space-y-6'>
          {/* Progress Bar */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>
                Question {currentQuestion + 1} of {quiz.length}
              </span>
              <span className='font-medium text-primary'>
                {answeredQuestions.size} answered
              </span>
            </div>
            <div className='h-2 bg-muted rounded-full overflow-hidden'>
              <div 
                className='h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300'
                style={{ width: `${(answeredQuestions.size / quiz.length) * 100}%` } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Question */}
          <div className='p-6 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50'>
            <h4 className='text-lg font-semibold mb-6'>{question.question}</h4>

            {/* Options */}
            <div className='space-y-3'>
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === question.correctAnswerIndex;
                const showCorrect = showResult && isCorrect;
                const showIncorrect = showResult && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={answeredQuestions.has(currentQuestion)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      showCorrect
                        ? 'border-green-500 bg-green-500/10'
                        : showIncorrect
                        ? 'border-red-500 bg-red-500/10'
                        : isSelected
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border/50 hover:border-primary/50 hover:bg-accent/50'
                    } ${answeredQuestions.has(currentQuestion) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className='flex items-center justify-between gap-3'>
                      <span className='flex-1'>{option}</span>
                      {showCorrect && (
                        <CheckCircle className='h-5 w-5 text-green-500 flex-shrink-0' />
                      )}
                      {showIncorrect && (
                        <XCircle className='h-5 w-5 text-red-500 flex-shrink-0' />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className='flex items-center justify-between gap-4'>
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className='px-5 py-2.5 border border-border/50 rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium'
            >
              ← Previous
            </button>

            <div className='flex gap-2'>
              {!showResult && selectedAnswer !== null && (
                <button
                  onClick={handleSubmit}
                  className='px-6 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg hover:opacity-90 transition-all shadow-lg font-medium'
                >
                  Submit Answer
                </button>
              )}

              {showResult && currentQuestion < quiz.length - 1 && (
                <button
                  onClick={handleNext}
                  className='px-6 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg hover:opacity-90 transition-all shadow-lg font-medium'
                >
                  Next Question →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
