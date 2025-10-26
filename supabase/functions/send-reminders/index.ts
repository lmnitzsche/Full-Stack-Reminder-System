// Supabase Edge Function to send Telegram reminders
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')

serve(async (req) => {
  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get current time
    const now = new Date().toISOString()

    // Find all active reminders that need to be sent
    const { data: reminders, error } = await supabaseClient
      .from('reminders')
      .select(`
        id,
        phone_number,
        next_send_at,
        is_recurring,
        recurrence_type,
        time_of_day,
        days_of_week,
        exact_datetime,
        task_id,
        tasks (
          title,
          description
        )
      `)
      .eq('is_active', true)
      .lte('next_send_at', now)

    if (error) {
      console.error('Error fetching reminders:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!reminders || reminders.length === 0) {
      return new Response(JSON.stringify({ message: 'No reminders to send' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const results = []

    // Send each reminder
    for (const reminder of reminders) {
      try {
        // Create message
        const task = reminder.tasks
        const message = `🔔 *TASK REMINDER*\n\n*${task.title}*${task.description ? `\n\n${task.description}` : ''}`

        // Send via Telegram (phone_number field now stores chat_id)
        const telegramResponse = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: reminder.phone_number, // This is actually the Telegram chat_id
              text: message,
              parse_mode: 'Markdown',
            }),
          }
        )

        const telegramData = await telegramResponse.json()

        if (!telegramResponse.ok || !telegramData.ok) {
          console.error(`Failed to send Telegram message to ${reminder.phone_number}:`, telegramData)
          results.push({
            reminder_id: reminder.id,
            success: false,
            error: telegramData.description || 'Unknown error'
          })
          continue
        }

        // Calculate next send time
        let nextSendAt = null
        let shouldDeactivate = false

        if (reminder.is_recurring) {
          // Calculate next occurrence for recurring reminders
          nextSendAt = calculateNextOccurrence(reminder)
        } else {
          // One-time reminder, deactivate it
          shouldDeactivate = true
        }

        // Update reminder in database
        const updateData: any = {
          last_sent_at: now,
        }

        if (shouldDeactivate) {
          updateData.is_active = false
        } else if (nextSendAt) {
          updateData.next_send_at = nextSendAt
        }

        await supabaseClient
          .from('reminders')
          .update(updateData)
          .eq('id', reminder.id)

        results.push({
          reminder_id: reminder.id,
          success: true,
          chat_id: reminder.phone_number,
          next_send_at: nextSendAt
        })

      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error)
        results.push({
          reminder_id: reminder.id,
          success: false,
          error: error.message
        })
      }
    }

    return new Response(JSON.stringify({
      message: `Processed ${reminders.length} reminders`,
      results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in send-reminders function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

function calculateNextOccurrence(reminder: any): string {
  const now = new Date()
  const [hours, minutes] = reminder.time_of_day.split(':').map(Number)

  if (reminder.recurrence_type === 'daily') {
    // Next occurrence is tomorrow at the same time
    const next = new Date(now)
    next.setDate(next.getDate() + 1)
    next.setHours(hours, minutes, 0, 0)
    return next.toISOString()
  }

  if (reminder.recurrence_type === 'weekly') {
    // Find next occurrence based on selected days
    const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const selectedDays = JSON.parse(reminder.days_of_week || '[]')
    const selectedDayIndices = selectedDays.map((day: string) => dayOrder.indexOf(day))

    let daysToAdd = 1
    const next = new Date(now)

    // Keep adding days until we find a selected day
    while (daysToAdd <= 7) {
      next.setDate(now.getDate() + daysToAdd)
      const dayIndex = next.getDay()
      
      if (selectedDayIndices.includes(dayIndex)) {
        next.setHours(hours, minutes, 0, 0)
        return next.toISOString()
      }
      
      daysToAdd++
    }

    // Fallback: add 1 day
    next.setDate(now.getDate() + 1)
    next.setHours(hours, minutes, 0, 0)
    return next.toISOString()
  }

  // Fallback
  const next = new Date(now)
  next.setDate(next.getDate() + 1)
  next.setHours(hours, minutes, 0, 0)
  return next.toISOString()
}
