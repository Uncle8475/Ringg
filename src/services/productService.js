const DISABLED_ERROR = 'Product service is disabled (Supabase removed).';

const productService = {
  async getOffers() {
    throw new Error(DISABLED_ERROR);
  },
  async getRings() {
    throw new Error(DISABLED_ERROR);
  },
};

export default productService;
