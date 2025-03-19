const admin = require("firebase-admin");
require("dotenv").config({ path: ".env.local" });

// Ensures environment variables are loaded
if (
  !process.env.FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_CLIENT_EMAIL ||
  !process.env.FIREBASE_PRIVATE_KEY
) {
  console.error("🔥 Firebase environment variables are missing!");
  process.exit(1); //Stop server if Firebase config is missing
}

//Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

const auth = admin.auth();
const db = admin.firestore();

module.exports = { auth, db };
