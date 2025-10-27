# Per-Reminder Notification Method Update

## What Changed

Users can now choose the notification method **for each individual reminder**:
- **Telegram only** - Send this reminder via Telegram
- **Email only** - Send this reminder via email
- **Both** - Send this reminder via both Telegram and Email

Previously, the system only supported Telegram notifications.

## How It Works

### Creating/Editing Reminders
When creating or editing a reminder, users can now:
1. Select **Send Via** dropdown with options:
   - Telegram Only
   - Email Only
   - Both Telegram & Email
2. If Telegram is selected (or Both), the Telegram Chat ID field is required
3. If Email is selected (or Both), reminders will be sent to the user's email address

### Settings Page
The Settings page has been simplified:
- Users just configure their **Telegram Chat ID** (optional)
- This Chat ID is used as a fallback if a reminder doesn't have one
- No global notification preferences needed since it's per-reminder

### Backend Behavior
The `send-reminders` Edge Function now:
1. Reads the `notification_method` field from each reminder
2. Sends via Telegram if method is 'telegram' or 'both'
3. Sends via Email if method is 'email' or 'both'
4. Uses chat ID from the reminder, or falls back to the user's profile

## Database Changes

New migration: `20251026031500_add_reminder_notification_method.sql`

Added column to `reminders` table:
- `notification_method` (TEXT, default 'telegram', CHECK constraint for valid values)
- Valid values: 'telegram', 'email', 'both'

Previous migration `20251026030000_add_notification_preferences.sql` added columns to profiles that are no longer used for notification preferences.

## User Experience

1. **Flexibility**: Each task reminder can use a different notification method
2. **Examples**:
   - Important work task → Both Telegram & Email
   - Quick daily reminder → Telegram only
   - Weekly report → Email only
3. **Validation**: System ensures Telegram Chat ID is provided when needed

## Files Changed

- `supabase/migrations/20251026031500_add_reminder_notification_method.sql` - Database schema
- `src/components/ReminderForm.jsx` - Added notification method dropdown and conditional validation
- `src/components/Settings.jsx` - Simplified to just Telegram Chat ID (removed toggle checkboxes)
- `supabase/functions/send-reminders/index.ts` - Respects per-reminder notification_method field
