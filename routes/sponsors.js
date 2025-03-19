const express = require("express");
const { db } = require("../config/firebase");
const {
  authenticateUser,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

//Get all sponsors (Public)
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("sponsors").get();
    const sponsors = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(sponsors);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve sponsors" });
  }
});

//Add new sponsor (Admin only)
router.post(
  "/",
  //   authenticateUser,
  //   authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { name, logoUrl } = req.body;

      if (!name || !logoUrl) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const newSponsor = { name, logoUrl, createdAt: new Date() };
      const docRef = await db.collection("sponsors").add(newSponsor);

      res.status(201).json({ message: "Sponsor added", id: docRef.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to add sponsor" });
    }
  }
);

module.exports = router;
