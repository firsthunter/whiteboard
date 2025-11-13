'use client';

import { chatWithDocument } from '@/actions/gemini';
import { ChatMessage, UploadedDocument } from '@/types';
import { MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CAGChatProps {
  document: UploadedDocument;
}

export function CAGChat({ document }: CAGChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      parts: [{ text: input.trim() }]
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithDocument(
        input.trim(),
        document.pdfBase64,
        messages
      );

      const assistantMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: response }]
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center gap-2'>
        <div className='p-1.5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg'>
          <MessageCircle className='h-4 w-4 text-primary' />
        </div>
        <h3 className='text-lg font-semibold'>AI Chat Assistant</h3>
      </div>

      {/* Chat Container */}
      <div className='rounded-xl border border-border/50 bg-gradient-to-br from-muted/30 to-muted/10 overflow-hidden'>
        {/* Chat Messages */}
        <div className='min-h-[400px] max-h-[600px] overflow-y-auto p-6 space-y-4'>
          {messages.length === 0 ? (
            <div className='text-center py-16'>
              <div className='mb-4 inline-flex p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl'>
                <MessageCircle className='h-12 w-12 text-primary' />
              </div>
              <p className='text-lg font-medium mb-2'>Ask me anything!</p>
              <p className='text-sm text-muted-foreground'>I&apos;ll answer based on the document content</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-tr-sm'
                      : 'bg-card border border-border/50 rounded-tl-sm'
                  }`}
                >
                  <p className='text-sm leading-relaxed whitespace-pre-wrap'>{msg.parts[0].text}</p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className='flex justify-start'>
              <div className='bg-card border border-border/50 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm'>
                <div className='flex items-center gap-2'>
                  <div className='animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full'></div>
                  <span className='text-sm text-muted-foreground'>Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className='flex gap-3 p-4 border-t border-border/50 bg-background/50'>
          <input
            type='text'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='Ask a question about this document...'
            className='flex-1 px-4 py-3 border border-border/50 rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all'
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className='px-5 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg'
            aria-label='Send message'
            title='Send message'
          >
            <Send className='h-5 w-5' />
          </button>
        </div>
      </div>
    </div>
  );
}
