const BASE_URL = import.meta.env.VITE_API_URL || '';

export const fetchConversations = async () => {
  const res = await fetch(`${BASE_URL}/api/conversations`);
  if (!res.ok) throw new Error('Failed to fetch conversations');
  const data = await res.json();
  return data.conversations || [];
};

export const fetchConversation = async (id) => {
  const res = await fetch(`${BASE_URL}/api/conversations/${id}`);
  if (!res.ok) throw new Error('Failed to fetch conversation');
  return await res.json();
};

export const sendMessage = async (message, conversationId = null) => {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversationId })
  });
  if (!res.ok) throw new Error('Failed to send message');
  return await res.json();
};