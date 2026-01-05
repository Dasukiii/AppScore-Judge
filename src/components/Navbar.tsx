import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    FileText,
    Library,
    BarChart3,
    LogOut,
    Menu,
    X,
    ChevronRight,
    ClipboardCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Submit App', path: '/submit', icon: FileText },
    { name: 'App Library', path: '/library', icon: Library },
    { name: 'Results', path: '/results', icon: BarChart3 },
];

export function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (!user) return null;

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col fixed left-4 top-4 bottom-4 w-64 bg-white rounded-2xl shadow-lg border border-[var(--color-border)] z-40">
                {/* Logo */}
                <div className="p-6 border-b border-[var(--color-border)]">
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] flex items-center justify-center">
                            <ClipboardCheck className="text-white" size={22} />
                        </div>
                        <span className="text-lg font-bold text-[var(--color-text-primary)]">
                            AppScore
                        </span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path === '/results' && location.pathname.startsWith('/results'));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${isActive
                                        ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-600)]'
                                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)]'
                                    }`}
                            >
                                <item.icon size={20} />
                                <span>{item.name}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="ml-auto"
                                    >
                                        <ChevronRight size={16} className="text-[var(--color-primary-500)]" />
                                    </motion.div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-[var(--color-border)]">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-surface-elevated)]">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-secondary-400)] to-[var(--color-secondary-600)] flex items-center justify-center text-white font-semibold">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                                {user.user_metadata?.full_name || 'Manager'}
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)] truncate">
                                {user.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 mt-2 rounded-xl text-red-500 hover:bg-red-50 font-medium transition-colors cursor-pointer"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-[var(--color-border)] z-40 px-4 flex items-center justify-between">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] flex items-center justify-center">
                        <ClipboardCheck className="text-white" size={18} />
                    </div>
                    <span className="font-bold text-[var(--color-text-primary)]">AppScore</span>
                </Link>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-lg hover:bg-[var(--color-surface-elevated)] cursor-pointer"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="lg:hidden fixed top-16 left-0 right-0 bottom-0 bg-white z-30 p-4"
                >
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path ||
                                (item.path === '/results' && location.pathname.startsWith('/results'));
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${isActive
                                            ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-600)]'
                                            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)]'
                                        }`}
                                >
                                    <item.icon size={20} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-medium cursor-pointer"
                        >
                            <LogOut size={20} />
                            <span>Sign Out</span>
                        </button>
                    </nav>
                </motion.div>
            )}
        </>
    );
}
