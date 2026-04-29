import apiClient from './apiClient';
import authService from './authService';
import userService from './userService';
import transactionService from './transactionService';
import productService from './productService';
import resumeService from './resumeService';

export {
    apiClient,
    authService,
    userService,
    transactionService,
    productService,
    resumeService
};

const api = {
    ...authService,
    ...userService,
    ...transactionService,
    ...productService,
    ...resumeService,
    // Helpers re-export for backward compatibility
    setAuthToken: apiClient.setAuthToken,
    getAuthToken: apiClient.getAuthToken,
    DEFAULT_BASE_URL: 'https://api.example.com',
    BASE_URL: apiClient.BASE_URL
};

export default api;
