import { useAuthContext } from '@/components/auth/AuthProvider';
import { AuthError } from '@/lib/auth';

export function useAuth() {
    const { user, loading, signIn, signOut } = useAuthContext();

    const login = async (email: string, password: string) => {
        try {
            await signIn(email, password);
        } catch (error) {
            if (error instanceof AuthError) {
                throw error;
            }
            throw new AuthError('UNKNOWN', 'An unexpected error occurred');
        }
    };

    const logout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Logout error:', error);
            throw new AuthError('UNKNOWN', 'Failed to sign out');
        }
    };

    return {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
    };
}