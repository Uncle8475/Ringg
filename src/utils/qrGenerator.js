/**
 * QR Code Data Generator
 * 
 * Generates valid HTTPS URLs for QR encoding.
 * iOS can properly scan and open these URLs.
 * 
 * Rules:
 * - Always return valid HTTPS URL
 * - Include required parameters as query params
 * - Never encode raw JSON or plain IDs
 * - Never leave QR content empty
 */

export const generateRingSetupUrl = (ringId, userId, token) => {
  const baseUrl = 'https://cosmic-attire.app/setup';
  const params = new URLSearchParams({
    ringId: ringId || 'CR-00123',
    userId: userId || 'user123',
    token: token || 'setup_token_xyz',
    timestamp: new Date().getTime().toString(),
  });
  
  return `${baseUrl}?${params.toString()}`;
};

export const generateRingPairingUrl = (ringId, securityCode) => {
  const baseUrl = 'https://cosmic-attire.app/pairing';
  const params = new URLSearchParams({
    ringId: ringId || 'CR-00123',
    securityCode: securityCode || 'SEC-0000',
  });
  
  return `${baseUrl}?${params.toString()}`;
};

export const generateRingInviteUrl = (ringId, inviteCode) => {
  const baseUrl = 'https://cosmic-attire.app/invite';
  const params = new URLSearchParams({
    ringId: ringId || 'CR-00123',
    inviteCode: inviteCode || 'INVITE-ABC123',
  });
  
  return `${baseUrl}?${params.toString()}`;
};

export const generateShareUrl = (ringId, action = 'setup') => {
  const baseUrl = 'https://cosmic-attire.app/share';
  const params = new URLSearchParams({
    ringId: ringId || 'CR-00123',
    action: action, // setup | invite | pair
    source: 'ios-app',
  });
  
  return `${baseUrl}?${params.toString()}`;
};

/**
 * Deep link format (with fallback to HTTPS)
 * If cosmic-attire:// is not registered, iOS will fall back to HTTPS URL
 */
export const generateRingDeepLink = (ringId) => {
  const deepLink = `cosmic-attire://ring/${ringId}`;
  const fallbackUrl = `https://cosmic-attire.app/ring/${ringId}`;
  
  return {
    deepLink,
    fallback: fallbackUrl,
    // For QR encoding, use fallback to ensure iOS can open it
    qrContent: fallbackUrl,
  };
};

/**
 * Universal link format (works on iOS without app registration)
 */
export const generateUniversalLink = (ringId, action = 'setup') => {
  const baseUrl = 'https://cosmic-attire.app';
  
  const links = {
    setup: `${baseUrl}/setup?ringId=${ringId}`,
    pairing: `${baseUrl}/pairing?ringId=${ringId}`,
    invite: `${baseUrl}/invite?ringId=${ringId}`,
    ring: `${baseUrl}/ring/${ringId}`,
  };
  
  return links[action] || links.setup;
};

export default {
  generateRingSetupUrl,
  generateRingPairingUrl,
  generateRingInviteUrl,
  generateShareUrl,
  generateRingDeepLink,
  generateUniversalLink,
};
