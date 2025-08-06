import {
  createInternService,
  getInternByIdService,
  updateInternStatusService,
  deleteInternService,
  getAllInternsService,
  searchInternsService,
  getInternStatistics,
} from "../services/intern.services";
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

export const getInternByIdController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;
    const intern = await getInternByIdService(id);

    if (!intern) {
      res.status(404).json({
        success: false,
        message: "Intern application not found",
      });
      return;
    }

    const encryptedData = encrypt(JSON.stringify(intern));

    res.status(200).json({
      success: true,
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error fetching intern:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch intern application",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const updateInternStatusController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isReplied, isShortlisted } = req.body;

    const updatedIntern = await updateInternStatusService(id, {
      isReplied,
      isShortlisted,
    });

    const encryptedData = encrypt(JSON.stringify(updatedIntern));

    res.status(200).json({
      success: true,
      message: "Intern status updated successfully",
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error updating intern status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update intern status",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const deleteInternController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;
    const isDeleted = await deleteInternService(id);

    if (!isDeleted) {
      res.status(404).json({
        success: false,
        message: "Intern application not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Intern application deleted successfully",
    });
  } catch (error: unknown) {
    console.log("Error deleting intern:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete intern application",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getAllInternsController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

    const result = await getAllInternsService(
      {},
      page,
      limit,
      sortBy,
      sortOrder
    );

    const encryptedData = encrypt(JSON.stringify(result.interns));

    const paginationData = {
      totalInterns: result.totalInterns,
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
    console.log("Error fetching interns:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch intern applications",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const searchInternsController = async (
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

    const result = await searchInternsService(searchTerm, page, limit);

    const encryptedData = encrypt(JSON.stringify(result.interns));

    const paginationData = {
      totalInterns: result.totalInterns,
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
    console.log("Error searching interns:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search intern applications",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getInternStatisticsController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const statistics = await getInternStatistics();

    const encryptedData = encrypt(JSON.stringify(statistics));

    res.status(200).json({
      success: true,
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error fetching intern statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch intern statistics",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};
