import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText,
    User,
    Link as LinkIcon,
    ImagePlus,
    X,
    CheckCircle,
    ArrowLeft,
    AlertCircle,
    Brain,
    Sparkles,
    Star,
    BarChart3
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { analyzeAppWithAI, type AIAnalysisResult } from '@/lib/openai';

interface FormData {
    name: string;
    owner: string;
    url: string;
    description: string;
    screenshots: File[];
}

type SubmissionState = 'form' | 'evaluating' | 'results';

export function SubmitApp() {
    const { user } = useAuth();
    const [state, setState] = useState<SubmissionState>('form');
    const [formData, setFormData] = useState<FormData>({
        name: '',
        owner: '',
        url: '',
        description: '',
        screenshots: [],
    });
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [evaluationProgress, setEvaluationProgress] = useState(0);
    const [evaluationStep, setEvaluationStep] = useState('');
    const [evaluationResult, setEvaluationResult] = useState<AIAnalysisResult | null>(null);
    const [appId, setAppId] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + formData.screenshots.length > 5) {
            setError('Maximum 5 screenshots allowed');
            return;
        }

        const validFiles = files.filter((file) => {
            if (!file.type.startsWith('image/')) {
                setError('Only image files are allowed');
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('Each file must be under 5MB');
                return false;
            }
            return true;
        });

        setFormData((prev) => ({
            ...prev,
            screenshots: [...prev.screenshots, ...validFiles],
        }));

        validFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrls((prev) => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
        setError('');
    };

    const removeScreenshot = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            screenshots: prev.screenshots.filter((_, i) => i !== index),
        }));
        setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const performEvaluation = async () => {
        // Step 1: Upload screenshots to Supabase Storage
        setEvaluationProgress(10);
        setEvaluationStep('Uploading screenshots...');

        const uploadedScreenshotUrls: string[] = [];

        if (formData.screenshots.length > 0) {
            for (const file of formData.screenshots) {
                try {
                    const fileName = `${user?.id}/${Date.now()}-${file.name}`;
                    const { data, error } = await supabase.storage
                        .from('screenshots')
                        .upload(fileName, file, {
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (error) {
                        console.error('Screenshot upload error:', error);
                        continue;
                    }

                    // Get public URL
                    const { data: urlData } = supabase.storage
                        .from('screenshots')
                        .getPublicUrl(data.path);

                    if (urlData?.publicUrl) {
                        uploadedScreenshotUrls.push(urlData.publicUrl);
                    }
                } catch (err) {
                    console.error('Error uploading screenshot:', err);
                }
            }
        }

        // Step 2: AI Analysis (with Vision if screenshots uploaded)
        setEvaluationProgress(30);
        setEvaluationStep(uploadedScreenshotUrls.length > 0
            ? 'AI is analyzing your screenshots with Vision...'
            : 'AI is analyzing your app...');

        await new Promise((resolve) => setTimeout(resolve, 300));

        setEvaluationProgress(50);
        setEvaluationStep('Evaluating user experience and design...');

        // Call OpenAI API with screenshots for Vision analysis
        const aiResult = await analyzeAppWithAI(
            formData.name,
            formData.url,
            formData.description,
            uploadedScreenshotUrls // Pass screenshot URLs for Vision
        );

        setEvaluationResult(aiResult);

        // Step 3: Save to database
        setEvaluationProgress(85);
        setEvaluationStep('Saving to database...');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const appData: any = {
            name: formData.name,
            owner: formData.owner,
            url: formData.url,
            description: formData.description || null,
            screenshots: uploadedScreenshotUrls,
            ux_score: aiResult.scores.ux,
            usefulness_score: aiResult.scores.usefulness,
            reliability_score: aiResult.scores.reliability,
            data_handling_score: aiResult.scores.dataHandling,
            clarity_score: aiResult.scores.clarity,
            total_score: aiResult.totalScore,
            ai_feedback: aiResult.overallAssessment,
            ai_strengths: aiResult.strengths,
            ai_improvements: aiResult.improvements,
            ux_explanation: aiResult.explanations.ux,
            usefulness_explanation: aiResult.explanations.usefulness,
            reliability_explanation: aiResult.explanations.reliability,
            data_handling_explanation: aiResult.explanations.dataHandling,
            clarity_explanation: aiResult.explanations.clarity,
            submitted_by: user?.id || null,
            evaluated_at: new Date().toISOString(),
        };

        const { data: savedApp, error: dbError } = await supabase
            .from('apps')
            .insert(appData)
            .select()
            .single();

        if (dbError) {
            throw new Error(`Database error: ${dbError.message}`);
        }

        setAppId((savedApp as { id: string }).id);

        // Complete
        setEvaluationProgress(100);
        setEvaluationStep('Evaluation complete!');
        await new Promise((resolve) => setTimeout(resolve, 500));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate
        try {
            new URL(formData.url);
        } catch {
            setError('Please enter a valid URL (e.g., https://example.com)');
            return;
        }

        if (!user) {
            setError('You must be logged in to submit an app');
            return;
        }

        // Start evaluation
        setState('evaluating');

        try {
            await performEvaluation();
            setState('results');
        } catch (err) {
            console.error('Evaluation error:', err);
            setError(err instanceof Error ? err.message : 'Evaluation failed');
            setState('form');
        }
    };

    const criteriaLabels: Record<string, string> = {
        ux: 'User Experience',
        usefulness: 'Usefulness',
        reliability: 'Reliability',
        dataHandling: 'Data Handling',
        clarity: 'Clarity',
    };

    // Evaluation in progress screen
    if (state === 'evaluating') {
        return (
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl shadow-lg border border-[var(--color-border)] p-10 text-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] flex items-center justify-center mx-auto mb-6"
                    >
                        <Brain className="text-white" size={40} />
                    </motion.div>

                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                        AI Evaluation in Progress
                    </h2>
                    <p className="text-[var(--color-text-secondary)] mb-8">
                        Our AI is analyzing <span className="font-semibold text-[var(--color-primary-600)]">{formData.name}</span>
                    </p>

                    {/* Progress Bar */}
                    <div className="relative h-4 bg-[var(--color-surface-elevated)] rounded-full overflow-hidden mb-4">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${evaluationProgress}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] rounded-full"
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--color-text-muted)]">{evaluationStep}</span>
                        <span className="font-semibold text-[var(--color-primary-600)]">{evaluationProgress}%</span>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-2 text-sm text-[var(--color-text-muted)]">
                        <Sparkles size={16} className="text-[var(--color-primary-500)]" />
                        <span>Powered by GPT-4o</span>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Results screen
    if (state === 'results' && evaluationResult) {
        const getScoreColor = (score: number) => {
            if (score >= 4) return 'text-green-600';
            if (score >= 3) return 'text-yellow-600';
            return 'text-orange-600';
        };

        return (
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Success Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white flex items-center gap-4"
                >
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                        <CheckCircle size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Evaluation Complete!</h2>
                        <p className="text-white/80">Your app has been evaluated by AI and saved to your library</p>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Score Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-primary-800)] rounded-2xl p-6 text-white"
                    >
                        <h3 className="text-lg font-semibold mb-4">{formData.name}</h3>
                        <div className="text-6xl font-bold mb-2">{evaluationResult.totalScore}%</div>
                        <p className="text-white/70">Overall Score</p>
                        <div className="mt-4 pt-4 border-t border-white/20">
                            <p className="text-sm text-white/80">by {formData.owner}</p>
                        </div>
                    </motion.div>

                    {/* Score Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-[var(--color-border)] p-6"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="text-[var(--color-primary-600)]" size={20} />
                            <h3 className="font-semibold text-[var(--color-text-primary)]">Score Breakdown</h3>
                        </div>
                        <div className="space-y-3">
                            {Object.entries(evaluationResult.scores).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-3">
                                    <span className="w-32 text-sm text-[var(--color-text-secondary)]">
                                        {criteriaLabels[key]}
                                    </span>
                                    <div className="flex-1">
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(value / 5) * 100}%` }}
                                                transition={{ duration: 0.8, delay: 0.3 }}
                                                className="h-full bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] rounded-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={14}
                                                className={star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
                                            />
                                        ))}
                                    </div>
                                    <span className={`font-semibold w-8 text-right ${getScoreColor(value)}`}>
                                        {value}/5
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* AI Assessment */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-md border border-[var(--color-border)] p-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Brain className="text-[var(--color-primary-600)]" size={20} />
                        <h3 className="font-semibold text-[var(--color-text-primary)]">AI Assessment</h3>
                    </div>
                    <p className="text-[var(--color-text-secondary)]">{evaluationResult.overallAssessment}</p>
                </motion.div>

                {/* Strengths & Improvements */}
                <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-green-50 rounded-2xl border border-green-200 p-6"
                    >
                        <h3 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                            <CheckCircle size={18} />
                            Strengths
                        </h3>
                        <ul className="space-y-2">
                            {evaluationResult.strengths.map((strength, i) => (
                                <li key={i} className="text-green-700 text-sm flex items-start gap-2">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                    {strength}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-orange-50 rounded-2xl border border-orange-200 p-6"
                    >
                        <h3 className="font-semibold text-orange-800 mb-4 flex items-center gap-2">
                            <Sparkles size={18} />
                            Areas for Improvement
                        </h3>
                        <ul className="space-y-2">
                            {evaluationResult.improvements.map((improvement, i) => (
                                <li key={i} className="text-orange-700 text-sm flex items-start gap-2">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                                    {improvement}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center justify-center gap-4"
                >
                    <Link to={`/results/${appId}`} className="btn btn-secondary cursor-pointer">
                        View Full Report
                    </Link>
                    <Link to="/library" className="btn btn-secondary cursor-pointer">
                        View All Apps
                    </Link>
                    <button
                        onClick={() => {
                            setState('form');
                            setFormData({ name: '', owner: '', url: '', description: '', screenshots: [] });
                            setPreviewUrls([]);
                            setEvaluationResult(null);
                        }}
                        className="btn btn-primary cursor-pointer"
                    >
                        Submit Another App
                    </button>
                </motion.div>
            </div>
        );
    }

    // Form view
    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-4 cursor-pointer"
                >
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Submit App for Evaluation</h1>
                <p className="text-[var(--color-text-secondary)] mt-1">
                    Enter your app details and get instant AI-powered evaluation
                </p>
            </div>

            {/* AI Badge */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-[var(--color-primary-50)] to-[var(--color-secondary-50)] border border-[var(--color-primary-200)] rounded-2xl p-4 mb-6 flex items-center gap-4"
            >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-500)] flex items-center justify-center">
                    <Brain className="text-white" size={24} />
                </div>
                <div>
                    <h3 className="font-semibold text-[var(--color-text-primary)]">Real AI-Powered Evaluation</h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Powered by OpenAI GPT-4o-mini - analyzing your app across 5 criteria
                    </p>
                </div>
            </motion.div>

            {/* Form */}
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl shadow-md border border-[var(--color-border)] p-8 space-y-6"
            >
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600"
                    >
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </motion.div>
                )}

                {/* App Name */}
                <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-[var(--color-text-secondary)]">
                        App Name *
                    </label>
                    <div className="relative">
                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={20} />
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-all"
                            placeholder="Enter app name"
                            required
                        />
                    </div>
                </div>

                {/* Owner */}
                <div className="space-y-2">
                    <label htmlFor="owner" className="block text-sm font-medium text-[var(--color-text-secondary)]">
                        App Owner / Developer *
                    </label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={20} />
                        <input
                            id="owner"
                            name="owner"
                            type="text"
                            value={formData.owner}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-all"
                            placeholder="Enter owner or developer name"
                            required
                        />
                    </div>
                </div>

                {/* App URL */}
                <div className="space-y-2">
                    <label htmlFor="url" className="block text-sm font-medium text-[var(--color-text-secondary)]">
                        App URL / Link *
                    </label>
                    <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={20} />
                        <input
                            id="url"
                            name="url"
                            type="url"
                            value={formData.url}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-all"
                            placeholder="https://your-app.com"
                            required
                        />
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                        The AI will analyze this URL
                    </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-medium text-[var(--color-text-secondary)]">
                        Description (Optional)
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-all resize-none"
                        placeholder="Brief description to help AI understand your app better..."
                    />
                </div>

                {/* Screenshots Upload */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                        Screenshots (Optional, Max 5) - For Visual AI Analysis
                    </label>
                    <p className="text-xs text-[var(--color-text-muted)]">
                        Upload screenshots for GPT-4o to analyze your app's design (Especially for authenticated apps)
                    </p>

                    <div className="relative">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            disabled={formData.screenshots.length >= 5}
                        />
                        <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${formData.screenshots.length >= 5
                            ? 'border-gray-200 bg-gray-50'
                            : 'border-[var(--color-primary-300)] bg-[var(--color-primary-50)] hover:bg-[var(--color-primary-100)]'
                            }`}>
                            <ImagePlus className={`mx-auto mb-2 ${formData.screenshots.length >= 5
                                ? 'text-gray-400'
                                : 'text-[var(--color-primary-500)]'
                                }`} size={28} />
                            <p className={`text-sm ${formData.screenshots.length >= 5
                                ? 'text-gray-400'
                                : 'text-[var(--color-text-secondary)]'
                                }`}>
                                {formData.screenshots.length >= 5
                                    ? 'Maximum screenshots reached'
                                    : 'Click or drag to upload screenshots'}
                            </p>
                        </div>
                    </div>

                    {previewUrls.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                            {previewUrls.map((url, index) => (
                                <div
                                    key={index}
                                    className="relative aspect-square rounded-xl overflow-hidden border border-[var(--color-border)] group"
                                >
                                    <img
                                        src={url}
                                        alt={`Screenshot ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeScreenshot(index)}
                                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-[var(--color-border)]">
                    <button
                        type="submit"
                        className="btn btn-cta w-full text-lg py-4 cursor-pointer"
                    >
                        <Brain size={22} />
                        Submit & Evaluate with AI
                    </button>
                    <p className="text-center text-xs text-[var(--color-text-muted)] mt-3">
                        Real AI evaluation takes 5-10 seconds
                    </p>
                </div>
            </motion.form>
        </div>
    );
}
