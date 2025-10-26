-- First, check existing cron jobs
SELECT * FROM cron.job;

-- Delete the old cron job if it exists
SELECT cron.unschedule('send-reminders-every-minute');

-- Create new cron job with current anon key
SELECT cron.schedule(
  'send-reminders-every-minute',
  '* * * * *', -- Every minute
  $$
  SELECT
    net.http_post(
      url:='https://gunwklwxcvayboxjmraz.supabase.co/functions/v1/send-reminders',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1bndrbHd4Y3ZheWJveGptcmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0Mzg4NjUsImV4cCI6MjA3NzAxNDg2NX0.iASkcEMOQhtvLlW-PEc9KYCZx1QvgU49-kkK523d5ic"}'::jsonb,
      body:='{}'::jsonb
    ) AS request_id;
  $$
);

-- Verify it was created
SELECT * FROM cron.job WHERE jobname = 'send-reminders-every-minute';

-- Check recent runs
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-reminders-every-minute')
ORDER BY start_time DESC 
LIMIT 5;
