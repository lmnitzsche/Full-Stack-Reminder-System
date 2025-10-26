-- ============================================
-- FIX AUTHENTICATION AND USER ISOLATION
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Enable all operations for tasks" ON tasks;
DROP POLICY IF EXISTS "Enable all operations for reminders" ON reminders;
DROP POLICY IF EXISTS "Enable all operations for user_settings" ON user_settings;
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view their own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can create their own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can update their own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can delete their own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can create their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;

-- Step 2: Delete all existing tasks and reminders (clean slate)
-- This is the easiest solution - removes all old data
DELETE FROM reminders;
DELETE FROM tasks;

-- Step 3: Drop and recreate user_id columns with proper constraints
ALTER TABLE tasks DROP COLUMN IF EXISTS user_id;
ALTER TABLE tasks ADD COLUMN user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE reminders DROP COLUMN IF EXISTS user_id;
ALTER TABLE reminders ADD COLUMN user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 3: Create indexes for performance
DROP INDEX IF EXISTS idx_tasks_user_id;
DROP INDEX IF EXISTS idx_reminders_user_id;
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_reminders_user_id ON reminders(user_id);

-- Step 4: Enable RLS on all tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS Policies for Tasks
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Step 6: Create RLS Policies for Reminders
CREATE POLICY "Users can view their own reminders" ON reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders" ON reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" ON reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" ON reminders
  FOR DELETE USING (auth.uid() = user_id);

-- Step 7: Create RLS Policies for User Settings
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid()::text = user_id);

-- ============================================
-- VERIFICATION QUERIES (Run these separately to check)
-- ============================================

-- Check policies are created
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd 
-- FROM pg_policies 
-- WHERE tablename IN ('tasks', 'reminders', 'user_settings');

-- Check user_id columns exist and are NOT NULL
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name IN ('tasks', 'reminders') AND column_name = 'user_id';
