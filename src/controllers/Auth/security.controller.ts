import { Request, Response } from "express";
import {
  getUserSecuritySettingsService,
  updateSecuritySettingsService,
  changePasswordService,
  getActiveSessionsService,
  terminateSessionService,
  terminateAllSessionsService,
  getSecurityActivityService,
  addSecurityActivityService,
  getSecurityActivitySummaryService,
  cleanupOldSecurityActivitiesService,
} from "../../services/Auth/security.service";
import { decrypt, encrypt } from "../../configs/crypto";
import { getDeviceInfo } from "../../utils/helpers";

// Get user security settings
export const getSecuritySettingsController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const userID = req.user?.userID;
    
    if (!userID) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const securitySettings = await getUserSecuritySettingsService(userID);
    
    res.status(200).json({
      success: true,
      message: "Security settings retrieved successfully",
      data: encrypt(JSON.stringify(securitySettings)),
    });
  } catch (error: any) {
    console.error("Error fetching security settings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update security settings
export const updateSecuritySettingsController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const userID = req.user?.userID;
    const { data } = req.body;
    
    if (!userID) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const decryptedData = JSON.parse(decrypt(data));
    const updatedSettings = await updateSecuritySettingsService(userID, decryptedData);
    
    // Log security activity
    await addSecurityActivityService(userID, {
      type: "settings_change",
      description: "Security settings updated",
      status: "success",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] || "",
      deviceInfo: getDeviceInfo(req),
    });

    res.status(200).json({
      success: true,
      message: "Security settings updated successfully",
      data: encrypt(JSON.stringify(updatedSettings)),
    });
  } catch (error: any) {
    console.error("Error updating security settings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Change password
export const changePasswordController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const userID = req.user?.userID;
    const { data } = req.body;
    
    if (!userID) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const decryptedData = JSON.parse(decrypt(data));
    const { currentPassword, newPassword } = decryptedData;
    
    const result = await changePasswordService(userID, currentPassword, newPassword);
    
    if (!result.success) {
      res.status(400).json({
        success: false,
        message: result.message,
      });
      return;
    }

    // Log security activity
    await addSecurityActivityService(userID, {
      type: "password_change",
      description: "Password changed successfully",
      status: "success",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] || "",
      deviceInfo: getDeviceInfo(req),
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get active sessions
export const getActiveSessionsController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const userID = req.user?.userID;
    
    if (!userID) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const sessions = await getActiveSessionsService(userID);
    
    res.status(200).json({
      success: true,
      message: "Active sessions retrieved successfully",
      data: encrypt(JSON.stringify(sessions)),
    });
  } catch (error: any) {
    console.error("Error fetching active sessions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Terminate specific session
export const terminateSessionController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const userID = req.user?.userID;
    const { sessionId } = req.params;
    
    if (!userID) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const result = await terminateSessionService(userID, sessionId);
    
    if (!result.success) {
      res.status(400).json({
        success: false,
        message: result.message,
      });
      return;
    }

    // Log security activity
    await addSecurityActivityService(userID, {
      type: "session_terminated",
      description: `Session terminated: ${sessionId}`,
      status: "success",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] || "",
      deviceInfo: getDeviceInfo(req),
    });

    res.status(200).json({
      success: true,
      message: "Session terminated successfully",
    });
  } catch (error: any) {
    console.error("Error terminating session:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Terminate all other sessions
export const terminateAllSessionsController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const userID = req.user?.userID;
    const currentToken = req.headers.authorization?.replace("Bearer ", "");
    
    if (!userID || !currentToken) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const result = await terminateAllSessionsService(userID, currentToken);
    
    // Log security activity
    await addSecurityActivityService(userID, {
      type: "all_sessions_terminated",
      description: "All other sessions terminated",
      status: "success",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] || "",
      deviceInfo: getDeviceInfo(req),
    });

    res.status(200).json({
      success: true,
      message: `${result.terminatedCount} sessions terminated successfully`,
    });
  } catch (error: any) {
    console.error("Error terminating all sessions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get security activity
export const getSecurityActivityController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const userID = req.user?.userID;
    const { page = 1, limit = 20, type, status } = req.query;
    
    if (!userID) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const filters = {
      type: type as string,
      status: status as string,
    };

    const activities = await getSecurityActivityService(
      userID,
      parseInt(page as string),
      parseInt(limit as string),
      filters
    );
    
    res.status(200).json({
      success: true,
      message: "Security activity retrieved successfully",
      data: encrypt(JSON.stringify(activities)),
    });
  } catch (error: any) {
    console.error("Error fetching security activity:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get security activity summary
export const getSecurityActivitySummaryController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const userID = req.user?.userID;
    const { days = 30 } = req.query;
    
    if (!userID) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const summary = await getSecurityActivitySummaryService(
      userID,
      parseInt(days as string)
    );
    
    res.status(200).json({
      success: true,
      message: "Security activity summary retrieved successfully",
      data: encrypt(JSON.stringify(summary)),
    });
  } catch (error: any) {
    console.error("Error fetching security activity summary:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Manual security activity logging (admin endpoint)
export const logSecurityActivityController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const userID = req.user?.userID;
    const { data } = req.body;
    
    if (!userID) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const activityData = JSON.parse(decrypt(data));
    
    await addSecurityActivityService(userID, {
      ...activityData,
      ipAddress: activityData.ipAddress || req.ip,
      userAgent: activityData.userAgent || req.headers["user-agent"] || "",
      deviceInfo: activityData.deviceInfo || getDeviceInfo(req),
    });

    res.status(200).json({
      success: true,
      message: "Security activity logged successfully",
    });
  } catch (error: any) {
    console.error("Error logging security activity:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
