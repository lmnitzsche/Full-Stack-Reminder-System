-- Add email_notifications_enabled column to profiles
ALTER TABLE profiles 
ADD COLUMN email_notifications_enabled BOOLEAN DEFAULT FALSE;
