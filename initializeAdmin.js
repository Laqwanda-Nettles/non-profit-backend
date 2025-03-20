const { auth, db } = require("./config/firebase");
require("dotenv").config({ path: ".env.local" });

async function createInitialAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    // Create admin user in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
    });

    // Save the admin user in Firestore
    await db.collection("users").doc(userRecord.uid).set({
      email,
      role: "admin",
      createdAt: new Date(),
    });

    console.log("Admin user created successfully:", userRecord.uid);
  } catch (error) {
    console.error("Error creating initial admin:", error.message);
  }
}

createInitialAdmin();
