import { NextResponse } from "next/server";
import { createPaste } from "@/lib/paste-storage";

export async function POST(request: Request) {
  const { text, expiryMinutes } = await request.json();

  if (!text || !expiryMinutes || expiryMinutes < 1 || expiryMinutes > 60) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { id, deleteToken } = createPaste(text, expiryMinutes);
  return NextResponse.json({ id, deleteToken });
}
