const mongoose = require("mongoose");

const IngredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, default: 1 }, // numeric quantity for scaling
  unit: { type: String, default: "" }
}, { _id: false });

const SubstitutionSchema = new mongoose.Schema({
  ingredient: String,
  suggestions: [String]
}, { _id: false });

const RecipeSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: String,
  cuisine: String,
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
  cookTimeMinutes: { type: Number, default: 10 },
  servings: { type: Number, default: 2 },
  ingredients: [IngredientSchema],
  steps: [String],
  nutrition: {
    calories: Number,
    protein: Number,
    fat: Number,
    carbs: Number
  },
  tags: [String], // e.g., vegetarian, gluten-free
  imageUrl: String,
  substitutions: [SubstitutionSchema],
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 5 }
    }
  ],
  avgRating: { type: Number, default: 0 }
}, { timestamps: true });

RecipeSchema.methods.updateAvgRating = function () {
  if (!this.ratings || this.ratings.length === 0) {
    this.avgRating = 0;
    return this.save();
  }
  const sum = this.ratings.reduce((s, r) => s + r.rating, 0);
  this.avgRating = Math.round((sum / this.ratings.length) * 10) / 10; // one decimal
  return this.save();
};

module.exports = mongoose.model("Recipe", RecipeSchema);
