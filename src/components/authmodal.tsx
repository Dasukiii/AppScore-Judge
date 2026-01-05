import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import type { AuthModalProps } from '@/types';
import { useAuth } from '@/context/AuthContext';

export function AuthModal({ isOpen, onClose, mode, onModeSwitch }: AuthModalProps) {
    const { login, register } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (mode === 'login') {
                const { error } = await login(email, password);
                if (error) throw error;
            } else {
                if (!fullName.trim()) {
                    throw new Error('Full name is required');
                }
                const { error } = await register(email, password, fullName);
                if (error) throw error;
            }
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setFullName('');
        setError('');
    };

    const handleModeSwitch = () => {
        resetForm();
        onModeSwitch();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="modal-overlay"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="w-full max-w-md mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="relative bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-primary-800)] p-8 text-white">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                                    aria-label="Close modal"
                                >
                                    <X size={20} />
                                </button>
                                <h2 className="text-2xl font-bold">
                                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                                </h2>
                                <p className="mt-2 text-white/80">
                                    {mode === 'login'
                                        ? 'Sign in to access your dashboard'
                                        : 'Join AppScore Judge today'}
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-8 space-y-5">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                {mode === 'signup' && (
                                    <div className="space-y-2">
                                        <label htmlFor="fullName" className="block text-sm font-medium text-[var(--color-text-secondary)]">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={20} />
                                            <input
                                                id="fullName"
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-all"
                                                placeholder="John Doe"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-secondary)]">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={20} />
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-all"
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text-secondary)]">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={20} />
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-12 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-all"
                                            placeholder="••••••••"
                                            minLength={6}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary w-full text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                                        </>
                                    ) : (
                                        mode === 'login' ? 'Sign In' : 'Create Account'
                                    )}
                                </button>

                                <div className="text-center text-sm text-[var(--color-text-secondary)]">
                                    {mode === 'login' ? (
                                        <>
                                            Don't have an account?{' '}
                                            <button
                                                type="button"
                                                onClick={handleModeSwitch}
                                                className="text-[var(--color-primary-600)] font-semibold hover:text-[var(--color-primary-700)] cursor-pointer"
                                            >
                                                Sign Up
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            Already have an account?{' '}
                                            <button
                                                type="button"
                                                onClick={handleModeSwitch}
                                                className="text-[var(--color-primary-600)] font-semibold hover:text-[var(--color-primary-700)] cursor-pointer"
                                            >
                                                Sign In
                                            </button>
                                        </>
                                    )}
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
