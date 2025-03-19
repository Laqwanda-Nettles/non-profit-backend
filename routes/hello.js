const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const hello = "Hello World!";
  res.status(200).json(hello);
});

module.exports = router;
