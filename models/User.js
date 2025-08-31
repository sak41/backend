const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  dietaryPreferences: [{ type: String }], // e.g., vegetarian, gluten-free
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
  ratings: [
    {
      recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
      rating: { type: Number, min: 1, max: 5 }
    }
  ]
}, { timestamps: true });

// password hashing
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", UserSchema);
