const { db } = require("./config/firebase");

async function testConnection() {
  try {
    await db.collection("test").add({ message: "Hello Firestore!" });
    console.log("✅ Firestore connection successful!");
  } catch (error) {
    console.error("❌ Firestore connection failed:", error);
  }
}

testConnection();
