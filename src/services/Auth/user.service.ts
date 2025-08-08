import UserModel, { IUser } from "../../models/Auth/user.model";
import { Types, SortOrder } from "mongoose";

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

    const user = await UserModel.findOneAndUpdate(
      { _id: id, "status.isDeleted": false },
      {
        $set: {
          ...updates,
          lastProfileUpdate: new Date(),
        },
      },
      { new: true, runValidators: true }
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
    );

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

    const user = await UserModel.findOneAndUpdate(
      { _id: id, "status.isDeleted": false },
      {
        $push: { "security.tokens": tokenData },
        $set: { lastLogin: new Date() },
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

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

    const updateQuery: any = {
      lastProfileUpdate: new Date(),
    };

    Object.keys(addressData).forEach((key) => {
      updateQuery[`addresses.${addressIndex}.${key}`] =
        addressData[key as keyof typeof addressData];
    });

    const user = await UserModel.findOneAndUpdate(
      { _id: id, "status.isDeleted": false },
      { $set: updateQuery },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return user as IUser;
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

    user.addresses.splice(addressIndex, 1);
    user.lastProfileUpdate = new Date();

    await user.save();

    return user as IUser;
  } catch (error: any) {
    throw new Error(`Failed to remove user address: ${error.message}`);
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

    const queryFilter = { ...filter, "status.isDeleted": false };

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
