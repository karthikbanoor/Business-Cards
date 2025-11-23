import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { image } = await req.json()

        if (!image) {
            throw new Error('No image provided')
        }

        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
        console.log("Gemini API Key present:", !!GEMINI_API_KEY);

        if (!GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set')
        }

        // Prepare the request to Gemini API
        // Using gemini-2.0-flash as it is available and fast
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: "Extract the following fields from the business card image: Name, Job Title, Company Name, Email, Phone, Website, Address. Return ONLY raw JSON. Do not include markdown formatting like ```json." },
                            {
                                inline_data: {
                                    mime_type: "image/jpeg",
                                    data: image
                                }
                            }
                        ]
                    }]
                }),
            }
        )

        const data = await response.json()

        if (data.error) {
            console.error("Gemini API Error:", JSON.stringify(data.error));
            throw new Error(`Gemini API Error: ${data.error.message}`)
        }

        const text = data.candidates[0].content.parts[0].text
        let extractedData;
        try {
            extractedData = JSON.parse(text);
        } catch (e) {
            // Fallback if Gemini returns markdown code blocks despite instructions
            const match = text.match(/```json\s*([\s\S]*?)\s*```/);
            if (match) {
                extractedData = JSON.parse(match[1]);
            } else {
                extractedData = { raw_text: text };
            }
        }

        return new Response(
            JSON.stringify(extractedData),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error: any) {
        console.error("Edge Function Error:", error.message);

        // If model not found, try to list available models to help debug
        let availableModels = "Could not fetch models";
        try {
            const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
            if (GEMINI_API_KEY) {
                const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
                const listData = await listResp.json();
                if (listData.models) {
                    availableModels = listData.models.map((m: any) => m.name).join(', ');
                }
            }
        } catch (e) {
            console.error("Failed to list models:", e);
        }

        return new Response(
            JSON.stringify({
                error: error.message,
                details: "If you see 'model not found', here are the available models for your key: " + availableModels
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    }
})
