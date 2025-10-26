-- Create a test reminder that will fire in 1 minute
-- First get your user_id and a task_id
SELECT 
  u.id as user_id,
  u.email,
  t.id as task_id,
  t.title
FROM auth.users u
CROSS JOIN LATERAL (
  SELECT id, title 
  FROM tasks 
  WHERE user_id = u.id 
  LIMIT 1
) t
WHERE u.email IS NOT NULL;

-- Use the values from above to create a test reminder
-- Replace the IDs below with your actual values
/*
INSERT INTO reminders (
  user_id,
  task_id,
  phone_number,
  next_send_at,
  is_active,
  is_recurring,
  exact_datetime
) VALUES (
  'YOUR_USER_ID_HERE',
  'YOUR_TASK_ID_HERE',
  'YOUR_TELEGRAM_CHAT_ID',
  NOW() + INTERVAL '1 minute',
  true,
  false,
  NOW() + INTERVAL '1 minute'
);
*/

-- Check if your profile has email notifications enabled
SELECT 
  u.email,
  p.email_notifications_enabled,
  p.telegram_chat_id
FROM auth.users u
JOIN profiles p ON p.id = u.id;
