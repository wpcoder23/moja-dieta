import { db } from "./index";
import { users, ingredients, supplementDefinitions } from "./schema";
import { ingredientsSeed } from "../../data/ingredients-seed";
import { lidlProductsSeed } from "../../data/lidl-products-seed";
import { imageMap } from "../../data/image-map";

async function seed() {
  console.log("Seeding database...");

  // Seed users
  const existingUsers = db.select().from(users).all();
  if (existingUsers.length === 0) {
    db.insert(users).values([
      {
        name: "Kris",
        pinHash: "1234", // TODO: hash properly
        birthDate: "1992-10-19",
        heightCm: 183,
        currentWeight: 107,
        targetWeight: 80,
        dailyCalorieTarget: 2500,
        dailyProteinTarget: 175,
        dailyFatTarget: 160,
        dailyCarbTarget: 90,
        dailyCarbMin: null,
        gender: "M",
        avgDailySteps: 11000,
        avgStepCalories: 375,
      },
      {
        name: "Aksana",
        pinHash: "1234", // TODO: hash properly
        birthDate: "1995-12-26",
        heightCm: 160,
        currentWeight: 64.2,
        targetWeight: 58,
        dailyCalorieTarget: 1500,
        dailyProteinTarget: 105,
        dailyFatTarget: 83,
        dailyCarbTarget: 83,
        dailyCarbMin: 75,
        gender: "F",
        avgDailySteps: 7000,
        avgStepCalories: 170,
      },
    ]).run();
    console.log("  Users seeded: Kris + Aksana");
  }

  // Seed ingredients
  const existingIngredients = db.select().from(ingredients).all();
  if (existingIngredients.length === 0) {
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
    console.log(`  Ingredients seeded: ${ingredientsSeed.length} items`);

    // Seed Lidl-specific products
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
    console.log(`  Lidl products seeded: ${lidlProductsSeed.length} items`);
  }

  // Seed supplements for Kris (userId=1)
  const existingSupps = db.select().from(supplementDefinitions).all();
  if (existingSupps.length === 0) {
    const krisSupps = [
      { userId: 1, name: "D3+K2 (Keto Centrum)", dosage: "5000 IU", timeOfDay: "morning" },
      { userId: 1, name: "Magnez (glicynian)", dosage: "400 mg", timeOfDay: "evening" },
      { userId: 1, name: "Omega-3 (EPA+DHA)", dosage: "2g", timeOfDay: "with_meal" },
      { userId: 1, name: "Witamina E (d-alfa-tokoferol)", dosage: "200 IU", timeOfDay: "with_meal" },
      { userId: 1, name: "Cynk", dosage: "30 mg", timeOfDay: "morning" },
      { userId: 1, name: "Bor", dosage: "6 mg", timeOfDay: "morning" },
    ];
    const aksanaSupps = [
      { userId: 2, name: "D3+K2 (Keto Centrum)", dosage: "3000 IU", timeOfDay: "morning" },
      { userId: 2, name: "Magnez (glicynian)", dosage: "300 mg", timeOfDay: "evening" },
      { userId: 2, name: "Omega-3 (EPA+DHA)", dosage: "2g", timeOfDay: "with_meal" },
      { userId: 2, name: "Witamina E (d-alfa-tokoferol)", dosage: "200 IU", timeOfDay: "with_meal" },
      { userId: 2, name: "Cynk", dosage: "15 mg", timeOfDay: "morning" },
      { userId: 2, name: "B6 (P5P)", dosage: "50 mg", timeOfDay: "morning" },
      { userId: 2, name: "Siemię lniane", dosage: "1 łyżka", timeOfDay: "morning" },
    ];
    for (const s of [...krisSupps, ...aksanaSupps]) {
      db.insert(supplementDefinitions).values(s).run();
    }
    console.log("  Supplements seeded: Kris (6) + Aksana (7)");
  }

  console.log("Seed complete!");
}

seed();
