import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// Get bookings scoped by role
router.get("/", async (req: Request, res: Response) => {
  try {
    const profile = (req as unknown as { userProfile: { role: string; user_id: string } }).userProfile;
    const role = profile?.role;

    if (role === "admin") {
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("*");
      if (error) throw new Error(error.message);
      return res.json({ success: true, data: bookings || [] });
    }

    // Resolve actor ids
    if (role === "homeowner") {
      const { data: homeowner } = await supabase
        .from("homeowners")
        .select("id")
        .eq("user_id", profile.user_id)
        .single() as { data: { id: string } | null; error: unknown };
      if (!homeowner) return res.json({ success: true, data: [] });

      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("homeowner_id", homeowner.id);
      if (error) throw new Error(error.message);
      return res.json({ success: true, data: bookings || [] });
    }

    if (role === "worker") {
      const { data: worker } = await supabase
        .from("workers")
        .select("id")
        .eq("user_id", profile.user_id)
        .single() as { data: { id: string } | null; error: unknown };
      if (!worker) return res.json({ success: true, data: [] });

      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("worker_id", worker.id);
      if (error) throw new Error(error.message);
      return res.json({ success: true, data: bookings || [] });
    }

    return res.status(403).json({ success: false, error: "Forbidden" });
  } catch (error) {
    console.error("Get bookings error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get bookings",
    });
  }
});

// Get booking by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = (req as unknown as { userProfile: Record<string, unknown> }).userProfile;
    const role = profile?.role;

    const { data: booking, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    if (role === "homeowner" || role === "worker") {
      // Fetch actor ids for ownership check
      const table = role === "homeowner" ? "homeowners" : "workers";
      const { data: actor } = await supabase
        .from(table)
        .select("id")
        .eq("user_id", (profile as { user_id: string }).user_id)
        .single() as { data: { id: string } | null; error: unknown };

      if (!actor) {
        return res.status(403).json({ success: false, error: "Forbidden" });
      }

      const expectedId =
        role === "homeowner"
          ? (booking as Record<string, unknown>).homeowner_id
          : (booking as Record<string, unknown>).worker_id;
      if (expectedId !== actor.id) {
        return res.status(403).json({ success: false, error: "Forbidden" });
      }
    }

    return res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get booking",
    });
  }
});

// Create booking
router.post("/", async (req: Request, res: Response) => {
  try {
    const bookingData = req.body;
    const profile = (req as unknown as { userProfile: Record<string, unknown> }).userProfile;
    const role = profile?.role;

    if (role === "worker") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    let homeownerId = bookingData.homeowner_id;
    const workerId = bookingData.worker_id;

    if (role === "homeowner") {
      const { data: homeowner } = await supabase
        .from("homeowners")
        .select("id")
        .eq("user_id", (profile as { user_id: string }).user_id)
        .single() as { data: { id: string } | null; error: unknown };
      if (!homeowner)
        return res
          .status(400)
          .json({ success: false, error: "Homeowner profile missing" });
      homeownerId = homeowner.id;
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        ...bookingData,
        homeowner_id: homeownerId,
        worker_id: workerId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return res.json({
      success: true,
      data: booking,
      message: "Booking created successfully",
    });
  } catch (error) {
    console.error("Create booking error:", error);
    return res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create booking",
    });
  }
});

// Update booking
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const profile = (req as unknown as { userProfile: Record<string, unknown> }).userProfile;
    const role = profile?.role;

    const { data: booking } = await supabase
      .from("bookings")
      .select("homeowner_id, worker_id")
      .eq("id", id)
      .single();

    if (!booking)
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });

    if (role === "homeowner" || role === "worker") {
      const table = role === "homeowner" ? "homeowners" : "workers";
      const { data: actor } = await supabase
        .from(table)
        .select("id")
        .eq("user_id", (profile as { user_id: string }).user_id)
        .single() as { data: { id: string } | null; error: unknown };

      if (!actor)
        return res.status(403).json({ success: false, error: "Forbidden" });

      const expectedId =
        role === "homeowner"
          ? (booking as Record<string, unknown>).homeowner_id
          : (booking as Record<string, unknown>).worker_id;
      if (expectedId !== actor.id) {
        return res.status(403).json({ success: false, error: "Forbidden" });
      }
    }

    const { data: updated, error } = await supabase
      .from("bookings")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return res.json({
      success: true,
      data: updated,
      message: "Booking updated successfully",
    });
  } catch (error) {
    console.error("Update booking error:", error);
    return res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update booking",
    });
  }
});

// Delete booking
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = (req as unknown as { userProfile: Record<string, unknown> }).userProfile;
    const role = profile?.role;

    const { data: booking } = await supabase
      .from("bookings")
      .select("homeowner_id, worker_id")
      .eq("id", id)
      .single();

    if (!booking)
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });

    if (role === "homeowner" || role === "worker") {
      const table = role === "homeowner" ? "homeowners" : "workers";
      const { data: actor } = await supabase
        .from(table)
        .select("id")
        .eq("user_id", (profile as { user_id: string }).user_id)
        .single() as { data: { id: string } | null; error: unknown };
      if (!actor)
        return res.status(403).json({ success: false, error: "Forbidden" });
      const expectedId =
        role === "homeowner" ? (booking as Record<string, unknown>).homeowner_id : (booking as Record<string, unknown>).worker_id;
      if (expectedId !== actor.id) {
        return res.status(403).json({ success: false, error: "Forbidden" });
      }
    } else if (role !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const { error } = await supabase.from("bookings").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return res.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Delete booking error:", error);
    return res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete booking",
    });
  }
});

export default router;
