import { adminAuth } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { idToken } = await request.json();

  if (!idToken) {
    return NextResponse.json({ error: "ID token required" }, { status: 400 });
  }

  try {
    const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 days in ms
    const sessionCookie = await adminAuth().createSessionCookie(idToken, {
      expiresIn,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set("__session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid ID token" }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("__session");
  return response;
}
