import mongoose, { Schema, Document } from "mongoose";

export interface IMenuItem extends Document {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: "veg" | "fitness" | "office" | "diet" | "addons";
  calories: number;
  prepTime: string;
  tags: string[];
  dietary: string[];
  rating: number;
  reviews: number;
  nutritionScore: number;
  spiceLevel: number;
  ingredients: string[];
  allergens: string[];
  availability: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // Admin user ID who created this item
  isActive: boolean;
}

const MenuItemSchema: Schema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: {
        values: ["veg", "fitness", "office", "diet", "addons"],
        message: "Category must be one of: veg, fitness, office, diet, addons",
      },
      index: true,
    },
    calories: {
      type: Number,
      required: true,
      min: 0,
    },
    prepTime: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags: string[]) {
          return tags.length <= 10;
        },
        message: "Cannot have more than 10 tags",
      },
    },
    dietary: {
      type: [String],
      default: [],
      validate: {
        validator: function (dietary: string[]) {
          return dietary.length <= 10;
        },
        message: "Cannot have more than 10 dietary preferences",
      },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    nutritionScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    spiceLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    ingredients: {
      type: [String],
      required: true,
      validate: {
        validator: function (ingredients: string[]) {
          return ingredients.length > 0;
        },
        message: "At least one ingredient is required",
      },
    },
    allergens: {
      type: [String],
      default: [],
    },
    availability: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
MenuItemSchema.index({ category: 1, availability: 1, isActive: 1 });
MenuItemSchema.index({ name: "text", description: "text", tags: "text" });
MenuItemSchema.index({ price: 1 });
MenuItemSchema.index({ rating: -1, reviews: -1 });
MenuItemSchema.index({ nutritionScore: -1 });

// Pre-save middleware to generate unique ID
MenuItemSchema.pre("save", function (next) {
  if (!this.id) {
    this.id = `MENU-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;
  }
  next();
});

// Virtual for discount percentage
MenuItemSchema.virtual("discountPercentage").get(function (this: IMenuItem) {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100
    );
  }
  return 0;
});

// Virtual for savings amount
MenuItemSchema.virtual("savings").get(function (this: IMenuItem) {
  if (this.originalPrice && this.originalPrice > this.price) {
    return this.originalPrice - this.price;
  }
  return 0;
});

// Ensure virtual fields are serialized
MenuItemSchema.set("toJSON", { virtuals: true });
MenuItemSchema.set("toObject", { virtuals: true });

export default mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);
