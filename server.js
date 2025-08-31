require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const recipeRoutes = require("./routes/recipes");
const userRoutes = require("./routes/users");
const uploadRoutes = require("./routes/uploads");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI || "mongodb://localhost:27017/smart_recipe_db");

// middleware
app.use(cors());
app.use(express.json({ limit: "6mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// api routes
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/uploads", uploadRoutes);

// health
app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date() }));

// error handler (last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
