const express = require("express");
const { db } = require("../config/firebase");
const {
  authenticateUser,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

//Get all program signups (Admin & Employees)
router.get(
  "/",
  authenticateUser,
  authorizeRoles("admin", "employee"),
  async (req, res) => {
    try {
      const snapshot = await db.collection("program_signups").get();
      const signees = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.status(200).json(signees);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve program signups" });
    }
  }
);

//Add new program signup (From Frontend Signup Form)
router.post("/", async (req, res) => {
  try {
    const { name, email, program } = req.body;

    if (!name || !email || !program) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newSignup = {
      name,
      email,
      program,
      status: "Pending",
      createdAt: new Date(),
    };
    const docRef = await db.collection("program_signups").add(newSignup);

    res
      .status(201)
      .json({ message: "Program signup successful", id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: "Failed to add program signup" });
  }
});

//Update program signup status
router.patch(
  "/:id/status",
  authenticateUser,
  authorizeRoles("admin", "employee"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (
        ![
          "Pending",
          "Approved",
          "Rejected",
          "Completed",
          "Waitlisted",
          "Withdrawn",
        ].includes(status)
      ) {
        return res.status(400).json({ error: "Invalid status value" });
      }

      const signupRef = db.collection("program_signups").doc(id);
      await signupRef.update({ status });

      res.status(200).json({ message: "Status updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update status" });
    }
  }
);

module.exports = router;
