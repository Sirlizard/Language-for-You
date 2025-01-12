import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { jobId } = await req.json()

    if (!jobId) {
      throw new Error('Job ID is required')
    }

    console.log('Processing translation for job:', jobId)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select(`
        *,
        shared_files!file_id (*)
      `)
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      console.error('Error fetching job:', jobError)
      throw new Error('Failed to fetch job details')
    }

    console.log('Retrieved job details:', job)

    // Download the original file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('shared_files')
      .download(job.shared_files.file_path)

    if (downloadError) {
      console.error('Error downloading file:', downloadError)
      throw new Error('Failed to download file')
    }

    // Read file content
    const text = await fileData.text()
    console.log('File content retrieved, length:', text.length)

    // Call Gemini API for translation
    console.log('Calling Gemini API for translation')
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': Deno.env.get('GEMINI_API_KEY') ?? '',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Translate the following text from ${job.source_language} to ${job.target_language}:\n\n${text}`,
          }],
        }],
      }),
    })

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error:', errorText)
      throw new Error('Translation failed')
    }

    const translationResult = await geminiResponse.json()
    const translatedText = translationResult.candidates[0].content.parts[0].text
    console.log('Translation completed, length:', translatedText.length)

    // Create a new file with translated content
    const translatedFile = new File(
      [translatedText],
      `translated_${job.shared_files.filename}`,
      { type: job.shared_files.content_type }
    )

    // Upload translated file
    const translatedFilePath = `translated_${crypto.randomUUID()}_${job.shared_files.filename}`
    const { error: uploadError } = await supabase.storage
      .from('shared_files')
      .upload(translatedFilePath, translatedFile)

    if (uploadError) {
      console.error('Error uploading translated file:', uploadError)
      throw new Error('Failed to upload translated file')
    }

    console.log('Translated file uploaded successfully')

    // Create new shared file record
    const { data: sharedFile, error: sharedFileError } = await supabase
      .from('shared_files')
      .insert({
        filename: `translated_${job.shared_files.filename}`,
        file_path: translatedFilePath,
        content_type: job.shared_files.content_type,
        file_size: translatedText.length,
        uploader_id: job.shared_files.uploader_id,
      })
      .select()
      .single()

    if (sharedFileError) {
      console.error('Error creating shared file record:', sharedFileError)
      throw new Error('Failed to create shared file record')
    }

    // Update job with translated file and status
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        returned_file_id: sharedFile.id,
        returned_at: new Date().toISOString(),
        status: 'completed'  // Changed from 'premium_translation_completed' to 'completed'
      })
      .eq('id', jobId)

    if (updateError) {
      console.error('Error updating job:', updateError)
      throw new Error('Failed to update job')
    }

    console.log('Job updated successfully')

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Translation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})