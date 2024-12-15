// import admin from "firebase-admin";
// import dotenv from "dotenv";

// dotenv.config(); // Load environment variables from .env file

// // Initialize Firebase Admin SDK only once
// if (!admin.apps.length) {
//   // Replace escaped newline with actual newline
//   const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");

//   console.log("Private Key:", privateKey); // For debugging, remove after testing

//   admin.initializeApp({
//     credential: admin.credential.cert({
//       projectId: process.env.FIREBASE_PROJECT_ID,
//       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//       privateKey: privateKey, // The correctly formatted private key
//     }),
//   });
// }

// export const auth = admin.auth();
// export default admin;
