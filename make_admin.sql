-- To make yourself an admin, replace 'YOUR_USER_ID_HERE' with your actual user ID
-- You can find your user ID by going to Settings in the app, or by running this query first:
-- SELECT id, email FROM auth.users;

-- Make yourself an admin (replace the ID below)
UPDATE profiles 
SET is_admin = TRUE 
WHERE id = 'YOUR_USER_ID_HERE';

-- To find your user ID, you can also check in the Supabase Auth dashboard
-- or run: SELECT id FROM auth.users WHERE email = 'your@email.com';