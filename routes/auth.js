const express = require("express");
const { auth, db } = require("../config/firebase");

const router = express.Router();

// Register Admin or Employee (Admin must be logged in to create employees)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, adminId } = req.body;
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    //Verify Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);
    const adminUser = await db.collection("users").doc(decodedToken.uid).get();

    if (!adminUser.exists || adminUser.data().role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins can register employees." });
    }

    //Role Validation
    if (!["admin", "employee"].includes(role)) {
      return res
        .status(400)
        .json({ error: "Invalid role. Must be admin or employee" });
    }

    //Check if user already exists in Firestore
    const existingUser = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (!existingUser.empty) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Create User in Firebase Auth
    const userRecord = await auth.createUser({ email, password });

    //Store in Firestore
    await db.collection("users").doc(userRecord.uid).set({
      email,
      role,
      createdAt: new Date(),
      adminId: decodedToken.uid,
    });

    res
      .status(201)
      .json({ message: "User registered successfully", uid: userRecord.uid });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    // Sign in with Firebase Auth
    const userRecord = await auth.getUserByEmail(email);

    if (!userRecord) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    //Retrieve user data from Firestore
    const userDoc = await db.collection("users").doc(userRecord.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found in Firestore" });
    }

    //Generate Firebase ID token (JWT)
    const idToken = await auth.createCustomToken(userRecord.uid);

    res.status(200).json({
      message: "Login successful",
      user: userDoc.data(),
      token: idToken,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

//Verify ID Token and Generate a Bearer Token
router.post("/verify-token", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a new Bearer token (same ID token for now)
    res.status(200).json({ token, user: userDoc.data() });
  } catch (error) {
    console.error("Token verfication error: ", error.message);
    res.status(403).json({ error: "Invalid or expired token" });
  }
});

module.exports = router;
