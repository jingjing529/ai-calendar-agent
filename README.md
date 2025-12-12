# Cal-E: AI Calendar Agent

An intelligent calendar assistant that helps you manage your Google Calendar through natural language conversations. Built with Next.js and Zypher.

🌐 **Live Demo**: [https://ai-calendar-agent.vercel.app/](https://ai-calendar-agent.vercel.app/)

**Deployment:**
- **Frontend**: Hosted on [Vercel](https://vercel.com)
- **Backend**: Hosted on AWS EC2

## ✨ Features

- 🤖 **Natural Language Interface**: Talk to Cal-E like a human assistant
  - "Schedule a meeting tomorrow at 3pm"
  - "Update the 3pm meeting to 4pm"
  - "Delete my next event"
  - "What's on my calendar this week?"

- 📅 **Google Calendar Integration**: 
  - Secure OAuth 2.0 authentication
  - Full CRUD operations (Create, Read, Update, Delete)
  - Real-time calendar sync
  - Private calendar support (no need to make it public)

- 🌍 **Smart Timezone Handling**:
  - Automatic timezone detection
  - Cross-timezone event scheduling
  - Support for timezone-specific requests (e.g., "Beijing time 8pm")

- 💬 **Streaming AI Responses**: 
  - Real-time text streaming (like ChatGPT)
  - Fast, responsive interface
  
- 🔒 **Privacy First**:
  - HTTP-only cookies for secure token storage
  - No local storage required
  - Server-side state management

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **FullCalendar** - Calendar visualization
- **Google Calendar API** - Calendar operations
- **Hosting**: [Vercel](https://vercel.com)

### Backend
- **Deno** - Runtime
- **Zypher Agent** - AI agent framework
- **Claude Sonnet 4** - AI model
- **Anthropic API** - AI service
- **Hosting**: AWS EC2

## 📋 Prerequisites

- Node.js 18+ (for frontend)
- Deno 1.40+ (for backend)
- Google Cloud Console account
- Anthropic API key

## 🌐 Access the Application

**Production URL**: [https://ai-calendar-agent.vercel.app/](https://ai-calendar-agent.vercel.app/)

Simply visit the URL above and click "Get Started" to connect your Google Calendar. No installation required!

---

## 🚀 Local Development Setup

If you want to run the application locally for development:

### 1. Clone the repository

```bash
git clone https://github.com/jingjing529/ai-calendar-agent
cd ai-calendar-agent
```

### 2. Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google Calendar API**
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: Web application
   - Authorized redirect URIs: 
     - For local dev: `http://localhost:3000/api/auth/google/callback`
     - For production: `https://ai-calendar-agent.vercel.app/api/auth/google/callback`
5. Save your `Client ID` and `Client Secret`

### 3. Configure Environment Variables

#### Frontend (`.env.local` in `frontend/` directory)

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

#### Backend (`.env` in `backend/` directory)

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key  # Optional, for web crawling features
```

### 4. Install Dependencies

#### Frontend
```bash
cd frontend
npm install
```

#### Backend
```bash
cd backend
# Deno will auto-install dependencies on first run
```

### 5. Run the Application Locally

#### Start Backend (Terminal 1)
```bash
cd backend
deno run --allow-net --allow-env --allow-read main.ts
```

The backend will run on `http://localhost:8000`

#### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

### 6. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000) and click "Get Started" to connect your Google Calendar.

## 📁 Project Structure

```
ai-calendar-agent/
├── backend/
│   ├── main.ts          # Deno server with Zypher Agent
│   └── deno.json        # Deno configuration
│
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/google/     # OAuth authentication
│   │   │   ├── calendar/        # Calendar CRUD operations
│   │   │   ├── calendar-events/ # Fetch events
│   │   │   ├── message/         # AI message handling
│   │   │   └── logout/          # Logout endpoint
│   │   ├── page.tsx             # Home page
│   │   └── success/             # Main app page
│   │
│   ├── components/
│   │   ├── HomePage.tsx         # Landing page
│   │   ├── Chat.tsx             # Chat interface
│   │   ├── CalendarView.tsx      # Calendar display
│   │   ├── CalendarAndChatShell.tsx  # Main layout
│   │   ├── HeaderWithAvatar.tsx  # App header
│   │   └── TokenExpiredModal.tsx # Token expiration modal
│   │
│   └── package.json
│
└── README.md
```

## 🔑 Key Features Explained

### 1. OAuth Flow
- User clicks "Get Started" → Redirects to Google OAuth
- User authorizes → Google redirects with code
- Server exchanges code for access token
- Token stored in HTTP-only cookie

### 2. Event Tracking
- **Last Event**: Stored in cookies after each operation
- **All Events**: Fetched in real-time from Google Calendar API
- AI uses both to match user requests (e.g., "update that meeting")

### 3. Streaming Responses
- Backend streams AI responses chunk by chunk
- Frontend updates UI in real-time
- No waiting for complete response

### 4. Timezone Handling
- User's timezone auto-detected from browser
- AI converts between timezones when needed
- Events created with correct timezone

## 🧪 Development

### Frontend Development
```bash
cd frontend
npm run dev
```

### Backend Development
```bash
cd backend
deno run --allow-net --allow-env --allow-read main.ts
```

### Build for Production
```bash
cd frontend
npm run build
npm start
```

## 📝 API Endpoints

- `GET /api/auth/google` - Initiate OAuth flow
- `GET /api/auth/google/callback` - OAuth callback
- `POST /api/message` - Send message to AI (streaming)
- `POST /api/calendar` - Calendar operations (insert/edit/delete)
- `GET /api/calendar-events` - Fetch calendar events
- `POST /api/logout` - Logout user

## 🔐 Security

- HTTP-only cookies for token storage (prevents XSS)
- Secure flag in production (HTTPS only)
- OAuth state parameter (prevents CSRF)
- Server-side token validation

## 🙏 Acknowledgments

- [Zypher](https://github.com/corespeed/zypher) - AI agent framework
- [FullCalendar](https://fullcalendar.io/) - Calendar component
- [Anthropic](https://www.anthropic.com/) - Claude AI
- [Google Calendar API](https://developers.google.com/calendar)
