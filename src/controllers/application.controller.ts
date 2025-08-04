import { createApplicationService } from "../services/application.service";
import { IApplication } from "../models/application.model";
import { decrypt, encrypt } from "../configs/crypto";

export const createApplicationController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { data } = req.body;
    const decryptedData = JSON.parse(decrypt(data));

    const ipAddress: string | undefined =
      req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
      req.socket?.remoteAddress ||
      req.connection?.remoteAddress ||
      "UNKNOWN";

    const finalData: Partial<IApplication> = {
      ...decryptedData,
      ipAddress: ipAddress,
    };

    const newApplication = await createApplicationService(finalData);

    const responseData = {
      fullName: newApplication.fullName,
      position: newApplication.position,
      submittedAt: new Date().toISOString(),
    };
    const encryptedData = encrypt(JSON.stringify(responseData));

    res.status(201).json({
      success: true,
      message: "Application Submitted Successfully",
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error creating application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit application",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};
