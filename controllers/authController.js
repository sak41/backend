const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

const genToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || "secret", {
    expiresIn: process.env.TOKEN_EXPIRES_IN || "7d"
  });
};

exports.register = [
  body("name").notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, email, password, dietaryPreferences } = req.body;
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: "Email already in use" });

      user = new User({ name, email, password, dietaryPreferences });
      await user.save();

      res.status(201).json({ token: genToken(user), user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
      next(err);
    }
  }
];

exports.login = [
  body("email").isEmail(),
  body("password").exists(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Invalid credentials" });

      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

      res.json({ token: genToken(user), user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
      next(err);
    }
  }
];
