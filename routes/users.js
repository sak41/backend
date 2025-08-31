const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");

router.get("/me", auth, userCtrl.me);
router.post("/favorites", auth, userCtrl.addFavorite);
router.delete("/favorites", auth, userCtrl.removeFavorite);
router.get("/suggestions", auth, userCtrl.suggest);

module.exports = router;
