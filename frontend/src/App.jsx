import React, { useState, useRef, useEffect } from 'react';

// ── CONFIG ─────────────────────────────────────────────────────────────────
const CHAT_ENDPOINT = '/chat.php'; // cambia con il tuo URL se necessario

// ── ICONS ──────────────────────────────────────────────────────────────────
const LeafIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const UsersIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg width="15" height="15" viewBox="0 0 24 24"
    fill={filled ? '#e05c5c' : 'none'} stroke={filled ? '#e05c5c' : 'currentColor'}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

// ── SUGGESTIONS ────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { emoji: '🥗', text: "Un'insalata fresca e proteica" },
  { emoji: '🍝', text: "Pasta vegana veloce" },
  { emoji: '🥣', text: "Colazione energetica" },
  { emoji: '🍲', text: "Zuppa comfort food" },
  { emoji: '🌮', text: "Qualcosa di messicano" },
  { emoji: '🍰', text: "Dolce senza zucchero" },
];

// ── RECIPE CARD ────────────────────────────────────────────────────────────
function RecipeCard({ recipe }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="recipe-card">
      {recipe.image && (
        <div className="recipe-img-wrap">
          <img src={recipe.image} alt={recipe.title} className="recipe-img" loading="lazy" />
          <button className="like-btn" onClick={() => setLiked(l => !l)} aria-label="Salva ricetta">
            <HeartIcon filled={liked} />
          </button>
        </div>
      )}
      <div className="recipe-body">
        <h3 className="recipe-title">{recipe.title}</h3>
        <div className="recipe-meta">
          {recipe.readyInMinutes && (
            <span className="meta-chip"><ClockIcon /> {recipe.readyInMinutes} min</span>
          )}
          {recipe.servings && (
            <span className="meta-chip"><UsersIcon /> {recipe.servings} porzioni</span>
          )}
          {recipe.healthScore && (
            <span className="meta-chip health">❤️ {recipe.healthScore}</span>
          )}
        </div>
        {recipe.summary && (
          <p className="recipe-summary"
            dangerouslySetInnerHTML={{
              __html: recipe.summary.replace(/<[^>]*>/g, '').slice(0, 140) + '…'
            }}
          />
        )}
        {recipe.sourceUrl && (
          <a href={recipe.sourceUrl} target="_blank" rel="noreferrer" className="recipe-link">
            Vedi ricetta completa →
          </a>
        )}
      </div>
    </div>
  );
}

// ── MESSAGE BUBBLE ─────────────────────────────────────────────────────────
function Message({ msg }) {
  if (msg.role === 'user') {
    return (
      <div className="msg-row user">
        <div className="bubble user-bubble">{msg.text}</div>
      </div>
    );
  }

  if (msg.type === 'error') {
    return (
      <div className="msg-row assistant">
        <div className="avatar"><LeafIcon size={16} color="#fff" /></div>
        <div className="bubble error-bubble">⚠️ {msg.text}</div>
      </div>
    );
  }

  return (
    <div className="msg-row assistant">
      <div className="avatar"><LeafIcon size={16} color="#fff" /></div>
      <div className="assistant-content">
        {msg.text && <div className="bubble assistant-bubble">{msg.text}</div>}
        {msg.recipes && msg.recipes.length > 0 && (
          <div className="cards-grid">
            {msg.recipes.map(r => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── TYPING INDICATOR ───────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="msg-row assistant">
      <div className="avatar"><LeafIcon size={16} color="#fff" /></div>
      <div className="bubble assistant-bubble typing">
        <span /><span /><span />
      </div>
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────
export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll automatico all'ultimo messaggio
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const query = text.trim();
    if (!query || loading) return;

    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setLoading(true);

    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', type: 'error', text: data.message }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: data.message || `Ho trovato ${data.recipes?.length || 0} ricette per te! 🌿`,
          recipes: data.recipes || [],
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant', type: 'error',
        text: 'Errore di connessione. Verifica che il backend sia attivo.',
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* ── HEADER ── */}
        <header className="header">
          <div className="logo">
            <div className="logo-icon"><LeafIcon size={18} color="#fff" /></div>
            <span className="logo-text">Verdura</span>
          </div>
          <span className="header-tag">Chef AI Plant-Based</span>
        </header>

        {/* ── MESSAGES / WELCOME ── */}
        <main className="main">
          {isEmpty ? (
            <div className="welcome">
              <div className="welcome-icon"><LeafIcon size={36} color="#3f8f66" /></div>
              <h1 className="welcome-title">Ciao! Sono il tuo Chef AI 🌿</h1>
              <p className="welcome-sub">
                Dimmi cosa hai voglia di mangiare e ti troverò ricette<br />
                plant-based deliziose e personalizzate.
              </p>
              <div className="suggestions">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} className="suggestion-pill"
                    onClick={() => sendMessage(s.text)}>
                    <span>{s.emoji}</span>
                    <span>{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="chat-list">
              {messages.map((msg, i) => <Message key={i} msg={msg} />)}
              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          )}
        </main>

        {/* ── INPUT ── */}
        <footer className="footer">
          {!isEmpty && (
            <div className="quick-pills">
              {SUGGESTIONS.slice(0, 3).map((s, i) => (
                <button key={i} className="quick-pill"
                  onClick={() => sendMessage(s.text)} disabled={loading}>
                  {s.emoji} {s.text}
                </button>
              ))}
            </div>
          )}
          <div className="input-row">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder="Cosa vorresti cucinare oggi?"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className="send-btn"
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || loading}
              aria-label="Invia"
            >
              <SendIcon />
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}

// ── STYLES ─────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,400&family=DM+Sans:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --green:    #2d7a55;
  --green-lt: #e8f5ee;
  --green-mid:#3f8f66;
  --text:     #1a2e22;
  --muted:    #6b8a75;
  --bg:       #f7faf8;
  --white:    #ffffff;
  --border:   #d4e8db;
  --red:      #e05c5c;
  --radius:   16px;
  --shadow:   0 2px 16px rgba(45,122,85,.10);
}

body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); }

.app {
  display: flex; flex-direction: column;
  height: 100dvh; max-width: 780px;
  margin: 0 auto; background: var(--white);
  box-shadow: 0 0 40px rgba(45,122,85,.08);
}

/* HEADER */
.header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px;
  background: var(--green);
  color: #fff;
}
.logo { display: flex; align-items: center; gap: 10px; }
.logo-icon {
  width: 34px; height: 34px; border-radius: 10px;
  background: rgba(255,255,255,.18);
  display: flex; align-items: center; justify-content: center;
}
.logo-text { font-family: 'Fraunces', serif; font-size: 1.25rem; font-weight: 600; letter-spacing: -.02em; }
.header-tag { font-size: .72rem; background: rgba(255,255,255,.15); padding: 4px 10px; border-radius: 99px; }

/* MAIN */
.main { flex: 1; overflow-y: auto; padding: 0; }

/* WELCOME */
.welcome {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; text-align: center;
  padding: 48px 24px 24px; min-height: 100%;
}
.welcome-icon {
  width: 72px; height: 72px; border-radius: 24px;
  background: var(--green-lt); display: flex; align-items: center; justify-content: center;
  margin-bottom: 20px;
}
.welcome-title { font-family: 'Fraunces', serif; font-size: 1.7rem; font-weight: 600; color: var(--text); margin-bottom: 10px; }
.welcome-sub { color: var(--muted); font-size: .95rem; line-height: 1.6; margin-bottom: 32px; }

.suggestions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; max-width: 560px; }
.suggestion-pill {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 16px; border-radius: 99px;
  border: 1.5px solid var(--border); background: var(--white);
  color: var(--text); font-size: .88rem; cursor: pointer;
  transition: all .18s;
}
.suggestion-pill:hover { background: var(--green-lt); border-color: var(--green); color: var(--green); }

/* CHAT LIST */
.chat-list { padding: 20px 16px; display: flex; flex-direction: column; gap: 18px; }

.msg-row { display: flex; gap: 10px; align-items: flex-start; }
.msg-row.user { flex-direction: row-reverse; }

.avatar {
  flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%;
  background: var(--green); display: flex; align-items: center; justify-content: center;
}

.bubble {
  max-width: 72%; padding: 12px 16px; border-radius: var(--radius);
  font-size: .92rem; line-height: 1.55;
}
.user-bubble { background: var(--green); color: #fff; border-bottom-right-radius: 4px; }
.assistant-bubble { background: var(--green-lt); color: var(--text); border-bottom-left-radius: 4px; }
.error-bubble { background: #fff0f0; color: #b03030; border: 1px solid #f5c0c0; }

/* TYPING */
.typing { display: flex; align-items: center; gap: 5px; padding: 14px 18px; }
.typing span {
  width: 7px; height: 7px; border-radius: 50%; background: var(--green-mid);
  animation: bounce .9s infinite ease-in-out;
}
.typing span:nth-child(2) { animation-delay: .15s; }
.typing span:nth-child(3) { animation-delay: .30s; }
@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }

/* ASSISTANT CONTENT */
.assistant-content { display: flex; flex-direction: column; gap: 12px; max-width: calc(100% - 42px); }

/* CARDS */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}

.recipe-card {
  border-radius: var(--radius); overflow: hidden;
  border: 1.5px solid var(--border); background: var(--white);
  box-shadow: var(--shadow);
  transition: transform .18s, box-shadow .18s;
}
.recipe-card:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(45,122,85,.14); }

.recipe-img-wrap { position: relative; aspect-ratio: 16/10; overflow: hidden; }
.recipe-img { width: 100%; height: 100%; object-fit: cover; }
.like-btn {
  position: absolute; top: 8px; right: 8px;
  width: 30px; height: 30px; border-radius: 50%;
  background: rgba(255,255,255,.85); border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: transform .15s;
}
.like-btn:hover { transform: scale(1.15); }

.recipe-body { padding: 12px 14px 14px; }
.recipe-title { font-family: 'Fraunces', serif; font-size: 1rem; font-weight: 600; margin-bottom: 8px; line-height: 1.3; }
.recipe-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.meta-chip {
  display: flex; align-items: center; gap: 4px;
  font-size: .74rem; color: var(--muted);
  background: var(--green-lt); padding: 3px 8px; border-radius: 99px;
}
.meta-chip.health { background: #fff0f0; color: #c04444; }
.recipe-summary { font-size: .8rem; color: var(--muted); line-height: 1.5; margin-bottom: 10px; }
.recipe-link {
  font-size: .8rem; color: var(--green); text-decoration: none; font-weight: 500;
}
.recipe-link:hover { text-decoration: underline; }

/* FOOTER */
.footer {
  padding: 10px 16px 14px;
  border-top: 1.5px solid var(--border);
  background: var(--white);
}
.quick-pills {
  display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px;
  scrollbar-width: none;
}
.quick-pills::-webkit-scrollbar { display: none; }
.quick-pill {
  flex-shrink: 0; white-space: nowrap;
  padding: 5px 12px; border-radius: 99px;
  border: 1px solid var(--border); background: var(--white);
  font-size: .78rem; color: var(--muted); cursor: pointer;
  transition: all .15s;
}
.quick-pill:hover:not(:disabled) { background: var(--green-lt); color: var(--green); border-color: var(--green); }

.input-row { display: flex; gap: 10px; align-items: center; }
.chat-input {
  flex: 1; padding: 12px 16px; border-radius: 99px;
  border: 1.5px solid var(--border); background: var(--bg);
  font-size: .93rem; font-family: 'DM Sans', sans-serif; color: var(--text);
  outline: none; transition: border-color .18s;
}
.chat-input:focus { border-color: var(--green); background: var(--white); }
.chat-input:disabled { opacity: .6; }

.send-btn {
  flex-shrink: 0; width: 44px; height: 44px; border-radius: 50%;
  background: var(--green); border: none; color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .18s, transform .12s;
}
.send-btn:hover:not(:disabled) { background: var(--green-mid); transform: scale(1.06); }
.send-btn:disabled { background: var(--border); cursor: not-allowed; }

@media (max-width: 600px) {
  .cards-grid { grid-template-columns: 1fr 1fr; }
  .welcome-title { font-size: 1.35rem; }
}
@media (max-width: 400px) {
  .cards-grid { grid-template-columns: 1fr; }
}
`;