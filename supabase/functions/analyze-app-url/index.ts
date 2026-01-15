import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalyzeRequest {
    appUrl: string;
    appName: string;
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response(null, {
            status: 200,
            headers: corsHeaders,
        });
    }

    try {
        const { appUrl, appName }: AnalyzeRequest = await req.json();

        const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openaiApiKey) {
            throw new Error('OpenAI API key not configured');
        }

        // First, try to fetch the URL content
        let pageContent = '';
        try {
            const response = await fetch(appUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; AppScoreJudge/1.0)',
                },
            });
            if (response.ok) {
                const html = await response.text();
                // Extract text content (basic extraction)
                pageContent = html
                    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .slice(0, 5000); // Limit content length
            }
        } catch (fetchError) {
            console.log('Could not fetch URL content:', fetchError);
        }

        // Construct prompt for comprehensive analysis
        const prompt = `You are an expert app/website evaluator. Analyze the following application and provide evaluation suggestions.

App Name: ${appName}
App URL: ${appUrl}
${pageContent ? `\nExtracted Page Content:\n${pageContent.slice(0, 3000)}` : '\n(Could not fetch page content - analyze based on URL and name)'}

Evaluate the app on these 5 criteria (1-5 scale):
1. **User Experience (UX)**: Interface design, navigation, accessibility, visual appeal
2. **Usefulness**: Does it solve a problem effectively? Feature completeness
3. **Reliability**: Performance, error handling, loading speed
4. **Data Handling**: Data presentation, forms, validation, security indicators
5. **Clarity**: Purpose clarity, documentation, onboarding

For each criterion, provide:
- A suggested score (1-5)
- A brief explanation (1-2 sentences)
- One improvement suggestion

Also provide:
- Overall strengths (2-3 points)
- Overall weaknesses (2-3 points)
- Priority action items (3-5 items)

Format your response as JSON with this structure:
{
  "scores": {
    "ux": { "score": number, "explanation": string, "suggestion": string },
    "usefulness": { "score": number, "explanation": string, "suggestion": string },
    "reliability": { "score": number, "explanation": string, "suggestion": string },
    "dataHandling": { "score": number, "explanation": string, "suggestion": string },
    "clarity": { "score": number, "explanation": string, "suggestion": string }
  },
  "strengths": [string],
  "weaknesses": [string],
  "actionItems": [string],
  "overallAssessment": string
}`;

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert app evaluator. Analyze apps/websites and provide structured evaluation feedback in JSON format.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 2000,
                temperature: 0.5,
                response_format: { type: 'json_object' }
            }),
        });

        if (!openaiResponse.ok) {
            const errorText = await openaiResponse.text();
            throw new Error(`OpenAI API error: ${errorText}`);
        }

        const openaiData = await openaiResponse.json();
        const responseContent = openaiData.choices[0]?.message?.content;

        let analysis;
        try {
            analysis = JSON.parse(responseContent);
        } catch {
            throw new Error('Failed to parse AI response');
        }

        return new Response(
            JSON.stringify({
                success: true,
                analysis,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error analyzing app URL:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: errorMessage,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            }
        );
    }
});
