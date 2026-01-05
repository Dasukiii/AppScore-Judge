// Supabase Edge Function: Generate AI Feedback
// Deploy with: supabase functions deploy generate-ai-feedback

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EvaluationRequest {
    appUrl: string;
    appName: string;
    scores: {
        ux: number;
        usefulness: number;
        reliability: number;
        dataHandling: number;
        clarity: number;
    };
    comments?: string;
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { appUrl, appName, scores, comments }: EvaluationRequest = await req.json();

        const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openaiApiKey) {
            throw new Error('OpenAI API key not configured');
        }

        // Construct prompt for OpenAI
        const prompt = `You are an expert app evaluator. Analyze the following evaluation scores and provide comprehensive feedback.

App Name: ${appName}
App URL: ${appUrl}

Evaluation Scores (1-5 scale, each worth 20% of total):
- User Experience (UX): ${scores.ux}/5
- Usefulness: ${scores.usefulness}/5
- Reliability: ${scores.reliability}/5
- Data Handling: ${scores.dataHandling}/5
- Clarity: ${scores.clarity}/5

${comments ? `Evaluator Comments: ${comments}` : ''}

Please provide:
1. **Overall Assessment**: A brief summary of the app's strengths and weaknesses
2. **Detailed Analysis**: Insights for each criterion based on the scores
3. **Recommended Improvements**: 3-5 specific, actionable improvement suggestions
4. **Action Items**: A prioritized list of next steps the development team should take

Format your response in markdown with clear sections.`;

        // Call OpenAI API
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional app evaluation expert. Provide constructive, actionable feedback based on evaluation scores.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1500,
                temperature: 0.7,
            }),
        });

        if (!openaiResponse.ok) {
            const errorText = await openaiResponse.text();
            throw new Error(`OpenAI API error: ${errorText}`);
        }

        const openaiData = await openaiResponse.json();
        const feedback = openaiData.choices[0]?.message?.content || 'Unable to generate feedback';

        // Extract action items from the feedback (simple parsing)
        const actionItems = extractActionItems(feedback);

        return new Response(
            JSON.stringify({
                success: true,
                feedback,
                actionItems,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );
    } catch (error) {
        console.error('Error generating AI feedback:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            }
        );
    }
});

function extractActionItems(feedback: string): string[] {
    const actionItems: string[] = [];

    // Look for numbered lists in the Action Items section
    const actionSection = feedback.match(/Action Items:?([\s\S]*?)(?=\n##|\n\*\*|$)/i);
    if (actionSection) {
        const lines = actionSection[1].split('\n');
        for (const line of lines) {
            const match = line.match(/^\s*\d+\.\s*(.+)/);
            if (match) {
                actionItems.push(match[1].trim());
            }
        }
    }

    // If no action items found, extract from numbered improvement suggestions
    if (actionItems.length === 0) {
        const lines = feedback.split('\n');
        for (const line of lines) {
            const match = line.match(/^\s*[-•]\s*(.+)/);
            if (match && match[1].length > 20) {
                actionItems.push(match[1].trim());
                if (actionItems.length >= 5) break;
            }
        }
    }

    return actionItems;
}
