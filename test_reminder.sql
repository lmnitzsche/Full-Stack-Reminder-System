-- Create a test reminder that fires in 2 minutes
-- First check what user_id to use (replace with your actual user_id)
SELECT id, email FROM auth.users;

-- Then create a test reminder (REPLACE 'YOUR_USER_ID' with your actual user ID from above)
-- Also make sure you have a task_id (check tasks table)

-- Example:
-- INSERT INTO reminders (
--   user_id,
--   task_id,
--   phone_number, -- Your Telegram chat_id
--   next_send_at,
--   is_active,
--   is_recurring,
--   exact_datetime
-- ) VALUES (
--   'YOUR_USER_ID',
--   'YOUR_TASK_ID',
--   'YOUR_TELEGRAM_CHAT_ID',
--   NOW() + INTERVAL '2 minutes',
--   true,
--   false,
--   NOW() + INTERVAL '2 minutes'
-- );

-- Check if cron is running by looking at recent job runs:
SELECT 
  jobname,
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-reminders-every-minute')
ORDER BY start_time DESC 
LIMIT 10;
