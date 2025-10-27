-- Add notification_method column to reminders table to specify how each reminder should be sent
ALTER TABLE reminders
ADD COLUMN notification_method TEXT DEFAULT 'telegram' CHECK (notification_method IN ('telegram', 'email', 'both'));

-- Update existing reminders to use 'telegram' as default
UPDATE reminders 
SET notification_method = 'telegram'
WHERE notification_method IS NULL;

-- Add comment
COMMENT ON COLUMN reminders.notification_method IS 'How this reminder should be sent: telegram, email, or both';
