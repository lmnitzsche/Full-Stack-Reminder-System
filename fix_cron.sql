-- Delete the existing broken cron job
SELECT cron.unschedule('send-reminders-every-minute');

-- Enable pg_net extension if not already enabled (needed for http calls)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Recreate the cron job with the correct setup
SELECT cron.schedule(
  'send-reminders-every-minute',
  '* * * * *',
  $$
  SELECT
    net.http_post(
      url:='https://gunwklwxcvayboxjmraz.supabase.co/functions/v1/send-reminders',
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1bndrbHd4Y3ZheWJveGptcmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0Mzg4NjUsImV4cCI6MjA3NzAxNDg2NX0.iASkcEMOQhtvLlW-PEc9KYCZx1QvgU49-kkK523d5ic'
      ),
      body:='{}'::jsonb
    );
  $$
);

-- Verify it was created
SELECT jobid, jobname, schedule, active FROM cron.job WHERE jobname = 'send-reminders-every-minute';
