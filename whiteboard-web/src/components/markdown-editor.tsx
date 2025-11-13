"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

// Dynamic import to avoid SSR issues with the markdown editor
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  disabled?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your content here in markdown...",
  minHeight = 200,
  maxHeight = 600,
  disabled = false,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Content</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "write" | "preview")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="write" className="mt-4">
            <div className="border rounded-md overflow-hidden" data-color-mode="light">
              <MDEditor
                value={value}
                onChange={(val) => onChange(val || "")}
                preview="edit"
                hideToolbar={false}
                height={minHeight}
                maxHeight={maxHeight}
                textareaProps={{
                  placeholder: placeholder,
                  disabled: disabled,
                }}
                enableScroll={true}
              />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <p>
                Supports <strong>Markdown</strong> syntax including:
              </p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>
                  <strong>Bold</strong> (**text**) and <em>Italic</em> (*text*)
                </li>
                <li>Headers (# H1, ## H2, ### H3)</li>
                <li>Lists (- item or 1. item)</li>
                <li>Code blocks (```language)</li>
                <li>Links ([text](url))</li>
                <li>Images (![alt](url))</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <div
              className="border rounded-md p-4 min-h-[200px] prose prose-sm max-w-none dark:prose-invert overflow-auto"
              style={{ minHeight: `${minHeight}px`, maxHeight: `${maxHeight}px` }}
            >
              {value ? (
                <ReactMarkdown
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    code: ({ className, children, ...props }: any) => {
                      const match = /language-(\w+)/.exec(className || '');
                      const isInline = !match && !className?.includes('language-');
                      return !isInline && match ? (
                        <pre className="hljs">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {value}
                </ReactMarkdown>
              ) : (
                <p className="text-muted-foreground italic">Nothing to preview yet...</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Simple markdown viewer component for displaying submitted content
interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export function MarkdownViewer({ content, className = "" }: MarkdownViewerProps) {
  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:border ${className}`}>
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
          code: ({ className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !className?.includes('language-');
            return !isInline && match ? (
              <pre className="hljs rounded-md border bg-muted p-4 overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className={`${className} bg-muted px-1.5 py-0.5 rounded text-sm font-mono`} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
