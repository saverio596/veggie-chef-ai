import React, { useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import ChatInput from '../components/ChatInput';
import MessageBubble from '../components/MessageBubble';
import WelcomeScreen from '../components/WelcomeScreen';
import TypingIndicator from '../components/TypingIndicator';
import './ChatPage.css';

export default function ChatPage({ conversationId, onNewConversation, refreshConversations }) {
  const { messages, sendMessage, loading, error } = useChat(conversationId, refreshConversations);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = (text) => {
    sendMessage(text, onNewConversation);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="chat-page">
      <header className="mobile-header">
        <span className="logo-text">VeggieChef AI</span>
      </header>

      <div className="chat-container">
        {isEmpty ? (
          <WelcomeScreen onSuggestionClick={handleSend} />
        ) : (
          <div className="messages-list">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="input-wrapper">
        <ChatInput onSend={handleSend} disabled={loading} isEmpty={isEmpty} />
      </div>
    </div>
  );
}
