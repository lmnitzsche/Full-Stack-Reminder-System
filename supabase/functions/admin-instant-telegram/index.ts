// Supabase Edge Function for admin instant Telegram messaging
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders
    })
  }

  try {
    const { userId, message } = await req.json()

    if (!userId || !message) {
      return new Response(JSON.stringify({ error: 'Missing userId or message' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user's Telegram chat ID
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('telegram_chat_id')
      .eq('id', userId)
      .single()

    if (profileError || !profile?.telegram_chat_id) {
      return new Response(JSON.stringify({ error: 'User has no Telegram chat ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Sending message to chat ID: ${profile.telegram_chat_id}`)

    // Send message via Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: profile.telegram_chat_id,
          text: `📢 Admin Message:\n\n${message}`,
          parse_mode: 'Markdown',
        }),
      }
    )

    const telegramData = await telegramResponse.json()
    console.log('Telegram response:', telegramData)

    if (!telegramResponse.ok || !telegramData.ok) {
      console.error('Failed to send Telegram message:', telegramData)
      return new Response(JSON.stringify({ error: `Telegram error: ${telegramData.description || 'Unknown error'}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ success: true, telegramResponse: telegramData }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: `Internal server error: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})