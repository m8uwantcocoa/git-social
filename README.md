# Git-Social 🧑‍💻🕸️

*The platform for anti-social coders to meet up and discuss their projects, commits, merges and more! Join Git-Social and start networking... not with pesky recruiters, but with actual coders! LinkedIn could never.*

## About the Project
Git-Social turns standard GitHub activity into an interactive social media feed. When you push code, open a pull request, or star a repository, it automatically shows up on your followers' feeds. Users can like, comment, and engage with real development work in real-time.

**Key Features:**
- **GitHub Activity Feed:** Automatically syncs GitHub events (pushes, PRs, issues) to a social timeline.
- **Social Features:** Follow other developers, like events, and comment on them.
- **Real-Time Notifications:** Get notified instantly when someone interacts with your activity.
- **Live Explore Widget:** Features a real-time weather widget (via Open-Meteo), latest activity tracker, and user search.
- **Developer Profiles:** View connected GitHub stats and repositories directly in the app.

## Tech Stack
- **Frontend:** [Nuxt 3](https://nuxt.com/) / [Vue 3](https://vuejs.org/) / TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, Realtime database, GitHub OAuth)
- **APIs:** GitHub REST API, Open-Meteo API

---

## 🚀 Getting Started

Follow these instructions to get a local copy up and running. Perfect for teachers, contributors, or anyone wanting to test the app.

### Prerequisites
- **Node.js** (v18 or newer recommended)
- **npm**, **yarn**, or **pnpm**
- A **Supabase** account (the free tier works perfectly)
- A **GitHub** account

### TEACHERS
- Skip step 1, you should have a .env file sent with everything set up for you.


### 1. Supabase Setup
1. Create a new project on [Supabase](https://database.new).
2. Go to **Authentication > Providers** and enable **GitHub**.
   - You will need to create an OAuth App in your GitHub Developer Settings.
   - Set the Authorization callback URL to: `http://localhost:3000/auth/callback`
3. Ensure your database tables are set up (Required tables: `profiles`, `events`, `comments`, `event_likes`, `follows`). 

### 2. Clone and Install
```bash
git clone <your-repository-url>
cd git-social
npm install
```

### 3. Environment Variables
Create a `.env` file in the root of your project and add the following variables:

```env
# Supabase Configuration
NUXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NUXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key

# GitHub Setup
# Create a Personal Access Token (classic) on GitHub with 'repo' and 'user' scopes
GITHUB_TOKEN=your_github_personal_access_token
```

### 4. Run the Development Server
```bash
npm run dev
```
Open http://localhost:3000 in your browser to see the app.

## 🧪 Testing the App
- **Sign in** using your GitHub account.
- **Search** for other users and follow them to start populating your feed.
- **Interact:** Try commenting or liking a post. If you have a friend test it with you, you'll see the real-time Supabase notifications pop up automatically!
