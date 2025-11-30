import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";
import { verifyToken, requireRole } from "../middleware/auth";

const router = Router();

// ============================================================================
// GET ALL REVIEWS - With filtering
// ============================================================================
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      reviewee_id,
      reviewer_id,
      booking_id,
      moderation_status,
      rating_min,
      rating_max,
      limit = 50,
      offset = 0,
    } = req.query;

    let query = supabase
      .from("reviews")
      .select(`
        *,
        reviewer:user_profiles!reviewer_id(id, full_name, role),
        reviewee:user_profiles!reviewee_id(id, full_name, role),
        booking:bookings(id, booking_date, service:services(name))
      `);

    if (reviewee_id) query = query.eq("reviewee_id", reviewee_id);
    if (reviewer_id) query = query.eq("reviewer_id", reviewer_id);
    if (booking_id) query = query.eq("booking_id", booking_id);
    if (moderation_status) query = query.eq("moderation_status", moderation_status);
    if (rating_min) query = query.gte("rating", parseInt(rating_min as string));
    if (rating_max) query = query.lte("rating", parseInt(rating_max as string));

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(
        parseInt(offset as string),
        parseInt(offset as string) + parseInt(limit as string) - 1
      );

    if (error) throw new Error(error.message);

    return res.json({ success: true, data, total: count });
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// GET SINGLE REVIEW
// ============================================================================
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        reviewer:user_profiles!reviewer_id(id, full_name, role),
        reviewee:user_profiles!reviewee_id(id, full_name, role),
        booking:bookings(id, booking_date, service:services(name)),
        moderator:admins(id, full_name)
      `)
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    if (!data) return res.status(404).json({ success: false, error: "Review not found" });

    return res.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching review:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// CREATE REVIEW
// ============================================================================
router.post("/", async (req: Request, res: Response) => {
  try {
    const reviewData = req.body;

    // Validate required fields
    if (!reviewData.booking_id || !reviewData.reviewer_id || !reviewData.reviewee_id || !reviewData.rating) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: booking_id, reviewer_id, reviewee_id, rating",
      });
    }

    // Validate rating
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      return res.status(400).json({
        success: false,
        error: "Rating must be between 1 and 5",
      });
    }

    // Check if booking exists and is completed
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", reviewData.booking_id)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        error: "Can only review completed bookings",
      });
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("booking_id", reviewData.booking_id)
      .eq("reviewer_id", reviewData.reviewer_id)
      .single();

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: "You have already reviewed this booking",
      });
    }

    // Determine reviewer and reviewee roles
    if (booking.homeowner_id === reviewData.reviewer_id) {
      reviewData.reviewer_role = "homeowner";
      reviewData.reviewee_role = "worker";
      if (booking.worker_id !== reviewData.reviewee_id) {
        return res.status(400).json({
          success: false,
          error: "Reviewee must be the worker assigned to this booking",
        });
      }
    } else if (booking.worker_id === reviewData.reviewer_id) {
      reviewData.reviewer_role = "worker";
      reviewData.reviewee_role = "homeowner";
      if (booking.homeowner_id !== reviewData.reviewee_id) {
        return res.status(400).json({
          success: false,
          error: "Reviewee must be the homeowner of this booking",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to review this booking",
      });
    }

    // Set moderation status (auto-approve for now, can add moderation rules)
    reviewData.moderation_status = "approved";
    reviewData.is_verified = true;

    // Insert review
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .insert([reviewData])
      .select(`
        *,
        reviewer:user_profiles!reviewer_id(id, full_name),
        reviewee:user_profiles!reviewee_id(id, full_name)
      `)
      .single();

    if (reviewError) throw new Error(reviewError.message);

    // Send notification to reviewee
    await supabase.from("notifications").insert([
      {
        user_id: reviewData.reviewee_id,
        type: "review",
        title: "New Review Received",
        message: `You have received a new ${reviewData.rating}-star review`,
        related_id: review.id,
        related_type: "review",
        priority: "normal",
      },
    ]);

    return res.status(201).json({ success: true, data: review });
  } catch (error: any) {
    console.error("Error creating review:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// UPDATE REVIEW (only by reviewer before moderation)
// ============================================================================
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Get existing review
    const { data: existingReview, error: fetchError } = await supabase
      .from("reviews")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw new Error(fetchError.message);
    if (!existingReview) {
      return res.status(404).json({ success: false, error: "Review not found" });
    }

    // Only allow reviewer to update their own review
    if (updates.reviewer_id && updates.reviewer_id !== existingReview.reviewer_id) {
      return res.status(403).json({
        success: false,
        error: "You can only update your own reviews",
      });
    }

    // Validate rating if being updated
    if (updates.rating && (updates.rating < 1 || updates.rating > 5)) {
      return res.status(400).json({
        success: false,
        error: "Rating must be between 1 and 5",
      });
    }

    // Update review
    const { data: updatedReview, error: updateError } = await supabase
      .from("reviews")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);

    return res.json({ success: true, data: updatedReview });
  } catch (error: any) {
    console.error("Error updating review:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// ADD RESPONSE TO REVIEW (by reviewee)
// ============================================================================
router.put("/:id/respond", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { response_text, reviewee_id } = req.body;

    if (!response_text) {
      return res.status(400).json({ success: false, error: "response_text is required" });
    }

    // Get review
    const { data: review, error: fetchError } = await supabase
      .from("reviews")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw new Error(fetchError.message);
    if (!review) {
      return res.status(404).json({ success: false, error: "Review not found" });
    }

    // Verify the person responding is the reviewee
    if (review.reviewee_id !== reviewee_id) {
      return res.status(403).json({
        success: false,
        error: "Only the reviewee can respond to this review",
      });
    }

    // Update review with response
    const { data: updatedReview, error: updateError } = await supabase
      .from("reviews")
      .update({
        response_text,
        responded_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);

    // Notify reviewer about the response
    await supabase.from("notifications").insert([
      {
        user_id: review.reviewer_id,
        type: "review",
        title: "Response to Your Review",
        message: "The person you reviewed has responded to your review",
        related_id: id,
        related_type: "review",
        priority: "normal",
      },
    ]);

    return res.json({ success: true, data: updatedReview });
  } catch (error: any) {
    console.error("Error responding to review:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// FLAG REVIEW (for moderation)
// ============================================================================
router.put("/:id/flag", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { data: review, error } = await supabase
      .from("reviews")
      .update({
        is_flagged: true,
        moderation_status: "flagged",
        moderation_notes: reason || "Flagged by user",
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return res.json({
      success: true,
      data: review,
      message: "Review flagged for moderation",
    });
  } catch (error: any) {
    console.error("Error flagging review:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// MODERATE REVIEW (admin only)
// ============================================================================
router.put("/:id/moderate", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { moderation_status, moderation_notes, moderated_by } = req.body;

    if (!moderation_status) {
      return res.status(400).json({ success: false, error: "moderation_status is required" });
    }

    const validStatuses = ["pending", "approved", "rejected", "flagged"];
    if (!validStatuses.includes(moderation_status)) {
      return res.status(400).json({
        success: false,
        error: `moderation_status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const { data: review, error } = await supabase
      .from("reviews")
      .update({
        moderation_status,
        moderation_notes,
        moderated_by,
        moderated_at: new Date().toISOString(),
        is_verified: moderation_status === "approved",
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Notify reviewer about moderation decision
    const { data: reviewData } = await supabase
      .from("reviews")
      .select("reviewer_id")
      .eq("id", id)
      .single();

    if (reviewData) {
      await supabase.from("notifications").insert([
        {
          user_id: reviewData.reviewer_id,
          type: "review",
          title: "Review Moderation Update",
          message: `Your review has been ${moderation_status}`,
          related_id: id,
          related_type: "review",
          priority: "normal",
        },
      ]);
    }

    return res.json({
      success: true,
      data: review,
      message: `Review ${moderation_status} successfully`,
    });
  } catch (error: any) {
    console.error("Error moderating review:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// DELETE REVIEW
// ============================================================================
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("reviews").delete().eq("id", id);

    if (error) throw new Error(error.message);

    return res.json({ success: true, message: "Review deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting review:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// GET WORKER AVERAGE RATING AND REVIEW STATS
// ============================================================================
router.get("/stats/worker/:worker_id", async (req: Request, res: Response) => {
  try {
    const { worker_id } = req.params;

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("rating, punctuality_rating, quality_rating, communication_rating, professionalism_rating")
      .eq("reviewee_id", worker_id)
      .eq("reviewee_role", "worker")
      .eq("moderation_status", "approved");

    if (error) throw new Error(error.message);

    const stats = {
      total_reviews: reviews.length,
      average_rating: 0,
      average_punctuality: 0,
      average_quality: 0,
      average_communication: 0,
      average_professionalism: 0,
      rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };

    if (reviews.length > 0) {
      let sumRating = 0;
      let sumPunctuality = 0;
      let sumQuality = 0;
      let sumCommunication = 0;
      let sumProfessionalism = 0;
      let countPunctuality = 0;
      let countQuality = 0;
      let countCommunication = 0;
      let countProfessionalism = 0;

      reviews.forEach((review) => {
        sumRating += review.rating;
        stats.rating_distribution[review.rating as keyof typeof stats.rating_distribution]++;

        if (review.punctuality_rating) {
          sumPunctuality += review.punctuality_rating;
          countPunctuality++;
        }
        if (review.quality_rating) {
          sumQuality += review.quality_rating;
          countQuality++;
        }
        if (review.communication_rating) {
          sumCommunication += review.communication_rating;
          countCommunication++;
        }
        if (review.professionalism_rating) {
          sumProfessionalism += review.professionalism_rating;
          countProfessionalism++;
        }
      });

      stats.average_rating = parseFloat((sumRating / reviews.length).toFixed(2));
      stats.average_punctuality = countPunctuality > 0 ? parseFloat((sumPunctuality / countPunctuality).toFixed(2)) : 0;
      stats.average_quality = countQuality > 0 ? parseFloat((sumQuality / countQuality).toFixed(2)) : 0;
      stats.average_communication = countCommunication > 0 ? parseFloat((sumCommunication / countCommunication).toFixed(2)) : 0;
      stats.average_professionalism = countProfessionalism > 0 ? parseFloat((sumProfessionalism / countProfessionalism).toFixed(2)) : 0;
    }

    return res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error("Error fetching worker review stats:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// GET HOMEOWNER AVERAGE RATING
// ============================================================================
router.get("/stats/homeowner/:homeowner_id", async (req: Request, res: Response) => {
  try {
    const { homeowner_id } = req.params;

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("rating")
      .eq("reviewee_id", homeowner_id)
      .eq("reviewee_role", "homeowner")
      .eq("moderation_status", "approved");

    if (error) throw new Error(error.message);

    const stats = {
      total_reviews: reviews.length,
      average_rating: 0,
      rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };

    if (reviews.length > 0) {
      let sumRating = 0;

      reviews.forEach((review) => {
        sumRating += review.rating;
        stats.rating_distribution[review.rating as keyof typeof stats.rating_distribution]++;
      });

      stats.average_rating = parseFloat((sumRating / reviews.length).toFixed(2));
    }

    return res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error("Error fetching homeowner review stats:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
