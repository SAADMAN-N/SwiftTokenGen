import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Run a simple query
    const result = await prisma.memecoin.count();
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      memecoinsCount: result
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Database connection failed'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}