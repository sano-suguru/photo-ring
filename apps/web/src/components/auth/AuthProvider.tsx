import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuthProvider } from '@/lib/auth';
import type { AuthUser } from '@/lib/auth';

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const authProvider = getAuthProvider();

    useEffect(() => {
        const initAuth = async () => {
            try {
                const currentUser = await authProvider.getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, [authProvider]);

    const signIn = async (email: string, password: string) => {
        try {
            const user = await authProvider.signIn(email, password);
            setUser(user);
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await authProvider.signOut();
            setUser(null);
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        signIn,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}
