// Supabase Edge Function for admin broadcast to all Telegram users
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
    const { message } = await req.json()

    if (!message) {
      return new Response(JSON.stringify({ error: 'Missing message' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all users with Telegram chat IDs
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('telegram_chat_id')
      .not('telegram_chat_id', 'is', null)

    if (profilesError) {
      console.error('Profiles error:', profilesError)
      return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Broadcasting to ${profiles?.length || 0} users`)

    const results = []
    
    // Send to all users
    for (const profile of profiles || []) {
      try {
        console.log(`Sending to chat ID: ${profile.telegram_chat_id}`)
        
        const telegramResponse = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: profile.telegram_chat_id,
              text: `🎯 Spin Wheel Result:\n\n${message}`,
              parse_mode: 'Markdown',
            }),
          }
        )

        const telegramData = await telegramResponse.json()
        console.log(`Response for ${profile.telegram_chat_id}:`, telegramData)

        if (telegramResponse.ok && telegramData.ok) {
          results.push({ chat_id: profile.telegram_chat_id, success: true })
        } else {
          results.push({ 
            chat_id: profile.telegram_chat_id, 
            success: false, 
            error: telegramData.description 
          })
        }
      } catch (error) {
        console.error(`Error sending to ${profile.telegram_chat_id}:`, error)
        results.push({ 
          chat_id: profile.telegram_chat_id, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const totalCount = results.length

    console.log(`Broadcast complete: ${successCount}/${totalCount} successful`)

    return new Response(JSON.stringify({ 
      success: true,
      sent: successCount,
      total: totalCount,
      results
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})