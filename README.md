# Task Tracker with SMS Reminders

A modern React task management application with intelligent SMS reminders powered by Supabase.

## Features

- ✅ **Task Management**: Create, edit, delete, and mark tasks as complete
- 📱 **SMS Reminders**: Set up phone reminders for your tasks
- ⏰ **Flexible Scheduling**: 
  - One-time reminders with exact date and time
  - Recurring reminders (daily, weekly, monthly)
  - Specific time of day selection
  - Day of week selection for weekly reminders
- 📊 **Task Statistics**: Track active, completed, and total tasks
- 🎨 **Beautiful UI**: Clean, modern, mobile-friendly interface
- 🔄 **Real-time Updates**: Powered by Supabase

## Setup Instructions

### 1. Install Dependencies

The dependencies are already installed, but if you need to reinstall:

```bash
npm install
```

### 2. Set Up Supabase

1. Create a free account at [https://supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings → API
4. Copy your project URL and anon/public key

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 4. Create Database Tables

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and run the SQL commands from `SUPABASE_SCHEMA.md`

This will create:
- `tasks` table - stores your tasks
- `reminders` table - stores reminder settings
- `user_settings` table - stores user preferences

### 5. Run the Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173` (or the next available port).

## SMS Implementation

To actually send SMS messages, you'll need to set up a backend service. The recommended approach is to use:

### Option 1: Supabase Edge Functions + Twilio (Recommended)

1. **Sign up for Twilio**:
   - Go to [https://twilio.com](https://twilio.com)
   - Get your Account SID, Auth Token, and a phone number

2. **Create a Supabase Edge Function**:
   ```bash
   npx supabase functions new send-reminders
   ```

3. **Implement the function** (see example in `SUPABASE_SCHEMA.md`)

4. **Set up a cron job** to run the function periodically:
   - Use Supabase's pg_cron extension
   - Or use an external service like Vercel Cron or Upstash QStash

### Option 2: Separate Backend Service

- Create a Node.js/Python service that polls the database
- Use Twilio, AWS SNS, or another SMS provider
- Deploy on Vercel, Railway, or similar platforms

## Project Structure

```
src/
├── components/
│   ├── TaskForm.jsx       # Form to create/edit tasks
│   ├── TaskList.jsx       # List view with filters
│   ├── TaskItem.jsx       # Individual task display
│   └── ReminderForm.jsx   # Reminder configuration UI
├── lib/
│   └── supabase.js        # Supabase client setup
├── App.jsx                # Main application component
├── App.css                # Main styles
└── main.jsx               # Application entry point
```

## Usage

### Creating a Task

1. Fill in the task title (required) and description (optional)
2. Click "Create Task"
3. Optionally add a reminder:
   - Enter your phone number (with country code)
   - Choose between one-time or recurring
   - Set the time and frequency
   - Click "Add Reminder" or "Skip and finish"

### Managing Tasks

- **Complete**: Check the checkbox next to a task
- **Edit**: Click the pencil icon (✏️)
- **Delete**: Click the trash icon (🗑️)
- **Filter**: Use the All/Active/Completed buttons

### Reminder Types

1. **One-time Reminder**:
   - Select exact date and time
   - Perfect for specific deadlines

2. **Daily Recurring**:
   - Runs every day at specified time
   - Great for daily habits

3. **Weekly Recurring**:
   - Choose specific days of the week
   - Select time of day
   - Ideal for weekly routines

4. **Monthly Recurring**:
   - Runs once per month
   - Good for monthly tasks

## Mobile Optimization

The app is fully responsive and works great on mobile devices. All touch interactions are optimized for mobile use.

## Technologies Used

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Supabase** - Backend and database
- **date-fns** - Date manipulation
- **CSS3** - Styling with CSS variables

## Troubleshooting

### Can't connect to Supabase
- Verify your `.env` file has correct credentials
- Make sure you've created the database tables
- Check browser console for specific errors

### Reminders not showing
- Ensure you've run the SQL schema
- Check that reminders were created successfully in the database
- Verify the relationship between tasks and reminders

### Node.js version issues
If you see Node.js version warnings:
- The app should still work for development
- For production, consider upgrading to Node.js 20.19+ or 22.12+
- Or use an older version of Vite

## Next Steps

- [ ] Set up SMS sending with Twilio
- [ ] Add user authentication
- [ ] Implement reminder history tracking
- [ ] Add task categories/tags
- [ ] Create a dark mode toggle
- [ ] Add task priorities
- [ ] Implement search functionality

## License

MIT

## Support

For issues or questions, please check the Supabase documentation:
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Twilio SMS Docs](https://www.twilio.com/docs/sms)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
