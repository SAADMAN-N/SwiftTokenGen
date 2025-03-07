const createAdminReferralCode = async (walletAddress: string) => {
  const response = await fetch('/api/admin/referral-codes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      walletAddress, // Must match one of the ADMIN_WALLETS
      isAdmin: true,
      usageLimit: 100, // Set desired usage limit
      expiresAt: '2024-12-31', // Optional expiration date
    }),
  });

  const data = await response.json();
  return data.code;
};