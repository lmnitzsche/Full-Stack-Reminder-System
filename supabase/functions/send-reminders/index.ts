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
        user_id,
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
        // Get user profile to check email notification preference
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('email_notifications_enabled')
          .eq('id', reminder.user_id)
          .single()

        // Get user email for email notifications
        const { data: { user } } = await supabaseClient.auth.admin.getUserById(reminder.user_id)
        
        // Create message
        const task = reminder.tasks
        const message = `🔔 *TASK REMINDER*\n\n*${task.title}*${task.description ? `\n\n${task.description}` : ''}`

        let telegramSuccess = false
        let emailSuccess = false
        let errors: string[] = []

        // Send via Telegram (phone_number field now stores chat_id)
        if (reminder.phone_number) {
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
            errors.push(`Telegram: ${telegramData.description || 'Unknown error'}`)
          } else {
            telegramSuccess = true
          }
        }

        // Send via Email if enabled
        if (profile?.email_notifications_enabled && user?.email) {
          try {
            const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
            
            if (RESEND_API_KEY) {
              const emailResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                  from: 'Task Tracker <reminders@logannitzsche.com>',
                  to: user.email,
                  subject: `🔔 Task Reminder: ${task.title}`,
                  html: `
                    <div style="font-family: 'Courier New', monospace; background: #0a0e27; color: #00ff41; padding: 20px; border: 2px solid #00ff41;">
                      <h1 style="color: #00ff41; text-transform: uppercase; letter-spacing: 3px;">🔔 Task Reminder</h1>
                      <div style="margin: 20px 0; padding: 20px; background: #1a1f3a; border: 1px solid #2d3748;">
                        <h2 style="color: #00ff41; margin: 0 0 10px 0;">${task.title}</h2>
                        ${task.description ? `<p style="color: #8b95a5; margin: 0;">${task.description}</p>` : ''}
                      </div>
                      <p style="color: #8b95a5; font-size: 12px; margin-top: 20px;">
                        This is an automated reminder from your Task Tracker system.
                      </p>
                    </div>
                  `
                }),
              })

              const emailData = await emailResponse.json()

              if (!emailResponse.ok) {
                console.error(`Failed to send email to ${user.email}:`, emailResponse.status, emailData)
                errors.push(`Email: ${JSON.stringify(emailData)}`)
              } else {
                console.log(`Email sent successfully to ${user.email}:`, emailData)
                emailSuccess = true
              }
            } else {
              console.log('RESEND_API_KEY not set, skipping email')
              errors.push('Email: RESEND_API_KEY not configured')
            }
          } catch (emailErr) {
            console.error('Email error:', emailErr)
            errors.push(`Email: ${emailErr instanceof Error ? emailErr.message : 'Unknown error'}`)
          }
        }

        // If at least one method succeeded, consider it a success
        if (!telegramSuccess && !emailSuccess && errors.length > 0) {
          results.push({
            reminder_id: reminder.id,
            success: false,
            error: errors.join(', ')
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
          telegram_sent: telegramSuccess,
          email_sent: emailSuccess,
          next_send_at: nextSendAt
        })

      } catch (err) {
        console.error(`Error processing reminder ${reminder.id}:`, err)
        results.push({
          reminder_id: reminder.id,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
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

  } catch (err) {
    console.error('Error in send-reminders function:', err)
    return new Response(JSON.stringify({ 
      error: err instanceof Error ? err.message : 'Unknown error' 
    }), {
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
