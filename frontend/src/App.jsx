import React from 'react';
import { useConversations } from './hooks/useConversations';
import Sidebar from './components/Sidebar';
import ChatPage from './pages/ChatPage';
import './index.css';

export default function App() {
  const { conversations, activeId, selectConversation, createNew, refreshConversations } = useConversations();

  return (
    <div className="app-layout">
      <Sidebar 
        conversations={conversations} 
        activeId={activeId} 
        onSelect={selectConversation} 
        onNew={createNew} 
      />
      <main className="main-content">
        <ChatPage 
            conversationId={activeId} 
            onNewConversation={selectConversation} 
            refreshConversations={refreshConversations}
        />
      </main>
    </div>
  );
}