# Progress

## Status: Needs Firebase project setup before running

All code is ready. The following setup steps are required before the app will work.

---

## TODO: Firebase Setup Checklist

### 1. Create a Firebase project and update Google Cloud redirect URI
- Go to https://console.firebase.google.com and create a new project
- Once created, note the **Project ID** (found in Project Settings → General)
- Then go to console.cloud.google.com → APIs & Services → Credentials → your OAuth 2.0 Client ID
- Under **Authorized redirect URIs**, replace the old redirect URI with:
  `https://{your-project-id}.firebaseapp.com/__/auth/handler`

### 2. Enable Google Auth
- Firebase Console → Authentication → Sign-in method → Enable Google

### 3. Get client credentials
- Firebase Console → Project Settings → Your apps → Add web app
- Copy the config values into `.env.local`:
  ```
  NEXT_PUBLIC_FIREBASE_API_KEY=
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
  NEXT_PUBLIC_FIREBASE_APP_ID=
  ```

### 4. Get admin (service account) credentials
- Firebase Console → Project Settings → Service accounts → Generate new private key
- From the downloaded JSON, copy into `.env.local`:
  ```
  FIREBASE_CLIENT_EMAIL=   (client_email field)
  FIREBASE_PRIVATE_KEY=    (private_key field — keep the \n escapes, wrap in quotes)
  ```

### 5. Enable Firestore
- Firebase Console → Firestore Database → Create database
- Start in **test mode** (open rules) for development

### 6. Create Firestore composite indexes
These are required for the queries to work. Create them in Firebase Console → Firestore → Indexes:

| Collection     | Fields                        |
|----------------|-------------------------------|
| `players`      | `match_id` ASC, `joined_at` ASC |
| `match_riddles`| `match_id` ASC, `sort_order` ASC |
| `player_notes` | `match_riddle_id` ASC         |
| `matches`      | `code` ASC                    |

### 7. Seed initial riddle themes
Use the in-app AI generation feature (Create page → "Generate a custom theme with AI"),
or write a seed script that calls `adminDb().collection("riddle_themes").doc().set({...})`.

### 8. Configure Firestore security rules (before going to production)
Current test-mode rules allow all reads/writes. Replace with proper rules, e.g.:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if false; // all writes go through API routes
    }
  }
}
```

### 9. Add authorized domain for Google Auth
- Firebase Console → Authentication → Settings → Authorized domains
- Add your production domain (localhost is already included by default)
