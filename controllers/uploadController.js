const path = require("path");
const ingredientRecognizer = require("../utils/ingredientRecognizer");

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const url = `/uploads/${req.file.filename}`;
    // run recognizer (stub or real)
    const imagePath = path.join(process.cwd(), "uploads", req.file.filename);
    const ingredients = await ingredientRecognizer.recognizeFromImage(imagePath);
    res.json({ imageUrl: url, ingredients });
  } catch (err) {
    next(err);
  }
};
