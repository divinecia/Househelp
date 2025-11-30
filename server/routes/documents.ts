import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// Get all documents for a user
router.get("/user/:user_id", async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const { document_type, verification_status } = req.query;

    let query = supabase
      .from("documents")
      .select(`
        *,
        verified_by_admin:admins(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq("user_id", user_id)
      .order("uploaded_at", { ascending: false });

    if (document_type) {
      query = query.eq("document_type", document_type);
    }

    if (verification_status) {
      query = query.eq("verification_status", verification_status);
    }

    const { data: documents, error } = await query;

    if (error) {
      console.error("Error fetching documents:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch documents",
      });
    }

    res.json({
      success: true,
      data: documents,
      total: documents?.length || 0,
    });
  } catch (error: any) {
    console.error("Error in GET /documents/user/:user_id:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Get single document
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: document, error } = await supabase
      .from("documents")
      .select(`
        *,
        user:user_profiles(
          id,
          email
        ),
        verified_by_admin:admins(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching document:", error);
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    res.json({
      success: true,
      data: document,
    });
  } catch (error: any) {
    console.error("Error in GET /documents/:id:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Get all documents pending verification (admin)
router.get("/admin/pending", async (req: Request, res: Response) => {
  try {
    const { data: documents, error } = await supabase
      .from("documents")
      .select(`
        *,
        user:user_profiles(
          id,
          email
        )
      `)
      .eq("verification_status", "pending")
      .order("uploaded_at", { ascending: true });

    if (error) {
      console.error("Error fetching pending documents:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch pending documents",
      });
    }

    res.json({
      success: true,
      data: documents,
      total: documents?.length || 0,
    });
  } catch (error: any) {
    console.error("Error in GET /documents/admin/pending:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Upload document (create document record)
// Note: Actual file upload should be handled by a separate file upload service (e.g., Supabase Storage)
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      user_id,
      document_type,
      document_name,
      file_url,
      file_size,
      file_type,
      expiry_date,
    } = req.body;

    // Validate required fields
    if (!user_id || !document_type || !document_name || !file_url) {
      return res.status(400).json({
        success: false,
        error: "user_id, document_type, document_name, and file_url are required",
      });
    }

    // Validate document_type
    const validTypes = [
      "national_id",
      "background_check",
      "certificate",
      "proof_of_address",
      "photo",
    ];
    if (!validTypes.includes(document_type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid document_type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("id", user_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Create document record
    const { data: document, error } = await supabase
      .from("documents")
      .insert([
        {
          user_id,
          document_type,
          document_name,
          file_url,
          file_size,
          file_type,
          expiry_date,
          verification_status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error uploading document:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to upload document",
      });
    }

    // Notify admins about new document upload
    const { data: admins } = await supabase.from("admins").select("id");

    if (admins && admins.length > 0) {
      const notifications = admins.map((admin: any) => ({
        user_id: admin.id,
        type: "verification",
        title: "New Document Uploaded",
        message: `A user has uploaded a ${document_type.replace("_", " ")} for verification`,
        related_id: document.id,
        related_type: "document",
        priority: "normal",
      }));

      await supabase.from("notifications").insert(notifications);
    }

    res.status(201).json({
      success: true,
      data: document,
      message: "Document uploaded successfully",
    });
  } catch (error: any) {
    console.error("Error in POST /documents:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Verify document (admin)
router.put("/:id/verify", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { verified_by } = req.body;

    if (!verified_by) {
      return res.status(400).json({
        success: false,
        error: "verified_by (admin_id) is required",
      });
    }

    // Get document details
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("user_id, document_type")
      .eq("id", id)
      .single();

    if (docError || !document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    // Update document status
    const { data: updatedDocument, error } = await supabase
      .from("documents")
      .update({
        verification_status: "verified",
        verified_by,
        verified_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error verifying document:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to verify document",
      });
    }

    // Notify user
    await supabase.from("notifications").insert([
      {
        user_id: document.user_id,
        type: "verification",
        title: "Document Verified",
        message: `Your ${document.document_type.replace("_", " ")} has been verified`,
        related_id: id,
        related_type: "document",
        priority: "normal",
      },
    ]);

    // Log activity
    await supabase.rpc("log_activity", {
      p_user_id: verified_by,
      p_action: "update",
      p_entity_type: "document",
      p_entity_id: id,
      p_description: "Document verified",
    });

    res.json({
      success: true,
      data: updatedDocument,
      message: "Document verified successfully",
    });
  } catch (error: any) {
    console.error("Error in PUT /documents/:id/verify:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Reject document (admin)
router.put("/:id/reject", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { verified_by, rejection_reason } = req.body;

    if (!verified_by || !rejection_reason) {
      return res.status(400).json({
        success: false,
        error: "verified_by (admin_id) and rejection_reason are required",
      });
    }

    // Get document details
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("user_id, document_type")
      .eq("id", id)
      .single();

    if (docError || !document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    // Update document status
    const { data: updatedDocument, error } = await supabase
      .from("documents")
      .update({
        verification_status: "rejected",
        verified_by,
        verified_at: new Date().toISOString(),
        rejection_reason,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error rejecting document:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to reject document",
      });
    }

    // Notify user
    await supabase.from("notifications").insert([
      {
        user_id: document.user_id,
        type: "verification",
        title: "Document Rejected",
        message: `Your ${document.document_type.replace("_", " ")} was rejected. Reason: ${rejection_reason}`,
        related_id: id,
        related_type: "document",
        priority: "high",
      },
    ]);

    // Log activity
    await supabase.rpc("log_activity", {
      p_user_id: verified_by,
      p_action: "update",
      p_entity_type: "document",
      p_entity_id: id,
      p_description: `Document rejected: ${rejection_reason}`,
    });

    res.json({
      success: true,
      data: updatedDocument,
      message: "Document rejected",
    });
  } catch (error: any) {
    console.error("Error in PUT /documents/:id/reject:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Delete document
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get document details before deletion (for cleanup)
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("file_url")
      .eq("id", id)
      .single();

    if (docError || !document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    // Delete document record
    const { error } = await supabase.from("documents").delete().eq("id", id);

    if (error) {
      console.error("Error deleting document:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to delete document",
      });
    }

    // Note: In a production system, you should also delete the actual file from storage
    // For example, if using Supabase Storage:
    // const filePath = document.file_url.split('/').pop();
    // await supabase.storage.from('documents').remove([filePath]);

    res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error: any) {
    console.error("Error in DELETE /documents/:id:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Get document verification statistics (admin)
router.get("/admin/stats", async (req: Request, res: Response) => {
  try {
    // Get total documents
    const { count: totalDocuments } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true });

    // Get documents by status
    const { data: statusData } = await supabase
      .from("documents")
      .select("verification_status")
      .order("verification_status");

    const statusCounts = statusData?.reduce((acc: any, curr: any) => {
      acc[curr.verification_status] = (acc[curr.verification_status] || 0) + 1;
      return acc;
    }, {});

    // Get documents by type
    const { data: typeData } = await supabase
      .from("documents")
      .select("document_type")
      .order("document_type");

    const typeCounts = typeData?.reduce((acc: any, curr: any) => {
      acc[curr.document_type] = (acc[curr.document_type] || 0) + 1;
      return acc;
    }, {});

    // Get expired documents
    const today = new Date().toISOString().split("T")[0];
    const { count: expiredCount } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .lt("expiry_date", today);

    res.json({
      success: true,
      data: {
        total_documents: totalDocuments || 0,
        by_status: statusCounts || {},
        by_type: typeCounts || {},
        expired_count: expiredCount || 0,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /documents/admin/stats:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

export default router;
