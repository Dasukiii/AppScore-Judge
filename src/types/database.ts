// Database Types for Supabase
// Auto-generated types should be placed here after running: npx supabase gen types typescript

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string;
                    avatar_url: string | null;
                    role: 'user' | 'admin';
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    full_name?: string;
                    avatar_url?: string | null;
                    role?: 'user' | 'admin';
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    full_name?: string;
                    avatar_url?: string | null;
                    role?: 'user' | 'admin';
                    updated_at?: string;
                };
            };
            apps: {
                Row: {
                    id: string;
                    name: string;
                    owner: string;
                    url: string;
                    description: string | null;
                    screenshots: string[];
                    // AI Evaluation Scores (1-5)
                    ux_score: number | null;
                    usefulness_score: number | null;
                    reliability_score: number | null;
                    data_handling_score: number | null;
                    clarity_score: number | null;
                    // Total score (0-100)
                    total_score: number | null;
                    // AI Feedback
                    ai_feedback: string | null;
                    ai_strengths: string[] | null;
                    ai_improvements: string[] | null;
                    ai_action_items: string[] | null;
                    // Score explanations
                    ux_explanation: string | null;
                    usefulness_explanation: string | null;
                    reliability_explanation: string | null;
                    data_handling_explanation: string | null;
                    clarity_explanation: string | null;
                    // Metadata
                    submitted_by: string;
                    evaluated_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    owner: string;
                    url: string;
                    description?: string | null;
                    screenshots?: string[];
                    ux_score?: number | null;
                    usefulness_score?: number | null;
                    reliability_score?: number | null;
                    data_handling_score?: number | null;
                    clarity_score?: number | null;
                    total_score?: number | null;
                    ai_feedback?: string | null;
                    ai_strengths?: string[] | null;
                    ai_improvements?: string[] | null;
                    ai_action_items?: string[] | null;
                    ux_explanation?: string | null;
                    usefulness_explanation?: string | null;
                    reliability_explanation?: string | null;
                    data_handling_explanation?: string | null;
                    clarity_explanation?: string | null;
                    submitted_by?: string | null;
                    evaluated_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    name?: string;
                    owner?: string;
                    url?: string;
                    description?: string | null;
                    screenshots?: string[];
                    ux_score?: number | null;
                    usefulness_score?: number | null;
                    reliability_score?: number | null;
                    data_handling_score?: number | null;
                    clarity_score?: number | null;
                    total_score?: number | null;
                    ai_feedback?: string | null;
                    ai_strengths?: string[] | null;
                    ai_improvements?: string[] | null;
                    ai_action_items?: string[] | null;
                    ux_explanation?: string | null;
                    usefulness_explanation?: string | null;
                    reliability_explanation?: string | null;
                    data_handling_explanation?: string | null;
                    clarity_explanation?: string | null;
                    evaluated_at?: string | null;
                    updated_at?: string;
                };
            };
        };
        Views: {
            app_leaderboard: {
                Row: {
                    id: string;
                    name: string;
                    owner: string;
                    url: string;
                    total_score: number;
                    ux_score: number;
                    usefulness_score: number;
                    reliability_score: number;
                    data_handling_score: number;
                    clarity_score: number;
                    ai_feedback: string | null;
                    evaluated_at: string;
                    created_at: string;
                    rank: number;
                };
            };
        };
        Functions: {
            calculate_total_score: {
                Args: {
                    ux: number;
                    usefulness: number;
                    reliability: number;
                    data_handling: number;
                    clarity: number;
                };
                Returns: number;
            };
        };
    };
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type App = Database['public']['Tables']['apps']['Row'];
export type AppInsert = Database['public']['Tables']['apps']['Insert'];
export type AppUpdate = Database['public']['Tables']['apps']['Update'];
export type LeaderboardApp = Database['public']['Views']['app_leaderboard']['Row'];

// Extended types for UI
export interface AppWithScores extends App {
    scores: {
        ux: number;
        usefulness: number;
        reliability: number;
        dataHandling: number;
        clarity: number;
    };
}

export interface AIEvaluationResult {
    totalScore: number;
    scores: {
        ux: { score: number; explanation: string };
        usefulness: { score: number; explanation: string };
        reliability: { score: number; explanation: string };
        dataHandling: { score: number; explanation: string };
        clarity: { score: number; explanation: string };
    };
    overallAssessment: string;
    strengths: string[];
    improvements: string[];
    actionItems: string[];
}
