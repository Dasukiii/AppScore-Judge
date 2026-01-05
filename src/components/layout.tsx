import { Outlet, Navigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

export function Layout() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[var(--color-primary-200)] border-t-[var(--color-primary-600)] rounded-full animate-spin" />
                    <p className="text-[var(--color-text-secondary)]">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-[var(--color-surface-elevated)]">
            <Navbar />
            {/* Main Content */}
            <main className="lg:ml-72 pt-20 lg:pt-8 pb-8 px-4 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
