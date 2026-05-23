import React, { useState } from 'react';
import './index.css';

export default function App() {
  const [inputValue, setInputValue] = useState('');

  const suggestions = [
    { emoji: '🥗', text: "Un'insalata fresca e proteica" },
    { emoji: '🍝', text: "Pasta vegana veloce" },
    { emoji: '🥣', text: "Colazione energetica" },
    { emoji: '🍲', text: "Zuppa comfort food" },
    { emoji: '🌮', text: "Qualcosa di messicano" },
    { emoji: '🍰', text: "Dolce senza zucchero" },
  ];

  const handleSuggestionClick = (text) => {
    setInputValue(text);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="logo-container">
          <div className="logo-icon-bg">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="leaf-icon-small">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
            </svg>
          </div>
          <span className="logo-text">Verdura</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="welcome-section">
          <div className="big-icon-container">
            <svg viewBox="0 0 24 24" fill="none" stroke="#3f8f66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="leaf-icon-large">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
            </svg>
          </div>
          <h1 className="title">Ciao! Sono il tuo Chef AI</h1>
          <p className="subtitle">
            Dimmi cosa hai voglia di mangiare e ti suggerirò ricette plant-based<br/>deliziose e personalizzate per te.
          </p>

          <div className="suggestions-grid">
            {suggestions.map((s, index) => (
              <button key={index} className="suggestion-pill" onClick={() => handleSuggestionClick(s.text)}>
                <span className="emoji">{s.emoji}</span>
                <span className="suggestion-text">{s.text}</span>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer / Input Area */}
      <footer className="input-area">
        <div className="input-container">
          <input 
            type="text" 
            className="chat-input" 
            placeholder="Cosa vorresti cucinare oggi?"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button className="send-button" disabled={!inputValue.trim()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
               <line x1="22" y1="2" x2="11" y2="13"></line>
               <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}