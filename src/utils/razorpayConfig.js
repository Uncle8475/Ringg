// Razorpay Configuration - Web-based for Expo compatibility
// Using test credentials for development
// NEVER hardcode production keys in client code

export const RAZORPAY_KEY_ID = 'rzp_test_1DP5MMOk78Ygzp'; // Test Key
export const RAZORPAY_MERCHANT_NAME = 'COSMIC Attire';

/**
 * Generate Razorpay web checkout URL
 * Opens in browser/WebView instead of native SDK
 * @param {number} amount - Amount in INR (rupees)
 * @param {string} description - Payment description
 * @returns {string} Razorpay checkout URL
 */
export const getRazorpayCheckoutUrl = (amount, description = 'Add money to COSMIC wallet') => {
  // Amount must be in paise (₹ * 100)
  const amountInPaise = Math.round(amount * 100);
  
  // Base URL for Razorpay test checkout
  const baseUrl = 'https://checkout.razorpay.com/v1/checkout.js';
  
  // Create order simulation (in production, this would be from your backend)
  // For demo purposes, we'll use Razorpay's test mode with callback
  const params = new URLSearchParams({
    key: RAZORPAY_KEY_ID,
    name: RAZORPAY_MERCHANT_NAME,
    description: description,
    amount: amountInPaise,
    currency: 'INR',
    prefill_email: 'user@cosmic.app',
    prefill_contact: '9876543210',
    prefill_name: 'COSMIC User',
    theme_color: '#BFA668',
  });
  
  // Return a format for web checkout (this is used with WebBrowser)
  // In a real scenario, you'd create an order on backend and redirect to Razorpay hosted page
  return `https://razorpay.com/?key=${RAZORPAY_KEY_ID}&amount=${amountInPaise}&description=${encodeURIComponent(description)}`;
};

/**
 * Generate test order for Razorpay
 * In production, this would call your backend API
 * @param {number} amount - Amount in INR
 * @returns {object} Order details
 */
export const generateTestOrder = (amount) => {
  // Simulate backend order creation
  // In production, call your API endpoint that creates order with Razorpay
  return {
    id: `order_${Date.now()}`,
    entity: 'order',
    amount: Math.round(amount * 100),
    amount_paid: 0,
    amount_due: Math.round(amount * 100),
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
    status: 'created',
    attempts: 0,
    notes: {
      description: 'Add money to COSMIC wallet',
    },
    created_at: Math.floor(Date.now() / 1000),
  };
};
