import { validationResult } from "express-validator";
import MenuService, { IMenuFilter, IMenuSort, IPaginationOptions } from "../../services/Menu/menu.service";
import { IMenuItem } from "../../models/Menu/menu.model";
import { encrypt, decrypt } from "../../configs/crypto";

export class MenuController {
  /**
   * Decrypt menu item data received from frontend
   */
  private static decryptMenuData(data: any): any {
    try {
      const decryptedData = { ...data };
      
      // Decrypt sensitive fields
      if (data.name) decryptedData.name = decrypt(data.name);
      if (data.description) decryptedData.description = decrypt(data.description);
      if (data.ingredients && Array.isArray(data.ingredients)) {
        decryptedData.ingredients = data.ingredients.map((ingredient: string) => decrypt(ingredient));
      }
      if (data.allergens && Array.isArray(data.allergens)) {
        decryptedData.allergens = data.allergens.map((allergen: string) => decrypt(allergen));
      }
      if (data.tags && Array.isArray(data.tags)) {
        decryptedData.tags = data.tags.map((tag: string) => decrypt(tag));
      }
      if (data.dietary && Array.isArray(data.dietary)) {
        decryptedData.dietary = data.dietary.map((diet: string) => decrypt(diet));
      }
      
      return decryptedData;
    } catch (error) {
      console.error('Error decrypting menu data:', error);
      throw new Error('Failed to decrypt menu data');
    }
  }

  /**
   * Encrypt menu item data before sending to frontend
   */
  private static encryptMenuData(data: any): any {
    try {
      // Handle single item or array of items
      if (Array.isArray(data)) {
        return data.map(item => this.encryptSingleMenuItem(item));
      }
      return this.encryptSingleMenuItem(data);
    } catch (error) {
      console.error('Error encrypting menu data:', error);
      throw new Error('Failed to encrypt menu data');
    }
  }

  /**
   * Encrypt a single menu item
   */
  private static encryptSingleMenuItem(item: any): any {
    try {
      const encryptedItem = { ...item._doc || item };
      
      // Encrypt sensitive fields
      if (item.name) encryptedItem.name = encrypt(item.name);
      if (item.description) encryptedItem.description = encrypt(item.description);
      if (item.ingredients && Array.isArray(item.ingredients)) {
        encryptedItem.ingredients = item.ingredients.map((ingredient: string) => encrypt(ingredient));
      }
      if (item.allergens && Array.isArray(item.allergens)) {
        encryptedItem.allergens = item.allergens.map((allergen: string) => encrypt(allergen));
      }
      if (item.tags && Array.isArray(item.tags)) {
        encryptedItem.tags = item.tags.map((tag: string) => encrypt(tag));
      }
      if (item.dietary && Array.isArray(item.dietary)) {
        encryptedItem.dietary = item.dietary.map((diet: string) => encrypt(diet));
      }
      
      return encryptedItem;
    } catch (error) {
      console.error('Error encrypting single menu item:', error);
      return item; // Return original if encryption fails
    }
  }
  /**
   * Create a new menu item
   * POST /api/menu
   */
  static async createMenuItem(req: any, res: any): Promise<void> {
    try {
      // Decrypt the incoming encrypted data from frontend (following user pattern)
      if (!req.body.data) {
        res.status(400).json({
          success: false,
          message: "No encrypted data provided",
        });
        return;
      }

      const decryptedMenuData = JSON.parse(decrypt(req.body.data));
      
      // Validate the decrypted data manually (since express-validator runs before decryption)
      if (!decryptedMenuData.id || !decryptedMenuData.name || !decryptedMenuData.description) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: id, name, description",
        });
        return;
      }

      const createdBy = req.user?.id || req.user?.userId;

      const menuItem = await MenuService.createMenuItem(decryptedMenuData, createdBy);

      // Encrypt the response data before sending to frontend (following user pattern)
      res.status(201).json({
        success: true,
        message: "Menu item created successfully",
        data: encrypt(JSON.stringify(menuItem)),
      });
    } catch (error: any) {
      console.error("Create menu item error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to create menu item",
      });
    }
  }

  /**
   * Get all menu items with filters and pagination
   * GET /api/menu
   */
  static async getMenuItems(req: any, res: any): Promise<void> {
    try {
      const {
        category,
        search,
        minPrice,
        maxPrice,
        dietary,
        spiceLevel,
        isVegetarian,
        isAvailable,
        minRating,
        minNutritionScore,
        sortBy,
        page,
        limit,
      } = req.query;

      // Parse filters
      const filters: IMenuFilter = {};
      if (category) filters.category = category as string;
      if (search) filters.search = search as string;
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
      if (dietary) {
        filters.dietary = Array.isArray(dietary) 
          ? dietary as string[] 
          : (dietary as string).split(',');
      }
      if (spiceLevel) filters.spiceLevel = parseInt(spiceLevel as string);
      if (isVegetarian) filters.isVegetarian = isVegetarian === 'true';
      if (isAvailable !== undefined) filters.isAvailable = isAvailable === 'true';
      if (minRating) filters.minRating = parseFloat(minRating as string);
      if (minNutritionScore) filters.minNutritionScore = parseInt(minNutritionScore as string);

      // Parse sorting
      const sort: IMenuSort = {};
      if (sortBy) sort.sortBy = sortBy as any;

      // Parse pagination
      const pagination: IPaginationOptions = {};
      if (page) pagination.page = parseInt(page as string);
      if (limit) pagination.limit = parseInt(limit as string);

      const result = await MenuService.getMenuItems(filters, sort, pagination);

      // Encrypt the response data before sending to frontend (following user pattern)
      res.status(200).json({
        success: true,
        message: "Menu items fetched successfully",
        data: encrypt(JSON.stringify(result)),
      });
    } catch (error: any) {
      console.error("Get menu items error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch menu items",
      });
    }
  }

  /**
   * Get menu item by ID
   * GET /api/menu/:id
   */
  static async getMenuItemById(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const menuItem = await MenuService.getMenuItemById(id);

      if (!menuItem) {
        res.status(404).json({
          success: false,
          message: "Menu item not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Menu item fetched successfully",
        data: menuItem,
      });
    } catch (error: any) {
      console.error("Get menu item error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch menu item",
      });
    }
  }

  /**
   * Update menu item
   * PUT /api/menu/:id
   */
  static async updateMenuItem(req: any, res: any): Promise<void> {
    try {
      // Decrypt the incoming encrypted data from frontend (following user pattern)
      if (!req.body.data) {
        res.status(400).json({
          success: false,
          message: "No encrypted data provided",
        });
        return;
      }

      const decryptedUpdateData = JSON.parse(decrypt(req.body.data));
      const { id } = req.params;

      const menuItem = await MenuService.updateMenuItem(id, decryptedUpdateData);

      if (!menuItem) {
        res.status(404).json({
          success: false,
          message: "Menu item not found",
        });
        return;
      }

      // Encrypt the response data before sending to frontend (following user pattern)
      res.status(200).json({
        success: true,
        message: "Menu item updated successfully",
        data: encrypt(JSON.stringify(menuItem)),
      });
    } catch (error: any) {
      console.error("Update menu item error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update menu item",
      });
    }
  }

  /**
   * Delete menu item (soft delete)
   * DELETE /api/menu/:id
   */
  static async deleteMenuItem(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const result = await MenuService.deleteMenuItem(id);

      if (!result) {
        res.status(404).json({
          success: false,
          message: "Menu item not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Menu item deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete menu item error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete menu item",
      });
    }
  }

  /**
   * Toggle menu item availability
   * PATCH /api/menu/:id/toggle-availability
   */
  static async toggleAvailability(req: any, res: any): Promise<void> {
    try {
      // Decrypt the incoming encrypted data from frontend (following user pattern)
      if (!req.body.data) {
        res.status(400).json({
          success: false,
          message: "No encrypted data provided",
        });
        return;
      }

      const decryptedData = JSON.parse(decrypt(req.body.data));
      const { id } = req.params;
      
      // Update the menu item with the new availability status
      const menuItem = await MenuService.updateMenuItem(id, { 
        availability: decryptedData.availability 
      });

      if (!menuItem) {
        res.status(404).json({
          success: false,
          message: "Menu item not found",
        });
        return;
      }

      // Encrypt the response data before sending to frontend (following user pattern)
      res.status(200).json({
        success: true,
        message: `Menu item ${menuItem.availability ? 'enabled' : 'disabled'} successfully`,
        data: encrypt(JSON.stringify(menuItem)),
      });
    } catch (error: any) {
      console.error("Toggle availability error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to toggle availability",
      });
    }
  }

  /**
   * Get menu categories with counts
   * GET /api/menu/categories
   */
  static async getMenuCategories(req: any, res: any): Promise<void> {
    try {
      const categories = await MenuService.getMenuCategories();

      res.status(200).json({
        success: true,
        message: "Menu categories fetched successfully",
        data: categories,
      });
    } catch (error: any) {
      console.error("Get categories error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch categories",
      });
    }
  }

  /**
   * Get featured menu items
   * GET /api/menu/featured
   */
  static async getFeaturedItems(req: any, res: any): Promise<void> {
    try {
      const { limit } = req.query;
      const itemLimit = limit ? parseInt(limit as string) : 6;

      const items = await MenuService.getFeaturedItems(itemLimit);

      res.status(200).json({
        success: true,
        message: "Featured items fetched successfully",
        data: items,
      });
    } catch (error: any) {
      console.error("Get featured items error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch featured items",
      });
    }
  }

  /**
   * Search menu items
   * GET /api/menu/search
   */
  static async searchMenuItems(req: any, res: any): Promise<void> {
    try {
      const { q: searchTerm, ...otherParams } = req.query;

      if (!searchTerm) {
        res.status(400).json({
          success: false,
          message: "Search term is required",
        });
        return;
      }

      // Parse filters (similar to getMenuItems)
      const {
        category,
        minPrice,
        maxPrice,
        dietary,
        spiceLevel,
        isVegetarian,
        isAvailable,
        minRating,
        minNutritionScore,
        page,
        limit,
      } = otherParams;

      const filters: IMenuFilter = {};
      if (category) filters.category = category as string;
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
      if (dietary) {
        filters.dietary = Array.isArray(dietary) 
          ? dietary as string[] 
          : (dietary as string).split(',');
      }
      if (spiceLevel) filters.spiceLevel = parseInt(spiceLevel as string);
      if (isVegetarian) filters.isVegetarian = isVegetarian === 'true';
      if (isAvailable !== undefined) filters.isAvailable = isAvailable === 'true';
      if (minRating) filters.minRating = parseFloat(minRating as string);
      if (minNutritionScore) filters.minNutritionScore = parseInt(minNutritionScore as string);

      const pagination: IPaginationOptions = {};
      if (page) pagination.page = parseInt(page as string);
      if (limit) pagination.limit = parseInt(limit as string);

      const result = await MenuService.searchMenuItems(
        searchTerm as string,
        filters,
        pagination
      );

      res.status(200).json({
        success: true,
        message: "Search results fetched successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Search menu items error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to search menu items",
      });
    }
  }

  /**
   * Update menu item rating
   * POST /api/menu/:id/rating
   */
  static async updateRating(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const { rating } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
        return;
      }

      const menuItem = await MenuService.updateRating(id, rating);

      if (!menuItem) {
        res.status(404).json({
          success: false,
          message: "Menu item not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Rating updated successfully",
        data: menuItem,
      });
    } catch (error: any) {
      console.error("Update rating error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update rating",
      });
    }
  }

  /**
   * Bulk update menu items
   * PUT /api/menu/bulk-update
   */
  static async bulkUpdateItems(req: any, res: any): Promise<void> {
    try {
      const { updates } = req.body;

      if (!Array.isArray(updates) || updates.length === 0) {
        res.status(400).json({
          success: false,
          message: "Updates array is required",
        });
        return;
      }

      const result = await MenuService.bulkUpdateItems(updates);

      res.status(200).json({
        success: true,
        message: "Bulk update completed",
        data: result,
      });
    } catch (error: any) {
      console.error("Bulk update error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to perform bulk update",
      });
    }
  }
}

export default MenuController;
