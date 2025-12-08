import { supabase } from "./supabase";
import type { Database } from "../../shared/types";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export const createNotification = async (
  userId: string,
  type: Notification["type"],
  title: string,
  message: string,
  data?: Record<string, unknown>,
): Promise<Notification> => {
  try {
    const insertData = {
      user_id: userId,
      type,
      title,
      message,
      data: (data || {}) as Database["public"]["Tables"]["notifications"]["Insert"]["data"],
      read: false,
    };

    const { data: notification, error } = await supabase
      .from("notifications")
      .insert([insertData as never])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return notification as Notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

export const getNotifications = async (
  userId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<Notification[]> => {
  try {
    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(error.message);
    }

    return (notifications as Notification[]) || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const getUnreadNotificationCount = async (
  userId: string,
): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      throw new Error(error.message);
    }

    return count || 0;
  } catch (error) {
    console.error("Error counting unread notifications:", error);
    return 0;
  }
};

export const markNotificationAsRead = async (
  notificationId: string,
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true } as never)
      .eq("id", notificationId);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (
  userId: string,
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true } as never)
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

export const deleteNotification = async (
  notificationId: string,
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

export const subscribeToNotifications = (
  userId: string,
  callback: (notification: Notification) => void,
) => {
  const subscription = supabase
    .channel(`user-notifications:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload: { new: unknown }) => {
        if (payload.new) {
          callback(payload.new as Notification);
        }
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};

export const sendNotificationToUser = async (
  userId: string,
  type: Notification["type"],
  title: string,
  message: string,
  data?: Record<string, unknown>,
): Promise<Notification> => {
  return createNotification(userId, type, title, message, data);
};

export const broadcastPaymentNotification = async (
  userId: string,
  amount: number,
  currency: string,
  status: "success" | "failed" | "pending",
  transactionRef: string,
): Promise<Notification> => {
  const messages = {
    success: `Payment of ${amount} ${currency} completed successfully`,
    failed: `Payment of ${amount} ${currency} failed. Please try again.`,
    pending: `Payment of ${amount} ${currency} is pending verification`,
  };

  return createNotification(
    userId,
    "info",
    `Payment ${status}`,
    messages[status],
    {
      amount,
      currency,
      status,
      transactionRef,
    } as Record<string, unknown>,
  );
};