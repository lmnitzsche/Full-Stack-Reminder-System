-- Add admin role to profiles table
ALTER TABLE profiles 
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN profiles.is_admin IS 'Whether this user has admin privileges';

-- You can manually set your user as admin by running:
-- UPDATE profiles SET is_admin = TRUE WHERE id = 'your-user-id';