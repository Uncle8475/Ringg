const DISABLED_ERROR = 'Transaction service is disabled (Supabase removed).';

const transactionService = {
  async getTransactions() {
    throw new Error(DISABLED_ERROR);
  },
  async getTransactionById() {
    throw new Error(DISABLED_ERROR);
  },
  async createTransaction() {
    throw new Error(DISABLED_ERROR);
  },
};

export default transactionService;
