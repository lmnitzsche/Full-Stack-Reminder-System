// Supabase Edge Function - Bot webhook to get user chat IDs
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')

serve(async (req) => {
  try {
    const body = await req.json()
    
    // Check if it's a message
    if (body.message && body.message.text) {
      const chatId = body.message.chat.id
      const text = body.message.text
      
      // Respond to /start or /id commands
      if (text === '/start' || text === '/id') {
        const responseMessage = `🤖 Your Chat ID is: \`${chatId}\`\n\nCopy this number and paste it when creating a reminder in the Task Tracker app!`
        
        await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: responseMessage,
              parse_mode: 'Markdown'
            })
          }
        )
      }
    }
    
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ ok: false }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
