import { 
  getUserReferralDataService, 
  claimRewardService, 
  updateReferralSettingsService,
  validateReferralCodeService 
} from "../../services/Auth/referral.service";
import { encrypt, decrypt } from "../../configs/crypto";

/**
 * Get user's referral data
 */
export const getUserReferralDataController = async (req: any, res: any): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized access"
      });
      return;
    }

    const referralData = await getUserReferralDataService(userId);
    
    // Encrypt the response data
    const encryptedResponse = encrypt(JSON.stringify(referralData));

    res.status(200).json({
      success: true,
      message: "Referral data fetched successfully",
      data: encryptedResponse
    });
  } catch (error) {
    console.error("Error in getUserReferralDataController:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch referral data",
      error: process.env.NODE_ENV === "development" ? (error as Error).message : undefined
    });
  }
};

/**
 * Claim a referral reward
 */
export const claimReferralRewardController = async (req: any, res: any): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { data } = req.body;
    const decryptedData = JSON.parse(decrypt(data));
    const { rewardId } = decryptedData;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized access"
      });
      return;
    }

    if (!rewardId) {
      res.status(400).json({
        success: false,
        message: "Reward ID is required"
      });
      return;
    }

    const success = await claimRewardService(userId, rewardId);
    
    if (success) {
      res.status(200).json({
        success: true,
        message: "Reward claimed successfully"
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to claim reward"
      });
    }
  } catch (error) {
    console.error("Error in claimReferralRewardController:", error);
    res.status(500).json({
      success: false,
      message: (error as Error).message || "Failed to claim reward",
      error: process.env.NODE_ENV === "development" ? (error as Error).message : undefined
    });
  }
};

/**
 * Update referral settings
 */
export const updateReferralSettingsController = async (req: any, res: any): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { data } = req.body;
    const decryptedData = JSON.parse(decrypt(data));
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized access"
      });
      return;
    }

    // Validate settings object
    const allowedSettings = [
      'shareViaEmail',
      'shareViaSMS', 
      'shareViaSocial',
      'notifyOnReferralJoin',
      'notifyOnRewardEarned'
    ];

    const filteredSettings = Object.keys(decryptedData)
      .filter(key => allowedSettings.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = decryptedData[key];
        return obj;
      }, {});

    if (Object.keys(filteredSettings).length === 0) {
      res.status(400).json({
        success: false,
        message: "No valid settings provided"
      });
      return;
    }

    const success = await updateReferralSettingsService(userId, filteredSettings);
    
    if (success) {
      res.status(200).json({
        success: true,
        message: "Referral settings updated successfully"
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to update referral settings"
      });
    }
  } catch (error) {
    console.error("Error in updateReferralSettingsController:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update referral settings",
      error: process.env.NODE_ENV === "development" ? (error as Error).message : undefined
    });
  }
};

/**
 * Validate referral code (public endpoint for signup)
 */
export const validateReferralCodeController = async (req: any, res: any): Promise<void> => {
  try {
    const { data } = req.body;
    const decryptedData = JSON.parse(decrypt(data));
    const { referralCode } = decryptedData;
    
    if (!referralCode) {
      res.status(400).json({
        success: false,
        message: "Referral code is required"
      });
      return;
    }

    const result = await validateReferralCodeService(referralCode);
    
    // Encrypt the response if valid
    const encryptedResponse = result.valid ? encrypt(JSON.stringify(result)) : null;

    res.status(200).json({
      success: true,
      message: result.valid ? "Valid referral code" : "Invalid referral code",
      data: encryptedResponse
    });
  } catch (error) {
    console.error("Error in validateReferralCodeController:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate referral code",
      error: process.env.NODE_ENV === "development" ? (error as Error).message : undefined
    });
  }
};

/**
 * Get referral statistics (admin/analytics endpoint)
 */
export const getReferralStatsController = async (req: any, res: any): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized access"
      });
      return;
    }

    const referralData = await getUserReferralDataService(userId);
    
    // Extract only stats for a lighter response
    const stats = {
      referralCode: referralData.referralCode,
      stats: referralData.stats,
      totalRewards: referralData.rewards.length,
      unclaimedRewards: referralData.rewards.filter(r => !r.claimed).length
    };

    const encryptedResponse = encrypt(JSON.stringify(stats));

    res.status(200).json({
      success: true,
      message: "Referral stats fetched successfully",
      data: encryptedResponse
    });
  } catch (error) {
    console.error("Error in getReferralStatsController:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch referral stats",
      error: process.env.NODE_ENV === "development" ? (error as Error).message : undefined
    });
  }
};
