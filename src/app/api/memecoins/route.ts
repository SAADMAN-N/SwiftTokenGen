import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate and transform the data
    const memecoinData = {
      name: String(data.name),
      symbol: String(data.symbol),
      decimals: Number(data.decimals),
      totalSupply: String(data.totalSupply),
      mintAddress: String(data.mintAddress),
      creatorAddress: String(data.creatorAddress),
      network: String(data.network),
      hasMintAuthority: Boolean(data.hasMintAuthority),
      hasFreezeAuthority: Boolean(data.hasFreezeAuthority),
      hasUpdateAuthority: Boolean(data.hasUpdateAuthority),
      priceInSol: Number(data.priceInSol),
      paymentStatus: String(data.paymentStatus),
      paymentTx: String(data.paymentTx)
    };

    // Validate required fields
    const requiredFields = [
      'name', 'symbol', 'decimals', 'totalSupply', 'mintAddress',
      'creatorAddress', 'network', 'hasMintAuthority', 'hasFreezeAuthority',
      'hasUpdateAuthority', 'priceInSol'
    ];

    const missingFields = requiredFields.filter(field => 
      memecoinData[field as keyof typeof memecoinData] === undefined ||
      memecoinData[field as keyof typeof memecoinData] === null
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const memecoin = await prisma.memecoin.create({
      data: memecoinData,
    });

    return NextResponse.json(memecoin);
  } catch (error) {
    console.error('Failed to create memecoin:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create memecoin' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await prisma.$connect();
    
    const memecoins = await prisma.memecoin.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        symbol: true,
        mintAddress: true,
        createdAt: true,
        totalSupply: true,
        priceInSol: true,
        paymentStatus: true,
      }
    });

    return NextResponse.json(memecoins);
  } catch (error) {
    // Type guard for error object
    const errorDetails = {
      name: error instanceof Error ? error.name : 'Unknown Error',
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : 'UNKNOWN',
      stack: error instanceof Error ? error.stack : undefined
    };

    // Log the error details
    console.error('Detailed database error:', errorDetails);

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { error: `Database connection failed: ${errorDetails.message}` },
        { status: 500 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: `Database query failed: ${errorDetails.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: `Internal server error: ${errorDetails.message}` },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
