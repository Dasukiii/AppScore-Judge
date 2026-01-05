import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText,
    Library,
    BarChart3,
    TrendingUp,
    Trophy,
    ArrowRight,
    Plus,
    Star
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Stats {
    totalApps: number;
    averageScore: number;
    highestScore: number;
    appsThisMonth: number;
}

interface RecentApp {
    id: string;
    name: string;
    owner: string;
    score: number;
    created_at: string;
}

interface TopApp {
    id: string;
    name: string;
    score: number;
    rank: number;
}

export function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats>({
        totalApps: 0,
        averageScore: 0,
        highestScore: 0,
        appsThisMonth: 0,
    });
    const [recentApps, setRecentApps] = useState<RecentApp[]>([]);
    const [topApps, setTopApps] = useState<TopApp[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch all apps with scores
            const { data: apps, error } = await supabase
                .from('apps')
                .select('id, name, owner, total_score, created_at')
                .not('total_score', 'is', null)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Type cast to fix TypeScript inference
            const typedApps = (apps || []) as { id: string; name: string; owner: string; total_score: number; created_at: string }[];

            if (typedApps.length > 0) {
                // Calculate stats
                const totalApps = typedApps.length;
                const sumScores = typedApps.reduce((sum, app) => sum + (app.total_score || 0), 0);
                const averageScore = Math.round(sumScores / totalApps);
                const highestScore = Math.max(...typedApps.map(app => app.total_score || 0));

                // Apps this month
                const now = new Date();
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const appsThisMonth = typedApps.filter(app => new Date(app.created_at) >= firstDayOfMonth).length;

                setStats({ totalApps, averageScore, highestScore, appsThisMonth });

                // Recent apps (top 4)
                setRecentApps(typedApps.slice(0, 4).map(app => ({
                    id: app.id,
                    name: app.name,
                    owner: app.owner,
                    score: app.total_score || 0,
                    created_at: app.created_at,
                })));

                // Top apps (top 3 by score)
                const topThree = [...typedApps]
                    .sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
                    .slice(0, 3)
                    .map((app, index) => ({
                        id: app.id,
                        name: app.name,
                        score: app.total_score || 0,
                        rank: index + 1,
                    }));
                setTopApps(topThree);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-[var(--color-primary-200)] border-t-[var(--color-primary-600)] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
                        Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Manager'}!
                    </h1>
                    <p className="text-[var(--color-text-secondary)] mt-1">
                        Submit apps for instant AI-powered evaluation
                    </p>
                </div>
                <Link
                    to="/submit"
                    className="btn btn-primary cursor-pointer"
                >
                    <Plus size={20} />
                    Submit New App
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-2xl p-6 shadow-md border border-[var(--color-border)] card-hover cursor-pointer"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary-100)] to-[var(--color-primary-200)] flex items-center justify-center">
                            <FileText className="text-[var(--color-primary-600)]" size={24} />
                        </div>
                        <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                            <TrendingUp size={14} />
                            +{stats.appsThisMonth}
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-[var(--color-text-primary)]">{stats.totalApps}</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">Total Apps Evaluated</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-md border border-[var(--color-border)] card-hover cursor-pointer"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-secondary-100)] to-[var(--color-secondary-200)] flex items-center justify-center">
                            <BarChart3 className="text-[var(--color-secondary-600)]" size={24} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-[var(--color-text-primary)]">{stats.averageScore}%</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">Average Score</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="bg-white rounded-2xl p-6 shadow-md border border-[var(--color-border)] card-hover cursor-pointer"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                            <Trophy className="text-yellow-600" size={24} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-[var(--color-text-primary)]">{stats.highestScore}%</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">Highest Score</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="bg-white rounded-2xl p-6 shadow-md border border-[var(--color-border)] card-hover cursor-pointer"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                            <Star className="text-green-600 fill-green-600" size={24} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-[var(--color-text-primary)]">{stats.appsThisMonth}</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">Apps This Month</p>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Link
                    to="/submit"
                    className="bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] rounded-2xl p-6 text-white card-hover cursor-pointer group"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Submit New App</h3>
                            <p className="text-white/80 text-sm">Get instant AI-powered evaluation for your app</p>
                        </div>
                        <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
                    </div>
                </Link>

                <Link
                    to="/library"
                    className="bg-white rounded-2xl p-6 shadow-md border border-[var(--color-border)] card-hover cursor-pointer group"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <Library className="text-[var(--color-primary-600)] mb-3" size={28} />
                            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">View All Apps</h3>
                            <p className="text-[var(--color-text-secondary)] text-sm">Browse all evaluated apps and their scores</p>
                        </div>
                        <ArrowRight className="text-[var(--color-text-muted)] group-hover:translate-x-2 group-hover:text-[var(--color-primary-600)] transition-all" size={24} />
                    </div>
                </Link>
            </div>

            {stats.totalApps === 0 ? (
                <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-surface-elevated)] flex items-center justify-center mx-auto mb-4">
                        <Plus className="text-[var(--color-text-muted)]" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                        No apps yet
                    </h3>
                    <p className="text-[var(--color-text-secondary)] mb-6">
                        Submit your first app to get started with AI-powered evaluation
                    </p>
                    <Link to="/submit" className="btn btn-primary cursor-pointer">
                        <Plus size={20} />
                        Submit Your First App
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Top Performing Apps */}
                    {topApps.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.4 }}
                            className="bg-white rounded-2xl shadow-md border border-[var(--color-border)] overflow-hidden"
                        >
                            <div className="p-5 border-b border-[var(--color-border)]">
                                <div className="flex items-center gap-2">
                                    <Trophy className="text-yellow-500" size={20} />
                                    <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Top Performers</h2>
                                </div>
                            </div>
                            <div className="divide-y divide-[var(--color-border)]">
                                {topApps.map((app) => (
                                    <Link
                                        key={app.id}
                                        to={`/results/${app.id}`}
                                        className="p-4 flex items-center gap-3 hover:bg-[var(--color-surface-elevated)] transition-colors cursor-pointer"
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${app.rank === 1
                                            ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                                            : app.rank === 2
                                                ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
                                                : 'bg-gradient-to-br from-amber-600 to-amber-800 text-white'
                                            }`}>
                                            #{app.rank}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-[var(--color-text-primary)] truncate">{app.name}</p>
                                        </div>
                                        <span className={`font-bold ${getScoreColor(app.score)}`}>{app.score}%</span>
                                    </Link>
                                ))}
                            </div>
                            <div className="p-4 border-t border-[var(--color-border)]">
                                <Link
                                    to="/results"
                                    className="text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] flex items-center gap-1 cursor-pointer"
                                >
                                    View Leaderboard
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    {/* Recent Apps */}
                    {recentApps.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.5 }}
                            className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-[var(--color-border)] overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
                                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Recently Evaluated</h2>
                                <Link
                                    to="/library"
                                    className="text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] flex items-center gap-1 cursor-pointer"
                                >
                                    View All
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                            <div className="divide-y divide-[var(--color-border)]">
                                {recentApps.map((app, index) => (
                                    <motion.div
                                        key={app.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                                        className="p-4 hover:bg-[var(--color-surface-elevated)] transition-colors cursor-pointer"
                                    >
                                        <Link to={`/results/${app.id}`} className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary-100)] to-[var(--color-primary-200)] flex items-center justify-center text-[var(--color-primary-600)] font-bold">
                                                    {app.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-[var(--color-text-primary)]">{app.name}</h3>
                                                    <p className="text-sm text-[var(--color-text-secondary)]">by {app.owner} • {formatDate(app.created_at)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`px-3 py-1.5 rounded-xl ${getScoreBg(app.score)}`}>
                                                    <span className={`text-lg font-bold ${getScoreColor(app.score)}`}>{app.score}%</span>
                                                </div>
                                                <ArrowRight size={18} className="text-[var(--color-text-muted)]" />
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
}
