# AppScore Judge

A smart app evaluation platform for judging applications based on UX, usefulness, reliability, data handling, and clarity with weighted scoring and AI-powered insights.

## 🚀 Features

- **Structured Evaluation**: Evaluate apps across 5 key criteria (20% weight each)
- **AI-Powered Insights**: Get intelligent feedback using OpenAI GPT-4
- **URL Analysis**: AI automatically analyzes app URLs and suggests scores
- **PDF Export**: Generate comprehensive evaluation reports
- **Modern UI**: Beautiful, responsive design with dark mode support
- **Supabase Backend**: Secure authentication and real-time database

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)
- OpenAI API key (for AI features)

## 🛠️ Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Set up Supabase database**
   
   Go to your Supabase dashboard → SQL Editor and run:
   ```sql
   -- Copy contents from supabase/migrations/001_initial_schema.sql
   ```

4. **Configure Storage (for screenshots)**
   
   In Supabase dashboard → Storage:
   - Create a bucket called `screenshots`
   - Set it to public

5. **Deploy Edge Functions (for AI features)**
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login and link project
   supabase login
   supabase link --project-ref your-project-ref

   # Set secrets
   supabase secrets set OPENAI_API_KEY=your-openai-key

   # Deploy functions
   supabase functions deploy generate-ai-feedback
   supabase functions deploy analyze-app-url
   supabase functions deploy export-pdf
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
appscore-judge/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── AuthModal.tsx
│   │   ├── Layout.tsx
│   │   └── Navbar.tsx
│   ├── config/           # App configuration
│   ├── context/          # React contexts (Auth)
│   ├── lib/              # Supabase client
│   ├── pages/            # Page components
│   │   ├── LandingPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── SubmitApp.tsx
│   │   ├── AppLibrary.tsx
│   │   ├── Evaluation.tsx
│   │   ├── Evaluations.tsx
│   │   └── Results.tsx
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Main app with routing
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles + Tailwind
├── supabase/
│   ├── migrations/       # SQL schema files
│   └── functions/        # Edge functions (AI, PDF)
├── public/
├── index.html
└── package.json
```

## 🔄 User Flow

1. **Landing Page** → User sees product features → Signs up/Logs in
2. **Dashboard** → Overview of all evaluation activities
3. **Submit App** → Add new app with name, URL, screenshots
4. **App Library** → Browse all apps, filter by status
5. **Evaluation** → Rate app on 5 criteria (1-5 stars each)
6. **AI Analysis** → (Optional) Get AI-suggested scores
7. **Results** → View detailed breakdown and AI feedback
8. **Export** → Download PDF report

## 🎨 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **State**: React Context API
- **Routing**: React Router DOM v7
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **AI**: OpenAI GPT-4o / GPT-4o-mini

## 📱 Bolt.new Import

This project is structured for easy import into Bolt.new:

1. Run `npm run build` to generate the production build
2. Upload the project to Bolt.new
3. Configure environment variables in Bolt.new settings
4. Connect your Supabase project

## 🔐 Security

- Row-Level Security (RLS) enabled on all tables
- Auth-protected routes
- Server-side AI API calls via Edge Functions
- No API keys exposed in client code

## 📄 License

MIT License

---

Built with ❤️ using React, Tailwind CSS, and Supabase
