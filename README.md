# 🌿 VeggieChef AI

> Assistente culinario intelligente specializzato in cucina vegetariana e plant-based, powered by Gemini AI e RAG (Retrieval-Augmented Generation).

![Status](https://img.shields.io/badge/status-live-brightgreen) ![PHP](https://img.shields.io/badge/PHP-8.4-blue) ![React](https://img.shields.io/badge/React-18-61dafb) ![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

- 💬 **Chat conversazionale** con memoria della sessione
- 🔍 **Ricerca semantica** tramite RAG + embeddings Gemini
- 🍽️ **Ricette vegetariane** sincronizzate da Spoonacular API
- 📱 **UI responsive** ottimizzata per mobile e desktop
- 🗂️ **Storico conversazioni** persistente

---

## 🏗️ Architettura

```
┌─────────────────┐        ┌─────────────────────┐
│   Frontend      │        │   Backend PHP        │
│   React + Vite  │◄──────►│   Railway            │
│   Vercel        │        │                      │
└─────────────────┘        └──────────┬──────────┘
                                      │
                           ┌──────────▼──────────┐
                           │   Gemini AI API      │
                           │   + Spoonacular API  │
                           └─────────────────────┘
```

| Layer | Tecnologia | Hosting |
|---|---|---|
| Frontend | React 18 + Vite | Vercel |
| Backend | PHP 8.4 | Railway |
| AI | Gemini 2.5 Flash | Google AI |
| Ricette | Spoonacular API | — |

---

## 🚀 Environments

| Environment | Frontend | Backend |
|---|---|---|
| **Production** | [veggie-chef-ai.vercel.app](https://veggie-chef-ai.vercel.app) | Railway production |
| **Staging** | Preview URL Vercel | Railway staging |

---

## 📁 Struttura del progetto

```
veggie-chef-ai/
├── frontend/               # React app
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom hooks (useChat, useConversations)
│   │   ├── pages/          # Pagine (ChatPage)
│   │   └── services/       # API client
│   └── vite.config.js
│
└── backend/                # PHP API
    ├── services/
    │   ├── GeminiService.php      # Integrazione Gemini AI
    │   ├── RAGService.php         # Ricerca semantica
    │   ├── ChatService.php        # Gestione conversazioni
    │   └── SpoonacularService.php # Sync ricette
    ├── storage/
    │   ├── conversations/         # JSON conversazioni
    │   └── recipes.json           # Knowledge base ricette
    ├── config.php
    └── router.php
```

---

## ⚙️ Setup locale

### Prerequisiti

- PHP 8.4+
- Composer
- Node.js 18+
- API key Gemini ([aistudio.google.com](https://aistudio.google.com))
- API key Spoonacular ([spoonacular.com/food-api](https://spoonacular.com/food-api))

### Backend

```bash
cd backend
composer install
cp .env.example .env
# Aggiungi le tue API key nel file .env
php -S localhost:8000 router.php
```

### Frontend

```bash
cd frontend
npm install
# Crea il file .env.local
echo "VITE_API_URL=http://localhost:8000" > .env.local
npm run dev
```

---

## 🔄 Workflow di sviluppo

```
feature/nome  →  staging  →  main
  (sviluppi)     (test)    (production)
```

1. Crea un branch dalla `staging`: `git checkout -b feature/nome`
2. Fai le modifiche e committa seguendo la convenzione:
   - `feat:` nuova funzionalità
   - `fix:` correzione bug
   - `chore:` manutenzione
   - `refactor:` refactoring
3. Apri una **Pull Request** verso `staging`
4. Testa su staging
5. Apri una **Pull Request** `staging → main` per andare in production

---

## 🔌 API Endpoints

| Method | Endpoint | Descrizione |
|---|---|---|
| `POST` | `/api/chat` | Invia un messaggio |
| `GET` | `/api/conversations` | Lista conversazioni |
| `GET` | `/api/conversations/:id` | Dettaglio conversazione |
| `POST` | `/api/recipes/sync` | Sincronizza ricette da Spoonacular |
| `POST` | `/api/rag/search` | Ricerca semantica ricette |

---

## 🌍 Variabili d'ambiente

### Backend (Railway)

```env
GEMINI_API_KEY=your_gemini_api_key
SPOONACULAR_API_KEY=your_spoonacular_api_key
```

### Frontend (Vercel)

```env
VITE_API_URL=https://your-backend.up.railway.app
```

---

## 📄 Licenza

MIT © Saverio Benedetto