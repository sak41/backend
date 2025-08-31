/**
 * seed.js
 * Run: npm run seed
 * Will insert recipes from /data/recipes.json if Recipe collection is empty.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Recipe = require("../models/Recipe");
const path = require("path");
const fs = require("fs");

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/smart_recipe_db";

async function seed() {
  await connectDB(mongoUri);
  const count = await Recipe.countDocuments();
  if (count > 0) {
    console.log("Recipes collection not empty - skipping seed.");
    process.exit(0);
  }
  const dataPath = path.join(__dirname, "..", "data", "recipes.json");
  const raw = fs.readFileSync(dataPath, "utf-8");
  const recipes = JSON.parse(raw);
  await Recipe.insertMany(recipes);
  console.log(`Inserted ${recipes.length} recipes`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
