import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, history } = await req.json();
    console.log('Received message:', message);
    console.log('Chat history:', history);

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Convert roles to match Gemini's expected format
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: msg.content,
    }));

    console.log('Formatted history:', formattedHistory);

    const chat = model.startChat({
      history: formattedHistory,
    });

    console.log('Sending message to Gemini API...');
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    console.log('Received response from Gemini API:', text);

    return new Response(
      JSON.stringify({ response: text }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});