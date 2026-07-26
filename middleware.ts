// Middleware temporarily disabled for auth debugging
// It will be re-enabled once the cookie forwarding is fixed

import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
