import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "pong", version: "87e65b0" });
}
