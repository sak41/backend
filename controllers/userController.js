const User = require("../models/User");
const Recipe = require("../models/Recipe");

// get current user profile
exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("favorites").lean();
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.addFavorite = async (req, res, next) => {
  try {
    const { recipeId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.favorites.includes(recipeId)) {
      user.favorites.push(recipeId);
      await user.save();
    }
    res.json({ favorites: user.favorites });
  } catch (err) {
    next(err);
  }
};

exports.removeFavorite = async (req, res, next) => {
  try {
    const { recipeId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.favorites = user.favorites.filter((r) => r.toString() !== recipeId);
    await user.save();
    res.json({ favorites: user.favorites });
  } catch (err) {
    next(err);
  }
};

// simple suggestions: based on user's top-rated recipes' tags/cuisine
exports.suggest = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();
    const RecipeModel = Recipe;
    // pick user's highest ratings
    const rated = user.ratings || [];
    const topRatedRecipeIds = rated
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5)
      .map((r) => r.recipe);

    const topRecipes = await RecipeModel.find({ _id: { $in: topRatedRecipeIds } }).lean();
    const preferredCuisines = new Set(topRecipes.map((r) => r.cuisine).filter(Boolean));
    const preferredTags = new Set((topRecipes.flatMap((r) => r.tags) || []).slice(0, 10));

    // find recipes that match
    const suggestions = await RecipeModel.find({
      $or: [
        { cuisine: { $in: [...preferredCuisines] } },
        { tags: { $in: [...preferredTags] } }
      ],
      _id: { $nin: topRatedRecipeIds.concat(user.favorites || []) }
    })
      .limit(10)
      .lean();

    res.json({ suggestions });
  } catch (err) {
    next(err);
  }
};
