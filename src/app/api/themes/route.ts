import { adminDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const snap = await adminDb()
    .collection("riddle_themes")
    .orderBy("created_at")
    .get();

  const themes = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json({ themes });
}
