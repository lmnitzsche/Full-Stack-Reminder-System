# Authentication Setup - SQL Updates

## Run these SQL commands in your Supabase SQL Editor

```sql
-- 1. Add user_id column to tasks table
ALTER TABLE tasks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Add user_id to reminders table (for direct filtering if needed)
ALTER TABLE reminders ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Update existing rows (for development - sets a dummy user_id)
-- Skip this if you haven't created any tasks yet, or delete existing tasks first

-- 4. Make user_id required for new entries
ALTER TABLE tasks ALTER COLUMN user_id SET NOT NULL;

-- 5. Create index on user_id for better performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_reminders_user_id ON reminders(user_id);

-- 6. Update RLS policies to be user-specific
DROP POLICY IF EXISTS "Enable all operations for tasks" ON tasks;
DROP POLICY IF EXISTS "Enable all operations for reminders" ON reminders;
DROP POLICY IF EXISTS "Enable all operations for user_settings" ON user_settings;

-- Tasks policies
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Reminders policies
CREATE POLICY "Users can view their own reminders" ON reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders" ON reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" ON reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" ON reminders
  FOR DELETE USING (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid()::text = user_id);
```

## Important Note

After running these SQL commands, you need to:
1. Enable Email auth in Supabase Dashboard → Authentication → Providers → Email
2. Configure email templates (optional but recommended)
3. Set Site URL in Authentication settings to your deployment URL

## For Development

If you have existing tasks and want to keep them, you'll need to:
1. Create a user account first
2. Get the user's UUID from the auth.users table
3. Update existing tasks with that user_id before making it NOT NULL
