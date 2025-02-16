import { AuthProvider, AuthUser, AuthError, AuthTokens, AUTH_ERROR_CODES } from './types';

export class MockAuthProvider implements AuthProvider {
    private currentUser: AuthUser | null = null;
    private mockTokens: AuthTokens | null = null;

    constructor() {
        // 開発用の初期ユーザーを設定
        if (process.env.NEXT_PUBLIC_MOCK_USER_EMAIL) {
            this.currentUser = {
                id: process.env.NEXT_PUBLIC_MOCK_USER_ID || 'mock-user-1',
                cognitoSub: 'mock-cognito-sub-1',
                email: process.env.NEXT_PUBLIC_MOCK_USER_EMAIL,
                displayName: 'Development User'
            };
            this.mockTokens = {
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token',
                idToken: 'mock-id-token'
            };
        }
    }

    async signIn(email: string, password: string): Promise<AuthUser> {
        // 開発用の簡易認証
        if (email === process.env.NEXT_PUBLIC_MOCK_USER_EMAIL && password === 'password') {
            this.currentUser = {
                id: process.env.NEXT_PUBLIC_MOCK_USER_ID || 'mock-user-1',
                cognitoSub: 'mock-cognito-sub-1',
                email: email,
                displayName: 'Development User'
            };
            this.mockTokens = {
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token',
                idToken: 'mock-id-token'
            };
            return this.currentUser;
        }

        throw new AuthError(
            AUTH_ERROR_CODES.INVALID_CREDENTIALS,
            'Invalid email or password'
        );
    }

    async signOut(): Promise<void> {
        this.currentUser = null;
        this.mockTokens = null;
    }

    async getCurrentUser(): Promise<AuthUser | null> {
        return this.currentUser;
    }

    async refreshSession(): Promise<AuthTokens | null> {
        return this.mockTokens;
    }

    async isAuthenticated(): Promise<boolean> {
        return this.currentUser !== null;
    }
}
