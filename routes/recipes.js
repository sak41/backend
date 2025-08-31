const express = require("express");
const router = express.Router();
const recipeCtrl = require("../controllers/recipeController");
const auth = require("../middleware/authMiddleware");

// public
router.get("/", recipeCtrl.getAll);
router.get("/:id", recipeCtrl.getById);
router.post("/match", recipeCtrl.match); // POST list of available ingredients

// protected actions
router.get("/:id/adjust", recipeCtrl.adjustServings);
router.post("/:id/rate", auth, recipeCtrl.rateRecipe);
router.post("/", auth, recipeCtrl.createRecipe); // create recipe (useful for admin/seed)

module.exports = router;
