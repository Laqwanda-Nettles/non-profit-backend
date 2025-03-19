const express = require("express");
const { db } = require("../config/firebase");
const {
  authenticateUser,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

//Get all blogs/news (Public)
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("blogs").get();
    const blogs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ error: "Failed to retrieve blogs" });
  }
});

//Get single blog by ID
router.get("/:id", async (req, res) => {
  try {
    const blogRef = db.collection("blogs").doc(req.params.id);
    const blogDoc = await blogRef.get();

    if (!blogDoc.exists) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.status(200).json({ id: blogDoc.id, ...blogDoc.data() });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ error: "Failed to retrieve blog" });
  }
});

//Add new blog/news (Admin Only)
router.post(
  "/",
  authenticateUser,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { title, content, author } = req.body;

      if (!title || !content || !author) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const newBlog = { title, content, author, createdAt: new Date() };
      const docRef = await db.collection("blogs").add(newBlog);

      res.status(201).json({ message: "Blog added", id: docRef.id });
    } catch (error) {
      console.error("Error adding blog:", error);
      res.status(500).json({ error: "Failed to add blog" });
    }
  }
);

//Edit blog/news (Admin Only)
router.put(
  "/:id",
  authenticateUser,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { title, content, author } = req.body;
      const blogRef = db.collection("blogs").doc(req.params.id);
      const blogDoc = await blogRef.get();

      if (!blogDoc.exists) {
        return res.status(404).json({ error: "Blog not found" });
      }

      await blogRef.update({ title, content, author });

      res.status(200).json({ message: "Blog updated" });
    } catch (error) {
      console.error("Error updating blog:", error);
      res.status(500).json({ error: "Failed to update blog" });
    }
  }
);

//Delete blog/news (Admin Only)
router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const blogRef = await db.collection("blogs").doc(req.params.id);
      const blogDoc = await blogRef.get();

      if (!blogDoc.exists) {
        return res.status(404).json({ error: "Blog not found" });
      }

      await blogRef.delete();
      res.status(200).json({ message: "Blog deleted" });
    } catch (error) {
      console.error("Error deleting blog:", error);
      res.status(500).json({ error: "Failed to delete blog" });
    }
  }
);

module.exports = router;
