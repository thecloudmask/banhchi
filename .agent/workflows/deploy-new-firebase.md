---
description: How to deploy the project to a new Firebase account
---

# Deploying to a New Firebase Account

Follow these steps to deploy this project to a completely new Firebase account.

## 1. Firebase Console Setup
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and create a new project (e.g., `banhchi-app`).
3. Once created, go to **Build** section in the sidebar:
   - **Authentication**: Click "Get started", enable **Email/Password** and **Google** providers.
   - **Firestore Database**: Click "Create database", start in **Production mode**, select a region (e.g., `asia-southeast1`).
   - **Storage**: Click "Get started", start in **Production mode**.

## 2. Register Web App
1. Project Overview > Project Settings (gear icon).
2. Scroll down to "Your apps".
3. Click the Web icon (</>).
4. Register app nickname (e.g. `My App`).
5. **Copy the `firebaseConfig` object**. You will need these values for `.env.local`.

## 3. Local Configuration
1. Open your terminal in the project folder.
2. Install Firebase tools (if not installed):
   ```bash
   npm install -g firebase-tools
   ```
3. Login to the new account:
   ```bash
   firebase login
   # Follow browser prompts
   ```
4. Link the new project:
   ```bash
   firebase use --add
   # Select your newly created project from the list
   # Alias: prod (or default)
   ```

## 4. Environment Variables
1. Open `.env.local` (or create if missing).
2. Update the following keys with values from Step 2:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456...
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456...
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XYZ...
   ```

## 5. Cloudinary Setup (For Images)
The project uses Cloudinary for image uploads (banners, gallery).
- By default, it uses a hardcoded account in `src/lib/cloudinary.ts`.
- **To use your own account**:
  1. Create a Cloudinary account.
  2. Create an **Upload Preset** (unsigned).
  3. Update `src/lib/cloudinary.ts` with your `CLOUD_NAME` and `UPLOAD_PRESET`.

## 6. Build and Deploy
1. Build the project:
   ```bash
   npm run build
   # Ensure "✓ Compiled successfully" and NO errors
   ```
2. Deploy to Firebase:
   ```bash
   firebase deploy
   ```
   
## 7. Firestore Rules (Important)
By default, database might be locked. Ensure your `firestore.rules` allow read/write appropriately.
- If you see permission errors, check Firestore Rules in Console.
- Basic dev rules (insecure): `allow read, write: if true;`
- Proper rules: `allow read, write: if request.auth != null;`

## Troubleshooting
- **Build Error**: "Missing generateStaticParams": This requires fetching data from Firestore. Ensure your local env can access the database during build.
- **Hosting URL**: The URL is shown after `firebase deploy` completes.
