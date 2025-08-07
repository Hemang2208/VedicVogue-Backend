import {
  createGeneralContactService,
  getGeneralContactByIdService,
  updateGeneralContactStatusService,
  deleteGeneralContactService,
  getAllGeneralContactsService,
  getContactsByStatusService,
  getContactsByPriorityService,
  getContactsByIssueTypeService,
  getPendingContactsService,
  getResolvedContactsService,
  getAssignedContactsService,
  searchGeneralContactsService,
  assignContactToAgentService,
  markContactAsResolvedService,
  getGeneralContactStatistics,
  getAllDeletedContactsService,
  restoreGeneralContactService,
  permanentlyDeleteContactService,
  bulkDeleteContactsService,
  bulkRestoreContactsService,
} from "../../services/Contact/generalContact.service";
import { IGeneralContact } from "../../models/Contact/generalContact.model";
import { decrypt, encrypt } from "../../configs/crypto";

export const createGeneralContactController = async (
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

    const finalData: Partial<IGeneralContact> = {
      ...decryptedData,
      ipAddress,
    };

    const newContact = await createGeneralContactService(finalData);

    const responseData = {
      name: newContact.name,
      email: newContact.email,
      subject: newContact.subject,
      status: newContact.status,
      submittedAt: new Date().toISOString(),
    };
    
    const encryptedData = encrypt(JSON.stringify(responseData));

    res.status(201).json({
      success: true,
      message: "Contact request submitted successfully",
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error creating contact:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit contact request",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getGeneralContactByIdController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;
    const contact = await getGeneralContactByIdService(id);

    if (!contact) {
      res.status(404).json({
        success: false,
        message: "Contact not found",
      });
      return;
    }

    const encryptedData = encrypt(JSON.stringify(contact));

    res.status(200).json({
      success: true,
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error fetching contact:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const updateGeneralContactStatusController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, assignedTo, responseNotes, customerSatisfactionRating, followUpRequired } = req.body;

    const updatedContact = await updateGeneralContactStatusService(id, {
      status,
      assignedTo,
      responseNotes,
      customerSatisfactionRating,
      followUpRequired,
    });

    const encryptedData = encrypt(JSON.stringify(updatedContact));

    res.status(200).json({
      success: true,
      message: "Contact status updated successfully",
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error updating contact status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update contact status",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const deleteGeneralContactController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;
    const isDeleted = await deleteGeneralContactService(id);

    if (!isDeleted) {
      res.status(404).json({
        success: false,
        message: "Contact not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error: unknown) {
    console.log("Error deleting contact:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete contact",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getAllGeneralContactsController = async (
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

    const result = await getAllGeneralContactsService(
      {},
      page,
      limit,
      sortBy,
      sortOrder
    );

    // Encrypt data safely
    let encryptedData: string;
    let encryptedData2: string;

    try {
      encryptedData = encrypt(JSON.stringify(result.contacts || []));

      const paginationData = {
        totalContacts: result.totalContacts || 0,
        currentPage: result.currentPage || 1,
        totalPages: result.totalPages || 0,
      };

      encryptedData2 = encrypt(JSON.stringify(paginationData));
    } catch (encryptError) {
      console.error("Encryption error:", encryptError);
      encryptedData = JSON.stringify(result.contacts || []);
      encryptedData2 = JSON.stringify({
        totalContacts: result.totalContacts || 0,
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
    console.error("Error fetching contacts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contacts",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getContactsByStatusController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { status } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getContactsByStatusService(
      status,
      page,
      limit
    );

    const encryptedData = encrypt(JSON.stringify(result.contacts));

    const paginationData = {
      totalContacts: result.totalContacts,
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
    console.log("Error fetching contacts by status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contacts by status",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getContactsByPriorityController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { priority } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getContactsByPriorityService(priority, page, limit);

    const encryptedData = encrypt(JSON.stringify(result.contacts));

    const paginationData = {
      totalContacts: result.totalContacts,
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
    console.log("Error fetching contacts by priority:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contacts by priority",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getContactsByIssueTypeController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { issueType } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getContactsByIssueTypeService(issueType, page, limit);

    const encryptedData = encrypt(JSON.stringify(result.contacts));

    const paginationData = {
      totalContacts: result.totalContacts,
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
    console.log("Error fetching contacts by issue type:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contacts by issue type",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getPendingContactsController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getPendingContactsService(page, limit);

    const encryptedData = encrypt(JSON.stringify(result.contacts));

    const paginationData = {
      totalContacts: result.totalContacts,
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
    console.log("Error fetching pending contacts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending contacts",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getResolvedContactsController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getResolvedContactsService(page, limit);

    const encryptedData = encrypt(JSON.stringify(result.contacts));

    const paginationData = {
      totalContacts: result.totalContacts,
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
    console.log("Error fetching resolved contacts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch resolved contacts",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getAssignedContactsController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { assignedTo } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getAssignedContactsService(assignedTo, page, limit);

    const encryptedData = encrypt(JSON.stringify(result.contacts));

    const paginationData = {
      totalContacts: result.totalContacts,
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
    console.log("Error fetching assigned contacts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned contacts",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const searchGeneralContactsController = async (
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

    const result = await searchGeneralContactsService(searchTerm, page, limit);

    const encryptedData = encrypt(JSON.stringify(result.contacts));

    const paginationData = {
      totalContacts: result.totalContacts,
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
    console.log("Error searching contacts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search contacts",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const assignContactToAgentController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { contactId } = req.params;
    const { agentName } = req.body;

    if (!agentName || typeof agentName !== "string") {
      res.status(400).json({
        success: false,
        message: "Agent name is required",
      });
      return;
    }

    const updatedContact = await assignContactToAgentService(contactId, agentName);

    const encryptedData = encrypt(JSON.stringify(updatedContact));

    res.status(200).json({
      success: true,
      message: "Contact assigned to agent successfully",
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error assigning contact to agent:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign contact to agent",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const markContactAsResolvedController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { contactId } = req.params;
    const { responseNotes } = req.body;

    const updatedContact = await markContactAsResolvedService(contactId, responseNotes);

    const encryptedData = encrypt(JSON.stringify(updatedContact));

    res.status(200).json({
      success: true,
      message: "Contact marked as resolved successfully",
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error marking contact as resolved:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark contact as resolved",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getGeneralContactStatisticsController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const statistics = await getGeneralContactStatistics();

    const encryptedData = encrypt(JSON.stringify(statistics));

    res.status(200).json({
      success: true,
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error fetching contact statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact statistics",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

// New controllers for managing deleted contacts
export const getAllDeletedContactsController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "deletedAt";
    const sortOrder = req.query.sortOrder || "desc";

    const result = await getAllDeletedContactsService(page, limit, sortBy, sortOrder);

    const encryptedData = encrypt(JSON.stringify(result));

    res.status(200).json({
      success: true,
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error fetching deleted contacts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch deleted contacts",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const restoreGeneralContactController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;

    const restoredContact = await restoreGeneralContactService(id);

    if (!restoredContact) {
      res.status(404).json({
        success: false,
        message: "Deleted contact not found",
      });
      return;
    }

    const encryptedData = encrypt(JSON.stringify(restoredContact));

    res.status(200).json({
      success: true,
      message: "Contact restored successfully",
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error restoring contact:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore contact",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const permanentlyDeleteContactController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await permanentlyDeleteContactService(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Deleted contact not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Contact permanently deleted successfully",
    });
  } catch (error: unknown) {
    console.log("Error permanently deleting contact:", error);
    res.status(500).json({
      success: false,
      message: "Failed to permanently delete contact",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const bulkDeleteContactsController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { data } = req.body;
    const decryptedData = JSON.parse(decrypt(data));
    const { ids } = decryptedData;

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({
        success: false,
        message: "Invalid or empty contact IDs array",
      });
      return;
    }

    const deletedCount = await bulkDeleteContactsService(ids);

    const responseData = {
      deletedCount,
      message: `${deletedCount} contacts deleted successfully`,
    };

    const encryptedData = encrypt(JSON.stringify(responseData));

    res.status(200).json({
      success: true,
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error bulk deleting contacts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to bulk delete contacts",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const bulkRestoreContactsController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { data } = req.body;
    const decryptedData = JSON.parse(decrypt(data));
    const { ids } = decryptedData;

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({
        success: false,
        message: "Invalid or empty contact IDs array",
      });
      return;
    }

    const restoredCount = await bulkRestoreContactsService(ids);

    const responseData = {
      restoredCount,
      message: `${restoredCount} contacts restored successfully`,
    };

    const encryptedData = encrypt(JSON.stringify(responseData));

    res.status(200).json({
      success: true,
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error bulk restoring contacts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to bulk restore contacts",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};
