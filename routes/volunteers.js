const express = require("express");
const { db } = require("../config/firebase");
const {
  authenticateUser,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get all volunteers (Admin & Employees)
router.get(
  "/",
  authenticateUser,
  authorizeRoles("admin", "employee"),
  async (req, res) => {
    try {
      const snapshot = await db.collection("volunteers").get();
      const volunteers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.status(200).json(volunteers);
    } catch (error) {
      console.error("Error retrieving volunteers:", error);
      res.status(500).json({
        error: "Failed to retrieve volunteers",
        details: error.message,
      });
    }
  }
);

// Add new volunteer (From Frontend Signup Form)
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, availability, skills, message } = req.body;

    if (!name || !email || !phone) {
      return res
        .status(400)
        .json({ error: "Name, Email, and Phone are required" });
    }

    const newVolunteer = {
      name,
      email,
      phone,
      availability,
      skills,
      message,
      createdAt: new Date(),
    };

    await db.collection("volunteers").add(newVolunteer);

    res.status(201).json({
      message: "Volunteer registered successfully!",
      volunteer: newVolunteer,
    });
  } catch (error) {
    console.error("Error adding volunteer:", error);
    res.status(500).json({ error: "Failed to add volunteer" });
  }
});

//Get a volunteer by ID (Admin & Employee)
router.get(
  "/:id",
  authenticateUser,
  authorizeRoles("admin", "employee"),
  async (req, res) => {
    try {
      const volunteerRef = db.collection("volunteers").doc(req.params.id);
      const volunteerDoc = await volunteerRef.get();

      if (!volunteerDoc.exists) {
        return res.status(404).json({ error: "Volunteer not found" });
      }

      res.status(200).json({ id: volunteerDoc.id, ...volunteerDoc.data() });
    } catch (error) {
      console.error("Error fetching volunteer:", error);
      res.status(500).json({ error: "Failed to retrieve volunteer" });
    }
  }
);

// Update volunteer status (Admin & Employees)
router.patch(
  "/:id/status",
  authenticateUser,
  authorizeRoles("admin", "employee"),
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      const validStatuses = [
        "pending",
        "approved",
        "review",
        "inactive",
        "active",
        "rejected",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }

      const volunteerRef = db.collection("volunteers").doc(req.params.id);
      const volunteerDoc = await volunteerRef.get();

      if (!volunteerDoc.exists) {
        return res.status(404).json({ error: "Volunteer not found" });
      }

      await volunteerRef.update({ status });

      res
        .status(200)
        .json({ message: "Volunteer status updated successfully!" });
    } catch (error) {
      console.error("Error updating volunteer status:", error);
      res.status(500).json({ error: "Failed to update volunteer status" });
    }
  }
);

module.exports = router;
