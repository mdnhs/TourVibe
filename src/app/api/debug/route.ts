import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({
      success: true,
      hasUrl: !!process.env.DATABASE_URL,
      urlLength: process.env.DATABASE_URL?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      userCount,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      hasUrl: !!process.env.DATABASE_URL,
      urlLength: process.env.DATABASE_URL?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
