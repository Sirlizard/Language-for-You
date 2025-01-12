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
    const userId = formData.get('userId') as string

    if (!file || !language || !userId) {
      throw new Error('Missing required fields')
    }

    console.log('Processing file:', file.name, 'for language:', language)

    // Read the file content
    const text = await file.text()

    // Select voice based on language (using a default voice for now)
    const voiceId = 'EXAVITQu4vr4xnSDxMaL' // Sarah's voice ID

    console.log('Calling ElevenLabs API...')

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
      console.error('ElevenLabs API error:', error)
      throw new Error(`ElevenLabs API error: ${error}`)
    }

    console.log('Audio generated successfully, uploading to Supabase Storage...')

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
      console.error('Storage upload error:', uploadError)
      throw uploadError
    }

    console.log('Audio file uploaded, creating database record...')

    // Create a record in the shared_files table
    const { data: fileData, error: fileError } = await supabase
      .from('shared_files')
      .insert({
        filename: `voice_over_${file.name}.mp3`,
        file_path: audioFileName,
        content_type: 'audio/mpeg',
        file_size: audioBuffer.byteLength,
        uploader_id: userId,
      })
      .select()
      .single()

    if (fileError) {
      console.error('Database insert error:', fileError)
      throw fileError
    }

    console.log('Database record created successfully')

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
      console.error('Job creation error:', jobError)
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