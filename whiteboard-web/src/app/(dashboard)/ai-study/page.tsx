'use client';

import { analyzeDocument } from '@/actions/gemini';
import { CAGChat } from '@/components/ai-study/CAGChat';
import { fileToBase64, isValidPDF } from '@/lib/utils/fileUtils';
import { StudyMaterial, UploadedDocument } from '@/types';
import {
    BookOpen,
    Brain,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    FileText,
    MessageCircle,
    RotateCcw,
    Sparkles,
    Target,
    Trophy,
    Upload,
    XCircle,
    Zap
} from 'lucide-react';
import { useState } from 'react';

export default function AIStudyTestPage() {
  const [uploading, setUploading] = useState(false);
  const [studyMaterial, setStudyMaterial] = useState<StudyMaterial | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'quiz' | 'flashcards' | 'chat'>('summary');
  const [fileName, setFileName] = useState<string>('');
  const [uploadedDocument, setUploadedDocument] = useState<UploadedDocument | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidPDF(file)) {
      setError('Please upload a PDF file');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setStudyMaterial(null);
      setFileName(file.name);
      
      console.log('🔄 Converting PDF to base64...');
      const pdfBase64 = await fileToBase64(file);
      
      console.log('🔄 Analyzing document...');
      const material = await analyzeDocument(pdfBase64);
      
      console.log('✅ Study material received:', material);
      setStudyMaterial(material);
      setUploadedDocument({
        id: crypto.randomUUID(),
        title: file.name.replace('.pdf', ''),
        fileName: file.name,
        fileSize: file.size,
        pdfBase64: pdfBase64,
        uploadedAt: new Date(),
        studyMaterial: material
      });
      setSelectedAnswers({});
      setCurrentQuizQuestion(0);
      setCurrentFlashcard(0);
      setIsFlashcardFlipped(false);
      setActiveTab('summary');
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process document');
    } finally {
      setUploading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleNextFlashcard = () => {
    if (studyMaterial?.flashcards && currentFlashcard < studyMaterial.flashcards.length - 1) {
      setIsFlashcardFlipped(false);
      setTimeout(() => setCurrentFlashcard(currentFlashcard + 1), 150);
    }
  };

  const handlePreviousFlashcard = () => {
    if (currentFlashcard > 0) {
      setIsFlashcardFlipped(false);
      setTimeout(() => setCurrentFlashcard(currentFlashcard - 1), 150);
    }
  };

  const calculateQuizScore = () => {
    if (!studyMaterial?.quiz) return { correct: 0, total: 0, percentage: 0 };
    const correct = studyMaterial.quiz.filter((q, idx) => selectedAnswers[idx] === q.correctAnswerIndex).length;
    const total = studyMaterial.quiz.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { correct, total, percentage };
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
  };

  const quizScore = calculateQuizScore();
  const allQuestionsAnswered = studyMaterial?.quiz && Object.keys(selectedAnswers).length === studyMaterial.quiz.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-primary to-primary/70 rounded-xl shadow-lg">
              <Brain className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                AI Study Companion
              </h1>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        {!studyMaterial ? (
          <div className="mb-8 p-12 border-2 border-dashed border-border/50 rounded-2xl bg-card/30 backdrop-blur-sm shadow-xl hover:border-primary/50 transition-all">
            <label className="flex flex-col items-center justify-center gap-6 cursor-pointer group">
              <div className="p-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl group-hover:scale-110 transition-transform shadow-lg">
                <Upload className="h-16 w-16 text-primary" />
              </div>
              <div className="text-center">
                <span className="text-xl font-bold block mb-2">Upload Your PDF</span>
                <p className="text-sm text-muted-foreground max-w-md">
                  Drop your study material here or click to browse. Get instant AI-generated summaries, quizzes, and flashcards.
                </p>
              </div>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            {uploading && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-full border border-primary/20">
                  <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                  <span className="text-sm font-medium text-primary">Analyzing with AI...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">{fileName}</p>
                  <p className="text-xs text-muted-foreground">Successfully processed</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setStudyMaterial(null);
                  setFileName('');
                  setSelectedAnswers({});
                }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border/50 rounded-lg hover:bg-accent transition-all"
              >
                Upload New
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 border border-red-500/50 bg-red-500/10 rounded-lg">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        )}

        {/* Study Material Display */}
        {studyMaterial && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">1</p>
                    <p className="text-xs text-muted-foreground">Summary</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Target className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{studyMaterial.quiz?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Quiz Questions</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{studyMaterial.flashcards?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Flashcards</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg overflow-hidden">
              <div className="flex border-b border-border/50 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all whitespace-nowrap ${
                    activeTab === 'summary'
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  Summary
                </button>
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all whitespace-nowrap ${
                    activeTab === 'quiz'
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <Target className="h-4 w-4" />
                  Quiz
                  {allQuestionsAnswered && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-green-500/20 text-green-600 rounded-full">
                      {quizScore.correct}/{quizScore.total}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('flashcards')}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all whitespace-nowrap ${
                    activeTab === 'flashcards'
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  Flashcards
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all whitespace-nowrap ${
                    activeTab === 'chat'
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <MessageCircle className="h-4 w-4" />
                  AI Chat
                </button>
              </div>
              {/* Tab Content */}
              <div className="p-6 min-h-[500px]">
              {/* Summary Tab */}
              {activeTab === 'summary' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">AI-Generated Summary</h2>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="p-8 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 shadow-inner">
                      <p className="text-base text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {studyMaterial.summary}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quiz Tab */}
              {activeTab === 'quiz' && studyMaterial.quiz && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Quiz Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold">Interactive Quiz</h2>
                    </div>
                    {Object.keys(selectedAnswers).length > 0 && (
                      <button
                        onClick={resetQuiz}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border/50 rounded-lg hover:bg-accent transition-all"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset Quiz
                      </button>
                    )}
                  </div>

                  {/* Quiz Completion Message */}
                  {allQuestionsAnswered && (
                    <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border border-green-500/20 shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-full">
                          <Trophy className="h-8 w-8 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-1">Quiz Complete!</h3>
                          <p className="text-sm text-muted-foreground">
                            You scored <span className="font-bold text-green-600">{quizScore.correct}</span> out of{' '}
                            <span className="font-bold">{quizScore.total}</span> ({quizScore.percentage}%)
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-green-600">{quizScore.percentage}%</div>
                          <div className="text-xs text-muted-foreground">Score</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Quiz Questions */}
                  {studyMaterial.quiz.map((q, idx) => (
                    <div key={q.id} className="p-6 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 shadow-md hover:shadow-lg transition-shadow">
                      <p className="font-bold text-lg mb-4 flex items-start gap-3">
                        <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm">
                          {idx + 1}
                        </span>
                        <span className="flex-1">{q.question}</span>
                      </p>
                      <div className="space-y-3">
                        {q.options.map((option, optIdx) => {
                          const isSelected = selectedAnswers[idx] === optIdx;
                          const isCorrect = optIdx === q.correctAnswerIndex;
                          const showResult = selectedAnswers[idx] !== undefined;
                          
                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleAnswerSelect(idx, optIdx)}
                              disabled={showResult}
                              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                showResult && isCorrect
                                  ? 'border-green-500 bg-green-500/10 shadow-sm'
                                  : showResult && isSelected && !isCorrect
                                  ? 'border-red-500 bg-red-500/10'
                                  : isSelected
                                  ? 'border-primary bg-primary/10 shadow-md scale-[1.02]'
                                  : 'border-border/50 hover:border-primary/50 hover:bg-accent/50 hover:scale-[1.01]'
                              } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="flex-1">{option}</span>
                                {showResult && isCorrect && (
                                  <div className="flex items-center gap-2 text-green-500 font-semibold text-sm">
                                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                                    Correct
                                  </div>
                                )}
                                {showResult && isSelected && !isCorrect && (
                                  <div className="flex items-center gap-2 text-red-500 font-semibold text-sm">
                                    <XCircle className="h-5 w-5 flex-shrink-0" />
                                    Wrong
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Flashcards Tab */}
              {activeTab === 'flashcards' && studyMaterial.flashcards && studyMaterial.flashcards.length > 0 && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  {/* Flashcards Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold">Study Flashcards</h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20 shadow-sm">
                        <span className="text-sm font-bold text-primary">
                          {currentFlashcard + 1} / {studyMaterial.flashcards.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
                        style={{ width: `${((currentFlashcard + 1) / studyMaterial.flashcards.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Flashcard */}
                  <div className="perspective-1000">
                    <button
                      onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                      className={`flashcard-preserve-3d relative h-96 w-full transition-transform duration-600 ${
                        isFlashcardFlipped ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
                      }`}
                      aria-label={isFlashcardFlipped ? 'Show question' : 'Show answer'}
                    >
                      {/* Front */}
                      <div className='absolute inset-0 flex items-center justify-center p-12 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 shadow-2xl [backface-visibility:hidden] hover:shadow-3xl transition-shadow'>
                        <div className='text-center max-w-lg'>
                          <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 mb-4'>
                            <Zap className='h-3 w-3 text-primary' />
                            <span className='text-xs uppercase tracking-wider text-primary font-bold'>Term</span>
                          </div>
                          <p className='text-3xl font-bold mb-8 leading-tight'>{studyMaterial.flashcards[currentFlashcard].front}</p>
                          <p className='text-sm text-muted-foreground flex items-center justify-center gap-2'>
                            <Sparkles className='h-4 w-4' />
                            Click or tap to reveal definition
                          </p>
                        </div>
                      </div>

                      {/* Back */}
                      <div className='absolute inset-0 flex items-center justify-center p-12 rounded-2xl bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-2 border-green-500/30 shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] hover:shadow-3xl transition-shadow'>
                        <div className='text-center max-w-lg'>
                          <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 mb-4'>
                            <CheckCircle className='h-3 w-3 text-green-600' />
                            <span className='text-xs uppercase tracking-wider text-green-600 font-bold'>Definition</span>
                          </div>
                          <p className='text-2xl mb-8 leading-relaxed'>{studyMaterial.flashcards[currentFlashcard].back}</p>
                          <p className='text-sm text-muted-foreground flex items-center justify-center gap-2'>
                            <RotateCcw className='h-4 w-4' />
                            Click to flip back
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Navigation */}
                  <div className='flex items-center justify-between gap-4'>
                    <button
                      onClick={handlePreviousFlashcard}
                      disabled={currentFlashcard === 0}
                      className='flex items-center gap-2 px-6 py-3 border-2 border-border/50 rounded-xl hover:bg-accent hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium shadow-sm hover:shadow-md'
                    >
                      <ChevronLeft className='h-5 w-5' />
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    <div className='flex gap-2'>
                      {studyMaterial.flashcards.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setIsFlashcardFlipped(false);
                            setTimeout(() => setCurrentFlashcard(index), 150);
                          }}
                          className={`h-2.5 rounded-full transition-all ${
                            index === currentFlashcard 
                              ? 'w-10 bg-primary shadow-md shadow-primary/50' 
                              : 'w-2.5 bg-muted hover:bg-muted-foreground/30'
                          }`}
                          aria-label={`Go to flashcard ${index + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleNextFlashcard}
                      disabled={currentFlashcard === studyMaterial.flashcards.length - 1}
                      className='flex items-center gap-2 px-6 py-3 border-2 border-border/50 rounded-xl hover:bg-accent hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium shadow-sm hover:shadow-md'
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className='h-5 w-5' />
                    </button>
                  </div>

                  {/* Keyboard Hints */}
                  <div className="text-center text-xs text-muted-foreground space-y-1">
                    <p>💡 Tip: Use arrow keys to navigate • Space to flip</p>
                  </div>
                </div>
              )}

              {/* Chat Tab */}
              {activeTab === 'chat' && uploadedDocument && (
                <div className="animate-in fade-in duration-300">
                  <CAGChat document={uploadedDocument} />
                </div>
              )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
