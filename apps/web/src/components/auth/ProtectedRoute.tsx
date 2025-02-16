'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            // 現在のパスをエンコードしてクエリパラメータとして追加
            const returnPath = encodeURIComponent(pathname);
            router.push(`/login?returnTo=${returnPath}`);
        }
    }, [isAuthenticated, loading, router, pathname]);

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}