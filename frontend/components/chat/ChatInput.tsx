'use client';

import { useState, useRef, useEffect } from 'react';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // AI 응답 완료 시 (disabled false로 전환) 자동 포커스
  useEffect(() => {
    if (!disabled) {
      textareaRef.current?.focus();
    }
  }, [disabled]);

  const adjustHeight = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustHeight(e.target);
  };

  const handleSubmit = () => {
    if (!message.trim() || disabled) return;
    if (message.length > 5000) {
      alert('Message is too long. Maximum 5000 characters.');
      return;
    }
    onSend(message.trim());
    setMessage('');
    // 높이 초기화
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        background: "#04050e",
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="p-4 max-w-3xl mx-auto"
      >
        <div className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={5000}
            rows={1}
            className="flex-1 px-4 py-3 text-sm text-white rounded-[8px] outline-none transition-all disabled:opacity-50 resize-none overflow-hidden [&::-webkit-scrollbar]:hidden"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
              lineHeight: "1.5",
              maxHeight: "160px",
              overflowY: "auto",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(3,247,181,0.4)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
            }}
          />
          <button
            type="submit"
            disabled={disabled || !message.trim()}
            className="px-6 py-3 text-sm font-semibold rounded-[5px] transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            style={{ background: "#03f7b5", color: "#04050e" }}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
