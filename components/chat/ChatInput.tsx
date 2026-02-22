'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Type your message...',
}: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    if (message.length > 5000) {
      alert('Message is too long. Maximum 5000 characters.');
      return;
    }

    onSend(message.trim());
    setMessage('');
  };

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#04050e' }}>
      <form onSubmit={handleSubmit} className="p-4 max-w-3xl mx-auto">
        <div className="flex gap-3">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={5000}
            className="flex-1 px-4 py-3 text-sm text-white rounded-[8px] outline-none transition-all disabled:opacity-50"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(3,247,181,0.4)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; }}
          />
          <button
            type="submit"
            disabled={disabled || !message.trim()}
            className="px-6 py-3 text-sm font-semibold rounded-[5px] transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#03f7b5', color: '#04050e' }}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
