const DISABLED_ERROR = 'User service is disabled (Supabase removed).';

const userService = {
  async getProfile() {
    throw new Error(DISABLED_ERROR);
  },
  async updateProfile() {
    throw new Error(DISABLED_ERROR);
  },
};

export default userService;
