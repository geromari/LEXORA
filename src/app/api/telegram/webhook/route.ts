import { NextRequest, NextResponse } from "next/server";
import { handleTelegramUpdate } from "@/lib/telegram";

export async function POST(req: NextRequest): Promise<NextResponse> {
  return handleTelegramUpdate(req);
}
