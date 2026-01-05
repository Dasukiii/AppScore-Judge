import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Search,
    Grid3X3,
    List,
    ExternalLink,
    ArrowRight,
    Plus,
    Star,
    Brain,
    SortAsc,
    SortDesc,
    Trash2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface App {
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
    screenshots: string[];
    created_at: string;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

export function AppLibrary() {
    const { user } = useAuth(); // Get current user
    const [apps, setApps] = useState<App[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchApps();
        } else {
            setLoading(false); // Stop loading if no user
        }
    }, [user]);

    const fetchApps = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('apps')
                .select('id, name, owner, url, total_score, ux_score, usefulness_score, reliability_score, data_handling_score, clarity_score, screenshots, created_at')
                .eq('submitted_by', user.id) // Filter by current user
                .not('total_score', 'is', null)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setApps(data || []);
        } catch (error) {
            console.error('Error fetching apps:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteApp = async (id: string, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation(); // Stop event bubbling

        if (!confirm('Are you sure you want to delete this app? This action cannot be undone.')) {
            return;
        }

        setDeletingId(id);
        try {
            const { error } = await supabase
                .from('apps')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Remove from local state
            setApps(prev => prev.filter(app => app.id !== id));
        } catch (error) {
            console.error('Error deleting app:', error);
            alert('Failed to delete app');
        } finally {
            setDeletingId(null);
        }
    };

    const filteredApps = useMemo(() => {
        let filtered = apps.filter((app) => {
            const matchesSearch =
                app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.owner.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });

        // Sort apps
        switch (sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                break;
            case 'highest':
                filtered.sort((a, b) => b.total_score - a.total_score);
                break;
            case 'lowest':
                filtered.sort((a, b) => a.total_score - b.total_score);
                break;
        }

        return filtered;
    }, [apps, searchQuery, sortBy]);

    const getScoreColor = (score: number) => {
        if (score >= 85) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-orange-600';
    };

    const getScoreBg = (score: number) => {
        if (score >= 85) return 'bg-green-100 border-green-200';
        if (score >= 70) return 'bg-yellow-100 border-yellow-200';
        return 'bg-orange-100 border-orange-200';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">My App Library</h1>
                    <p className="text-[var(--color-text-secondary)] mt-1">
                        Manage your AI-evaluated applications
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

            {/* Filters Bar */}
            <div className="bg-white rounded-2xl shadow-md border border-[var(--color-border)] p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search your apps..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-all"
                        />
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2">
                        {sortBy.includes('highest') || sortBy.includes('newest') ? (
                            <SortDesc className="text-[var(--color-text-muted)]" size={20} />
                        ) : (
                            <SortAsc className="text-[var(--color-text-muted)]" size={20} />
                        )}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-all cursor-pointer"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="highest">Highest Score</option>
                            <option value="lowest">Lowest Score</option>
                        </select>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-1 p-1 bg-[var(--color-surface-elevated)] rounded-xl border border-[var(--color-border)]">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid'
                                ? 'bg-white shadow text-[var(--color-primary-600)]'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                                }`}
                            aria-label="Grid view"
                        >
                            <Grid3X3 size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === 'list'
                                ? 'bg-white shadow text-[var(--color-primary-600)]'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                                }`}
                            aria-label="List view"
                        >
                            <List size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
                <span>Showing {filteredApps.length} of {apps.length} apps</span>
                <div className="flex items-center gap-1 text-[var(--color-primary-600)]">
                    <Brain size={16} />
                    <span>Your private evaluations</span>
                </div>
            </div>

            {/* Apps Display */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredApps.map((app, index) => (
                        <motion.div
                            key={app.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Link
                                to={`/results/${app.id}`}
                                className="block bg-white rounded-2xl shadow-md border border-[var(--color-border)] overflow-hidden card-hover cursor-pointer group relative"
                            >
                                {/* Thumbnail */}
                                <div className="aspect-video bg-gradient-to-br from-[var(--color-primary-100)] to-[var(--color-primary-200)] relative overflow-hidden">
                                    {app.screenshots && app.screenshots.length > 0 ? (
                                        <img
                                            src={app.screenshots[0]}
                                            alt={app.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-6xl font-bold text-[var(--color-primary-300)]">
                                                {app.name.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full border ${getScoreBg(app.total_score)}`}>
                                        <span className={`font-bold ${getScoreColor(app.total_score)}`}>{app.total_score}%</span>
                                    </div>
                                    <div className="absolute bottom-4 left-4 flex items-center gap-1 px-2 py-1 rounded-lg bg-white/90 backdrop-blur text-xs font-medium text-[var(--color-text-secondary)]">
                                        <Brain size={12} />
                                        AI Evaluated
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="font-semibold text-lg text-[var(--color-text-primary)] line-clamp-1 group-hover:text-[var(--color-primary-600)] transition-colors">
                                            {app.name}
                                        </h3>
                                        <div className="flex gap-1">
                                            <a
                                                href={app.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 rounded-lg hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-primary-600)] transition-colors cursor-pointer"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <ExternalLink size={16} />
                                            </a>
                                            <div
                                                className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--color-text-muted)] hover:text-red-500 transition-colors cursor-pointer"
                                                onClick={(e) => deleteApp(app.id, e)}
                                            >
                                                {deletingId === app.id ? (
                                                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Trash2 size={16} />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                                        by {app.owner}
                                    </p>

                                    {/* Mini Score Breakdown */}
                                    <div className="flex items-center gap-1 mb-4">
                                        {[
                                            { key: 'ux', score: app.ux_score },
                                            { key: 'usefulness', score: app.usefulness_score },
                                            { key: 'reliability', score: app.reliability_score },
                                            { key: 'data_handling', score: app.data_handling_score },
                                            { key: 'clarity', score: app.clarity_score },
                                        ].map(({ key, score }) => (
                                            <div
                                                key={key}
                                                className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden"
                                                title={`${key}: ${score}/5`}
                                            >
                                                <div
                                                    className="h-full bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] rounded-full"
                                                    style={{ width: `${(score / 5) * 100}%` }}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-[var(--color-text-muted)]">
                                            {formatDate(app.created_at)}
                                        </span>
                                        <span className="text-sm font-medium text-[var(--color-primary-600)] flex items-center gap-1 group-hover:gap-2 transition-all">
                                            View Results
                                            <ArrowRight size={14} />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-md border border-[var(--color-border)] overflow-hidden">
                    <div className="divide-y divide-[var(--color-border)]">
                        {filteredApps.map((app, index) => (
                            <motion.div
                                key={app.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <Link
                                    to={`/results/${app.id}`}
                                    className="p-4 flex items-center gap-4 hover:bg-[var(--color-surface-elevated)] transition-colors cursor-pointer group"
                                >
                                    {/* Avatar */}
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-primary-100)] to-[var(--color-primary-200)] flex items-center justify-center text-[var(--color-primary-600)] font-bold text-xl flex-shrink-0">
                                        {app.name.charAt(0)}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-[var(--color-text-primary)] truncate">
                                                {app.name}
                                            </h3>
                                            <span
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    window.open(app.url, '_blank');
                                                }}
                                                className="text-[var(--color-text-muted)] hover:text-[var(--color-primary-600)] cursor-pointer"
                                            >
                                                <ExternalLink size={14} />
                                            </span>
                                        </div>
                                        <p className="text-sm text-[var(--color-text-secondary)]">
                                            by {app.owner} • {formatDate(app.created_at)}
                                        </p>
                                    </div>

                                    {/* Star Ratings Mini */}
                                    <div className="hidden md:flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => {
                                            const avgScore = (app.ux_score + app.usefulness_score + app.reliability_score + app.data_handling_score + app.clarity_score) / 5;
                                            return (
                                                <Star
                                                    key={star}
                                                    size={14}
                                                    className={star <= Math.round(avgScore) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
                                                />
                                            );
                                        })}
                                    </div>

                                    {/* Score */}
                                    <div className={`px-4 py-2 rounded-xl border ${getScoreBg(app.total_score)}`}>
                                        <span className={`text-xl font-bold ${getScoreColor(app.total_score)}`}>
                                            {app.total_score}%
                                        </span>
                                    </div>

                                    {/* Delete Action (visible on hover) */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                            onClick={(e) => deleteApp(app.id, e)}
                                            title="Delete App"
                                        >
                                            {deletingId === app.id ? (
                                                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Trash2 size={18} />
                                            )}
                                        </button>
                                    </div>

                                    {/* Arrow */}
                                    <ArrowRight size={18} className="text-[var(--color-text-muted)]" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {filteredApps.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                >
                    <div className="w-16 h-16 rounded-full bg-[var(--color-surface-elevated)] flex items-center justify-center mx-auto mb-4">
                        <Search className="text-[var(--color-text-muted)]" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                        {apps.length === 0 ? 'No apps yet' : 'No apps found'}
                    </h3>
                    <p className="text-[var(--color-text-secondary)] mb-6">
                        {apps.length === 0
                            ? 'Submit your first app to get started with AI-powered evaluation'
                            : 'Try adjusting your search criteria'}
                    </p>
                    <Link to="/submit" className="btn btn-primary cursor-pointer">
                        <Plus size={20} />
                        Submit Your First App
                    </Link>
                </motion.div>
            )}
        </div>
    );
}
