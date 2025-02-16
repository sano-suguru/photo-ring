import { MockAuthProvider } from './mock';
import { CognitoAuthProvider } from './cognito';
import { AuthProvider } from './types';

let authProvider: AuthProvider;

export function getAuthProvider(): AuthProvider {
    if (!authProvider) {
        authProvider = process.env.NEXT_PUBLIC_AUTH_MODE === 'mock'
            ? new MockAuthProvider()
            : new CognitoAuthProvider();
    }
    return authProvider;
}

export * from './types';
