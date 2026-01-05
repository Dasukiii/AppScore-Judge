import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, signIn, signUp, signOut } from '@/lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ error: Error | null }>;
    register: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const { error } = await signIn(email, password);
        return { error: error ? new Error(error.message) : null };
    }, []);

    const register = useCallback(async (email: string, password: string, fullName: string) => {
        const { error } = await signUp(email, password, fullName);
        return { error: error ? new Error(error.message) : null };
    }, []);

    const logout = useCallback(async () => {
        await signOut();
        setUser(null);
        setSession(null);
    }, []);

    const value = {
        user,
        session,
        loading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
