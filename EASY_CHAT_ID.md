# Easy Chat ID Setup

Now users can get their chat ID automatically from the bot!

## Setup (One-time, 5 minutes)

### 1. Deploy the webhook function:
```bash
supabase functions deploy telegram-webhook
```

### 2. Set up the webhook with Telegram:
```bash
curl "https://api.telegram.org/bot6716359942:YOUR_FULL_BOT_TOKEN/setWebhook?url=https://gunwklwxcvayboxjmraz.supabase.co/functions/v1/telegram-webhook"
```

**Replace `YOUR_FULL_BOT_TOKEN` with your complete bot token!**

You should see:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

## How Users Get Their Chat ID (30 seconds)

1. Open Telegram
2. Search for your bot (`@yourbotname`)
3. Send `/start` or `/id`
4. Bot replies with: "🤖 Your Chat ID is: `123456789`"
5. Copy the number and use it in the app!

That's it! Super easy for users. 🎉

## Commands the bot responds to:
- `/start` - Get your chat ID
- `/id` - Get your chat ID

Both do the same thing - just give the user their chat ID!

---

## Alternative: Simple Instructions for Users

If you don't want to set up the webhook, just tell users:

**"To get your Telegram Chat ID:**
1. Start a chat with `@userinfobot` on Telegram
2. It will reply with your ID
3. Copy that number"

`@userinfobot` is a public bot that tells anyone their chat ID!
