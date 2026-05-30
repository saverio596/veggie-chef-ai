import { useState, useEffect } from 'react';
import { fetchConversations, fetchConversation } from '../services/api';

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const loadConversations = async () => {
    try {
      const data = await fetchConversations();
      setConversations(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const selectConversation = (id) => {
    setActiveId(id);
  };

  const createNew = () => {
    setActiveId(null);
  };

  return { conversations, activeId, selectConversation, createNew, refreshConversations: loadConversations };
}
