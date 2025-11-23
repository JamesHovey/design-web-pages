import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const GATEWAY_USERNAME = "pmw";
const GATEWAY_PASSWORD = "pmw";
const GATEWAY_COOKIE = "gateway_auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (username === GATEWAY_USERNAME && password === GATEWAY_PASSWORD) {
      const response = NextResponse.json({ success: true });

      // Set cookie that expires in 24 hours
      response.cookies.set(GATEWAY_COOKIE, "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
