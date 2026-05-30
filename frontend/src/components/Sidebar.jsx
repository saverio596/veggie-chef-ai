import React, { useState } from 'react';
import './Sidebar.css';

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const MessageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

export default function Sidebar({ conversations, activeId, onSelect, onNew }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={() => { onNew(); setIsOpen(false); }}>
            <PlusIcon /> Nuova Chat
          </button>
        </div>

        <div className="sidebar-scroll">
          <div className="history-group">
            <span className="history-label">Recenti</span>
            {conversations.length === 0 && <div className="no-history">Nessuna chat recente</div>}
            {conversations.map(conv => (
              <button 
                key={conv.id} 
                className={`history-item ${activeId === conv.id ? 'active' : ''}`}
                onClick={() => { onSelect(conv.id); setIsOpen(false); }}
              >
                <MessageIcon />
                <span className="history-title">{conv.title || 'Nuova Conversazione'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
}
