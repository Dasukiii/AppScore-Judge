import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BarChart3,
    Brain,
    Shield,
    Zap,
    ArrowRight,
    Star,
    ClipboardCheck,
    Users,
    FileText,
    Download
} from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/context/AuthContext';

const features = [
    {
        icon: Brain,
        title: 'Instant AI Evaluation',
        description: 'Submit your app URL and get instant AI-powered evaluation across 5 key criteria.',
    },
    {
        icon: ClipboardCheck,
        title: '5 Key Criteria',
        description: 'Apps are scored on UX, Usefulness, Reliability, Data Handling, and Clarity.',
    },
    {
        icon: BarChart3,
        title: 'Weighted Scoring',
        description: 'Fair, balanced scoring with 20% weight per criterion for accurate, unbiased results.',
    },
    {
        icon: Zap,
        title: 'Results in Seconds',
        description: 'No waiting - get your evaluation results immediately after submission.',
    },
    {
        icon: Download,
        title: 'Export Reports',
        description: 'Generate comprehensive PDF reports with scores, feedback, and recommendations.',
    },
    {
        icon: Shield,
        title: 'Actionable Insights',
        description: 'Receive specific improvement suggestions to make your app even better.',
    },
];

const stats = [
    { value: '5', label: 'Evaluation Criteria' },
    { value: '<10s', label: 'Instant Results' },
    { value: 'GPT-4o', label: 'Powered by' },
    { value: 'PDF', label: 'Export Ready' },
];

export function LandingPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({
        isOpen: false,
        mode: 'login',
    });

    // Redirect if already logged in
    if (user) {
        navigate('/dashboard');
        return null;
    }

    const openAuthModal = (mode: 'login' | 'signup') => {
        setAuthModal({ isOpen: true, mode });
    };

    const closeAuthModal = () => {
        setAuthModal({ ...authModal, isOpen: false });
    };

    const switchAuthMode = () => {
        setAuthModal({ ...authModal, mode: authModal.mode === 'login' ? 'signup' : 'login' });
    };

    return (
        <div className="min-h-screen bg-[var(--color-surface)]">
            {/* Navigation */}
            <nav className="fixed top-4 left-4 right-4 z-50">
                <div className="max-w-7xl mx-auto">
                    <div className="glass-card rounded-2xl px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] flex items-center justify-center">
                                <ClipboardCheck className="text-white" size={22} />
                            </div>
                            <span className="text-xl font-bold text-[var(--color-text-primary)]">
                                AppScore Judge
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => openAuthModal('login')}
                                className="btn btn-secondary text-sm cursor-pointer"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => openAuthModal('signup')}
                                className="btn btn-primary text-sm cursor-pointer"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--color-primary-200)] rounded-full blur-3xl opacity-30 animate-float" />
                    <div className="absolute top-40 right-20 w-96 h-96 bg-[var(--color-secondary-200)] rounded-full blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }} />
                    <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-[var(--color-cta-200)] rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }} />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] text-[var(--color-primary-600)] text-sm font-medium mb-6">
                                <Star size={16} className="fill-current" />
                                <span>Smart App Evaluation Platform</span>
                            </div>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[var(--color-text-primary)] leading-tight mb-6"
                        >
                            Judge Apps with{' '}
                            <span className="text-gradient">Confidence</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-xl text-[var(--color-text-secondary)] mb-10 max-w-2xl mx-auto"
                        >
                            A simple yet powerful evaluation tool for judging apps based on UX, usefulness,
                            reliability, data handling, and clarity with weighted scoring and AI-powered insights.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <button
                                onClick={() => openAuthModal('login')}
                                className="btn btn-cta text-lg px-8 py-4 cursor-pointer"
                            >
                                Start Evaluating Now
                                <ArrowRight size={20} />
                            </button>
                        </motion.div>
                    </div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
                    >
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="glass-card rounded-2xl p-6 text-center card-hover cursor-pointer"
                            >
                                <div className="text-4xl font-bold text-gradient mb-2">{stat.value}</div>
                                <div className="text-sm text-[var(--color-text-secondary)]">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-[var(--color-surface-elevated)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
                                Everything You Need to Evaluate Apps
                            </h2>
                            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
                                Comprehensive tools for fair, consistent, and transparent app evaluations
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-white rounded-2xl p-8 shadow-md border border-[var(--color-border)] card-hover cursor-pointer"
                            >
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-primary-100)] to-[var(--color-primary-200)] flex items-center justify-center mb-6">
                                    <feature.icon className="text-[var(--color-primary-600)]" size={28} />
                                </div>
                                <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-[var(--color-text-secondary)]">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
                                How It Works
                            </h2>
                            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
                                Three simple steps to comprehensive app evaluation
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '01',
                                icon: FileText,
                                title: 'Submit App',
                                description: 'Enter your app name, URL, and optional screenshots.',
                            },
                            {
                                step: '02',
                                icon: Brain,
                                title: 'AI Evaluates',
                                description: 'Our AI instantly analyzes and scores your app.',
                            },
                            {
                                step: '03',
                                icon: BarChart3,
                                title: 'View Results',
                                description: 'Get detailed scores, feedback, and improvement tips.',
                            },
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.15 }}
                                className="relative"
                            >
                                <div className="glass-card rounded-2xl p-8 text-center card-hover cursor-pointer">
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-cta-500)] to-[var(--color-cta-600)] flex items-center justify-center text-white text-sm font-bold">
                                        {item.step}
                                    </div>
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] flex items-center justify-center mx-auto mt-4 mb-6">
                                        <item.icon className="text-white" size={32} />
                                    </div>
                                    <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">
                                        {item.title}
                                    </h3>
                                    <p className="text-[var(--color-text-secondary)]">
                                        {item.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-primary-800)]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-8">
                            <Users className="text-white" size={40} />
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Ready to Start Evaluating?
                        </h2>
                        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                            Join managers who trust AppScore Judge for fair, consistent, and transparent app evaluations.
                        </p>
                        <button
                            onClick={() => openAuthModal('signup')}
                            className="btn bg-white text-[var(--color-primary-700)] hover:bg-white/90 text-lg px-8 py-4 cursor-pointer"
                        >
                            Get Started Free
                            <ArrowRight size={20} />
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[var(--color-text-primary)] text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <ClipboardCheck className="text-white" size={22} />
                            </div>
                            <span className="text-lg font-bold">AppScore Judge</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-white/60">
                            <Link to="/pdpa-policy" className="hover:text-white transition-colors cursor-pointer">PDPA Policy</Link>
                            <a href="mailto:asha@kadoshai.com" className="hover:text-white transition-colors cursor-pointer">Contact</a>
                        </div>
                        <div className="flex flex-col items-center md:items-end gap-2">
                            <div className="flex items-center gap-2 text-sm text-white/60">
                                <span>Powered by</span>
                                <img src="/kadosh-ai-icon.png" alt="Kadosh AI" className="w-24 h-6" />
                            </div>
                            <p className="text-sm text-white/60">
                                © 2026 AppScore Judge. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Auth Modal */}
            <AuthModal
                isOpen={authModal.isOpen}
                onClose={closeAuthModal}
                mode={authModal.mode}
                onModeSwitch={switchAuthMode}
            />
        </div>
    );
}
