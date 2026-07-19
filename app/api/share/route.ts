import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "a scholarship";
  const provider = searchParams.get("provider") || "";
  const country = searchParams.get("country") || "";

  const text = `🎓 I just matched with the ${title} scholarship!\n\n${provider}\n${country}\n\nFind your scholarship match at Blackspace.`;

  return NextResponse.json({ text });
}
