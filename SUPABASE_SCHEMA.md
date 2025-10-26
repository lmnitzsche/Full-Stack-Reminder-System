# Supabase Database Schema

## Setup Instructions

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL commands below to create the necessary tables

## SQL Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminders table
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  
  -- Exact date/time for one-time reminders
  exact_datetime TIMESTAMP WITH TIME ZONE,
  
  -- Time of day (24-hour format, e.g., "14:30" for 2:30 PM)
  time_of_day TEXT,
  
  -- Days of week (JSON array, e.g., ["monday", "wednesday", "friday"])
  days_of_week JSONB,
  
  -- Recurring settings
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_type TEXT, -- 'daily', 'weekly', 'monthly', 'custom'
  
  -- Status tracking
  is_active BOOLEAN DEFAULT TRUE,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  next_send_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user settings table for default phone number
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL,
  default_phone_number TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_reminders_task_id ON reminders(task_id);
CREATE INDEX idx_reminders_next_send ON reminders(next_send_at) WHERE is_active = TRUE;
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust these based on your authentication setup)
-- For now, allowing all operations for development
CREATE POLICY "Enable all operations for tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Enable all operations for reminders" ON reminders FOR ALL USING (true);
CREATE POLICY "Enable all operations for user_settings" ON user_settings FOR ALL USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## SMS Reminder Implementation

For SMS reminders, you'll need to set up a serverless function (Supabase Edge Function or similar) that:

1. Polls the `reminders` table for reminders where `next_send_at <= NOW()` and `is_active = TRUE`
2. Sends SMS via Twilio (recommended) or another SMS provider
3. Updates `last_sent_at` and calculates the next `next_send_at` for recurring reminders

### Twilio Setup (Recommended)

1. Sign up for a Twilio account
2. Get your Account SID and Auth Token
3. Purchase a phone number
4. Add these to your Supabase secrets/environment variables
5. Use Twilio's REST API to send SMS messages

### Example Twilio Edge Function (Supabase)

```javascript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  )

  // Get due reminders
  const { data: reminders } = await supabase
    .from('reminders')
    .select('*, tasks(*)')
    .lte('next_send_at', new Date().toISOString())
    .eq('is_active', true)

  // Send SMS for each reminder using Twilio
  // ... Twilio implementation here

  return new Response(JSON.stringify({ processed: reminders?.length || 0 }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

## Table Relationships

- `reminders.task_id` → `tasks.id` (Many reminders can belong to one task)
- `user_settings.user_id` → User identifier (from your auth system)
