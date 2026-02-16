'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to read the SSO token from localStorage.
 * Returns the token string or null if not available.
 */
export function useSsoToken() {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        setToken(localStorage.getItem('tpc_token'));
    }, []);

    return token;
}

/**
 * Append ?sso_token=<token> to a URL if a token is available.
 */
export function appendSsoToken(url: string, token: string | null): string {
    if (!token || !url || url === '#') return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}sso_token=${token}`;
}
