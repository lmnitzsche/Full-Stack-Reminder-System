# Telegram Reminder Setup Guide

This guide will walk you through setting up automated Telegram reminders for your Task Tracker app using Supabase Edge Functions and Telegram Bot API.

**✅ Completely FREE**
**✅ No verification needed**
**✅ Setup time: 10 minutes**

---

## Step 1: Create a Telegram Bot (2 minutes)

### 1.1 Open Telegram
- Open Telegram app on your phone or go to [web.telegram.org](https://web.telegram.org)

### 1.2 Find BotFather
- Search for `@BotFather` (official Telegram bot for creating bots)
- Start a chat with BotFather

### 1.3 Create Your Bot
1. Send `/newbot` to BotFather
2. Choose a name for your bot (e.g., "Task Reminder Bot")
3. Choose a username (must end in 'bot', e.g., "mytaskreminder_bot")
4. BotFather will give you a **Bot Token** - SAVE THIS!

**Example token:** `6789012345:ABCdefGHIjklMNOpqrsTUVwxyz1234567890`

---

## Step 2: Get Your Chat ID (1 minute)

### 2.1 Start Your Bot
- Click the link BotFather gave you to open your bot
- Send `/start` to your bot

### 2.2 Get Your Chat ID
Go to this URL in your browser (replace `YOUR_BOT_TOKEN` with your actual token):

```
https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
```

**Example:**
```
https://api.telegram.org/bot6789012345:ABCdefGHIjklMNOpqrsTUVwxyz1234567890/getUpdates
```

You'll see JSON like this:
```json
{
  "ok": true,
  "result": [{
    "message": {
      "chat": {
        "id": 123456789,  // ← This is your chat_id!
        "first_name": "Your Name"
      }
    }
  }]
}
```

**Save your `chat_id` number!**

---

## Step 3: Install Supabase CLI (2 minutes)

```bash
# Mac/Linux
brew install supabase/tap/supabase

# Or using npm
npm install -g supabase
```

Verify installation:
```bash
supabase --version
```

---

## Step 4: Link Your Supabase Project (1 minute)

```bash
cd /Users/logannitzsche/Desktop/task-tracker

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref gunwklwxcvayboxjmraz
```

---

## Step 5: Set Bot Token as Secret (30 seconds)

```bash
# Set your Telegram bot token
supabase secrets set TELEGRAM_BOT_TOKEN=your_bot_token_here
```

**Replace `your_bot_token_here` with your actual bot token from Step 1!**

---

## Step 6: Deploy the Edge Function (1 minute)

```bash
# Deploy the send-reminders function
supabase functions deploy send-reminders
```

---

## Step 7: Set Up Cron Job (2 minutes)

### 7.1 Enable pg_cron Extension
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Database** → **Extensions**
4. Search for `pg_cron` and enable it

### 7.2 Create Cron Job
Go to **SQL Editor** and run:

```sql
-- Create a cron job that runs every minute
select cron.schedule(
  'send-reminders-every-minute',
  '* * * * *',
  $$
  select
    net.http_post(
      url:='https://gunwklwxcvayboxjmraz.supabase.co/functions/v1/send-reminders',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY_HERE"}'::jsonb
    ) as request_id;
  $$
);
```

**IMPORTANT:** Replace `YOUR_ANON_KEY_HERE` with your Supabase Anon Key from your `.env` file (`VITE_SUPABASE_ANON_KEY`)

---

## Step 8: Update UI Labels (1 minute)

The app still says "Phone Number" but now we need "Telegram Chat ID". Let me update that for you! (Or you can keep it as is - it still works, just stores chat_id in the phone_number field)

---

## Step 9: Test It! (2 minutes)

### 9.1 Create a Test Reminder
1. Go to your app at http://localhost:5174
2. Create a new task
3. Set a reminder for 1-2 minutes from now
4. **Important:** Enter your **chat_id** (from Step 2) instead of a phone number

### 9.2 Wait for Notification
- In 1-2 minutes, you'll get a Telegram notification! 📱
- Tap it to see your task reminder

---

## Troubleshooting

### Not Getting Messages?

1. **Check bot token is set:**
   ```bash
   supabase secrets list
   ```

2. **Check function logs:**
   ```bash
   supabase functions logs send-reminders
   ```

3. **Verify chat_id is correct:**
   - Go to `https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates`
   - Make sure you sent `/start` to your bot first

4. **Check cron job exists:**
   ```sql
   SELECT * FROM cron.job;
   ```

### Test Function Manually

```bash
curl -i --location --request POST \
  'https://gunwklwxcvayboxjmraz.supabase.co/functions/v1/send-reminders' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: 'application/json'
```

---

## How It Works

1. **Every minute**, the cron job triggers the Edge Function
2. The function queries for reminders where `next_send_at <= current_time`
3. For each reminder, it sends a message via Telegram Bot API
4. After sending:
   - **One-time reminders** are deactivated
   - **Recurring reminders** have their `next_send_at` calculated and updated
5. User gets a push notification on their phone/desktop

---

## Benefits vs SMS

| Feature | Telegram | SMS |
|---------|----------|-----|
| **Cost** | FREE ✅ | ~$0.0075 per message |
| **Setup** | 10 minutes | Requires business registration |
| **Verification** | None needed | Phone + A2P 10DLC |
| **Rich formatting** | ✅ Bold, links, buttons | ❌ Plain text only |
| **International** | ✅ Works everywhere | Limited by carrier |
| **Instant delivery** | ✅ Always | Sometimes delayed |
| **Push notifications** | ✅ Yes | ✅ Yes |

---

## Next Steps

### For Multiple Users:
Each user needs to:
1. Start your bot (send `/start`)
2. Get their chat_id from the getUpdates URL
3. Enter their chat_id when creating reminders

### Optional: Auto Chat ID Discovery
You could build a feature where:
- User clicks "Connect Telegram"
- Gets redirected to your bot
- Bot automatically captures and stores their chat_id
- No manual copy/paste needed!

---

## Commands Cheat Sheet

```bash
# Deploy function
supabase functions deploy send-reminders

# Check logs
supabase functions logs send-reminders

# List secrets
supabase secrets list

# Test bot token works
curl https://api.telegram.org/botYOUR_TOKEN/getMe
```

---

**You're all set!** 🚀 Create a reminder and watch it arrive in Telegram!
