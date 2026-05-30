import React from 'react';
import './WelcomeScreen.css';

const SUGGESTIONS = [
  { emoji: '🥗', text: "Un'insalata fresca e proteica" },
  { emoji: '🍝', text: "Pasta vegana veloce" },
  { emoji: '🥣', text: "Colazione energetica" },
  { emoji: '🍲', text: "Zuppa comfort food" },
];

export default function WelcomeScreen({ onSuggestionClick }) {
  return (
    <div className="welcome-screen">
      <div className="welcome-logo">🌿</div>
      <h1 className="welcome-title">Ciao! Sono VeggieChef</h1>
      <p className="welcome-subtitle">
        Il tuo assistente culinario plant-based. Dimmi cosa hai voglia di mangiare.
      </p>
      
      <div className="suggestions-grid">
        {SUGGESTIONS.map((s, i) => (
          <button key={i} className="suggestion-card" onClick={() => onSuggestionClick(s.text)}>
            <div className="suggestion-emoji">{s.emoji}</div>
            <div className="suggestion-text">{s.text}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
