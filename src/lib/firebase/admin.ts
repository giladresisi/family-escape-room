import { App, initializeApp, getApps, getApp as getFirebaseApp, cert } from "firebase-admin/app";
import { getAuth, Auth, DecodedIdToken } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let _app: App | undefined;

function app(): App {
  if (_app) return _app;
  if (getApps().length > 0) {
    _app = getFirebaseApp();
    return _app;
  }
  _app = initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
  return _app;
}

export function adminAuth(): Auth {
  return getAuth(app());
}

export function adminDb(): Firestore {
  return getFirestore(app());
}

export async function getUserFromRequest(
  request: Request
): Promise<DecodedIdToken | null> {
  const cookieHeader = request.headers.get("cookie") || "";
  const sessionCookie = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("__session="))
    ?.slice("__session=".length);

  if (!sessionCookie) return null;

  try {
    return await adminAuth().verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}
