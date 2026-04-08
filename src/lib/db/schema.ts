import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  pinHash: text("pin_hash").notNull(),
  birthDate: text("birth_date"),
  heightCm: integer("height_cm"),
  currentWeight: real("current_weight"),
  targetWeight: real("target_weight"),
  dailyCalorieTarget: integer("daily_calorie_target"),
  dailyProteinTarget: integer("daily_protein_target"),
  dailyFatTarget: integer("daily_fat_target"),
  dailyCarbTarget: integer("daily_carb_target"),
  dailyCarbMin: integer("daily_carb_min"),
  gender: text("gender"), // M / F
  avgDailySteps: integer("avg_daily_steps"),
  avgStepCalories: integer("avg_step_calories"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const weightLogs = sqliteTable("weight_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  weight: real("weight").notNull(),
  loggedAt: text("logged_at").notNull(),
  note: text("note"),
});

export const ingredients = sqliteTable("ingredients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(), // meat/fish/dairy/vegetable/fruit/fat/supplement/spice/fermented
  caloriesPer100g: integer("calories_per_100g"),
  proteinPer100g: real("protein_per_100g"),
  fatPer100g: real("fat_per_100g"),
  carbsPer100g: real("carbs_per_100g"),
  fiberPer100g: real("fiber_per_100g"),
  micronutrients: text("micronutrients"), // JSON
  isGlp1Booster: integer("is_glp1_booster", { mode: "boolean" }).default(false),
  isAntiInflammatory: integer("is_anti_inflammatory", { mode: "boolean" }).default(false),
  isTestosteroneFriendly: integer("is_testosterone_friendly", { mode: "boolean" }).default(false),
  isHormoneFriendly: integer("is_hormone_friendly", { mode: "boolean" }).default(false),
  isClean15: integer("is_clean15", { mode: "boolean" }).default(false),
  pesticideRisk: text("pesticide_risk"), // low/medium/high
  storeAvailability: text("store_availability"), // JSON ["lidl","biedronka","auchan"]
  notes: text("notes"),
  imageUrl: text("image_url"),
});

export const meals = sqliteTable("meals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  prepTimeMin: integer("prep_time_min"),
  calories: integer("calories"),
  protein: real("protein"),
  fat: real("fat"),
  carbs: real("carbs"),
  fiber: real("fiber"),
  isGlp1Friendly: integer("is_glp1_friendly", { mode: "boolean" }).default(false),
  isAntiInflammatory: integer("is_anti_inflammatory", { mode: "boolean" }).default(false),
  isLowAcid: integer("is_low_acid", { mode: "boolean" }).default(false),
  isTestosteroneFriendly: integer("is_testosterone_friendly", { mode: "boolean" }).default(false),
  isHormoneFriendly: integer("is_hormone_friendly", { mode: "boolean" }).default(false),
  instructions: text("instructions"), // JSON
  eatingOrderHint: text("eating_order_hint"),
  tags: text("tags"), // JSON
});

export const mealIngredients = sqliteTable("meal_ingredients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  mealId: integer("meal_id").references(() => meals.id).notNull(),
  ingredientId: integer("ingredient_id").references(() => ingredients.id).notNull(),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(), // g/ml/szt
});

export const weeklyPlans = sqliteTable("weekly_plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  weekStart: text("week_start").notNull(),
  planData: text("plan_data").notNull(), // JSON
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const shoppingListItems = sqliteTable("shopping_list_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  weeklyPlanId: integer("weekly_plan_id"),
  ingredientId: integer("ingredient_id"),
  name: text("name").notNull(),
  quantity: real("quantity"),
  unit: text("unit"),
  store: text("store"), // lidl/biedronka/auchan/any
  isChecked: integer("is_checked", { mode: "boolean" }).default(false),
  category: text("category"),
  notes: text("notes"),
});

export const activityLogs = sqliteTable("activity_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: text("date").notNull(),
  steps: integer("steps"),
  stepsCalories: integer("steps_calories"),
  workoutType: text("workout_type"),
  workoutDurationMin: integer("workout_duration_min"),
  workoutCalories: integer("workout_calories"),
  source: text("source").default("manual"), // manual/ios_shortcut
  note: text("note"),
});

export const foodScans = sqliteTable("food_scans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  imagePath: text("image_path"),
  aiResponse: text("ai_response"), // JSON
  caloriesEstimated: integer("calories_estimated"),
  protein: real("protein"),
  fat: real("fat"),
  carbs: real("carbs"),
  mealType: text("meal_type"), // breakfast/lunch/dinner/snack
  scannedAt: text("scanned_at").default("CURRENT_TIMESTAMP"),
});

export const dailyLogs = sqliteTable("daily_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: text("date").notNull(),
  mealsEaten: text("meals_eaten"), // JSON
  totalCalories: integer("total_calories"),
  totalProtein: real("total_protein"),
  totalFat: real("total_fat"),
  totalCarbs: real("total_carbs"),
  totalFiber: real("total_fiber"),
  micronutrientTotals: text("micronutrient_totals"), // JSON
  waterMl: integer("water_ml").default(0),
  fastingStart: text("fasting_start"),
  fastingEnd: text("fasting_end"),
  steps: integer("steps"),
  totalBurned: integer("total_burned"),
  calorieDeficit: integer("calorie_deficit"),
  glp1Score: integer("glp1_score"),
  antiInflammatoryScore: integer("anti_inflammatory_score"),
});

export const supplementDefinitions = sqliteTable("supplement_definitions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  dosage: text("dosage"),
  timeOfDay: text("time_of_day"), // morning/evening/with_meal
  notes: text("notes"),
});

export const supplementLogs = sqliteTable("supplement_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  supplementId: integer("supplement_id").references(() => supplementDefinitions.id).notNull(),
  date: text("date").notNull(),
  takenAt: text("taken_at"),
});

export const menstrualCycle = sqliteTable("menstrual_cycle", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  periodStart: text("period_start").notNull(),
  periodEnd: text("period_end"),
  cycleLength: integer("cycle_length").default(28),
  notes: text("notes"),
});

export const pushSubscriptions = sqliteTable("push_subscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  subscription: text("subscription").notNull(), // JSON
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});
