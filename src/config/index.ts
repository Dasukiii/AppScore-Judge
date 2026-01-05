// Supabase Configuration
// Replace these with your actual Supabase project credentials
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// OpenAI Configuration for AI features
export const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

// App Configuration
export const APP_CONFIG = {
    name: 'AppScore Judge',
    description: 'Smart App Evaluation Platform',
    version: '1.0.0',
};

// Evaluation Criteria Weights (must sum to 100)
export const EVALUATION_WEIGHTS = {
    ux: 20,           // User Experience
    usefulness: 20,   // Usefulness
    reliability: 20,  // Reliability
    dataHandling: 20, // Data Handling
    clarity: 20,      // Clarity
} as const;

// Evaluation Status Types
export const EVALUATION_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
} as const;
