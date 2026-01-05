// Supabase Edge Function: Export Evaluation Report as PDF
// Deploy with: supabase functions deploy export-pdf

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportRequest {
    evaluationId?: string;
    appId?: string;
    dateFrom?: string;
    dateTo?: string;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { evaluationId, appId, dateFrom, dateTo }: ExportRequest = await req.json();

        // Fetch evaluation data
        let query = supabase
            .from('evaluations')
            .select(`
        *,
        app:apps (
          id,
          name,
          owner,
          url,
          description
        )
      `);

        if (evaluationId) {
            query = query.eq('id', evaluationId);
        } else if (appId) {
            query = query.eq('app_id', appId);
        }

        if (dateFrom) {
            query = query.gte('created_at', dateFrom);
        }
        if (dateTo) {
            query = query.lte('created_at', dateTo);
        }

        const { data: evaluations, error } = await query.order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Database error: ${error.message}`);
        }

        if (!evaluations || evaluations.length === 0) {
            throw new Error('No evaluations found');
        }

        // Generate HTML for PDF
        const html = generateReportHTML(evaluations);

        // For now, return HTML that can be converted to PDF client-side
        // In production, you could use a service like Puppeteer or a PDF API
        return new Response(
            JSON.stringify({
                success: true,
                html,
                evaluations,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );
    } catch (error) {
        console.error('Error exporting PDF:', error);
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

function generateReportHTML(evaluations: any[]): string {
    const criteriaLabels: Record<string, string> = {
        ux_score: 'User Experience',
        usefulness_score: 'Usefulness',
        reliability_score: 'Reliability',
        data_handling_score: 'Data Handling',
        clarity_score: 'Clarity',
    };

    const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AppScore Judge - Evaluation Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e2e8f0;
    }
    .header h1 {
      font-size: 28px;
      color: #4f46e5;
      margin-bottom: 8px;
    }
    .header p {
      color: #64748b;
      font-size: 14px;
    }
    .evaluation {
      margin-bottom: 40px;
      padding: 24px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: #f8fafc;
    }
    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .app-header h2 {
      font-size: 22px;
      color: #1e293b;
    }
    .total-score {
      font-size: 32px;
      font-weight: 700;
      color: #4f46e5;
    }
    .app-meta {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 20px;
    }
    .scores-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .score-item {
      text-align: center;
      padding: 12px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .score-item label {
      display: block;
      font-size: 11px;
      color: #64748b;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    .score-item .score {
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
    }
    .feedback {
      margin-top: 20px;
      padding: 16px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .feedback h3 {
      font-size: 14px;
      color: #4f46e5;
      margin-bottom: 8px;
    }
    .feedback p {
      font-size: 14px;
      color: #475569;
      white-space: pre-line;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>AppScore Judge</h1>
    <p>Evaluation Report • Generated on ${formatDate(new Date().toISOString())}</p>
  </div>

  ${evaluations.map(evaluation => `
    <div class="evaluation">
      <div class="app-header">
        <div>
          <h2>${evaluation.app?.name || 'Unknown App'}</h2>
        </div>
        <div class="total-score">${evaluation.total_score}%</div>
      </div>
      
      <div class="app-meta">
        <strong>Owner:</strong> ${evaluation.app?.owner || 'N/A'} • 
        <strong>URL:</strong> ${evaluation.app?.url || 'N/A'} • 
        <strong>Evaluated:</strong> ${formatDate(evaluation.created_at)}
      </div>

      <div class="scores-grid">
        ${Object.entries(criteriaLabels).map(([key, label]) => `
          <div class="score-item">
            <label>${label}</label>
            <div class="score">${evaluation[key]}/5</div>
          </div>
        `).join('')}
      </div>

      ${evaluation.ai_feedback ? `
        <div class="feedback">
          <h3>AI-Generated Feedback</h3>
          <p>${evaluation.ai_feedback}</p>
        </div>
      ` : ''}

      ${evaluation.comments ? `
        <div class="feedback">
          <h3>Evaluator Comments</h3>
          <p>${evaluation.comments}</p>
        </div>
      ` : ''}
    </div>
  `).join('')}

  <div class="footer">
    <p>© 2026 AppScore Judge. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}
