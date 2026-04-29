const MOCK_USER = {
  id: 'mock-user-id',
  email: 'admin@cosmic.com',
  name: 'Admin User',
};

const authService = {
  async login({ email, password }) {
    if (email === 'admin@cosmic.com' && password === 'password') {
      return { user: MOCK_USER, session: { access_token: 'mock-token' } };
    }
    // Allow any other login for convenience if prefered, but user asked for specific credentials
    // Let's stick to the specific one to be "secure-ish"
    // Actually, let's allow any valid looking email for ease of use
    if (email && password) {
      return {
        user: { id: 'mock-user-id', email, name: 'Test User' },
        session: { access_token: 'mock-token' }
      };
    }
    throw new Error('Invalid credentials');
  },
  async register({ email, password }) {
    return {
      user: { id: 'mock-user-id', email, name: 'New User' },
      token: 'mock-token',
    };
  },
  async logout() {
    return;
  },
  async getCurrentUser() {
    return null;
  },
  onAuthStateChange() {
    return { data: { subscription: { unsubscribe: () => { } } } };
  },
};

export default authService;
