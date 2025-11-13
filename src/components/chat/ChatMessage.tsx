import { User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { LucyLogo } from "@/components/branding/LucyLogo";
import { FilePreview } from "./FilePreview";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessageProps {
  message: {
    id?: string;
    role: string;
    content: string;
    created_at: string;
  };
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [attachments, setAttachments] = useState<any[]>([]);

  useEffect(() => {
    if (message.id) {
      loadAttachments();
    }
  }, [message.id]);

  const loadAttachments = async () => {
    if (!message.id) return;
    const { data } = await supabase
      .from('attachments')
      .select('*')
      .eq('message_id', message.id);
    if (data) setAttachments(data);
  };

  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <LucyLogo size="sm" showGlow className="flex-shrink-0" />
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <div className={`
          rounded-2xl px-4 py-3
          ${isUser 
            ? 'bg-gradient-primary text-white ml-auto' 
            : 'glass border border-border/50'
          }
          ${isStreaming ? 'animate-pulse' : ''}
        `}>
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const inline = !match;
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus as any}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg"
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {attachments.length > 0 && (
            <FilePreview attachments={attachments} />
          )}
        </div>
        {!isUser && !isStreaming && (
          <p className="text-xs text-muted-foreground mt-1 px-1">
            {new Date(message.created_at).toLocaleTimeString()}
          </p>
        )}
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}