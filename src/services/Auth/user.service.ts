import UserModel, { IUser, IUserAccount } from "../../models/Auth/user.model";
import { Types, SortOrder } from "mongoose";

// Constants for limits
const MAX_SESSIONS = 10;

export const createUserService = async (
  userData: Partial<IUser>
): Promise<IUser> => {
  try {
    const newUser = new UserModel(userData);
    return (await newUser.save()) as IUser;
  } catch (error: any) {
    throw new Error(`Error creating user: ${error.message}`);
  }
};

export const getUserByIdService = async (id: string): Promise<IUser | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    const user = await UserModel.findOne({
      _id: id,
      "status.isDeleted": false,
    });

    return user as IUser | null;
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
};

export const getUserByUserIdService = async (
  userID: string
): Promise<IUser | null> => {
  try {
    const user = await UserModel.findOne({
      userID: userID,
      "status.isDeleted": false,
    });

    return user as IUser | null;
  } catch (error: any) {
    throw new Error(`Failed to fetch user by userID: ${error.message}`);
  }
};

export const getUserByEmailService = async (
  email: string
): Promise<IUser | null> => {
  try {
    const user = await UserModel.findOne({
      "account.email": email.toLowerCase(),
      "status.isDeleted": false,
    }).select("+account.password");

    return user as IUser | null;
  } catch (error: any) {
    throw new Error(`Failed to fetch user by email: ${error.message}`);
  }
};

export const getUserByPhoneService = async (
  phone: string
): Promise<IUser | null> => {
  try {
    const user = await UserModel.findOne({
      "account.phone": phone,
      "status.isDeleted": false,
    });

    return user as IUser | null;
  } catch (error: any) {
    throw new Error(`Failed to fetch user by phone: ${error.message}`);
  }
};

export const updateUserService = async (
  id: string,
  updates: Partial<IUser>
): Promise<IUser | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    // Create a copy of updates to avoid modifying the original object
    const updateData = { ...updates };

    // CRITICAL FIX: Never allow password to be overwritten through general updates
    // Password updates should ONLY be handled by the dedicated password service
    if (updateData.account) {
      // Always remove password from updates to prevent accidental overwrites
      const { password, ...accountWithoutPassword } = updateData.account;
      updateData.account = accountWithoutPassword as any;

      // If account object would be empty after removing password, don't update account at all
      if (Object.keys(accountWithoutPassword).length === 0) {
        delete updateData.account;
      }
    }

    // Basic validation for email format if provided
    if (updateData.account?.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.account.email)) {
        throw new Error("Invalid email format");
      }
    }

    // Basic validation for phone if provided
    if (updateData.account?.phone) {
      const phoneRegex = /^\d{10,15}$/;
      if (!phoneRegex.test(updateData.account.phone.replace(/\D/g, ""))) {
        throw new Error("Invalid phone number format");
      }
    }

    // Use dot notation for safer partial updates to prevent overwriting nested objects
    const flattenedUpdates: any = {};

    // Flatten the update object using dot notation for safer updates
    const flattenObject = (obj: any, prefix: string = "") => {
      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        // CRITICAL: Never allow password field to be updated through this service
        if (newKey === "account.password") {
          console.warn(
            "Blocked attempt to update password through general update service"
          );
          return;
        }

        if (
          value &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          !(value instanceof Date)
        ) {
          flattenObject(value, newKey);
        } else {
          flattenedUpdates[newKey] = value;
        }
      });
    };

    flattenObject(updateData);

    // Always update the lastProfileUpdate timestamp
    flattenedUpdates.lastProfileUpdate = new Date();

    const user = await UserModel.findOneAndUpdate(
      { _id: id, "status.isDeleted": false },
      { $set: flattenedUpdates },
      { new: true, runValidators: false }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return user as IUser;
  } catch (error: any) {
    throw new Error(`Failed to update user: ${error.message}`);
  }
};

export const updateUserPasswordService = async (
  id: string,
  newPassword: string
): Promise<IUser | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    const user = await UserModel.findOneAndUpdate(
      { _id: id, "status.isDeleted": false },
      {
        $set: {
          "account.password": newPassword,
          lastPasswordChange: new Date(),
        },
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return user as IUser;
  } catch (error: any) {
    throw new Error(`Failed to update user password: ${error.message}`);
  }
};

export const updateUserLastLogoutService = async (
  id: string
): Promise<IUser | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    const user = await UserModel.findOneAndUpdate(
      { _id: id, "status.isDeleted": false },
      {
        $set: {
          lastLogout: new Date(),
        },
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return user as IUser;
  } catch (error: any) {
    throw new Error(`Failed to update user last logout: ${error.message}`);
  }
};

export const updateUserStatusService = async (
  id: string,
  updates: {
    isVerified?: boolean;
    isActive?: boolean;
    isBanned?: boolean;
    banReason?: string;
  }
): Promise<IUser | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    const statusUpdates: any = {};

    if (updates.isVerified !== undefined) {
      statusUpdates["status.isVerified"] = updates.isVerified;
    }

    if (updates.isActive !== undefined) {
      statusUpdates["status.isActive"] = updates.isActive;
    }

    if (updates.isBanned !== undefined) {
      statusUpdates["status.ban.isBanned"] = updates.isBanned;
      statusUpdates["status.ban.bannedAt"] = updates.isBanned
        ? new Date()
        : null;
      if (updates.banReason) {
        statusUpdates["status.ban.banReason"] = updates.banReason;
      }
    }

    const user = await UserModel.findOneAndUpdate(
      { _id: id, "status.isDeleted": false },
      { $set: statusUpdates },
      { new: true, runValidators: true }
    ).select("+account.password");

    if (!user) {
      throw new Error("User not found");
    }

    return user as IUser;
  } catch (error: any) {
    throw new Error(`Failed to update user status: ${error.message}`);
  }
};

export const addUserTokenService = async (
  id: string,
  token: string,
  deviceInfo?: string,
  deviceDetails?: any
): Promise<IUser | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    const tokenData = {
      token,
      createdAt: new Date(),
      deviceInfo: deviceInfo || "",
      device: deviceDetails || {
        type: "",
        brand: "",
        model: "",
        browser: "",
        os: "",
        memory: 0,
        cores: 0,
      },
    };

    // First, get the user to check current tokens
    const currentUser = await UserModel.findOne({ _id: id, "status.isDeleted": false });
    
    if (!currentUser) {
      throw new Error("User not found");
    }

    // Initialize security.tokens if it doesn't exist
    if (!currentUser.security) {
      currentUser.security = {
        role: "user",
        tokens: [],
        activities: [],
      };
    }

    if (!currentUser.security.tokens) {
      currentUser.security.tokens = [];
    }

    // Add new token to the beginning (most recent first)
    currentUser.security.tokens.unshift(tokenData);

    // Keep only the latest 10 sessions/tokens
    if (currentUser.security.tokens.length > MAX_SESSIONS) {
      currentUser.security.tokens = currentUser.security.tokens.slice(0, MAX_SESSIONS);
    }

    // Update lastLogin and save
    currentUser.lastLogin = new Date();
    const user = await currentUser.save();

    return user as IUser;
  } catch (error: any) {
    throw new Error(`Failed to add user token: ${error.message}`);
  }
};

export const removeUserTokenService = async (
  id: string,
  token: string
): Promise<IUser | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    const user = await UserModel.findOneAndUpdate(
      { _id: id, "status.isDeleted": false },
      { $pull: { "security.tokens": { token } } },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return user as IUser;
  } catch (error: any) {
    throw new Error(`Failed to remove user token: ${error.message}`);
  }
};

export const addUserAddressService = async (
  id: string,
  addressData: {
    label: string;
    houseNumber: string;
    street: string;
    area: string;
    landmark?: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
    coordinates?: { latitude: number; longitude: number };
  }
): Promise<IUser | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    const address = {
      ...addressData,
      coordinates: addressData.coordinates || { latitude: 0, longitude: 0 },
    };

    const user = await UserModel.findOneAndUpdate(
      { _id: id, "status.isDeleted": false },
      {
        $push: { addresses: address },
        $set: { lastProfileUpdate: new Date() },
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return user as IUser;
  } catch (error: any) {
    throw new Error(`Failed to add user address: ${error.message}`);
  }
};

export const updateUserAddressService = async (
  id: string,
  addressIndex: number,
  addressData: Partial<{
    label: string;
    houseNumber: string;
    street: string;
    area: string;
    landmark: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
    coordinates: { latitude: number; longitude: number };
  }>
): Promise<IUser | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    const user = await UserModel.findById(id);
    if (!user || user.status.isDeleted) {
      throw new Error("User not found");
    }

    // Get active (non-deleted) addresses to map the index correctly
    const activeAddresses = user.addresses.filter((addr) => !addr.isDeleted);

    if (addressIndex < 0 || addressIndex >= activeAddresses.length) {
      throw new Error("Invalid address index");
    }

    // Find the actual index in the full addresses array
    let actualIndex = -1;
    let activeCount = 0;

    for (let i = 0; i < user.addresses.length; i++) {
      if (!user.addresses[i].isDeleted) {
        if (activeCount === addressIndex) {
          actualIndex = i;
          break;
        }
        activeCount++;
      }
    }

    if (actualIndex === -1) {
      throw new Error("Address not found");
    }

    const updateQuery: any = {
      lastProfileUpdate: new Date(),
    };

    Object.keys(addressData).forEach((key) => {
      updateQuery[`addresses.${actualIndex}.${key}`] =
        addressData[key as keyof typeof addressData];
    });

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: id, "status.isDeleted": false },
      { $set: updateQuery },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser as IUser;
  } catch (error: any) {
    throw new Error(`Failed to update user address: ${error.message}`);
  }
};

export const removeUserAddressService = async (
  id: string,
  addressIndex: number
): Promise<IUser | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    const user = await UserModel.findById(id);
    if (!user || user.status.isDeleted) {
      throw new Error("User not found");
    }

    // Get active (non-deleted) addresses to map the index correctly
    const activeAddresses = user.addresses.filter((addr) => !addr.isDeleted);

    if (addressIndex < 0 || addressIndex >= activeAddresses.length) {
      throw new Error("Invalid address index");
    }

    // Find the actual index in the full addresses array
    let actualIndex = -1;
    let activeCount = 0;

    for (let i = 0; i < user.addresses.length; i++) {
      if (!user.addresses[i].isDeleted) {
        if (activeCount === addressIndex) {
          actualIndex = i;
          break;
        }
        activeCount++;
      }
    }

    if (actualIndex === -1) {
      throw new Error("Address not found");
    }

    // Check if the address is already soft deleted
    if (user.addresses[actualIndex].isDeleted) {
      throw new Error("Address is already deleted");
    }

    // Soft delete the address by setting isDeleted to true and deletedAt timestamp
    user.addresses[actualIndex].isDeleted = true;
    user.addresses[actualIndex].deletedAt = new Date();
    user.lastProfileUpdate = new Date();

    await user.save();

    return user as IUser;
  } catch (error: any) {
    throw new Error(`Failed to remove user address: ${error.message}`);
  }
};

// Service to restore soft-deleted address
export const restoreUserAddressService = async (
  id: string,
  addressIndex: number
): Promise<IUser | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    const user = await UserModel.findById(id);
    if (!user || user.status.isDeleted) {
      throw new Error("User not found");
    }

    if (addressIndex < 0 || addressIndex >= user.addresses.length) {
      throw new Error("Invalid address index");
    }

    // Check if the address is soft deleted
    if (!user.addresses[addressIndex].isDeleted) {
      throw new Error("Address is not deleted");
    }

    // Restore the address by setting isDeleted to false and clearing deletedAt
    user.addresses[addressIndex].isDeleted = false;
    user.addresses[addressIndex].deletedAt = null;
    user.lastProfileUpdate = new Date();

    await user.save();

    return user as IUser;
  } catch (error: any) {
    throw new Error(`Failed to restore user address: ${error.message}`);
  }
};

export const addToUserCartService = async (
  id: string,
  itemId: string,
  quantity: number = 1
): Promise<IUser | null> => {
  try {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(itemId)) {
      throw new Error("Invalid user ID or item ID");
    }

    // Check if item already exists in cart
    const user = await UserModel.findOne({
      _id: id,
      "status.isDeleted": false,
      "activity.cart.item": itemId,
    });

    if (user) {
      // Update quantity if item exists
      const updatedUser = await UserModel.findOneAndUpdate(
        { _id: id, "activity.cart.item": itemId },
        { $inc: { "activity.cart.$.quantity": quantity } },
        { new: true, runValidators: true }
      );
      return updatedUser as IUser;
    } else {
      // Add new item to cart
      const updatedUser = await UserModel.findOneAndUpdate(
        { _id: id, "status.isDeleted": false },
        { $push: { "activity.cart": { item: itemId, quantity } } },
        { new: true, runValidators: true }
      );
      return updatedUser as IUser;
    }
  } catch (error: any) {
    throw new Error(`Failed to add item to cart: ${error.message}`);
  }
};

export const removeFromUserCartService = async (
  id: string,
  itemId: string
): Promise<IUser | null> => {
  try {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(itemId)) {
      throw new Error("Invalid user ID or item ID");
    }

    const user = await UserModel.findOneAndUpdate(
      { _id: id, "status.isDeleted": false },
      { $pull: { "activity.cart": { item: itemId } } },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return user as IUser;
  } catch (error: any) {
    throw new Error(`Failed to remove item from cart: ${error.message}`);
  }
};

export const clearUserCartService = async (
  id: string
): Promise<IUser | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    const user = await UserModel.findOneAndUpdate(
      { _id: id, "status.isDeleted": false },
      { $set: { "activity.cart": [] } },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return user as IUser;
  } catch (error: any) {
    throw new Error(`Failed to clear user cart: ${error.message}`);
  }
};

export const addToUserFavoritesService = async (
  id: string,
  kitchenId?: string,
  dishIds?: string[]
): Promise<IUser | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    const favoriteData: any = {};

    if (kitchenId && Types.ObjectId.isValid(kitchenId)) {
      favoriteData.kitchens = kitchenId;
    }

    if (dishIds && dishIds.length > 0) {
      const validDishIds = dishIds.filter((id) => Types.ObjectId.isValid(id));
      favoriteData.dishes = validDishIds;
    }

    const user = await UserModel.findOneAndUpdate(
      { _id: id, "status.isDeleted": false },
      { $push: { "activity.favorites": favoriteData } },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return user as IUser;
  } catch (error: any) {
    throw new Error(`Failed to add to favorites: ${error.message}`);
  }
};

export const updateUserLoyaltyPointsService = async (
  id: string,
  points: number,
  operation: "add" | "subtract" | "set" = "add"
): Promise<IUser | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    let updateQuery: any;

    switch (operation) {
      case "add":
        updateQuery = { $inc: { "activity.loyaltyPoints": points } };
        break;
      case "subtract":
        updateQuery = { $inc: { "activity.loyaltyPoints": -Math.abs(points) } };
        break;
      case "set":
        updateQuery = { $set: { "activity.loyaltyPoints": points } };
        break;
      default:
        throw new Error("Invalid operation");
    }

    const user = await UserModel.findOneAndUpdate(
      { _id: id, "status.isDeleted": false },
      updateQuery,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return user as IUser;
  } catch (error: any) {
    throw new Error(`Failed to update loyalty points: ${error.message}`);
  }
};

export const deleteUserService = async (id: string): Promise<boolean> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    const result = await UserModel.findOneAndUpdate(
      { _id: id, "status.isDeleted": false },
      {
        $set: {
          "status.isDeleted": true,
          "status.deletedAt": new Date(),
        },
      },
      { new: true }
    );

    return !!result;
  } catch (error: any) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
};

export const getAllUsersIncludingDeletedService = async (
  page: number = 1,
  limit: number = 10
): Promise<{
  users: any[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    // No filter - get all users regardless of status
    const filter = {};
    return await getAllUsersService(filter, page, limit);
  } catch (error: any) {
    throw new Error(`Failed to fetch all users: ${error.message}`);
  }
};

export const getAllUsersService = async (
  filter: any = {},
  page: number = 1,
  limit: number = 10,
  sortBy: string = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
): Promise<{
  users: any[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    const skip = (page - 1) * limit;
    const sort: Record<string, SortOrder> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const queryFilter = {
      ...filter,
      // Don't automatically add isDeleted filter - let each service specify what it needs
    };

    const users = await UserModel.find(queryFilter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("-account.password")
      .lean();

    const totalUsers = await UserModel.countDocuments(queryFilter);
    const totalPages = Math.ceil(totalUsers / limit);

    return {
      users,
      totalUsers,
      currentPage: page,
      totalPages,
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
};

export const getUsersByRoleService = async (
  role: "user" | "admin" | "captain" | "kitchen",
  page: number = 1,
  limit: number = 10
): Promise<{
  users: any[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    const filter = {
      "security.role": role,
      "status.isDeleted": false,
    };

    return await getAllUsersService(filter, page, limit);
  } catch (error: any) {
    throw new Error(`Failed to fetch users by role: ${error.message}`);
  }
};

export const getActiveUsersService = async (
  page: number = 1,
  limit: number = 10
): Promise<{
  users: any[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    const filter = {
      "status.isActive": true,
      "status.isDeleted": false,
    };

    return await getAllUsersService(filter, page, limit);
  } catch (error: any) {
    throw new Error(`Failed to fetch active users: ${error.message}`);
  }
};

export const getInactiveUsersService = async (
  page: number = 1,
  limit: number = 10
): Promise<{
  users: any[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    const filter = {
      "status.isActive": false,
      "status.isDeleted": false,
    };

    return await getAllUsersService(filter, page, limit);
  } catch (error: any) {
    throw new Error(`Failed to fetch inactive users: ${error.message}`);
  }
};

export const getVerifiedUsersService = async (
  page: number = 1,
  limit: number = 10
): Promise<{
  users: any[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    const filter = {
      "status.isVerified": true,
      "status.isDeleted": false,
    };

    return await getAllUsersService(filter, page, limit);
  } catch (error: any) {
    throw new Error(`Failed to fetch verified users: ${error.message}`);
  }
};

export const getBannedUsersService = async (
  page: number = 1,
  limit: number = 10
): Promise<{
  users: any[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    const filter = {
      "status.ban.isBanned": true,
      "status.isDeleted": false,
    };

    return await getAllUsersService(filter, page, limit);
  } catch (error: any) {
    throw new Error(`Failed to fetch banned users: ${error.message}`);
  }
};

export const searchUsersService = async (
  searchTerm: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  users: IUser[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    const filter = {
      $or: [
        { fullname: { $regex: searchTerm, $options: "i" } },
        { userID: { $regex: searchTerm, $options: "i" } },
        { "account.email": { $regex: searchTerm, $options: "i" } },
        { "account.phone": { $regex: searchTerm, $options: "i" } },
      ],
      "status.isDeleted": false,
    };

    return await getAllUsersService(filter, page, limit);
  } catch (error: any) {
    throw new Error(`Failed to search users: ${error.message}`);
  }
};

export const getDeletedUsersService = async (
  page: number = 1,
  limit: number = 10
): Promise<{
  users: any[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    const filter = {
      "status.isDeleted": true,
    };

    return await getAllUsersService(filter, page, limit);
  } catch (error: any) {
    throw new Error(`Failed to fetch deleted users: ${error.message}`);
  }
};

export const getUserStatisticsService = async (): Promise<{
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  bannedUsers: number;
  usersByRole: Array<{ role: string; count: number }>;
  recentRegistrations: number;
}> => {
  try {
    const totalUsers = await UserModel.countDocuments({
      "status.isDeleted": false,
    });

    const activeUsers = await UserModel.countDocuments({
      "status.isActive": true,
      "status.isDeleted": false,
    });

    const verifiedUsers = await UserModel.countDocuments({
      "status.isVerified": true,
      "status.isDeleted": false,
    });

    const bannedUsers = await UserModel.countDocuments({
      "status.ban.isBanned": true,
      "status.isDeleted": false,
    });

    const usersByRole = await UserModel.aggregate([
      { $match: { "status.isDeleted": false } },
      { $group: { _id: "$security.role", count: { $sum: 1 } } },
      { $project: { role: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    // Recent registrations in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRegistrations = await UserModel.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      "status.isDeleted": false,
    });

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      bannedUsers,
      usersByRole,
      recentRegistrations,
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch user statistics: ${error.message}`);
  }
};
