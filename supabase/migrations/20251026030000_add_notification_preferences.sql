-- Add notification preference columns to profiles
ALTER TABLE profiles 
ADD COLUMN telegram_notifications_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN email_notifications_enabled_v2 BOOLEAN DEFAULT FALSE;

-- Migrate existing email_notifications_enabled to new column
UPDATE profiles 
SET email_notifications_enabled_v2 = email_notifications_enabled;

-- Drop old column
ALTER TABLE profiles 
DROP COLUMN email_notifications_enabled;

-- Rename new column
ALTER TABLE profiles 
RENAME COLUMN email_notifications_enabled_v2 TO email_notifications_enabled;

-- Add comment
COMMENT ON COLUMN profiles.telegram_notifications_enabled IS 'Whether user wants to receive Telegram notifications';
COMMENT ON COLUMN profiles.email_notifications_enabled IS 'Whether user wants to receive email notifications';
