import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ExportRequest {
    appId?: string;
    appIds?: string[];
    exportAll?: boolean;
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response(null, {
            status: 200,
            headers: corsHeaders,
        });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { appId, appIds, exportAll }: ExportRequest = await req.json();

        let query = supabase
            .from("apps")
            .select("*")
            .not("total_score", "is", null);

        if (appId) {
            query = query.eq("id", appId);
        } else if (appIds && appIds.length > 0) {
            query = query.in("id", appIds);
        } else if (!exportAll) {
            throw new Error("Either appId, appIds, or exportAll must be provided");
        }

        const { data: apps, error } = await query.order("total_score", { ascending: false });

        if (error) {
            throw new Error(`Database error: ${error.message}`);
        }

        if (!apps || apps.length === 0) {
            throw new Error("No apps found");
        }

        const html = generateReportHTML(apps);

        return new Response(
            JSON.stringify({
                success: true,
                html,
                apps,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error) {
        console.error("Error exporting PDF:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            }
        );
    }
});

function generateReportHTML(apps: any[]): string {
    const criteriaLabels: Record<string, string> = {
        ux_score: "User Experience",
        usefulness_score: "Usefulness",
        reliability_score: "Reliability",
        data_handling_score: "Data Handling",
        clarity_score: "Clarity",
    };

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
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
      background: #ffffff;
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
    .app-report {
      margin-bottom: 40px;
      padding: 24px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: #f8fafc;
      page-break-inside: avoid;
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
    .app-meta a {
      color: #4f46e5;
      text-decoration: none;
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
      font-weight: 600;
    }
    .score-item .score {
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
    }
    .section {
      margin-top: 20px;
      padding: 16px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .section h3 {
      font-size: 14px;
      color: #4f46e5;
      margin-bottom: 8px;
      text-transform: uppercase;
      font-weight: 700;
    }
    .section p, .section li {
      font-size: 14px;
      color: #475569;
      white-space: pre-line;
    }
    .section ul {
      list-style: none;
      padding-left: 0;
    }
    .section li {
      padding: 4px 0;
      padding-left: 20px;
      position: relative;
    }
    .section li:before {
      content: '•';
      position: absolute;
      left: 8px;
      color: #4f46e5;
      font-weight: bold;
    }
    .strengths {
      background: #f0fdf4;
      border-color: #86efac;
    }
    .strengths h3 {
      color: #16a34a;
    }
    .strengths li:before {
      color: #16a34a;
    }
    .improvements {
      background: #fff7ed;
      border-color: #fed7aa;
    }
    .improvements h3 {
      color: #ea580c;
    }
    .improvements li:before {
      color: #ea580c;
    }
    .explanation-grid {
      display: grid;
      gap: 12px;
      margin-top: 20px;
    }
    .explanation-item {
      padding: 12px;
      background: white;
      border-radius: 8px;
      border-left: 3px solid #4f46e5;
    }
    .explanation-item h4 {
      font-size: 13px;
      color: #1e293b;
      margin-bottom: 4px;
      font-weight: 600;
    }
    .explanation-item p {
      font-size: 13px;
      color: #64748b;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #94a3b8;
    }
    @media print {
      body { padding: 20px; }
      .app-report { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>AppScore Judge</h1>
    <p>AI-Powered Application Evaluation Report • Generated on ${formatDate(new Date().toISOString())}</p>
  </div>

  ${apps
        .map(
            (app) => `
    <div class="app-report">
      <div class="app-header">
        <div>
          <h2>${app.name}</h2>
        </div>
        <div class="total-score">${app.total_score}%</div>
      </div>

      <div class="app-meta">
        <strong>Owner:</strong> ${app.owner} •
        <strong>URL:</strong> <a href="${app.url}">${app.url}</a> •
        <strong>Evaluated:</strong> ${formatDate(app.evaluated_at || app.created_at)}
      </div>

      ${app.description ? `
        <div class="section">
          <h3>Description</h3>
          <p>${app.description}</p>
        </div>
      ` : ""}

      <div class="scores-grid">
        ${Object.entries(criteriaLabels)
                    .map(
                        ([key, label]) => `
          <div class="score-item">
            <label>${label}</label>
            <div class="score">${app[key]}/5</div>
          </div>
        `
                    )
                    .join("")}
      </div>

      ${app.ux_explanation || app.usefulness_explanation || app.reliability_explanation || app.data_handling_explanation || app.clarity_explanation ? `
        <div class="section">
          <h3>Score Explanations</h3>
          <div class="explanation-grid">
            ${app.ux_explanation ? `
              <div class="explanation-item">
                <h4>User Experience</h4>
                <p>${app.ux_explanation}</p>
              </div>
            ` : ""}
            ${app.usefulness_explanation ? `
              <div class="explanation-item">
                <h4>Usefulness</h4>
                <p>${app.usefulness_explanation}</p>
              </div>
            ` : ""}
            ${app.reliability_explanation ? `
              <div class="explanation-item">
                <h4>Reliability</h4>
                <p>${app.reliability_explanation}</p>
              </div>
            ` : ""}
            ${app.data_handling_explanation ? `
              <div class="explanation-item">
                <h4>Data Handling</h4>
                <p>${app.data_handling_explanation}</p>
              </div>
            ` : ""}
            ${app.clarity_explanation ? `
              <div class="explanation-item">
                <h4>Clarity</h4>
                <p>${app.clarity_explanation}</p>
              </div>
            ` : ""}
          </div>
        </div>
      ` : ""}

      ${app.ai_feedback ? `
        <div class="section">
          <h3>AI-Generated Feedback</h3>
          <p>${app.ai_feedback}</p>
        </div>
      ` : ""}

      ${app.ai_strengths && app.ai_strengths.length > 0 ? `
        <div class="section strengths">
          <h3>Strengths</h3>
          <ul>
            ${app.ai_strengths.map((strength: string) => `<li>${strength}</li>`).join("")}
          </ul>
        </div>
      ` : ""}

      ${app.ai_improvements && app.ai_improvements.length > 0 ? `
        <div class="section improvements">
          <h3>Areas for Improvement</h3>
          <ul>
            ${app.ai_improvements.map((improvement: string) => `<li>${improvement}</li>`).join("")}
          </ul>
        </div>
      ` : ""}
    </div>
  `
        )
        .join("")}

  <div class="footer">
    <p>© 2026 AppScore Judge. All rights reserved.</p>
    <p style="margin-top: 8px;">AI-Powered evaluations using GPT-4o & GPT-4o-mini</p>
  </div>
</body>
</html>
  `;
}