import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_BASE_URL = 'https://api.example.com';
const BASE_URL = (global && global.__API_BASE_URL__) || DEFAULT_BASE_URL;
const AUTH_TOKEN_KEY = 'cosmic_attire_auth_token';

async function getAuthToken() {
    try {
        return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (e) {
        return null;
    }
}

async function setAuthToken(token) {
    try {
        if (token) {
            await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
        } else {
            await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        }
    } catch (e) {
        // swallow storage errors
    }
}

async function request(method, path, { body, query, requireAuth } = {}) {
    const url = new URL(path, BASE_URL);
    if (query && typeof query === 'object') {
        Object.keys(query).forEach((k) => {
            if (query[k] !== undefined && query[k] !== null) {
                url.searchParams.append(k, query[k])
            }
        });
    }

    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    };

    if (requireAuth) {
        const token = await getAuthToken();
        if (token) headers.Authorization = `Bearer ${token}`;
    }

    const opts = {
        method,
        headers,
    };
    if (body !== undefined) opts.body = JSON.stringify(body);

    // Operational Demo Mode Interceptor
    if (BASE_URL.includes('example.com')) {
        console.warn(`[DEMO MODE] Intercepting request to ${path}`);
        if (path === '/user/profile') {
            return { email: 'demo@cosmic.com', name: 'Demo User' };
        }
        if (path.includes('/transactions')) {
            return [
                { id: '1', description: 'Monthly Subscription', amount: -499, created_at: new Date().toISOString() },
                { id: '2', description: 'Coffee at Starbucks', amount: -250, created_at: new Date(Date.now() - 86400000).toISOString() },
                { id: '3', description: 'Wallet Refund', amount: 1000, created_at: new Date(Date.now() - 172800000).toISOString() },
            ];
        }
    }

    const res = await fetch(url.toString(), opts);
    const text = await res.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch (e) {
        // non-json response
        data = text;
    }

    if (!res.ok) {
        // Create enhanced error object
        const err = new Error(data && data.message ? data.message : `Request failed: ${res.status}`);
        err.status = res.status;
        err.body = data;
        throw err;
    }

    return data;
}

export default {
    request,
    setAuthToken,
    getAuthToken,
    BASE_URL
};
