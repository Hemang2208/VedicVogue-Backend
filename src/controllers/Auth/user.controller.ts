import {
  getUserByIdService,
  getUserByUserIdService,
  getUserByEmailService,
  getUserByPhoneService,
  updateUserService,
  updateUserPasswordService,
  updateUserStatusService,
  addUserTokenService,
  removeUserTokenService,
  addUserAddressService,
  updateUserAddressService,
  removeUserAddressService,
  addToUserCartService,
  removeFromUserCartService,
  clearUserCartService,
  addToUserFavoritesService,
  updateUserLoyaltyPointsService,
  deleteUserService,
  getAllUsersService,
  getUsersByRoleService,
  getActiveUsersService,
  getVerifiedUsersService,
  getBannedUsersService,
  searchUsersService,
  getUserStatisticsService,
} from "../../services/Auth/user.service";
import { IUser } from "../../models/Auth/user.model";
import { decrypt, encrypt } from "../../configs/crypto";
import { processUserCreation } from "../../utils/user/userCreation";
import { processUserLogin } from "../../utils/user/userAuth";

export const createUserController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { data } = req.body;
    const decryptedData = JSON.parse(decrypt(data));

    // Process user creation using utility function
    const result = await processUserCreation(decryptedData, req);

    if (!result.success && result.error) {
      res.status(result.error.statusCode).json({
        success: false,
        message: result.error.message,
      });
      return;
    }

    // Encrypt response data
    const encryptedData = encrypt(JSON.stringify(result.user));

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const loginUserController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { data } = req.body;
    const decryptedData = JSON.parse(decrypt(data));

    // Process user login using utility function
    const result = await processUserLogin(decryptedData, req);

    if (!result.success && result.error) {
      res.status(result.error.statusCode).json({
        success: false,
        message: result.error.message,
      });
      return;
    }

    // Encrypt response data
    const responseData = {
      user: result.user,
      tokens: result.tokens,
    };
    const encryptedData = encrypt(JSON.stringify(responseData));

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error during login:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getUserByIdController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await getUserByIdService(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const encryptedData = encrypt(JSON.stringify(user));

    res.status(200).json({
      success: true,
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getUserByUserIdController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { userID } = req.params;
    const user = await getUserByUserIdService(userID);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const encryptedData = encrypt(JSON.stringify(user));

    res.status(200).json({
      success: true,
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error fetching user by userID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getUserByEmailController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { data } = req.body;
    const { email } = JSON.parse(decrypt(data));

    const user = await getUserByEmailService(email);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const encryptedData = encrypt(JSON.stringify(user));

    res.status(200).json({
      success: true,
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error fetching user by email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getUserByPhoneController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { data } = req.body;
    const { phone } = JSON.parse(decrypt(data));

    const user = await getUserByPhoneService(phone);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const encryptedData = encrypt(JSON.stringify(user));

    res.status(200).json({
      success: true,
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error fetching user by phone:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const updateUserController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    const updates = JSON.parse(decrypt(data));

    const updatedUser = await updateUserService(id, updates);

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const encryptedData = encrypt(JSON.stringify(updatedUser));

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const updateUserPasswordController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    const { newPassword } = JSON.parse(decrypt(data));

    const updatedUser = await updateUserPasswordService(id, newPassword);

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error: unknown) {
    console.log("Error updating user password:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update password",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const updateUserStatusController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    const updates = JSON.parse(decrypt(data));

    const updatedUser = await updateUserStatusService(id, updates);

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const encryptedData = encrypt(JSON.stringify(updatedUser));

    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error updating user status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const addUserTokenController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    const { token, deviceInfo, deviceDetails } = JSON.parse(decrypt(data));

    const updatedUser = await addUserTokenService(
      id,
      token,
      deviceInfo,
      deviceDetails
    );

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Token added successfully",
    });
  } catch (error: unknown) {
    console.log("Error adding user token:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add token",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const removeUserTokenController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    const { token } = JSON.parse(decrypt(data));

    const updatedUser = await removeUserTokenService(id, token);

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Token removed successfully",
    });
  } catch (error: unknown) {
    console.log("Error removing user token:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove token",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const addUserAddressController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    const addressData = JSON.parse(decrypt(data));

    const updatedUser = await addUserAddressService(id, addressData);

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const encryptedData = encrypt(JSON.stringify(updatedUser));

    res.status(200).json({
      success: true,
      message: "Address added successfully",
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error adding user address:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add address",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const updateUserAddressController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id, addressIndex } = req.params;
    const { data } = req.body;
    const addressData = JSON.parse(decrypt(data));

    const updatedUser = await updateUserAddressService(
      id,
      parseInt(addressIndex),
      addressData
    );

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const encryptedData = encrypt(JSON.stringify(updatedUser));

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error updating user address:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update address",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const removeUserAddressController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id, addressIndex } = req.params;

    const updatedUser = await removeUserAddressService(
      id,
      parseInt(addressIndex)
    );

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Address removed successfully",
    });
  } catch (error: unknown) {
    console.log("Error removing user address:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove address",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const addToUserCartController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    const { itemId, quantity } = JSON.parse(decrypt(data));

    const updatedUser = await addToUserCartService(id, itemId, quantity);

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const encryptedData = encrypt(JSON.stringify(updatedUser.activity.cart));

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error adding item to cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const removeFromUserCartController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    const { itemId } = JSON.parse(decrypt(data));

    const updatedUser = await removeFromUserCartService(id, itemId);

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
    });
  } catch (error: unknown) {
    console.log("Error removing item from cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const clearUserCartController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;

    const updatedUser = await clearUserCartService(id);

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error: unknown) {
    console.log("Error clearing cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const addToUserFavoritesController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    const { kitchenId, dishIds } = JSON.parse(decrypt(data));

    const updatedUser = await addToUserFavoritesService(id, kitchenId, dishIds);

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const encryptedData = encrypt(
      JSON.stringify(updatedUser.activity.favorites)
    );

    res.status(200).json({
      success: true,
      message: "Added to favorites successfully",
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error adding to favorites:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add to favorites",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const updateUserLoyaltyPointsController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    const { points, operation } = JSON.parse(decrypt(data));

    const updatedUser = await updateUserLoyaltyPointsService(
      id,
      points,
      operation
    );

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const responseData = {
      loyaltyPoints: updatedUser.activity.loyaltyPoints,
    };
    const encryptedData = encrypt(JSON.stringify(responseData));

    res.status(200).json({
      success: true,
      message: "Loyalty points updated successfully",
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error updating loyalty points:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update loyalty points",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const deleteUserController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;
    const isDeleted = await deleteUserService(id);

    if (!isDeleted) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: unknown) {
    console.log("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getAllUsersController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    // Add CORS headers explicitly (backup to middleware)
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Credentials", "true");

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

    const result = await getAllUsersService({}, page, limit, sortBy, sortOrder);

    // Encrypt data safely
    let encryptedData: string;
    let encryptedData2: string;

    try {
      encryptedData = encrypt(JSON.stringify(result.users || []));

      const paginationData = {
        totalUsers: result.totalUsers || 0,
        currentPage: result.currentPage || 1,
        totalPages: result.totalPages || 0,
      };

      encryptedData2 = encrypt(JSON.stringify(paginationData));
    } catch (encryptError) {
      console.error("Encryption error:", encryptError);
      encryptedData = JSON.stringify(result.users || []);
      encryptedData2 = JSON.stringify({
        totalUsers: result.totalUsers || 0,
        currentPage: result.currentPage || 1,
        totalPages: result.totalPages || 0,
      });
    }

    const responseData = {
      success: true,
      data: encryptedData,
      pagination: encryptedData2,
    };

    res.status(200).json(responseData);
  } catch (error: unknown) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getUsersByRoleController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { role } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getUsersByRoleService(role, page, limit);

    const encryptedData = encrypt(JSON.stringify(result.users));

    const paginationData = {
      totalUsers: result.totalUsers,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
    };

    const encryptedData2 = encrypt(JSON.stringify(paginationData));

    res.status(200).json({
      success: true,
      data: encryptedData,
      pagination: encryptedData2,
    });
  } catch (error: unknown) {
    console.log("Error fetching users by role:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users by role",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getActiveUsersController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getActiveUsersService(page, limit);

    const encryptedData = encrypt(JSON.stringify(result.users));

    const paginationData = {
      totalUsers: result.totalUsers,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
    };

    const encryptedData2 = encrypt(JSON.stringify(paginationData));

    res.status(200).json({
      success: true,
      data: encryptedData,
      pagination: encryptedData2,
    });
  } catch (error: unknown) {
    console.log("Error fetching active users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active users",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getVerifiedUsersController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getVerifiedUsersService(page, limit);

    const encryptedData = encrypt(JSON.stringify(result.users));

    const paginationData = {
      totalUsers: result.totalUsers,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
    };

    const encryptedData2 = encrypt(JSON.stringify(paginationData));

    res.status(200).json({
      success: true,
      data: encryptedData,
      pagination: encryptedData2,
    });
  } catch (error: unknown) {
    console.log("Error fetching verified users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch verified users",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getBannedUsersController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getBannedUsersService(page, limit);

    const encryptedData = encrypt(JSON.stringify(result.users));

    const paginationData = {
      totalUsers: result.totalUsers,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
    };

    const encryptedData2 = encrypt(JSON.stringify(paginationData));

    res.status(200).json({
      success: true,
      data: encryptedData,
      pagination: encryptedData2,
    });
  } catch (error: unknown) {
    console.log("Error fetching banned users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch banned users",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const searchUsersController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { searchTerm } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!searchTerm || typeof searchTerm !== "string") {
      res.status(400).json({
        success: false,
        message: "Search term is required",
      });
      return;
    }

    const result = await searchUsersService(searchTerm, page, limit);

    const encryptedData = encrypt(JSON.stringify(result.users));

    const paginationData = {
      totalUsers: result.totalUsers,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
    };

    const encryptedData2 = encrypt(JSON.stringify(paginationData));

    res.status(200).json({
      success: true,
      data: encryptedData,
      pagination: encryptedData2,
    });
  } catch (error: unknown) {
    console.log("Error searching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search users",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getUserStatisticsController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const statistics = await getUserStatisticsService();

    const encryptedData = encrypt(JSON.stringify(statistics));

    res.status(200).json({
      success: true,
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error fetching user statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user statistics",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

// Token validation controller
export const validateTokenController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        valid: false,
        message: "No valid authorization header"
      });
      return;
    }

    const token = authHeader.substring(7);
    
    // Import JWT utilities
    const { verifyAccessToken } = require("../../utils/jwt");
    
    try {
      const decoded = verifyAccessToken(token);
      
      // Optionally verify user still exists and is active
      const user = await getUserByIdService(decoded.userId);
      
      if (!user || !user.status.isActive || user.status.isDeleted) {
        res.status(401).json({
          success: false,
          valid: false,
          message: "User account is inactive"
        });
        return;
      }

      res.status(200).json({
        success: true,
        valid: true,
        userId: decoded.userId,
        role: decoded.role
      });
    } catch (tokenError) {
      res.status(401).json({
        success: false,
        valid: false,
        message: "Invalid or expired token"
      });
    }
  } catch (error: unknown) {
    console.log("Error validating token:", error);
    res.status(500).json({
      success: false,
      valid: false,
      message: "Token validation failed"
    });
  }
};

// Refresh token controller
export const refreshTokenController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { data } = req.body;
    
    if (!data) {
      res.status(400).json({
        success: false,
        message: "Refresh token data is required"
      });
      return;
    }

    const { refreshToken } = JSON.parse(decrypt(data));
    
    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: "Refresh token is required"
      });
      return;
    }

    // Import JWT utilities
    const { verifyRefreshToken, generateAccessToken } = require("../../utils/jwt");
    
    try {
      const decoded = verifyRefreshToken(refreshToken);
      
      // Verify user still exists and is active
      const user = await getUserByIdService(decoded.userId);
      
      if (!user || !user.status.isActive || user.status.isDeleted) {
        res.status(401).json({
          success: false,
          message: "User account is inactive"
        });
        return;
      }

      // Check if refresh token exists in user's tokens array
      const tokenExists = user.security.tokens.some(
        (tokenData: any) => tokenData.token === refreshToken
      );

      if (!tokenExists) {
        res.status(401).json({
          success: false,
          message: "Invalid refresh token"
        });
        return;
      }

      // Generate new access token
      const newAccessToken = generateAccessToken({
        userId: (user as any)._id.toString(),
        userID: user.userID,
        email: user.account.email,
        role: user.security.role
      });

      const responseData = { accessToken: newAccessToken };
      const encryptedData = encrypt(JSON.stringify(responseData));

      res.status(200).json({
        success: true,
        message: "Access token refreshed successfully",
        data: encryptedData
      });
    } catch (tokenError) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token"
      });
    }
  } catch (error: unknown) {
    console.log("Error refreshing token:", error);
    res.status(500).json({
      success: false,
      message: "Token refresh failed"
    });
  }
};
