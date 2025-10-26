# Telegram Setup - Quick Reference

## 1. Create Bot (2 min)
1. Message `@BotFather` on Telegram
2. Send `/newbot`
3. Follow prompts
4. **Save bot token**

## 2. Get Your Chat ID (1 min)
1. Start your bot (send `/start`)
2. Visit: `https://api.telegram.org/botYOUR_TOKEN/getUpdates`
3. Find `"chat":{"id":123456789}` in JSON
4. **Save chat_id**

## 3. Deploy (5 min)

```bash
# Install CLI
brew install supabase/tap/supabase

# Login and link
supabase login
supabase link --project-ref gunwklwxcvayboxjmraz

# Set bot token
supabase secrets set TELEGRAM_BOT_TOKEN=your_token_here

# Deploy
supabase functions deploy send-reminders
```

## 4. Set Up Cron Job (2 min)

In Supabase SQL Editor:

```sql
select cron.schedule(
  'send-reminders-every-minute',
  '* * * * *',
  $$
  select net.http_post(
    url:='https://gunwklwxcvayboxjmraz.supabase.co/functions/v1/send-reminders',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  ) as request_id;
  $$
);
```

## 5. Test (1 min)
1. Create task in app
2. Add reminder with your **chat_id** (not phone number!)
3. Wait for Telegram notification! 📱

## Useful Commands

```bash
# Check logs
supabase functions logs send-reminders

# Test bot token
curl https://api.telegram.org/botYOUR_TOKEN/getMe

# List secrets
supabase secrets list

# Check cron jobs
# Run in Supabase SQL Editor:
SELECT * FROM cron.job;
```

## Troubleshooting

**No messages?**
- Make sure you sent `/start` to your bot
- Check chat_id is correct
- Verify bot token is set: `supabase secrets list`
- Check logs: `supabase functions logs send-reminders`

**Function errors?**
- Make sure cron job has correct anon key
- Check function deployed: `supabase functions list`
