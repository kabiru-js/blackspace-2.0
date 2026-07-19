# Blackspace — Scholarship Discovery & AI Application Assistant

A Tinder-style scholarship discovery platform with AI-powered application assistance.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ & pnpm (or npm)
- Supabase account (free tier works)
- Optional: OpenAI or Google Gemini API key

### 1. Clone & Install

```bash
cd Blackspace-pro
pnpm install
```

### 2. Set Up Supabase

1. Create a [Supabase](https://supabase.com) project
2. Go to **SQL Editor** and run the migration below
3. Go to **Storage** → create a public bucket called `documents`
4. Go to **Authentication** → enable Email/Password auth
5. Copy your project URL and anon key

### 3. Configure Environment

```bash
cp .env.local.example .env.local
```

Fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-key           # optional — fallback templates used otherwise
```

### 4. Seed the Database

```bash
pnpm seed
```

This inserts 50+ real scholarships (Chevening, DAAD, Fulbright, etc.) into your database.

### 5. Run the App

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🗄️ Database Migration

Run this SQL in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT NOT NULL,
  country TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('undergraduate', 'masters', 'phd')),
  field_of_study TEXT NOT NULL,
  gpa TEXT,
  preferred_countries TEXT[] DEFAULT '{}',
  goals TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scholarships table
CREATE TABLE scholarships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  country TEXT NOT NULL,
  level TEXT NOT NULL,
  field TEXT NOT NULL,
  funding_type TEXT NOT NULL CHECK (funding_type IN ('full', 'partial')),
  deadline DATE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  eligibility TEXT DEFAULT '',
  application_link TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Swipes table
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scholarship_id UUID NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  liked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scholarship_id UUID NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'submitted')),
  generated_essay TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User documents table
CREATE TABLE user_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('cv', 'transcript', 'passport', 'personal_statement')),
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_swipes_user_id ON swipes(user_id);
CREATE INDEX idx_swipes_scholarship_id ON swipes(scholarship_id);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_scholarship_id ON applications(scholarship_id);
CREATE INDEX idx_user_documents_user_id ON user_documents(user_id);
CREATE INDEX idx_users_email ON users(email);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;

-- Users can read all scholarships
CREATE POLICY "Allow read all" ON scholarships FOR SELECT USING (true);

-- Users CRUD their own data
CREATE POLICY "Users read own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users upsert own" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own" ON users FOR UPDATE USING (auth.uid() = id);

-- Swipes
CREATE POLICY "Users crud own swipes" ON swipes FOR ALL USING (auth.uid() = user_id);

-- Applications
CREATE POLICY "Users crud own apps" ON applications FOR ALL USING (auth.uid() = user_id);

-- Documents
CREATE POLICY "Users crud own docs" ON user_documents FOR ALL USING (auth.uid() = user_id);
```

---

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── generate-essay/route.ts   # AI essay API
│   │   └── upload/route.ts           # Document upload API
│   ├── auth/callback/route.ts        # Auth callback handler
│   ├── login/page.tsx                # Auth page
│   ├── onboarding/page.tsx           # 4-step onboarding
│   ├── saved/page.tsx                # Liked scholarships
│   ├── swipe/page.tsx                # Swipe deck UI
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Redirect to /swipe
│   └── globals.css                   # Tailwind + design tokens
├── components/
│   ├── ApplicationModal.tsx          # AI apply flow modal
│   ├── DocumentChecklist.tsx         # Document upload checklist
│   ├── Navbar.tsx                    # Bottom navigation
│   ├── Providers.tsx                 # Auth + store provider
│   ├── SwipeCard.tsx                 # Swipeable card component
│   └── SwipeDeck.tsx                 # Card stack manager
├── lib/
│   ├── ai.ts                         # AI generation (Gemini/OpenAI)
│   ├── matching.ts                   # Match score algorithm
│   ├── seed.ts                       # 50+ scholarship seed data
│   ├── store.ts                      # Zustand state management
│   ├── supabaseClient.ts             # Browser Supabase client
│   ├── supabaseServer.ts             # Server Supabase client
│   └── types.ts                     # TypeScript types
```

---

## 🧠 Matching Algorithm

| Condition                          | Score |
|------------------------------------|-------|
| Study level matches                | +40   |
| Field of study matches             | +30   |
| Country matches preferred list     | +20   |
| Random variety boost               | +10   |
| **Max**                            | 100   |

Scholarships are sorted by match score descending.

---

## 🤖 AI Generation

The app supports both **Google Gemini** and **OpenAI** for generating:

- **Personal Statement** (300–500 words, tailored)
- **Motivation Letter** (formal, persuasive)

If no API key is configured, a smart template with user data is returned as fallback.

Set at least one:

```
GEMINI_API_KEY=...
# or
OPENAI_API_KEY=...
```

---

## 🎨 Design System

- **Dark mode only** — black gradient background
- **Accent**: Purple/blue gradient (#7c3aed → #3b82f6)
- **Cards**: Rounded-2xl, subtle glow shadows
- **Badges**: Green (FULLY FUNDED), Red (URGENT), Amber (CLOSING SOON), Purple (HIGH MATCH)
- **Typography**: System font stack, clean hierarchy

---

## 🔐 Authentication

- Email/password via Supabase Auth
- New users are redirected to onboarding
- Session persistence across page reloads
- Row-level security on all tables

---

## 📦 Seed Data

50+ scholarships from real programs:

- Chevening (UK)
- DAAD (Germany)
- Erasmus Mundus (Multiple)
- Fulbright (USA)
- Mastercard Foundation (Multiple)
- Rhodes, Gates Cambridge, MEXT, KAIST, ADB-JSP, and 30+ more

---

## 🚀 Deployment

**Vercel** (recommended):

1. Push to GitHub
2. Import in Vercel
3. Set environment variables
4. Deploy

The `pnpm build` command produces a fully static-capable output.

---

## 📝 License

MIT
