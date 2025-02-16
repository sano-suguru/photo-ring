import {
    CognitoIdentityProvider,
    InitiateAuthCommand,
    InitiateAuthCommandInput,
    GlobalSignOutCommand,
    GetUserCommand,
    NotAuthorizedException
} from '@aws-sdk/client-cognito-identity-provider';
import { AuthProvider, AuthUser, AuthError, AuthTokens, AUTH_ERROR_CODES } from './types';

export class CognitoAuthProvider implements AuthProvider {
    private cognito: CognitoIdentityProvider;
    private tokens: AuthTokens | null = null;

    constructor() {
        this.cognito = new CognitoIdentityProvider({
            region: process.env.NEXT_PUBLIC_AWS_REGION
        });
    }

    async signIn(email: string, password: string): Promise<AuthUser> {
        try {
            const params: InitiateAuthCommandInput = {
                AuthFlow: 'USER_PASSWORD_AUTH',
                ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
                AuthParameters: {
                    USERNAME: email,
                    PASSWORD: password,
                },
            };

            const command = new InitiateAuthCommand(params);
            const response = await this.cognito.send(command);

            if (!response.AuthenticationResult) {
                throw new AuthError(
                    AUTH_ERROR_CODES.UNKNOWN,
                    'Authentication failed'
                );
            }

            const { AccessToken, RefreshToken, IdToken } = response.AuthenticationResult;

            if (!AccessToken || !RefreshToken || !IdToken) {
                throw new AuthError(
                    AUTH_ERROR_CODES.UNKNOWN,
                    'Invalid authentication result'
                );
            }

            this.tokens = {
                accessToken: AccessToken,
                refreshToken: RefreshToken,
                idToken: IdToken
            };

            // ユーザー情報を取得
            const user = await this.getCurrentUser();
            if (!user) {
                throw new AuthError(
                    AUTH_ERROR_CODES.UNKNOWN,
                    'Failed to get user info'
                );
            }

            return user;
        } catch (error) {
            if (error instanceof NotAuthorizedException) {
                throw new AuthError(
                    AUTH_ERROR_CODES.INVALID_CREDENTIALS,
                    'Invalid email or password'
                );
            }
            throw new AuthError(
                AUTH_ERROR_CODES.UNKNOWN,
                error instanceof Error ? error.message : 'An unknown error occurred'
            );
        }
    }

    async signOut(): Promise<void> {
        if (this.tokens?.accessToken) {
            try {
                const command = new GlobalSignOutCommand({
                    AccessToken: this.tokens.accessToken
                });
                await this.cognito.send(command);
            } catch (error) {
                console.error('Error during sign out:', error);
            }
        }
        this.tokens = null;
    }

    async getCurrentUser(): Promise<AuthUser | null> {
        if (!this.tokens?.accessToken) {
            return null;
        }

        try {
            const command = new GetUserCommand({
                AccessToken: this.tokens.accessToken
            });
            const response = await this.cognito.send(command);

            if (!response.UserAttributes) {
                return null;
            }

            const getAttribute = (name: string) =>
                response.UserAttributes?.find(attr => attr.Name === name)?.Value;

            return {
                id: getAttribute('custom:app_user_id') || '',
                cognitoSub: getAttribute('sub') || '',
                email: getAttribute('email') || '',
                displayName: getAttribute('name') || ''
            };
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    async refreshSession(): Promise<AuthTokens | null> {
        if (!this.tokens?.refreshToken) {
            return null;
        }

        try {
            const params: InitiateAuthCommandInput = {
                AuthFlow: 'REFRESH_TOKEN_AUTH',
                ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
                AuthParameters: {
                    REFRESH_TOKEN: this.tokens.refreshToken
                },
            };

            const command = new InitiateAuthCommand(params);
            const response = await this.cognito.send(command);

            if (!response.AuthenticationResult) {
                return null;
            }

            const { AccessToken, IdToken } = response.AuthenticationResult;

            if (!AccessToken || !IdToken) {
                return null;
            }

            this.tokens = {
                ...this.tokens,
                accessToken: AccessToken,
                idToken: IdToken
            };

            return this.tokens;
        } catch (error) {
            console.error('Error refreshing session:', error);
            return null;
        }
    }

    async isAuthenticated(): Promise<boolean> {
        const user = await this.getCurrentUser();
        return user !== null;
    }
}
