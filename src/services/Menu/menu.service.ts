import MenuItem, { IMenuItem } from "../../models/Menu/menu.model";
import { Request } from "express";
import { Types } from "mongoose";

export interface IMenuFilter {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  dietary?: string[];
  spiceLevel?: number;
  isVegetarian?: boolean;
  isAvailable?: boolean;
  minRating?: number;
  minNutritionScore?: number;
}

export interface IMenuSort {
  sortBy?: "popular" | "rating" | "price-low" | "price-high" | "calories" | "nutrition" | "name" | "newest";
}

export interface IPaginationOptions {
  page?: number;
  limit?: number;
}

export class MenuService {
  /**
   * Create a new menu item
   */
  static async createMenuItem(menuData: Partial<IMenuItem>, createdBy?: string): Promise<IMenuItem> {
    try {
      const menuItem = new MenuItem({
        ...menuData,
        createdBy,
      });

      await menuItem.save();
      return menuItem;
    } catch (error: any) {
      throw new Error(`Failed to create menu item: ${error.message}`);
    }
  }

  /**
   * Get all menu items with filters, sorting, and pagination
   */
  static async getMenuItems(
    filters: IMenuFilter = {},
    sort: IMenuSort = {},
    pagination: IPaginationOptions = {}
  ): Promise<{
    items: IMenuItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const {
        category,
        search,
        minPrice,
        maxPrice,
        dietary,
        spiceLevel,
        isVegetarian,
        isAvailable = true,
        minRating,
        minNutritionScore,
      } = filters;

      const { sortBy = "popular" } = sort;
      const { page = 1, limit = 12 } = pagination;

      // Build query
      const query: any = {
        isActive: true,
      };

      if (isAvailable !== undefined) {
        query.availability = isAvailable;
      }

      if (category && category !== "all") {
        query.category = category;
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined) query.price.$gte = minPrice;
        if (maxPrice !== undefined) query.price.$lte = maxPrice;
      }

      if (spiceLevel !== undefined) {
        query.spiceLevel = { $lte: spiceLevel };
      }

      if (minRating !== undefined) {
        query.rating = { $gte: minRating };
      }

      if (minNutritionScore !== undefined) {
        query.nutritionScore = { $gte: minNutritionScore };
      }

      if (dietary && dietary.length > 0) {
        query.dietary = { $in: dietary };
      }

      if (isVegetarian) {
        query.dietary = { $in: ["Vegetarian"] };
      }

      // Text search
      if (search) {
        query.$text = { $search: search };
      }

      // Build sort
      let sortQuery: any = {};
      switch (sortBy) {
        case "price-low":
          sortQuery = { price: 1 };
          break;
        case "price-high":
          sortQuery = { price: -1 };
          break;
        case "rating":
          sortQuery = { rating: -1, reviews: -1 };
          break;
        case "calories":
          sortQuery = { calories: 1 };
          break;
        case "nutrition":
          sortQuery = { nutritionScore: -1 };
          break;
        case "name":
          sortQuery = { name: 1 };
          break;
        case "newest":
          sortQuery = { createdAt: -1 };
          break;
        default: // popular
          sortQuery = { reviews: -1, rating: -1 };
      }

      // Add text score for search queries
      if (search) {
        sortQuery.score = { $meta: "textScore" };
      }

      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        MenuItem.find(query).sort(sortQuery).skip(skip).limit(limit).exec(),
        MenuItem.countDocuments(query),
      ]);

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch menu items: ${error.message}`);
    }
  }

  /**
   * Get menu item by ID
   */
  static async getMenuItemById(id: string): Promise<IMenuItem | null> {
    try {
      // Build query to search by either _id (if valid ObjectId) or custom id field
      const query: any = { isActive: true };
      
      if (Types.ObjectId.isValid(id)) {
        query.$or = [{ _id: id }, { id: id }];
      } else {
        query.id = id;
      }

      return await MenuItem.findOne(query);
    } catch (error: any) {
      throw new Error(`Failed to fetch menu item: ${error.message}`);
    }
  }

  /**
   * Update menu item
   */
  static async updateMenuItem(id: string, updateData: Partial<IMenuItem>): Promise<IMenuItem | null> {
    try {
      // Build query to search by either _id (if valid ObjectId) or custom id field
      const query: any = { isActive: true };
      
      if (Types.ObjectId.isValid(id)) {
        query.$or = [{ _id: id }, { id: id }];
      } else {
        query.id = id;
      }

      const menuItem = await MenuItem.findOneAndUpdate(
        query,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      return menuItem;
    } catch (error: any) {
      throw new Error(`Failed to update menu item: ${error.message}`);
    }
  }

  /**
   * Soft delete menu item
   */
  static async deleteMenuItem(id: string): Promise<boolean> {
    try {
      // Build query to search by either _id (if valid ObjectId) or custom id field
      const query: any = {};
      
      if (Types.ObjectId.isValid(id)) {
        query.$or = [{ _id: id }, { id: id }];
      } else {
        query.id = id;
      }

      const result = await MenuItem.findOneAndUpdate(
        query,
        { $set: { isActive: false } },
        { new: true }
      );

      return !!result;
    } catch (error: any) {
      throw new Error(`Failed to delete menu item: ${error.message}`);
    }
  }

  /**
   * Toggle menu item availability
   */
  static async toggleAvailability(id: string): Promise<IMenuItem | null> {
    try {
      // Build query to search by either _id (if valid ObjectId) or custom id field
      const query: any = { isActive: true };
      
      if (Types.ObjectId.isValid(id)) {
        query.$or = [{ _id: id }, { id: id }];
      } else {
        query.id = id;
      }

      const menuItem = await MenuItem.findOne(query);

      if (!menuItem) {
        throw new Error("Menu item not found");
      }

      menuItem.availability = !menuItem.availability;
      await menuItem.save();

      return menuItem;
    } catch (error: any) {
      throw new Error(`Failed to toggle availability: ${error.message}`);
    }
  }

  /**
   * Get menu categories with counts
   */
  static async getMenuCategories(): Promise<Array<{ category: string; count: number }>> {
    try {
      const categories = await MenuItem.aggregate([
        { $match: { isActive: true, availability: true } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $project: { category: "$_id", count: 1, _id: 0 } },
        { $sort: { category: 1 } },
      ]);

      return categories;
    } catch (error: any) {
      throw new Error(`Failed to fetch menu categories: ${error.message}`);
    }
  }

  /**
   * Get featured/popular menu items
   */
  static async getFeaturedItems(limit: number = 6): Promise<IMenuItem[]> {
    try {
      return await MenuItem.find({
        isActive: true,
        availability: true,
        rating: { $gte: 4.5 },
      })
        .sort({ reviews: -1, rating: -1 })
        .limit(limit);
    } catch (error: any) {
      throw new Error(`Failed to fetch featured items: ${error.message}`);
    }
  }

  /**
   * Update menu item rating
   */
  static async updateRating(id: string, newRating: number): Promise<IMenuItem | null> {
    try {
      // Build query to search by either _id (if valid ObjectId) or custom id field
      const query: any = { isActive: true };
      
      if (Types.ObjectId.isValid(id)) {
        query.$or = [{ _id: id }, { id: id }];
      } else {
        query.id = id;
      }

      const menuItem = await MenuItem.findOne(query);

      if (!menuItem) {
        throw new Error("Menu item not found");
      }

      // Calculate new average rating
      const totalRating = menuItem.rating * menuItem.reviews + newRating;
      const newReviews = menuItem.reviews + 1;
      const newAverageRating = totalRating / newReviews;

      menuItem.rating = Math.round(newAverageRating * 10) / 10; // Round to 1 decimal
      menuItem.reviews = newReviews;

      await menuItem.save();
      return menuItem;
    } catch (error: any) {
      throw new Error(`Failed to update rating: ${error.message}`);
    }
  }

  /**
   * Search menu items
   */
  static async searchMenuItems(
    searchTerm: string,
    filters: IMenuFilter = {},
    pagination: IPaginationOptions = {}
  ): Promise<{
    items: IMenuItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      return await this.getMenuItems(
        { ...filters, search: searchTerm },
        { sortBy: "popular" },
        pagination
      );
    } catch (error: any) {
      throw new Error(`Failed to search menu items: ${error.message}`);
    }
  }

  /**
   * Bulk update menu items
   */
  static async bulkUpdateItems(
    updates: Array<{ id: string; data: Partial<IMenuItem> }>
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const update of updates) {
      try {
        await this.updateMenuItem(update.id, update.data);
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Failed to update ${update.id}: ${error.message}`);
      }
    }

    return results;
  }
}

export default MenuService;
