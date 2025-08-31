const mongoose = require("mongoose");

const connectDB = async (mongoUri) => {
  try {
    await mongoose.connect(mongoUri, {
      // options are not required in mongoose v6+
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message || err);
    process.exit(1);
  }
};

module.exports = connectDB;
