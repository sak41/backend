/**
 * Simple recipe matching algorithm:
 * - Score = matchedIngredients / totalIngredients
 * - Add small bonus if dietary tags match (vegetarian, gluten-free etc)
 * - Filter by difficulty/cookTime if options provided
 */

function normalize(s) {
  if (!s) return "";
  return s.toString().trim().toLowerCase();
}

function matchRecipes(availableIngredients = [], recipes = [], opts = {}) {
  const available = (availableIngredients || []).map(normalize);
  const dietary = (opts.dietary || []).map(normalize);
  const limit = opts.limit || 20;

  const scored = recipes.map((r) => {
    const reqIngredients = (r.ingredients || []).map((ing) => normalize(ing.name));
    const total = reqIngredients.length || 1;
    const matched = reqIngredients.filter((ri) => available.some((a) => a.includes(ri) || ri.includes(a)));
    let score = matched.length / total;

    // dietary boost
    if (dietary.length && r.tags && r.tags.some((t) => dietary.includes(normalize(t)))) {
      score += 0.15;
    }

    // small bonus for avgRating
    const ratingBonus = (r.avgRating || 0) / 10; // e.g., 4.5 -> 0.45
    score += ratingBonus * 0.05;

    return { recipe: r, score, matched: matched.slice(0, 10), missing: reqIngredients.filter((ri) => !matched.includes(ri)) };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

module.exports = { matchRecipes };
