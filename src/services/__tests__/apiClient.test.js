import apiClient from '../apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('apiClient', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        fetch.mockClear();
    });

    describe('getAuthToken', () => {
        it('should retrieve token from storage', async () => {
            AsyncStorage.getItem.mockResolvedValue('test-token');
            const token = await apiClient.getAuthToken();
            expect(token).toBe('test-token');
            expect(AsyncStorage.getItem).toHaveBeenCalledWith('cosmic_attire_auth_token');
        });

        it('should return null on error', async () => {
            AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
            const token = await apiClient.getAuthToken();
            expect(token).toBeNull();
        });
    });

    describe('setAuthToken', () => {
        it('should set token in storage', async () => {
            await apiClient.setAuthToken('new-token');
            expect(AsyncStorage.setItem).toHaveBeenCalledWith('cosmic_attire_auth_token', 'new-token');
        });

        it('should remove token if null is passed', async () => {
            await apiClient.setAuthToken(null);
            expect(AsyncStorage.removeItem).toHaveBeenCalledWith('cosmic_attire_auth_token');
        });
    });

    describe('request', () => {
        it('should make a basic GET request', async () => {
            fetch.mockResolvedValue({
                ok: true,
                text: jest.fn().mockResolvedValue(JSON.stringify({ success: true })),
            });

            const result = await apiClient.request('GET', '/test');

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/test'),
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                    })
                })
            );
            expect(result).toEqual({ success: true });
        });

        it('should inject auth token when requireAuth is true', async () => {
            AsyncStorage.getItem.mockResolvedValue('auth-token');
            fetch.mockResolvedValue({
                ok: true,
                text: jest.fn().mockResolvedValue('{}'),
            });

            await apiClient.request('GET', '/protected', { requireAuth: true });

            expect(fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer auth-token',
                    })
                })
            );
        });

        it('should throw error on failed request', async () => {
            fetch.mockResolvedValue({
                ok: false,
                status: 400,
                text: jest.fn().mockResolvedValue(JSON.stringify({ message: 'Bad Request' })),
            });

            await expect(apiClient.request('GET', '/error')).rejects.toThrow('Bad Request');
        });
    });
});
