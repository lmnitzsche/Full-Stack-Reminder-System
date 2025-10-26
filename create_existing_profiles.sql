-- Create profiles for existing users
INSERT INTO profiles (id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;
