const Recipe = require("../models/Recipe");
const { matchRecipes } = require("../utils/recipeMatcher");

// create recipe (admin / seeded) - basic create
exports.createRecipe = async (req, res, next) => {
  try {
    const data = req.body;
    const recipe = new Recipe(data);
    await recipe.save();
    res.status(201).json(recipe);
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { q, cuisine, difficulty, maxCookTime, tags, dietary } = req.query;
    const filter = {};
    if (cuisine) filter.cuisine = cuisine;
    if (difficulty) filter.difficulty = difficulty;
    if (maxCookTime) filter.cookTimeMinutes = { $lte: Number(maxCookTime) };
    if (tags) filter.tags = { $in: tags.split(",") };
    if (dietary) filter.tags = { $in: dietary.split(",") };

    if (q) {
      filter.title = { $regex: q, $options: "i" };
    }
    const recipes = await Recipe.find(filter).limit(200).lean();
    res.json({ count: recipes.length, recipes });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json(recipe);
  } catch (err) {
    next(err);
  }
};

// match by provided ingredients (POST body: { ingredients: ["egg", "tomato"], dietary: ["vegetarian"], limit: 10 })
exports.match = async (req, res, next) => {
  try {
    const { ingredients = [], dietary = [], limit = 10 } = req.body;
    const allRecipes = await Recipe.find({}).lean();
    const matches = matchRecipes(ingredients, allRecipes, { dietary, limit: Number(limit) });
    res.json(matches.slice(0, limit));
  } catch (err) {
    next(err);
  }
};

// adjust servings: returns adjusted ingredient quantities
exports.adjustServings = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id).lean();
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    const target = Number(req.query.servings) || recipe.servings;
    const factor = target / (recipe.servings || 1);
    const adjusted = (recipe.ingredients || []).map((ing) => ({
      name: ing.name,
      qty: Math.round((ing.qty || 0) * factor * 100) / 100,
      unit: ing.unit
    }));
    res.json({ recipeId: recipe._id, originalServings: recipe.servings, targetServings: target, ingredients: adjusted });
  } catch (err) {
    next(err);
  }
};

// rate a recipe: body { rating: 4 }
exports.rateRecipe = async (req, res, next) => {
  try {
    const user = req.user;
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const existing = recipe.ratings.find((r) => r.user.toString() === user._id.toString());
    const ratingValue = Number(req.body.rating);
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) return res.status(400).json({ message: "Rating 1-5 required" });

    if (existing) {
      existing.rating = ratingValue;
    } else {
      recipe.ratings.push({ user: user._id, rating: ratingValue });
    }
    await recipe.updateAvgRating();

    // also update in user's ratings
    const User = require("../models/User");
    const dbUser = await User.findById(user._id);
    const userRating = dbUser.ratings.find((r) => r.recipe.toString() === recipe._id.toString());
    if (userRating) userRating.rating = ratingValue;
    else dbUser.ratings.push({ recipe: recipe._id, rating: ratingValue });
    await dbUser.save();

    res.json({ message: "Rated", avgRating: recipe.avgRating });
  } catch (err) {
    next(err);
  }
};

exports.create = exports.createRecipe;
