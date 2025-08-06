import { createInternService } from "../services/intern.services";
import { IIntern } from "../models/intern.model";
import { decrypt, encrypt } from "../configs/crypto";

export const createInternController = async (
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

    const finalData: Partial<IIntern> = {
      ...decryptedData,
      ipAddress: ipAddress,
    };

    const newIntern = await createInternService(finalData);

    const responseData = {
      fullName: newIntern.fullName,
      college: newIntern.college,
      submittedAt: new Date().toISOString(),
    };
    const encryptedData = encrypt(JSON.stringify(responseData));

    res.status(201).json({
      success: true,
      message: "Intern Submitted Successfully",
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error creating intern application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit intern application",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};
