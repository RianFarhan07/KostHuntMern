import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config(); // Ensure .env variables are loaded

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

export const auth = admin.auth();
export default admin;