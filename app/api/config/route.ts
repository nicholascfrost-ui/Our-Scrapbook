import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    url: process.env.SUPABASE_URL || null,
    key: process.env.SUPABASE_ANON_KEY || null,
  });
}
