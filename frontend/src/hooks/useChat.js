import { useState, useEffect } from 'react';
import { fetchConversation, sendMessage as apiSendMessage } from '../services/api';

export function useChat(conversationId, refreshConversations) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (conversationId) {
      loadHistory();
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchConversation(conversationId);
      
      const parsedMessages = [];
      data.messages.forEach(msg => {
        // Only show user and model text to the frontend
        if (msg.role === 'user') {
          parsedMessages.push({ role: 'user', text: msg.parts[0].text });
        } else if (msg.role === 'model') {
            if (msg.parts[0].text) {
                parsedMessages.push({ role: 'assistant', text: msg.parts[0].text });
            }
        } else if (msg.role === 'function') {
           const response = msg.parts[0]?.functionResponse;
           if (response && response.response && response.response.results) {
              // Attach recipes to the last assistant message or append a hidden context
               parsedMessages.push({ role: 'assistant', recipes: response.response.results, hidden: true});
           }
        }
      });
      
      // Post-process to merge recipes into previous assistant bubble or display them
      const finalMsgs = [];
      parsedMessages.forEach(m => {
          if (m.hidden) {
              if (finalMsgs.length > 0 && finalMsgs[finalMsgs.length - 1].role === 'assistant') {
                  finalMsgs[finalMsgs.length - 1].recipes = m.recipes;
              } else {
                 finalMsgs.push({ role: 'assistant', text: "Ecco cosa ho trovato:", recipes: m.recipes });
              }
          } else {
              finalMsgs.push(m);
          }
      });

      setMessages(finalMsgs);
      setError(null);
    } catch (err) {
      setError("Impossibile caricare la conversazione");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (text, onNewConversation) => {
    if (!text.trim() || loading) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);
    setError(null);

    try {
      const data = await apiSendMessage(text, conversationId);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: data.message,
        recipes: data.recipes || []
      }]);

      if (!conversationId && onNewConversation) {
        onNewConversation(data.conversationId);
      }
      
      refreshConversations();
    } catch (err) {
      setError("Errore di connessione. Riprova più tardi.");
      setMessages(prev => [...prev, { role: 'assistant', type: 'error', text: "Errore di connessione. Riprova più tardi." }]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading, error };
}
