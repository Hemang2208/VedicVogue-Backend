import { body, param, query } from "express-validator";

export const createMenuItemValidation = [
  body("id")
    .isString()
    .withMessage("ID must be a string")
    .isLength({ min: 5, max: 50 })
    .withMessage("ID must be between 5 and 50 characters")
    .trim(),

  body("name")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .trim(),

  body("description")
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters")
    .trim(),

  body("price")
    .isNumeric()
    .withMessage("Price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("originalPrice")
    .optional()
    .isNumeric()
    .withMessage("Original price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Original price must be a positive number"),

  body("image")
    .isString()
    .withMessage("Image must be a string")
    .isURL()
    .withMessage("Image must be a valid URL"),

  body("category")
    .isString()
    .withMessage("Category must be a string")
    .isIn(["veg", "fitness", "office", "diet", "addons"])
    .withMessage("Category must be one of: veg, fitness, office, diet, addons"),

  body("calories")
    .isNumeric()
    .withMessage("Calories must be a number")
    .isInt({ min: 0 })
    .withMessage("Calories must be a positive integer"),

  body("prepTime")
    .isString()
    .withMessage("Prep time must be a string")
    .matches(/^\d+\s*(mins?|hours?)$/i)
    .withMessage("Prep time should be in format like '25 mins' or '1 hour'"),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array")
    .custom((tags: any[]) => {
      if (tags.length > 10) {
        throw new Error("Cannot have more than 10 tags");
      }
      return true;
    }),

  body("dietary")
    .optional()
    .isArray()
    .withMessage("Dietary must be an array")
    .custom((dietary: any[]) => {
      if (dietary.length > 10) {
        throw new Error("Cannot have more than 10 dietary preferences");
      }
      return true;
    }),

  body("nutritionScore")
    .isNumeric()
    .withMessage("Nutrition score must be a number")
    .isInt({ min: 0, max: 100 })
    .withMessage("Nutrition score must be between 0 and 100"),

  body("spiceLevel")
    .isNumeric()
    .withMessage("Spice level must be a number")
    .isInt({ min: 0, max: 3 })
    .withMessage("Spice level must be between 0 and 3"),

  body("ingredients")
    .isArray({ min: 1 })
    .withMessage("Ingredients must be an array with at least one item"),

  body("allergens")
    .optional()
    .isArray()
    .withMessage("Allergens must be an array"),

  body("availability")
    .optional()
    .isBoolean()
    .withMessage("Availability must be a boolean"),
];

export const updateMenuItemValidation = [
  param("id")
    .isString()
    .withMessage("ID must be a string")
    .notEmpty()
    .withMessage("ID is required"),

  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .trim(),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters")
    .trim(),

  body("price")
    .optional()
    .isNumeric()
    .withMessage("Price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("originalPrice")
    .optional()
    .isNumeric()
    .withMessage("Original price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Original price must be a positive number"),

  body("image")
    .optional()
    .isString()
    .withMessage("Image must be a string")
    .isURL()
    .withMessage("Image must be a valid URL"),

  body("category")
    .optional()
    .isString()
    .withMessage("Category must be a string")
    .isIn(["veg", "fitness", "office", "diet", "addons"])
    .withMessage("Category must be one of: veg, fitness, office, diet, addons"),

  body("calories")
    .optional()
    .isNumeric()
    .withMessage("Calories must be a number")
    .isInt({ min: 0 })
    .withMessage("Calories must be a positive integer"),

  body("prepTime")
    .optional()
    .isString()
    .withMessage("Prep time must be a string")
    .matches(/^\d+\s*(mins?|hours?)$/i)
    .withMessage("Prep time should be in format like '25 mins' or '1 hour'"),

  body("nutritionScore")
    .optional()
    .isNumeric()
    .withMessage("Nutrition score must be a number")
    .isInt({ min: 0, max: 100 })
    .withMessage("Nutrition score must be between 0 and 100"),

  body("spiceLevel")
    .optional()
    .isNumeric()
    .withMessage("Spice level must be a number")
    .isInt({ min: 0, max: 3 })
    .withMessage("Spice level must be between 0 and 3"),

  body("availability")
    .optional()
    .isBoolean()
    .withMessage("Availability must be a boolean"),
];

export const getMenuItemValidation = [
  param("id")
    .isString()
    .withMessage("ID must be a string")
    .notEmpty()
    .withMessage("ID is required"),
];

export const getMenuItemsValidation = [
  query("category")
    .optional()
    .isString()
    .withMessage("Category must be a string"),

  query("search")
    .optional()
    .isString()
    .withMessage("Search must be a string")
    .isLength({ min: 1, max: 100 })
    .withMessage("Search term must be between 1 and 100 characters"),

  query("minPrice")
    .optional()
    .isNumeric()
    .withMessage("Min price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Min price must be positive"),

  query("maxPrice")
    .optional()
    .isNumeric()
    .withMessage("Max price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Max price must be positive"),

  query("spiceLevel")
    .optional()
    .isNumeric()
    .withMessage("Spice level must be a number")
    .isInt({ min: 0, max: 3 })
    .withMessage("Spice level must be between 0 and 3"),

  query("isVegetarian")
    .optional()
    .isBoolean()
    .withMessage("Is vegetarian must be a boolean"),

  query("isAvailable")
    .optional()
    .isBoolean()
    .withMessage("Is available must be a boolean"),

  query("minRating")
    .optional()
    .isNumeric()
    .withMessage("Min rating must be a number")
    .isFloat({ min: 0, max: 5 })
    .withMessage("Min rating must be between 0 and 5"),

  query("minNutritionScore")
    .optional()
    .isNumeric()
    .withMessage("Min nutrition score must be a number")
    .isInt({ min: 0, max: 100 })
    .withMessage("Min nutrition score must be between 0 and 100"),

  query("sortBy")
    .optional()
    .isString()
    .withMessage("Sort by must be a string")
    .isIn(["popular", "rating", "price-low", "price-high", "calories", "nutrition", "name", "newest"])
    .withMessage("Sort by must be one of: popular, rating, price-low, price-high, calories, nutrition, name, newest"),

  query("page")
    .optional()
    .isNumeric()
    .withMessage("Page must be a number")
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isNumeric()
    .withMessage("Limit must be a number")
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

export const updateRatingValidation = [
  param("id")
    .isString()
    .withMessage("ID must be a string")
    .notEmpty()
    .withMessage("ID is required"),

  body("rating")
    .isNumeric()
    .withMessage("Rating must be a number")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
];

export const searchMenuValidation = [
  query("q")
    .isString()
    .withMessage("Search query must be a string")
    .isLength({ min: 1, max: 100 })
    .withMessage("Search query must be between 1 and 100 characters"),
  
  ...getMenuItemsValidation.filter(validator => 
    !validator.toString().includes('query("search")')
  ),
];
