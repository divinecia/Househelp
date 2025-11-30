import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// ============================================================================
// GET ALL CONVERSATIONS FOR A USER
// ============================================================================
router.get("/conversations/:user_id", async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(`
        *,
        participant_1:user_profiles!participant_1_id(id, full_name, role),
        participant_2:user_profiles!participant_2_id(id, full_name, role),
        last_message:messages!last_message_id(id, message_text, created_at)
      `)
      .or(`participant_1_id.eq.${user_id},participant_2_id.eq.${user_id}`)
      .eq("is_active", true)
      .order("last_message_at", { ascending: false })
      .range(
        parseInt(offset as string),
        parseInt(offset as string) + parseInt(limit as string) - 1
      );

    if (error) throw new Error(error.message);

    // Filter out archived conversations
    const filteredConversations = conversations.filter((conv) => {
      if (conv.participant_1_id === user_id) {
        return !conv.is_archived_by_p1;
      } else {
        return !conv.is_archived_by_p2;
      }
    });

    return res.json({ success: true, data: filteredConversations });
  } catch (error: any) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// GET OR CREATE CONVERSATION BETWEEN TWO USERS
// ============================================================================
router.post("/conversations", async (req: Request, res: Response) => {
  try {
    const { participant_1_id, participant_2_id, booking_id } = req.body;

    if (!participant_1_id || !participant_2_id) {
      return res.status(400).json({
        success: false,
        error: "Both participant_1_id and participant_2_id are required",
      });
    }

    if (participant_1_id === participant_2_id) {
      return res.status(400).json({
        success: false,
        error: "Cannot create conversation with yourself",
      });
    }

    // Check if conversation already exists (bidirectional)
    const { data: existingConversation } = await supabase
      .from("conversations")
      .select("*")
      .or(
        `and(participant_1_id.eq.${participant_1_id},participant_2_id.eq.${participant_2_id}),and(participant_1_id.eq.${participant_2_id},participant_2_id.eq.${participant_1_id})`
      )
      .single();

    if (existingConversation) {
      return res.json({ success: true, data: existingConversation });
    }

    // Create new conversation
    const { data: newConversation, error } = await supabase
      .from("conversations")
      .insert([
        {
          participant_1_id,
          participant_2_id,
          booking_id,
        },
      ])
      .select(`
        *,
        participant_1:user_profiles!participant_1_id(id, full_name, role),
        participant_2:user_profiles!participant_2_id(id, full_name, role)
      `)
      .single();

    if (error) throw new Error(error.message);

    return res.status(201).json({ success: true, data: newConversation });
  } catch (error: any) {
    console.error("Error creating conversation:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// GET MESSAGES IN A CONVERSATION
// ============================================================================
router.get("/conversations/:conversation_id/messages", async (req: Request, res: Response) => {
  try {
    const { conversation_id } = req.params;
    const { limit = 50, offset = 0, user_id } = req.query;

    const { data: messages, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:user_profiles!sender_id(id, full_name, role),
        recipient:user_profiles!recipient_id(id, full_name, role)
      `)
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: false })
      .range(
        parseInt(offset as string),
        parseInt(offset as string) + parseInt(limit as string) - 1
      );

    if (error) throw new Error(error.message);

    // Filter out deleted messages for this user
    const filteredMessages = messages.filter((msg) => {
      if (user_id) {
        if (msg.sender_id === user_id && msg.is_deleted_by_sender) return false;
        if (msg.recipient_id === user_id && msg.is_deleted_by_recipient) return false;
      }
      return true;
    });

    // Mark messages as read if user_id is provided
    if (user_id) {
      const unreadMessageIds = filteredMessages
        .filter((msg) => msg.recipient_id === user_id && !msg.is_read)
        .map((msg) => msg.id);

      if (unreadMessageIds.length > 0) {
        await supabase
          .from("messages")
          .update({ is_read: true, read_at: new Date().toISOString() })
          .in("id", unreadMessageIds);
      }
    }

    return res.json({ success: true, data: filteredMessages.reverse() });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// SEND MESSAGE
// ============================================================================
router.post("/", async (req: Request, res: Response) => {
  try {
    const { conversation_id, sender_id, recipient_id, message_text, message_type, attachment_url, booking_id } = req.body;

    if (!sender_id || !recipient_id || !message_text) {
      return res.status(400).json({
        success: false,
        error: "sender_id, recipient_id, and message_text are required",
      });
    }

    // Verify or create conversation
    let convId = conversation_id;
    if (!convId) {
      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(participant_1_id.eq.${sender_id},participant_2_id.eq.${recipient_id}),and(participant_1_id.eq.${recipient_id},participant_2_id.eq.${sender_id})`
        )
        .single();

      if (conversation) {
        convId = conversation.id;
      } else {
        const { data: newConv, error: newConvError } = await supabase
          .from("conversations")
          .insert([{ participant_1_id: sender_id, participant_2_id: recipient_id, booking_id }])
          .select("id")
          .single();

        if (newConvError) throw new Error(newConvError.message);
        convId = newConv.id;
      }
    }

    // Insert message
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert([
        {
          conversation_id: convId,
          sender_id,
          recipient_id,
          message_text,
          message_type: message_type || "text",
          attachment_url,
          booking_id,
        },
      ])
      .select(`
        *,
        sender:user_profiles!sender_id(id, full_name, role),
        recipient:user_profiles!recipient_id(id, full_name, role)
      `)
      .single();

    if (messageError) throw new Error(messageError.message);

    // Update conversation's last message
    await supabase
      .from("conversations")
      .update({
        last_message_id: message.id,
        last_message_at: message.created_at,
      })
      .eq("id", convId);

    // Create notification for recipient
    await supabase.from("notifications").insert([
      {
        user_id: recipient_id,
        type: "message",
        title: "New Message",
        message: `You have a new message from ${message.sender.full_name}`,
        related_id: convId,
        related_type: "message",
        priority: "normal",
      },
    ]);

    return res.status(201).json({ success: true, data: message });
  } catch (error: any) {
    console.error("Error sending message:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// MARK MESSAGE AS READ
// ============================================================================
router.put("/:id/read", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: message, error } = await supabase
      .from("messages")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return res.json({ success: true, data: message });
  } catch (error: any) {
    console.error("Error marking message as read:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// DELETE MESSAGE (soft delete)
// ============================================================================
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ success: false, error: "user_id is required" });
    }

    // Get message
    const { data: message, error: fetchError } = await supabase
      .from("messages")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw new Error(fetchError.message);
    if (!message) {
      return res.status(404).json({ success: false, error: "Message not found" });
    }

    // Determine which delete flag to set
    const updateData: any = {};
    if (message.sender_id === user_id) {
      updateData.is_deleted_by_sender = true;
    } else if (message.recipient_id === user_id) {
      updateData.is_deleted_by_recipient = true;
    } else {
      return res.status(403).json({
        success: false,
        error: "You can only delete your own messages",
      });
    }

    // Update message
    const { error: updateError } = await supabase
      .from("messages")
      .update(updateData)
      .eq("id", id);

    if (updateError) throw new Error(updateError.message);

    return res.json({ success: true, message: "Message deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting message:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// ARCHIVE CONVERSATION
// ============================================================================
router.put("/conversations/:id/archive", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ success: false, error: "user_id is required" });
    }

    // Get conversation
    const { data: conversation, error: fetchError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw new Error(fetchError.message);
    if (!conversation) {
      return res.status(404).json({ success: false, error: "Conversation not found" });
    }

    // Determine which archive flag to set
    const updateData: any = {};
    if (conversation.participant_1_id === user_id) {
      updateData.is_archived_by_p1 = true;
    } else if (conversation.participant_2_id === user_id) {
      updateData.is_archived_by_p2 = true;
    } else {
      return res.status(403).json({
        success: false,
        error: "You are not a participant in this conversation",
      });
    }

    // Update conversation
    const { error: updateError } = await supabase
      .from("conversations")
      .update(updateData)
      .eq("id", id);

    if (updateError) throw new Error(updateError.message);

    return res.json({ success: true, message: "Conversation archived successfully" });
  } catch (error: any) {
    console.error("Error archiving conversation:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// GET UNREAD MESSAGE COUNT
// ============================================================================
router.get("/unread-count/:user_id", async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    const { data: messages, error } = await supabase
      .from("messages")
      .select("id")
      .eq("recipient_id", user_id)
      .eq("is_read", false)
      .eq("is_deleted_by_recipient", false);

    if (error) throw new Error(error.message);

    return res.json({ success: true, count: messages.length });
  } catch (error: any) {
    console.error("Error fetching unread count:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
