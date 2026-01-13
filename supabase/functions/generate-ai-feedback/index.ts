import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
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

const REFERENCE_CRITERIA = `
## REFERENCE-BASED SCORING RUBRICS

Use these industry-standard benchmarks to evaluate each criterion objectively:

### 1. USER EXPERIENCE (UX) - Reference Standards
**Score 5 - Excellent (Reference: Apple Human Interface Guidelines, Material Design 3)**
- Navigation follows platform conventions (iOS/Android/Web standards)
- Touch targets meet minimum 44x44pt (iOS) or 48x48dp (Android) standards
- Visual hierarchy follows F-pattern or Z-pattern reading flow
- Micro-interactions provide feedback within 100ms (per Nielsen Norman Group)
- Accessibility meets WCAG 2.1 AA standards
- Consistent spacing using 8pt grid system

**Score 4 - Good**
- Meets most platform conventions with minor deviations
- Touch targets adequate but not optimal in some areas
- Clear visual hierarchy with occasional inconsistencies
- Feedback present but may exceed 100-300ms threshold

**Score 3 - Average (Industry Baseline)**
- Basic navigation structure present
- Some touch targets below recommended size
- Visual hierarchy partially established
- Feedback delayed or missing in some interactions

**Score 2 - Below Average**
- Navigation confusing or non-standard
- Multiple touch target issues
- Unclear content hierarchy
- Minimal or no interaction feedback

**Score 1 - Poor**
- Fundamental usability violations
- Cannot complete basic tasks intuitively
- No adherence to any design system

### 2. USEFULNESS - Reference Standards
**Score 5 - Excellent (Reference: Jobs-to-be-Done Framework)**
- Solves a clearly defined user problem better than alternatives
- Core functionality accessible within 3 taps/clicks (3-click rule)
- Feature set comparable to top 3 competitors in category
- Provides unique value proposition not available elsewhere
- Time-to-value under 30 seconds for core feature

**Score 4 - Good**
- Solves user problem effectively
- Core features accessible within 4-5 interactions
- Feature parity with mid-tier competitors
- Some differentiation from alternatives

**Score 3 - Average (Industry Baseline)**
- Addresses user need but with friction
- Core features require 5+ interactions
- Basic feature set, missing some competitor features
- Limited differentiation

**Score 2 - Below Average**
- Partially solves user problem
- Cumbersome to access main features
- Missing critical features competitors offer

**Score 1 - Poor**
- Unclear what problem it solves
- Core functionality buried or broken
- No competitive value

### 3. RELIABILITY - Reference Standards
**Score 5 - Excellent (Reference: Google SRE Standards)**
- 99.9%+ uptime expectation (based on observable behavior)
- Error handling follows HTTP status code conventions
- Graceful degradation when features unavailable
- Offline support or clear offline messaging
- Load times under 3 seconds (Core Web Vitals LCP)
- No observable crashes or freezes

**Score 4 - Good**
- Stable performance with rare issues
- Most errors handled gracefully
- Load times 3-5 seconds
- Occasional minor glitches

**Score 3 - Average (Industry Baseline)**
- Generally stable with intermittent issues
- Basic error messages present
- Load times 5-8 seconds
- Some unhandled edge cases

**Score 2 - Below Average**
- Frequent performance issues
- Poor error handling
- Load times exceed 8 seconds
- Multiple reproducible bugs

**Score 1 - Poor**
- Unstable, crashes frequently
- No error handling
- Unacceptable load times
- Core features broken

### 4. DATA HANDLING - Reference Standards
**Score 5 - Excellent (Reference: GDPR, CCPA, OWASP Top 10)**
- Clear privacy policy accessible before data collection
- Explicit consent obtained for data collection (opt-in)
- Data minimization - only collects necessary data
- Secure transmission (HTTPS, certificate valid)
- User data export/deletion options available
- No third-party tracking without disclosure
- Form validation prevents injection attacks

**Score 4 - Good**
- Privacy policy present and accessible
- Consent mechanisms in place
- Mostly necessary data collection
- Secure transmission
- Some data control options

**Score 3 - Average (Industry Baseline)**
- Privacy policy exists but hard to find
- Implicit consent assumed
- Some unnecessary data collection
- HTTPS present
- Limited user data control

**Score 2 - Below Average**
- Vague or missing privacy policy
- No clear consent mechanism
- Excessive data collection
- Security concerns observable

**Score 1 - Poor**
- No privacy information
- Collects data without any disclosure
- Observable security vulnerabilities
- No user data rights

### 5. CLARITY - Reference Standards
**Score 5 - Excellent (Reference: Plain Language Guidelines, Hemingway Readability)**
- Reading level appropriate for target audience (Grade 8 for general public)
- Consistent terminology throughout (style guide adherence)
- Error messages actionable (explain what, why, how to fix)
- Empty states provide guidance
- Microcopy follows UX writing best practices
- Icons paired with labels for critical actions
- No jargon without explanation

**Score 4 - Good**
- Generally clear language
- Mostly consistent terminology
- Helpful error messages
- Some empty state guidance
- Minor clarity issues

**Score 3 - Average (Industry Baseline)**
- Understandable but not optimized
- Some terminology inconsistencies
- Basic error messages
- Limited empty state handling
- Occasional confusing copy

**Score 2 - Below Average**
- Confusing language in multiple areas
- Inconsistent terminology
- Unhelpful error messages
- No empty state guidance

**Score 1 - Poor**
- Incomprehensible or misleading text
- Technical jargon throughout
- Error messages missing or cryptic
- Users cannot understand how to proceed
`;

const SYSTEM_PROMPT = `You are an expert app evaluator using OBJECTIVE, REFERENCE-BASED assessment criteria. Your evaluations must be grounded in industry standards, not subjective opinions.

KEY PRINCIPLES:
1. Compare against specific reference standards (provided below)
2. Cite which benchmarks the app meets or fails to meet
3. Provide measurable, observable evidence for each score
4. Avoid vague language like "good" or "nice" - be specific
5. Reference industry leaders as comparison points when relevant

${REFERENCE_CRITERIA}

When analyzing scores, always explain:
- Which specific reference criteria justify the score
- What observable evidence supports the assessment
- How the app compares to industry benchmarks
- Concrete examples of what would improve the score`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { appUrl, appName, scores, comments }: EvaluationRequest = await req.json();

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const totalScore = Math.round(
      ((scores.ux + scores.usefulness + scores.reliability + scores.dataHandling + scores.clarity) / 25) * 100
    );

    const prompt = `Evaluate this app using the REFERENCE-BASED SCORING RUBRICS provided in your system instructions.

## APP DETAILS
- **Name**: ${appName}
- **URL**: ${appUrl}

## SUBMITTED SCORES (1-5 scale, each worth 20%)
| Criterion | Score | Weight |
|-----------|-------|--------|
| User Experience (UX) | ${scores.ux}/5 | 20% |
| Usefulness | ${scores.usefulness}/5 | 20% |
| Reliability | ${scores.reliability}/5 | 20% |
| Data Handling | ${scores.dataHandling}/5 | 20% |
| Clarity | ${scores.clarity}/5 | 20% |
| **Total Score** | **${totalScore}%** | 100% |

${comments ? `## EVALUATOR NOTES\n${comments}` : ''}

## REQUIRED OUTPUT FORMAT

### 1. Overall Assessment
Provide a 2-3 sentence executive summary comparing this app to industry standards.

### 2. Reference-Based Analysis
For EACH criterion, provide:
- **Score Justification**: Which specific reference benchmarks from the rubric apply
- **Evidence**: Observable behaviors or features that support the score
- **Gap Analysis**: What's missing compared to the reference standard for the next score level
- **Industry Comparison**: How this compares to leading apps in similar categories

### 3. Prioritized Improvements (Ranked by Impact)
List 5 specific, measurable improvements with:
- The reference standard it would help meet
- Expected impact on user experience/business metrics
- Implementation complexity (Low/Medium/High)

### 4. Action Items
Provide a numbered list of concrete next steps the development team should take, ordered by priority.`;

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
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.5,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const openaiData = await openaiResponse.json();
    const feedback = openaiData.choices[0]?.message?.content || 'Unable to generate feedback';

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
        error: error instanceof Error ? error.message : 'Unknown error',
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

  if (actionItems.length === 0) {
    const lines = feedback.split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*[-*]\s*(.+)/);
      if (match && match[1].length > 20) {
        actionItems.push(match[1].trim());
        if (actionItems.length >= 5) break;
      }
    }
  }

  return actionItems;
}
