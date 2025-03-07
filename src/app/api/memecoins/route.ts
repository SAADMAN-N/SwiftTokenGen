import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const memecoin = await prisma.memecoin.create({
      data: {
        ...data,
        paymentStatus: data.paymentTx ? 'completed' : 'pending', // Set status based on paymentTx
        paymentTx: data.paymentTx, // Make sure this is included
      },
    });

    return NextResponse.json(memecoin);
  } catch (error) {
    console.error('Failed to create memecoin:', error);
    return NextResponse.json(
      { error: 'Failed to create memecoin' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const memecoins = await prisma.memecoin.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(memecoins);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch memecoins' },
      { status: 500 }
    );
  }
}
