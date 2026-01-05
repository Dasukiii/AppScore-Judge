import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Download,
    Trophy,
    Star,
    TrendingUp,
    BarChart3,
    Brain,
    ExternalLink,
    Sparkles,
    Search
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LeaderboardApp {
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
    evaluated_at: string;
    created_at: string;
}

interface DetailedApp extends LeaderboardApp {
    description: string | null;
    screenshots: string[];
    ai_feedback: string | null;
    ai_strengths: string[] | null;
    ai_improvements: string[] | null;
    ux_explanation: string | null;
    usefulness_explanation: string | null;
    reliability_explanation: string | null;
    data_handling_explanation: string | null;
    clarity_explanation: string | null;
}

const criteriaLabels: Record<string, string> = {
    ux: 'User Experience',
    usefulness: 'Usefulness',
    reliability: 'Reliability',
    dataHandling: 'Data Handling',
    clarity: 'Clarity',
};

const criteriaColors: Record<string, string> = {
    ux: '#6366f1',
    usefulness: '#14b8a6',
    reliability: '#f97316',
    dataHandling: '#8b5cf6',
    clarity: '#ec4899',
};

export function Results() {
    const { id } = useParams();
    const [leaderboard, setLeaderboard] = useState<LeaderboardApp[]>([]);
    const [appDetail, setAppDetail] = useState<DetailedApp | null>(null);
    const [rank, setRank] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchAppDetail(id);
        } else {
            fetchLeaderboard();
        }
    }, [id]);

    const fetchLeaderboard = async () => {
        try {
            const { data, error } = await supabase
                .from('apps')
                .select('id, name, owner, url, total_score, ux_score, usefulness_score, reliability_score, data_handling_score, clarity_score, evaluated_at, created_at')
                .not('total_score', 'is', null)
                .order('total_score', { ascending: false });

            if (error) throw error;
            setLeaderboard(data || []);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAppDetail = async (appId: string) => {
        try {
            const { data, error } = await supabase
                .from('apps')
                .select('*')
                .eq('id', appId)
                .single();

            if (error) throw error;

            setAppDetail(data);

            // Calculate rank
            const { data: allApps, error: rankError } = await supabase
                .from('apps')
                .select('id, total_score')
                .not('total_score', 'is', null)
                .order('total_score', { ascending: false });

            if (!rankError && allApps) {
                const appRank = (allApps as { id: string; total_score: number }[]).findIndex(app => app.id === appId) + 1;
                setRank(appRank);
            }
        } catch (error) {
            console.error('Error fetching app detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getScoreColor = (score: number) => {
        if (score >= 85) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-orange-600';
    };

    const getScoreBg = (score: number) => {
        if (score >= 85) return 'bg-green-100';
        if (score >= 70) return 'bg-yellow-100';
        return 'bg-orange-100';
    };

    const handleExportPDF = () => {
        // TODO: Implement PDF export via Supabase Edge Function
        alert('PDF export functionality will be implemented via Supabase Edge Function');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-[var(--color-primary-200)] border-t-[var(--color-primary-600)] rounded-full animate-spin" />
            </div>
        );
    }

    // Show leaderboard if no ID is provided
    if (!id) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
                            Your Leaderboard
                        </h1>
                        <p className="text-[var(--color-text-secondary)] mt-1">
                            Rankings of your AI-evaluated applications
                        </p>
                    </div>
                    <button
                        onClick={handleExportPDF}
                        className="btn btn-secondary cursor-pointer"
                    >
                        <Download size={20} />
                        Export All (PDF)
                    </button>
                </div>

                {/* Leaderboard */}
                {leaderboard.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-surface-elevated)] flex items-center justify-center mx-auto mb-4">
                            <Trophy className="text-[var(--color-text-muted)]" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                            No apps evaluated yet
                        </h3>
                        <p className="text-[var(--color-text-secondary)] mb-6">
                            Submit your first app to start the leaderboard
                        </p>
                        <Link to="/submit" className="btn btn-primary cursor-pointer">
                            Submit Your First App
                        </Link>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-md border border-[var(--color-border)] overflow-hidden"
                    >
                        <div className="p-6 border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-primary-50)] to-[var(--color-secondary-50)]">
                            <div className="flex items-center gap-3">
                                <Trophy className="text-yellow-500" size={28} />
                                <div>
                                    <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                                        App Rankings
                                    </h2>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        Based on AI evaluation scores
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-[var(--color-border)]">
                            {leaderboard.map((app, index) => (
                                <motion.div
                                    key={app.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link
                                        to={`/results/${app.id}`}
                                        className="p-5 flex items-center gap-4 hover:bg-[var(--color-surface-elevated)] transition-colors cursor-pointer"
                                    >
                                        {/* Rank Badge */}
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${index === 0
                                            ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg shadow-yellow-200'
                                            : index === 1
                                                ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
                                                : index === 2
                                                    ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white'
                                                    : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'
                                            }`}>
                                            #{index + 1}
                                        </div>

                                        {/* App Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-[var(--color-text-primary)]">{app.name}</h3>
                                            <p className="text-sm text-[var(--color-text-secondary)]">
                                                by {app.owner} • {formatDate(app.evaluated_at || app.created_at)}
                                            </p>
                                        </div>

                                        {/* Score Breakdown Mini */}
                                        <div className="hidden lg:flex items-center gap-1">
                                            {[
                                                app.ux_score,
                                                app.usefulness_score,
                                                app.reliability_score,
                                                app.data_handling_score,
                                                app.clarity_score
                                            ].map((score, idx) => (
                                                <div key={idx} className="flex items-center gap-0.5" title={`${score}/5`}>
                                                    <Star
                                                        size={12}
                                                        className="fill-yellow-400 text-yellow-400"
                                                    />
                                                    <span className="text-xs text-[var(--color-text-muted)]">{score}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* AI Badge */}
                                        <div className="hidden md:flex items-center gap-1 text-xs text-[var(--color-primary-600)] bg-[var(--color-primary-50)] px-2 py-1 rounded-lg">
                                            <Brain size={12} />
                                            AI Scored
                                        </div>

                                        {/* Total Score */}
                                        <div className={`px-4 py-2 rounded-xl ${getScoreBg(app.total_score)}`}>
                                            <span className={`text-2xl font-bold ${getScoreColor(app.total_score)}`}>
                                                {app.total_score}%
                                            </span>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        );
    }

    if (!appDetail) {
        return (
            <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Search className="text-gray-400" size={32} />
                </div>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">App Not Found</h2>
                <p className="text-[var(--color-text-secondary)] mb-6">
                    The app you are looking for does not exist or you do not have permission to view it.
                </p>
                <Link to="/library" className="btn btn-primary">
                    Go to Library
                </Link>
            </div>
        );
    }

    const scores = {
        ux: { score: appDetail.ux_score, explanation: appDetail.ux_explanation || 'No explanation provided' },
        usefulness: { score: appDetail.usefulness_score, explanation: appDetail.usefulness_explanation || 'No explanation provided' },
        reliability: { score: appDetail.reliability_score, explanation: appDetail.reliability_explanation || 'No explanation provided' },
        dataHandling: { score: appDetail.data_handling_score, explanation: appDetail.data_handling_explanation || 'No explanation provided' },
        clarity: { score: appDetail.clarity_score, explanation: appDetail.clarity_explanation || 'No explanation provided' },
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    to="/results"
                    className="p-2 rounded-xl hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
                >
                    <ArrowLeft size={24} />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        {appDetail.name}
                    </h1>
                    <p className="text-[var(--color-text-secondary)]">
                        by {appDetail.owner}
                    </p>
                </div>
                <button
                    onClick={handleExportPDF}
                    className="btn btn-primary cursor-pointer"
                >
                    <Download size={20} />
                    Export PDF
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Score Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-primary-800)] rounded-2xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Trophy className="text-yellow-400" size={24} />
                                <span className="text-white/80">Rank #{rank}</span>
                            </div>
                            <TrendingUp size={20} className="text-green-400" />
                        </div>
                        <div className="text-6xl font-bold mb-2">{appDetail.total_score}%</div>
                        <p className="text-white/70">Overall AI Score</p>
                        <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2">
                            <Brain size={16} className="text-white/60" />
                            <span className="text-sm text-white/60">Evaluated by GPT-4o & GPT-4o-mini</span>
                        </div>
                    </motion.div>

                    {/* App Details */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl shadow-md border border-[var(--color-border)] p-6"
                    >
                        <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">App Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">URL</label>
                                <a
                                    href={appDetail.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] mt-1 cursor-pointer"
                                >
                                    {appDetail.url}
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                            {appDetail.description && (
                                <div>
                                    <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Description</label>
                                    <p className="text-[var(--color-text-secondary)] mt-1 text-sm">{appDetail.description}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Evaluated</label>
                                <p className="text-[var(--color-text-secondary)] mt-1 text-sm">
                                    {formatDate(appDetail.evaluated_at || appDetail.created_at)}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Score Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl shadow-md border border-[var(--color-border)] p-6"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 className="text-[var(--color-primary-600)]" size={24} />
                            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                                Criteria Breakdown
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {Object.entries(scores).map(([key, value], index) => (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + index * 0.05 }}
                                    className="p-4 rounded-xl bg-[var(--color-surface-elevated)]"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-[var(--color-text-primary)]">
                                            {criteriaLabels[key]}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={16}
                                                    className={star <= value.score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
                                                />
                                            ))}
                                            <span className="text-lg font-semibold text-[var(--color-text-primary)] ml-2">
                                                {value.score}/5
                                            </span>
                                        </div>
                                    </div>
                                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(value.score / 5) * 100}%` }}
                                            transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                                            className="absolute inset-y-0 left-0 rounded-full"
                                            style={{ backgroundColor: criteriaColors[key] }}
                                        />
                                    </div>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        {value.explanation}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* AI Feedback */}
                    {appDetail.ai_feedback && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl shadow-md border border-[var(--color-border)] p-6"
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <Brain className="text-[var(--color-primary-600)]" size={24} />
                                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                                    AI Analysis & Feedback
                                </h2>
                            </div>

                            <p className="text-[var(--color-text-secondary)] whitespace-pre-line">
                                {appDetail.ai_feedback}
                            </p>
                        </motion.div>
                    )}

                    {/* Strengths & Improvements */}
                    {(appDetail.ai_strengths || appDetail.ai_improvements) && (
                        <div className="grid md:grid-cols-2 gap-6">
                            {appDetail.ai_strengths && appDetail.ai_strengths.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-green-50 rounded-2xl border border-green-200 p-6"
                                >
                                    <h3 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                                        <Sparkles size={18} />
                                        Strengths
                                    </h3>
                                    <ul className="space-y-2">
                                        {appDetail.ai_strengths.map((strength, i) => (
                                            <li key={i} className="text-green-700 text-sm flex items-start gap-2">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                                {strength}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )}

                            {appDetail.ai_improvements && appDetail.ai_improvements.length > 0 && (
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
                                        {appDetail.ai_improvements.map((improvement, i) => (
                                            <li key={i} className="text-orange-700 text-sm flex items-start gap-2">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                                                {improvement}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
