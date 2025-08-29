# 🚀 ISCHOOLGO - Quick Setup Guide

## 🎯 Ready to Deploy in 5 Steps!

### Step 1: Choose Your Platform
- **🌟 Recommended: [Netlify](https://netlify.com)** (Easiest)
- **Alternative: [Vercel](https://vercel.com)** (Fast)
- **Alternative: [Cloudflare Pages](https://pages.cloudflare.com)** (CDN)

### Step 2: Deploy from GitHub
1. Connect your GitHub account
2. Import repository: `SSSMAA/App6`
3. Select branch: `deployment-setup`
4. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

### Step 3: Set Up Supabase (5 min)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy these values:
   - Project URL
   - Anon Key

### Step 4: Get Google AI Key (2 min)
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create API key
3. Copy the key

### Step 5: Configure Environment Variables
Add these to your hosting platform:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

## ✅ That's it! Your app will be live in minutes!

### Test Login:
- **Admin:** admin@ischoolgo.com / admin123
- **Teacher:** teacher@ischoolgo.com / teacher123

---

*Need help? Check the full [DEPLOYMENT_REPORT.md](./DEPLOYMENT_REPORT.md)*