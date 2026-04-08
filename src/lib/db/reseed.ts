import { db } from "./index";
import { ingredients } from "./schema";
import { ingredientsSeed } from "../../data/ingredients-seed";
import { lidlProductsSeed } from "../../data/lidl-products-seed";
import { imageMap } from "../../data/image-map";

async function reseed() {
  console.log("Reseeding ingredients with images...");

  // Delete all existing ingredients
  db.delete(ingredients).run();
  console.log("  Cleared ingredients table");

  // Re-insert all base ingredients with imageUrl
  for (const ing of ingredientsSeed) {
    db.insert(ingredients).values({
      name: ing.name,
      category: ing.category,
      caloriesPer100g: ing.caloriesPer100g,
      proteinPer100g: ing.proteinPer100g,
      fatPer100g: ing.fatPer100g,
      carbsPer100g: ing.carbsPer100g,
      fiberPer100g: ing.fiberPer100g,
      micronutrients: JSON.stringify(ing.micronutrients),
      isGlp1Booster: ing.isGlp1Booster,
      isAntiInflammatory: ing.isAntiInflammatory,
      isTestosteroneFriendly: ing.isTestosteroneFriendly,
      isHormoneFriendly: ing.isHormoneFriendly,
      isClean15: ing.isClean15,
      pesticideRisk: ing.pesticideRisk,
      storeAvailability: JSON.stringify(ing.storeAvailability),
      notes: ing.notes || null,
      imageUrl: imageMap[ing.name] || null,
    }).run();
  }
  console.log(`  Base ingredients: ${ingredientsSeed.length}`);

  // Re-insert Lidl products
  for (const ing of lidlProductsSeed) {
    db.insert(ingredients).values({
      name: ing.name,
      category: ing.category,
      caloriesPer100g: ing.caloriesPer100g,
      proteinPer100g: ing.proteinPer100g,
      fatPer100g: ing.fatPer100g,
      carbsPer100g: ing.carbsPer100g,
      fiberPer100g: ing.fiberPer100g,
      micronutrients: JSON.stringify(ing.micronutrients),
      isGlp1Booster: ing.isGlp1Booster,
      isAntiInflammatory: ing.isAntiInflammatory,
      isTestosteroneFriendly: ing.isTestosteroneFriendly,
      isHormoneFriendly: ing.isHormoneFriendly,
      isClean15: false,
      pesticideRisk: ing.pesticideRisk,
      storeAvailability: JSON.stringify(ing.storeAvailability),
      notes: ing.notes || null,
      imageUrl: ing.imageUrl || null,
    }).run();
  }
  console.log(`  Lidl products: ${lidlProductsSeed.length}`);

  console.log(`  Total: ${ingredientsSeed.length + lidlProductsSeed.length} ingredients with images`);
  console.log("Reseed complete!");
}

reseed();
