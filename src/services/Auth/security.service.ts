import UserModel, { IUser } from "../../models/Auth/user.model";
import { comparePassword, hashPassword } from "../../utils/password";
import mongoose from "mongoose";

// Constants for limits
const MAX_ACTIVITIES = 20;
const MAX_SESSIONS = 10;

// Interface for security settings
export interface SecuritySettings {
  twoFactorAuth: boolean;
  loginNotifications: boolean;
  sessionTimeout: boolean;
  deviceTracking: boolean;
  passwordExpiry: boolean;
}

// Interface for security activity
export interface SecurityActivity {
  type: string;
  description: string;
  timestamp: Date;
  status: string;
  location?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: any;
}

// Interface for session data
export interface SessionData {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
  ip: string;
  token: string;
  createdAt: Date;
  deviceInfo?: any;
}

// Get user security settings
export const getUserSecuritySettingsService = async (
  userId: string
): Promise<SecuritySettings> => {
  try {
    const user = await UserModel.findOne({ userID: userId });

    if (!user) {
      throw new Error("User not found");
    }

    // Extract security settings from user document
    // If not set, return default values
    const securitySettings: SecuritySettings = {
      twoFactorAuth: user.security?.twoFactorAuth || false,
      loginNotifications: user.security?.loginNotifications !== false, // default true
      sessionTimeout: user.security?.sessionTimeout !== false, // default true
      deviceTracking: user.security?.deviceTracking !== false, // default true
      passwordExpiry: user.security?.passwordExpiry || false,
    };

    return securitySettings;
  } catch (error: any) {
    console.error("Error fetching security settings:", error);
    throw new Error("Failed to fetch security settings");
  }
};

// Update security settings
export const updateSecuritySettingsService = async (
  userId: string,
  settings: Partial<SecuritySettings>
): Promise<SecuritySettings> => {
  try {
    const user = await UserModel.findOne({ userID: userId });

    if (!user) {
      throw new Error("User not found");
    }

    // Update security settings
    if (!user.security) {
      user.security = {
        role: "user",
        tokens: [],
        activities: [],
      };
    }

    // Update the security settings
    Object.assign(user.security, settings);

    await user.save();

    return await getUserSecuritySettingsService(userId);
  } catch (error: any) {
    console.error("Error updating security settings:", error);
    throw new Error("Failed to update security settings");
  }
};

// Change password
export const changePasswordService = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await UserModel.findOne({ userID: userId }).select(
      "+account.password"
    );

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Check if passwords exist
    if (!currentPassword) {
      return { success: false, message: "Current password is required" };
    }

    if (!user.account?.password) {
      return { success: false, message: "No password found for user" };
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      user.account.password
    );

    if (!isCurrentPasswordValid) {
      return { success: false, message: "Current password is incorrect" };
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    user.account.password = hashedNewPassword;
    user.lastPasswordChange = new Date();

    await user.save();

    return { success: true, message: "Password changed successfully" };
  } catch (error: any) {
    console.error("Error changing password:", error);
    throw new Error("Failed to change password");
  }
};

// Get active sessions
export const getActiveSessionsService = async (
  userId: string
): Promise<SessionData[]> => {
  try {
    const user = await UserModel.findOne({ userID: userId });

    if (!user) {
      throw new Error("User not found");
    }

    const sessions: SessionData[] = [];

    // Map tokens to session data
    if (user.security?.tokens) {
      user.security.tokens.forEach((tokenData, index) => {
        const deviceInfo = tokenData.device || tokenData.deviceInfo;
        const device = deviceInfo
          ? `${deviceInfo.browser} on ${deviceInfo.os}`
          : `Device ${index + 1}`;

        const location = deviceInfo?.location || "Unknown location";
        const lastActive = getRelativeTime(tokenData.createdAt);
        const ip = deviceInfo?.ipAddress || "Unknown IP";

        sessions.push({
          id: tokenData._id?.toString() || `session_${index}`,
          device,
          location,
          lastActive,
          current: index === 0, // Assume first token is current session
          ip,
          token: tokenData.token,
          createdAt: tokenData.createdAt,
          deviceInfo,
        });
      });
    }

    // Ensure we don't return more than the maximum allowed sessions
    return sessions.slice(0, MAX_SESSIONS);
  } catch (error: any) {
    console.error("Error fetching active sessions:", error);
    throw new Error("Failed to fetch active sessions");
  }
};

// Terminate specific session
export const terminateSessionService = async (
  userId: string,
  sessionId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await UserModel.findOne({ userID: userId });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (!user.security?.tokens) {
      return { success: false, message: "No active sessions found" };
    }

    // Find and remove the specific token
    const initialTokenCount = user.security.tokens.length;
    user.security.tokens = user.security.tokens.filter(
      (tokenData) => tokenData._id?.toString() !== sessionId
    );

    if (user.security.tokens.length === initialTokenCount) {
      return { success: false, message: "Session not found" };
    }

    await user.save();

    return { success: true, message: "Session terminated successfully" };
  } catch (error: any) {
    console.error("Error terminating session:", error);
    throw new Error("Failed to terminate session");
  }
};

// Terminate all other sessions
export const terminateAllSessionsService = async (
  userId: string,
  currentToken: string
): Promise<{ success: boolean; terminatedCount: number }> => {
  try {
    const user = await UserModel.findOne({ userID: userId });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.security?.tokens) {
      return { success: true, terminatedCount: 0 };
    }

    const initialTokenCount = user.security.tokens.length;

    // Keep only the current token
    user.security.tokens = user.security.tokens.filter(
      (tokenData) => tokenData.token === currentToken
    );

    const terminatedCount = initialTokenCount - user.security.tokens.length;

    await user.save();

    return { success: true, terminatedCount };
  } catch (error: any) {
    console.error("Error terminating all sessions:", error);
    throw new Error("Failed to terminate all sessions");
  }
};

// Get security activity
export const getSecurityActivityService = async (
  userId: string,
  page: number = 1,
  limit: number = 20,
  filters?: { type?: string; status?: string }
): Promise<{
  activities: SecurityActivity[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  try {
    const user = await UserModel.findOne({ userID: userId });

    if (!user) {
      throw new Error("User not found");
    }

    // Get activities from user's security.activities array
    let activities = user.security?.activities || [];

    // Apply filters
    if (filters?.type) {
      activities = activities.filter(
        (activity) => activity.type === filters.type
      );
    }

    if (filters?.status) {
      activities = activities.filter(
        (activity) => activity.status === filters.status
      );
    }

    // Sort by timestamp (most recent first)
    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Get total count after filtering
    const total = activities.length;

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedActivities = activities.slice(startIndex, endIndex);

    // Transform activities to SecurityActivity interface
    const transformedActivities: SecurityActivity[] = paginatedActivities.map(
      (activity) => ({
        type: activity.type,
        description: activity.description,
        timestamp: activity.timestamp,
        status: activity.status,
        location: activity.location,
        ipAddress: activity.ipAddress,
        userAgent: activity.userAgent,
        deviceInfo: activity.deviceInfo,
      })
    );

    // Additional safety check to ensure we don't return more than maximum activities
    const finalActivities = transformedActivities.slice(0, MAX_ACTIVITIES);

    // If no activities found, create an initial one
    if (finalActivities.length === 0 && page === 1) {
      const initialActivity = {
        type: "login",
        description: "Account accessed",
        status: "success",
        location: "System",
      };

      await addSecurityActivityService(userId, initialActivity);

      return {
        activities: [
          {
            ...initialActivity,
            timestamp: new Date(),
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      };
    }

    return {
      activities: finalActivities,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error: any) {
    console.error("Error fetching security activity:", error);
    throw new Error("Failed to fetch security activity");
  }
};

// Add security activity (for logging)
export const addSecurityActivityService = async (
  userId: string,
  activityData: Omit<SecurityActivity, "timestamp">
): Promise<void> => {
  try {
    // Find user and add activity to their security.activities array
    const user = await UserModel.findOne({ userID: userId });

    if (!user) {
      console.error(`User not found for activity logging: ${userId}`);
      return;
    }

    // Initialize security object if it doesn't exist
    if (!user.security) {
      user.security = {
        role: "user",
        tokens: [],
        activities: [],
      };
    }

    // Initialize activities array if it doesn't exist
    if (!user.security.activities) {
      user.security.activities = [];
    }

    // Create new activity
    const newActivity = {
      type: activityData.type,
      description: activityData.description,
      status: activityData.status,
      location: activityData.location,
      ipAddress: activityData.ipAddress,
      userAgent: activityData.userAgent,
      deviceInfo: activityData.deviceInfo,
      timestamp: new Date(),
      metadata: {},
    };

    // Add activity to the beginning of the array (most recent first)
    user.security.activities.unshift(newActivity);

    // Keep only the latest 20 activities to prevent unlimited growth
    if (user.security.activities.length > MAX_ACTIVITIES) {
      user.security.activities = user.security.activities.slice(
        0,
        MAX_ACTIVITIES
      );
    }

    // Save the updated user document
    await user.save();
  } catch (error: any) {
    console.error("Error adding security activity:", error);
    // Don't throw error here as it's just logging - we don't want to break the main functionality
  }
};

// Get security activity summary/stats
export const getSecurityActivitySummaryService = async (
  userId: string,
  days: number = 30
): Promise<{
  totalActivities: number;
  recentLogins: number;
  passwordChanges: number;
  suspiciousActivities: number;
  topActivityTypes: Array<{ type: string; count: number }>;
}> => {
  try {
    const user = await UserModel.findOne({ userID: userId });

    if (!user) {
      throw new Error("User not found");
    }

    const activities = user.security?.activities || [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Filter activities within the specified date range
    const recentActivities = activities.filter(
      (activity) => new Date(activity.timestamp) >= startDate
    );

    // Calculate statistics
    const totalActivities = recentActivities.length;
    const recentLogins = recentActivities.filter(
      (activity) => activity.type === "login"
    ).length;
    const passwordChanges = recentActivities.filter(
      (activity) => activity.type === "password_change"
    ).length;
    const suspiciousActivities = recentActivities.filter(
      (activity) => activity.status === "warning"
    ).length;

    // Calculate top activity types
    const activityTypeCounts: { [key: string]: number } = {};
    recentActivities.forEach((activity) => {
      activityTypeCounts[activity.type] =
        (activityTypeCounts[activity.type] || 0) + 1;
    });

    const topActivityTypes = Object.entries(activityTypeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalActivities,
      recentLogins,
      passwordChanges,
      suspiciousActivities,
      topActivityTypes,
    };
  } catch (error: any) {
    console.error("Error fetching security activity summary:", error);
    throw new Error("Failed to fetch security activity summary");
  }
};

// Delete old security activities (cleanup function)
export const cleanupOldSecurityActivitiesService = async (
  retentionDays: number = 365
): Promise<{ deletedCount: number }> => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    let totalDeletedCount = 0;

    // Update all users to remove old activities
    const users = await UserModel.find({
      "security.activities": { $exists: true, $ne: [] },
    });

    for (const user of users) {
      if (user.security?.activities) {
        const originalCount = user.security.activities.length;

        // Filter out old activities
        user.security.activities = user.security.activities.filter(
          (activity) => new Date(activity.timestamp) >= cutoffDate
        );

        const deletedCount = originalCount - user.security.activities.length;

        if (deletedCount > 0) {
          await user.save();
          totalDeletedCount += deletedCount;
        }
      }
    }

    console.log(`Deleted ${totalDeletedCount} old security activities`);

    return { deletedCount: totalDeletedCount };
  } catch (error: any) {
    console.error("Error cleaning up old security activities:", error);
    throw new Error("Failed to cleanup old security activities");
  }
};

// Helper function to get relative time
const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
};

/**
 * Enforce activity and session limits across all users
 * This function can be called periodically to ensure database consistency
 */
export const enforceSecurityLimitsService = async (): Promise<{
  usersUpdated: number;
  activitiesTrimmed: number;
  sessionsTrimmed: number;
}> => {
  try {
    let usersUpdated = 0;
    let activitiesTrimmed = 0;
    let sessionsTrimmed = 0;

    // Find all users with security data
    const users = await UserModel.find({
      $or: [
        { "security.activities.20": { $exists: true } }, // Users with more than 20 activities
        { "security.tokens.10": { $exists: true } }, // Users with more than 10 tokens
      ],
    });

    for (const user of users) {
      let userModified = false;

      // Trim activities to MAX_ACTIVITIES
      if (
        user.security?.activities &&
        user.security.activities.length > MAX_ACTIVITIES
      ) {
        const originalLength = user.security.activities.length;
        user.security.activities = user.security.activities
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          ) // Sort by timestamp desc
          .slice(0, MAX_ACTIVITIES);
        activitiesTrimmed += originalLength - user.security.activities.length;
        userModified = true;
      }

      // Trim sessions to MAX_SESSIONS
      if (user.security?.tokens && user.security.tokens.length > MAX_SESSIONS) {
        const originalLength = user.security.tokens.length;
        user.security.tokens = user.security.tokens
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ) // Sort by createdAt desc
          .slice(0, MAX_SESSIONS);
        sessionsTrimmed += originalLength - user.security.tokens.length;
        userModified = true;
      }

      if (userModified) {
        await user.save();
        usersUpdated++;
      }
    }

    console.log(
      `Security limits enforced: ${usersUpdated} users updated, ${activitiesTrimmed} activities trimmed, ${sessionsTrimmed} sessions trimmed`
    );

    return {
      usersUpdated,
      activitiesTrimmed,
      sessionsTrimmed,
    };
  } catch (error: any) {
    console.error("Error enforcing security limits:", error);
    throw new Error("Failed to enforce security limits");
  }
};
