import React, { useState, useRef, useEffect } from 'react';
import './ChatInput.css';

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export default function ChatInput({ onSend, disabled, isEmpty }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend(value);
      setValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`chat-input-container ${isEmpty ? 'centered' : ''}`}>
      <div className="input-box">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Cosa vorresti cucinare oggi?"
          disabled={disabled}
          rows={1}
        />
        <button 
          className="send-btn" 
          onClick={handleSend} 
          disabled={!value.trim() || disabled}
          aria-label="Invia messaggio"
        >
          <SendIcon />
        </button>
      </div>
      <div className="footer-text">
        VeggieChef può commettere errori.
      </div>
    </div>
  );
}
