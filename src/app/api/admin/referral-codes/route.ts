import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateRandomCode } from '@/lib/utils';

const ADMIN_WALLETS = [
  '2CkMCBW3MxLsHKhPG4X68FqSxVptFkZQmi83SnWCgKQ3'
];

export async function POST(request: Request) {
  try {
    const { walletAddress, isAdmin, usageLimit, expiresAt } = await request.json();

    // Verify admin wallet
    if (!ADMIN_WALLETS.includes(walletAddress)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const code = await prisma.referralCode.create({
      data: {
        code: generateRandomCode(),
        isAdmin,
        usageLimit,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: walletAddress,
      }
    });

    return NextResponse.json(code);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create referral code' },
      { status: 500 }
    );
  }
}
