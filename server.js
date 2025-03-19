const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: ".env.local" });

const app = express();

//Middleware
app.use(express.json());
app.use(cors());

//Routes
app.use("/api/auth", require("./routes/auth")); //Registration & Login
app.use("/api/volunteers", require("./routes/volunteers"));
app.use("/api/programs", require("./routes/programs"));
app.use("/api/blog", require("./routes/blog"));
app.use("/api/sponsors", require("./routes/sponsors"));
app.use("/api/hello", require("./routes/hello"));

//Start Server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on Port: ${PORT}`));
