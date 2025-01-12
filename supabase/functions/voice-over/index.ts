import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const formData = await req.formData()
    const file = formData.get('file') as File
    const language = formData.get('language') as string

    if (!file) {
      throw new Error('No file provided')
    }

    // Read the file content
    const text = await file.text()

    // Select voice based on language (using a default voice for now)
    const voiceId = 'EXAVITQu4vr4xnSDxMaL' // Sarah's voice ID

    // Call ElevenLabs API to generate audio
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': Deno.env.get('ELEVEN_LABS_API_KEY') ?? '',
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          }
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`ElevenLabs API error: ${error}`)
    }

    const audioBuffer = await response.arrayBuffer()
    
    // Upload the audio file to Supabase Storage
    const audioFileName = `${crypto.randomUUID()}.mp3`
    const { error: uploadError } = await supabase.storage
      .from('shared_files')
      .upload(audioFileName, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: false
      })

    if (uploadError) {
      throw uploadError
    }

    // Create a record in the shared_files table
    const { data: fileData, error: fileError } = await supabase
      .from('shared_files')
      .insert({
        filename: `voice_over_${file.name}.mp3`,
        file_path: audioFileName,
        content_type: 'audio/mpeg',
        file_size: audioBuffer.byteLength,
        uploader_id: (await req.json()).userId,
      })
      .select()
      .single()

    if (fileError) {
      throw fileError
    }

    // Create a job record
    const { error: jobError } = await supabase
      .from('jobs')
      .insert({
        file_id: fileData.id,
        language,
        payment_amount: Math.floor(Math.random() * 1000),
        status: 'completed',
        is_premium_translation: true,
        returned_file_id: fileData.id,
        returned_at: new Date().toISOString(),
      })

    if (jobError) {
      throw jobError
    }

    return new Response(
      JSON.stringify({ fileId: fileData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})