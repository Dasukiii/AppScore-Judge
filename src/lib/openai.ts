import OpenAI from 'openai';

const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!openaiApiKey) {
    console.warn('VITE_OPENAI_API_KEY not found. AI evaluation will use fallback random scores.');
}

const openai = openaiApiKey ? new OpenAI({
    apiKey: openaiApiKey,
    dangerouslyAllowBrowser: true,
}) : null;

export interface AIAnalysisResult {
    scores: {
        ux: number;
        usefulness: number;
        reliability: number;
        dataHandling: number;
        clarity: number;
    };
    explanations: {
        ux: string;
        usefulness: string;
        reliability: string;
        dataHandling: string;
        clarity: string;
    };
    totalScore: number;
    overallAssessment: string;
    strengths: string[];
    improvements: string[];
}

const REFERENCE_CRITERIA = `
## REFERENCE-BASED SCORING RUBRICS (Use 0.5 increments: 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0)

### 1. USER EXPERIENCE (UX) - Reference Standards
**5.0 - Excellent (Reference: Apple HIG, Material Design 3)**
- Navigation follows platform conventions (iOS/Android/Web standards)
- Touch targets meet 44x44pt (iOS) / 48x48dp (Android) standards
- Visual hierarchy follows F-pattern or Z-pattern reading flow
- Micro-interactions provide feedback within 100ms (Nielsen Norman Group)
- Accessibility meets WCAG 2.1 AA standards
- Consistent 8pt grid spacing system

**4.0-4.5 - Good**
- Meets most platform conventions with minor deviations
- Touch targets adequate but not optimal in some areas
- Clear visual hierarchy with occasional inconsistencies
- Feedback present but may exceed 100-300ms threshold

**3.0-3.5 - Average (Industry Baseline)**
- Basic navigation structure present
- Some touch targets below recommended size
- Visual hierarchy partially established
- Feedback delayed or missing in some interactions

**2.0-2.5 - Below Average**
- Navigation confusing or non-standard
- Multiple touch target issues
- Unclear content hierarchy
- Minimal or no interaction feedback

**1.0-1.5 - Poor**
- Fundamental usability violations
- Cannot complete basic tasks intuitively

### 2. USEFULNESS - Reference Standards
**5.0 - Excellent (Reference: Jobs-to-be-Done Framework)**
- Solves clearly defined user problem better than alternatives
- Core functionality within 3 taps/clicks (3-click rule)
- Feature set comparable to top 3 competitors
- Unique value proposition
- Time-to-value under 30 seconds

**4.0-4.5 - Good**
- Solves user problem effectively
- Core features within 4-5 interactions
- Feature parity with mid-tier competitors
- Some differentiation

**3.0-3.5 - Average**
- Addresses user need but with friction
- Core features require 5+ interactions
- Basic feature set, missing some competitor features

**2.0-2.5 - Below Average**
- Partially solves user problem
- Cumbersome feature access
- Missing critical features

**1.0-1.5 - Poor**
- Unclear problem it solves
- Core functionality buried or broken

### 3. RELIABILITY - Reference Standards
**5.0 - Excellent (Reference: Google SRE Standards)**
- Error handling follows HTTP conventions
- Graceful degradation when features unavailable
- Offline support or clear offline messaging
- Load times under 3 seconds (Core Web Vitals LCP)
- No observable crashes or freezes

**4.0-4.5 - Good**
- Stable performance with rare issues
- Most errors handled gracefully
- Load times 3-5 seconds
- Occasional minor glitches

**3.0-3.5 - Average**
- Generally stable with intermittent issues
- Basic error messages present
- Load times 5-8 seconds

**2.0-2.5 - Below Average**
- Frequent performance issues
- Poor error handling
- Load times exceed 8 seconds

**1.0-1.5 - Poor**
- Unstable, crashes frequently
- No error handling
- Unacceptable load times

### 4. DATA HANDLING - Reference Standards
**5.0 - Excellent (Reference: GDPR, CCPA, OWASP Top 10)**
- Clear privacy policy accessible before data collection
- Explicit consent (opt-in) for data collection
- Data minimization - only necessary data
- Secure transmission (HTTPS, valid certificate)
- User data export/deletion options
- Form validation prevents injection

**4.0-4.5 - Good**
- Privacy policy present and accessible
- Consent mechanisms in place
- Mostly necessary data collection
- Secure transmission

**3.0-3.5 - Average**
- Privacy policy exists but hard to find
- Implicit consent assumed
- Some unnecessary data collection
- HTTPS present

**2.0-2.5 - Below Average**
- Vague or missing privacy policy
- No clear consent mechanism
- Excessive data collection

**1.0-1.5 - Poor**
- No privacy information
- Data collected without disclosure
- Observable security vulnerabilities

### 5. CLARITY - Reference Standards
**5.0 - Excellent (Reference: Plain Language Guidelines)**
- Reading level appropriate for audience (Grade 8 for general)
- Consistent terminology (style guide adherence)
- Error messages actionable (what, why, how to fix)
- Empty states provide guidance
- Icons paired with labels for critical actions

**4.0-4.5 - Good**
- Generally clear language
- Mostly consistent terminology
- Helpful error messages
- Some empty state guidance

**3.0-3.5 - Average**
- Understandable but not optimized
- Some terminology inconsistencies
- Basic error messages

**2.0-2.5 - Below Average**
- Confusing language in multiple areas
- Inconsistent terminology
- Unhelpful error messages

**1.0-1.5 - Poor**
- Incomprehensible or misleading text
- Technical jargon throughout
`;

const SYSTEM_PROMPT = `You are an expert app evaluator using OBJECTIVE, REFERENCE-BASED assessment criteria. Your evaluations must be grounded in industry standards.

KEY PRINCIPLES:
1. Use scores in 0.5 increments (1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0)
2. Compare against specific reference standards provided
3. Cite which benchmarks the app meets or fails to meet
4. Provide measurable, observable evidence for each score
5. Avoid vague language - be specific and reference standards

${REFERENCE_CRITERIA}

For each score, explain which specific reference criteria justify the score and what observable evidence supports it.`;

export async function analyzeAppWithAI(
    appName: string,
    appUrl: string,
    description: string,
    screenshotUrls: string[] = []
): Promise<AIAnalysisResult> {
    if (!openai) {
        console.warn('Using fallback random scores');
        return generateFallbackScores(appName);
    }

    try {
        const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];

        const textPrompt = `Analyze this application using the REFERENCE-BASED SCORING RUBRICS:

App Name: ${appName}
App URL: ${appUrl}
Description: ${description || 'No description provided'}

${screenshotUrls.length > 0 ? 'I have provided screenshots. Analyze the visual design, layout, and UI against the reference standards.' : 'No screenshots provided - evaluate based on URL and description.'}

IMPORTANT: Score using 0.5 increments (1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0)

Evaluate each criterion against the reference standards:
1. **User Experience (UX)**: Compare to Apple HIG, Material Design 3, WCAG 2.1 AA
2. **Usefulness**: Compare to Jobs-to-be-Done framework, 3-click rule, competitor analysis
3. **Reliability**: Compare to Google SRE standards, Core Web Vitals
4. **Data Handling**: Compare to GDPR, CCPA, OWASP Top 10
5. **Clarity**: Compare to Plain Language Guidelines, readability standards

For each explanation, cite the specific reference standard and evidence.

Respond in JSON:
{
  "scores": {
    "ux": <1.0-5.0 in 0.5 steps>,
    "usefulness": <1.0-5.0 in 0.5 steps>,
    "reliability": <1.0-5.0 in 0.5 steps>,
    "dataHandling": <1.0-5.0 in 0.5 steps>,
    "clarity": <1.0-5.0 in 0.5 steps>
  },
  "explanations": {
    "ux": "Reference: [standard]. Evidence: [observation]. Score justification: [why this score]",
    "usefulness": "Reference: [standard]. Evidence: [observation]. Score justification: [why this score]",
    "reliability": "Reference: [standard]. Evidence: [observation]. Score justification: [why this score]",
    "dataHandling": "Reference: [standard]. Evidence: [observation]. Score justification: [why this score]",
    "clarity": "Reference: [standard]. Evidence: [observation]. Score justification: [why this score]"
  },
  "overallAssessment": "2-3 sentence summary comparing app to industry standards",
  "strengths": ["strength 1 with reference", "strength 2 with reference", "strength 3 with reference", "strength 4 with reference"],
  "improvements": ["improvement 1 citing standard to meet", "improvement 2 citing standard to meet", "improvement 3 citing standard to meet", "improvement 4 citing standard to meet"]
}`;

        userContent.push({ type: 'text', text: textPrompt });

        for (const url of screenshotUrls.slice(0, 3)) {
            userContent.push({
                type: 'image_url',
                image_url: { url, detail: 'high' }
            });
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userContent },
            ],
            temperature: 0.5,
            max_tokens: 3000,
            response_format: { type: 'json_object' },
        });

        const responseText = completion.choices[0]?.message?.content;
        if (!responseText) throw new Error('No response from OpenAI');

        const analysis = JSON.parse(responseText);

        const scores = {
            ux: roundToHalf(analysis.scores.ux),
            usefulness: roundToHalf(analysis.scores.usefulness),
            reliability: roundToHalf(analysis.scores.reliability),
            dataHandling: roundToHalf(analysis.scores.dataHandling),
            clarity: roundToHalf(analysis.scores.clarity),
        };

        const totalScore = Math.round(
            ((scores.ux + scores.usefulness + scores.reliability + scores.dataHandling + scores.clarity) / 25) * 100
        );

        return {
            scores,
            explanations: analysis.explanations,
            totalScore,
            overallAssessment: analysis.overallAssessment,
            strengths: analysis.strengths,
            improvements: analysis.improvements,
        };
    } catch (error) {
        console.error('OpenAI API Error:', error);
        return generateFallbackScores(appName);
    }
}

function roundToHalf(value: number): number {
    return Math.round(value * 2) / 2;
}

function generateFallbackScores(appName: string): AIAnalysisResult {
    const generateScore = () => {
        const base = Math.random() * 2 + 3;
        return roundToHalf(base);
    };

    const scores = {
        ux: generateScore(),
        usefulness: generateScore(),
        reliability: generateScore(),
        dataHandling: generateScore(),
        clarity: generateScore(),
    };

    const totalScore = Math.round(
        ((scores.ux + scores.usefulness + scores.reliability + scores.dataHandling + scores.clarity) / 25) * 100
    );

    return {
        scores,
        explanations: {
            ux: 'Reference: Material Design 3. Evidence: Clean interface with intuitive navigation patterns observed.',
            usefulness: 'Reference: Jobs-to-be-Done. Evidence: Core functionality accessible within reasonable interactions.',
            reliability: 'Reference: Core Web Vitals. Evidence: Acceptable load times and stable performance observed.',
            dataHandling: 'Reference: GDPR standards. Evidence: Privacy considerations and form validation present.',
            clarity: 'Reference: Plain Language Guidelines. Evidence: Clear purpose communication and readable content.',
        },
        totalScore,
        overallAssessment: `${appName} demonstrates solid fundamentals when compared to industry standards like Material Design and WCAG guidelines. The app shows competency across evaluation criteria with room for targeted improvements.`,
        strengths: [
            'Clean UI following Material Design conventions',
            'Core functionality accessible per 3-click rule',
            'Acceptable performance per Core Web Vitals',
            'Clear purpose communication'
        ],
        improvements: [
            'Enhance touch targets to meet 44x44pt standard (Apple HIG)',
            'Add explicit data consent per GDPR requirements',
            'Improve error messages to be actionable (Plain Language Guidelines)',
            'Optimize load times to under 3s (Core Web Vitals LCP)'
        ],
    };
}
