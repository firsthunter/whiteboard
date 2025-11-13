'use client';

import { useMemo } from 'react';
import type { ModuleResource } from '@/actions/utils/types';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, PlayCircle } from 'lucide-react';

interface ResourceViewerProps {
  resource: ModuleResource;
}

// Extract YouTube video ID from various URL formats
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  // Handle different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
    }
  }

  // If already an embed URL, return as is
  if (url.includes('youtube.com/embed/')) {
    return url;
  }

  return null;
}

export function ResourceViewer({ resource }: ResourceViewerProps) {
  const videoEmbedUrl = useMemo(() => {
    if (resource.type === 'VIDEO') {
      const url = resource.url || resource.content || '';
      return getYouTubeEmbedUrl(url);
    }
    return null;
  }, [resource]);

  return (
    <div className="space-y-4">
      {/* VIDEO TYPE */}
      {resource.type === 'VIDEO' && (
        <div>
          {videoEmbedUrl ? (
            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
              <iframe
                className="w-full h-full"
                src={videoEmbedUrl}
                title={resource.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
              <div className="text-center p-6">
                <PlayCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground font-medium mb-2">Invalid Video URL</p>
                <p className="text-sm text-muted-foreground">
                  Please provide a valid YouTube URL
                </p>
                {(resource.url || resource.content) && (
                  <p className="text-xs text-muted-foreground/70 mt-2 break-all">
                    URL: {resource.url || resource.content}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* DOCUMENT TYPE */}
      {resource.type === 'DOCUMENT' && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-8 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-lg mb-2">{resource.title}</h3>
            {resource.description && (
              <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
            )}
            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <a
                href={resource.url || resource.content || '#'}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Document
              </a>
            </Button>
          </div>
        </div>
      )}

      {/* READING TYPE */}
      {resource.type === 'READING' && (
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="p-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed text-foreground">
                {resource.content || 'No reading content available.'}
              </div>
            </div>
            {resource.url && (
              <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                >
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Additional Resources
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LINK TYPE */}
      {resource.type === 'LINK' && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-8 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="text-center">
            <ExternalLink className="h-16 w-16 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-lg mb-2">External Resource</h3>
            {resource.description && (
              <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
            )}
            <div className="bg-white dark:bg-gray-900 px-4 py-2 rounded-lg border mb-4 break-all text-sm">
              {resource.url || resource.content}
            </div>
            <Button
              asChild
              size="lg"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <a
                href={resource.url || resource.content || '#'}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Link
              </a>
            </Button>
          </div>
        </div>
      )}

      {/* QUIZ TYPE */}
      {resource.type === 'QUIZ' && (
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <span className="text-2xl">❓</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-orange-900 dark:text-orange-100 mb-1">
                  Quiz
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Test your knowledge
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap">
                  {resource.content || 'Quiz questions will appear here.'}
                </div>
              </div>
              {resource.url && (
                <div className="mt-4">
                  <Button
                    asChild
                    variant="outline"
                  >
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Take Quiz
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
