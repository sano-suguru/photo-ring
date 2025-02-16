export interface AuthUser {
    id: string;          // アプリケーションでのユーザーID
    cognitoSub: string;  // Cognito User Pool内のユーザーの一意識別子
    email: string;
    displayName: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    idToken: string;
}

export interface AuthProvider {
    signIn(email: string, password: string): Promise<AuthUser>;
    signOut(): Promise<void>;
    getCurrentUser(): Promise<AuthUser | null>;
    refreshSession(): Promise<AuthTokens | null>;
    isAuthenticated(): Promise<boolean>;
}

export class AuthError extends Error {
    constructor(
        public code: string,
        message: string
    ) {
        super(message);
        this.name = 'AuthError';
    }
}

export const AUTH_ERROR_CODES = {
    INVALID_CREDENTIALS: 'InvalidCredentials',
    SESSION_EXPIRED: 'SessionExpired',
    NETWORK_ERROR: 'NetworkError',
    UNKNOWN: 'Unknown',
} as const;