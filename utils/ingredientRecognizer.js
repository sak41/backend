/**
 * ingredientRecognizer.js
 *
 * This is a pluggable recognizer:
 * - By default it returns a naive set (stub) based on filename or a small heuristic.
 * - If you want high-quality recognition, replace the stub with calls to Google Vision / Clarifai / OpenAI Vision here.
 *
 * Usage:
 *   const recognized = await recognizeFromImage('/path/to/uploads/123.jpg')
 */

const path = require("path");
const fs = require("fs");

async function recognizeFromImage(filePath) {
  // If user has configured a provider, they can implement calls here.
  const provider = process.env.VISION_PROVIDER;
  const apiKey = process.env.VISION_API_KEY;

  if (provider && apiKey) {
    // TODO: implement provider-specific code.
    // For now, we just fall back to stub even if provider provided.
  }

  // STUB: basic heuristic:
  // - if filename includes common ingredients, return those
  const basename = path.basename(filePath).toLowerCase();
  const known = ["tomato", "onion", "garlic", "egg", "banana", "milk", "chicken", "rice", "potato", "carrot", "mushroom", "cheese", "avocado", "shrimp", "beef", "spinach", "lemon", "pepper", "cucumber"];
  const found = known.filter((k) => basename.includes(k));
  if (found.length) return found;

  // fallback: return a small default list — the frontend can then show these to user to confirm/edit
  return ["tomato", "onion", "garlic"];
}

module.exports = { recognizeFromImage };
