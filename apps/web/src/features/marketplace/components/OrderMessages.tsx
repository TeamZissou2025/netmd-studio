import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@netmd-studio/ui';
import { formatRelativeTime } from '@netmd-studio/utils';
import type { Database } from '@netmd-studio/types';

type Message = Database['public']['Tables']['messages']['Row'];

interface OrderMessagesProps {
  messages: Message[];
  currentUserId: string;
  onSend: (body: string) => Promise<{ error: unknown } | undefined>;
  counterpartyName: string;
}

export function OrderMessages({ messages, currentUserId, onSend, counterpartyName }: OrderMessagesProps) {
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    if (!body.trim() || sending) return;
    setSending(true);
    await onSend(body);
    setBody('');
    setSending(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px]">
        {messages.length === 0 && (
          <p className="text-nav text-[var(--text-tertiary)] text-center py-8">
            No messages yet. Start a conversation with {counterpartyName}.
          </p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 ${
                  isOwn
                    ? 'bg-[var(--accent-dim)] border border-[var(--border-accent)]'
                    : 'bg-[var(--surface-1)] border border-[var(--border)]'
                }`}
              >
                <p className="text-nav text-[var(--text-primary)] whitespace-pre-wrap break-words">{msg.body}</p>
                <p className="text-tag text-[var(--text-tertiary)] mt-1">{formatRelativeTime(msg.created_at)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[var(--border)] p-3 flex gap-2">
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 h-8 bg-[var(--surface-0)] border border-[var(--border)] rounded-md px-3 text-nav text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-accent)] outline-none"
        />
        <Button onClick={handleSend} disabled={!body.trim() || sending}>
          <Send size={14} />
        </Button>
      </div>
    </div>
  );
}
