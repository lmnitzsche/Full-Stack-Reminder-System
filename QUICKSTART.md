# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Set Up Supabase (2 minutes)

1. Go to [https://supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Choose a name, database password, and region
4. Wait for the project to be created

### Step 2: Create Database Tables (1 minute)

1. In your Supabase dashboard, go to **SQL Editor**
2. Open the file `SUPABASE_SCHEMA.md` in this project
3. Copy ALL the SQL code from that file
4. Paste it into the Supabase SQL Editor
5. Click **Run** to create all tables

### Step 3: Configure the App (1 minute)

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL**
3. Copy your **anon/public** key
4. Open the `.env` file in this project
5. Replace the placeholder values:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Step 4: Run the App (1 minute)

```bash
npm run dev
```

Open your browser to the URL shown (usually `http://localhost:5173`)

## ✅ You're Ready!

You can now:
- Create tasks
- Set reminders (they'll be stored in the database)
- Mark tasks complete
- Edit and delete tasks

## 📱 To Enable SMS (Optional)

The app stores all reminder information in the database. To actually send SMS messages, you need to set up a backend service:

**Easiest Method**: Supabase Edge Functions + Twilio
- Full instructions in `SUPABASE_SCHEMA.md`
- Cost: ~$0.0075 per SMS with Twilio

**Alternative**: Any Node.js/Python backend with a cron job

## 🆘 Troubleshooting

**App shows errors?**
- Make sure you created the database tables (Step 2)
- Check that your `.env` file has the correct credentials
- Restart the dev server after changing `.env`

**Database connection failed?**
- Verify your Supabase URL and key in `.env`
- Make sure your Supabase project is active

**Need help?**
- Check the full README.md for detailed documentation
- See SUPABASE_SCHEMA.md for database details
