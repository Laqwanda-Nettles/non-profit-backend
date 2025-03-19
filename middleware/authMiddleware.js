const { auth, db } = require("../config/firebase");

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    //Verify Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);

    //Check if the token is expired or invalid
    if (!decodedToken) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Invalid or expired token" });
    }

    const userDoc = await db.collection("users").doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    req.user = { uid: decodedToken.uid, role: userDoc.data().role };
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    res.status(403).json({ error: "Unauthorized: Invalid or expired token" });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Forbidden: Insufficent permissions" });
    }
    next();
  };
};

module.exports = { authenticateUser, authorizeRoles };
