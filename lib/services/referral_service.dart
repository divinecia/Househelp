import 'package:flutter/material.dart';
import '../models/referral_model.dart';
import '../models/user_model.dart';
import 'supabase_service.dart';
import 'notification_service.dart';
import 'payment_service.dart';

class ReferralService {
  static final _client = SupabaseService.client;

  // Generate referral code
  static Future<String> generateReferralCode(String userId) async {
    try {
      final code = _generateCode();
      
      await _client.from('referral_codes').insert({
        'id': 'ref_${DateTime.now().millisecondsSinceEpoch}',
        'user_id': userId,
        'code': code,
        'created_at': DateTime.now().toIso8601String(),
        'is_active': true,
      });

      return code;
    } catch (e) {
      throw Exception('Failed to generate referral code: ${e.toString()}');
    }
  }

  // Get user's referral code
  static Future<String?> getUserReferralCode(String userId) async {
    try {
      final response = await _client
          .from('referral_codes')
          .select('code')
          .eq('user_id', userId)
          .eq('is_active', true)
          .single();

      return response['code'];
    } catch (e) {
      // If no code exists, generate one
      return await generateReferralCode(userId);
    }
  }

  // Apply referral code
  static Future<bool> applyReferralCode(String userId, String code) async {
    try {
      // Check if code exists and is valid
      final referralCode = await _client
          .from('referral_codes')
          .select('user_id')
          .eq('code', code)
          .eq('is_active', true)
          .single();

      final referrerId = referralCode['user_id'];
      
      // Check if user is trying to refer themselves
      if (referrerId == userId) {
        return false;
      }

      // Check if user has already been referred
      final existingReferral = await _client
          .from('referrals')
          .select('id')
          .eq('referred_user_id', userId)
          .limit(1);

      if (existingReferral.isNotEmpty) {
        return false;
      }

      // Create referral record
      final referralId = 'referral_${DateTime.now().millisecondsSinceEpoch}';
      await _client.from('referrals').insert({
        'id': referralId,
        'referrer_id': referrerId,
        'referred_user_id': userId,
        'referral_code': code,
        'status': ReferralStatus.pending.name,
        'created_at': DateTime.now().toIso8601String(),
      });

      // Send notification to referrer
      await NotificationService.sendNotification(
        userId: referrerId,
        title: 'New Referral',
        message: 'Someone used your referral code!',
        type: 'referral',
        data: {
          'referral_id': referralId,
          'referred_user_id': userId,
        },
      );

      return true;
    } catch (e) {
      return false;
    }
  }

  // Complete referral (when referred user meets criteria)
  static Future<void> completeReferral(String referralId) async {
    try {
      // Get referral details
      final referral = await _client
          .from('referrals')
          .select()
          .eq('id', referralId)
          .single();

      if (referral['status'] != ReferralStatus.pending.name) {
        return;
      }

      // Update referral status
      await _client
          .from('referrals')
          .update({
            'status': ReferralStatus.completed.name,
            'completed_at': DateTime.now().toIso8601String(),
          })
          .eq('id', referralId);

      // Award points to both users
      await _awardReferralRewards(referral['referrer_id'], referral['referred_user_id']);

      // Send completion notifications
      await NotificationService.sendNotification(
        userId: referral['referrer_id'],
        title: 'Referral Completed',
        message: 'Your referral has been completed! Rewards have been credited.',
        type: 'referral_completed',
        data: {
          'referral_id': referralId,
        },
      );

      await NotificationService.sendNotification(
        userId: referral['referred_user_id'],
        title: 'Welcome Bonus',
        message: 'Welcome bonus points have been credited to your account!',
        type: 'welcome_bonus',
        data: {
          'referral_id': referralId,
        },
      );
    } catch (e) {
      debugPrint('Failed to complete referral: $e');
    }
  }

  // Award referral rewards
  static Future<void> _awardReferralRewards(String referrerId, String referredUserId) async {
    try {
      // Award points to referrer
      await addLoyaltyPoints(
        userId: referrerId,
        points: 500,
        description: 'Referral bonus',
        type: 'referral_bonus',
      );

      // Award welcome bonus to referred user
      await addLoyaltyPoints(
        userId: referredUserId,
        points: 200,
        description: 'Welcome bonus',
        type: 'welcome_bonus',
      );
    } catch (e) {
      debugPrint('Failed to award referral rewards: $e');
    }
  }

  // Get user's referrals
  static Future<List<Referral>> getUserReferrals(String userId) async {
    try {
      final response = await _client
          .from('referrals')
          .select()
          .eq('referrer_id', userId)
          .order('created_at', ascending: false);

      return response.map<Referral>((json) => Referral.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to get user referrals: ${e.toString()}');
    }
  }

  // Get referral statistics
  static Future<Map<String, dynamic>> getReferralStatistics(String userId) async {
    try {
      final referrals = await _client
          .from('referrals')
          .select()
          .eq('referrer_id', userId);

      final stats = {
        'total_referrals': referrals.length,
        'completed_referrals': referrals.where((r) => r['status'] == ReferralStatus.completed.name).length,
        'pending_referrals': referrals.where((r) => r['status'] == ReferralStatus.pending.name).length,
        'total_earnings': 0.0,
        'by_month': <String, int>{},
      };

      // Calculate earnings from completed referrals
      stats['total_earnings'] = (stats['completed_referrals'] as int) * 500.0;

      // Group by month
      for (final referral in referrals) {
        final date = DateTime.parse(referral['created_at']);
        final month = '${date.year}-${date.month.toString().padLeft(2, '0')}';
        stats['by_month'][month] = (stats['by_month'][month] ?? 0) + 1;
      }

      return stats;
    } catch (e) {
      throw Exception('Failed to get referral statistics: ${e.toString()}');
    }
  }

  // Add loyalty points
  static Future<void> addLoyaltyPoints({
    required String userId,
    required int points,
    required String description,
    required String type,
    String? referenceId,
  }) async {
    try {
      final transactionId = 'loyalty_${DateTime.now().millisecondsSinceEpoch}';
      
      // Create loyalty transaction
      await _client.from('loyalty_transactions').insert({
        'id': transactionId,
        'user_id': userId,
        'points': points,
        'description': description,
        'type': type,
        'reference_id': referenceId,
        'created_at': DateTime.now().toIso8601String(),
      });

      // Update user's total points
      await _updateUserLoyaltyPoints(userId);
    } catch (e) {
      throw Exception('Failed to add loyalty points: ${e.toString()}');
    }
  }

  // Deduct loyalty points
  static Future<bool> deductLoyaltyPoints({
    required String userId,
    required int points,
    required String description,
    required String type,
    String? referenceId,
  }) async {
    try {
      // Check if user has enough points
      final userPoints = await getUserLoyaltyPoints(userId);
      if (userPoints < points) {
        return false;
      }

      final transactionId = 'loyalty_${DateTime.now().millisecondsSinceEpoch}';
      
      // Create loyalty transaction with negative points
      await _client.from('loyalty_transactions').insert({
        'id': transactionId,
        'user_id': userId,
        'points': -points,
        'description': description,
        'type': type,
        'reference_id': referenceId,
        'created_at': DateTime.now().toIso8601String(),
      });

      // Update user's total points
      await _updateUserLoyaltyPoints(userId);

      return true;
    } catch (e) {
      throw Exception('Failed to deduct loyalty points: ${e.toString()}');
    }
  }

  // Get user's loyalty points
  static Future<int> getUserLoyaltyPoints(String userId) async {
    try {
      final response = await _client
          .from('loyalty_points')
          .select('total_points')
          .eq('user_id', userId)
          .single();

      return response['total_points'] ?? 0;
    } catch (e) {
      return 0;
    }
  }

  // Update user's total loyalty points
  static Future<void> _updateUserLoyaltyPoints(String userId) async {
    try {
      final transactions = await _client
          .from('loyalty_transactions')
          .select('points')
          .eq('user_id', userId);

      final totalPoints = transactions.fold<int>(0, (sum, transaction) => sum + transaction['points']);

      await _client
          .from('loyalty_points')
          .upsert({
            'user_id': userId,
            'total_points': totalPoints,
            'updated_at': DateTime.now().toIso8601String(),
          });
    } catch (e) {
      debugPrint('Failed to update user loyalty points: $e');
    }
  }

  // Get loyalty transactions
  static Future<List<LoyaltyTransaction>> getLoyaltyTransactions(String userId) async {
    try {
      final response = await _client
          .from('loyalty_transactions')
          .select()
          .eq('user_id', userId)
          .order('created_at', ascending: false);

      return response.map<LoyaltyTransaction>((json) => LoyaltyTransaction.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to get loyalty transactions: ${e.toString()}');
    }
  }

  // Get available rewards
  static Future<List<LoyaltyReward>> getAvailableRewards() async {
    try {
      final response = await _client
          .from('loyalty_rewards')
          .select()
          .eq('is_active', true)
          .order('points_required', ascending: true);

      return response.map<LoyaltyReward>((json) => LoyaltyReward.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to get available rewards: ${e.toString()}');
    }
  }

  // Redeem reward
  static Future<bool> redeemReward(String userId, String rewardId) async {
    try {
      // Get reward details
      final reward = await _client
          .from('loyalty_rewards')
          .select()
          .eq('id', rewardId)
          .single();

      if (!reward['is_active']) {
        return false;
      }

      final pointsRequired = reward['points_required'] as int;
      final userPoints = await getUserLoyaltyPoints(userId);

      if (userPoints < pointsRequired) {
        return false;
      }

      // Deduct points
      final deducted = await deductLoyaltyPoints(
        userId: userId,
        points: pointsRequired,
        description: 'Redeemed: ${reward['title']}',
        type: 'reward_redemption',
        referenceId: rewardId,
      );

      if (!deducted) {
        return false;
      }

      // Create redemption record
      final redemptionId = 'redemption_${DateTime.now().millisecondsSinceEpoch}';
      await _client.from('reward_redemptions').insert({
        'id': redemptionId,
        'user_id': userId,
        'reward_id': rewardId,
        'points_spent': pointsRequired,
        'status': RedemptionStatus.pending.name,
        'created_at': DateTime.now().toIso8601String(),
      });

      // Send notification
      await NotificationService.sendNotification(
        userId: userId,
        title: 'Reward Redeemed',
        message: 'You have successfully redeemed ${reward['title']}!',
        type: 'reward_redeemed',
        data: {
          'reward_id': rewardId,
          'redemption_id': redemptionId,
        },
      );

      return true;
    } catch (e) {
      return false;
    }
  }

  // Get user's redemptions
  static Future<List<RewardRedemption>> getUserRedemptions(String userId) async {
    try {
      final response = await _client
          .from('reward_redemptions')
          .select()
          .eq('user_id', userId)
          .order('created_at', ascending: false);

      return response.map<RewardRedemption>((json) => RewardRedemption.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to get user redemptions: ${e.toString()}');
    }
  }

  // Award job completion points
  static Future<void> awardJobCompletionPoints(String userId, double jobAmount) async {
    try {
      // Award 1 point per RWF spent
      final points = jobAmount.round();
      
      await addLoyaltyPoints(
        userId: userId,
        points: points,
        description: 'Job completion bonus',
        type: 'job_completion',
      );
    } catch (e) {
      debugPrint('Failed to award job completion points: $e');
    }
  }

  // Award rating points
  static Future<void> awardRatingPoints(String userId, double rating) async {
    try {
      // Award points based on rating (5 stars = 50 points)
      final points = (rating * 10).round();
      
      await addLoyaltyPoints(
        userId: userId,
        points: points,
        description: 'Rating bonus',
        type: 'rating_bonus',
      );
    } catch (e) {
      debugPrint('Failed to award rating points: $e');
    }
  }

  // Get loyalty tiers
  static Future<List<LoyaltyTier>> getLoyaltyTiers() async {
    try {
      final response = await _client
          .from('loyalty_tiers')
          .select()
          .order('points_required', ascending: true);

      return response.map<LoyaltyTier>((json) => LoyaltyTier.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to get loyalty tiers: ${e.toString()}');
    }
  }

  // Get user's current tier
  static Future<LoyaltyTier?> getUserTier(String userId) async {
    try {
      final userPoints = await getUserLoyaltyPoints(userId);
      
      final tiers = await getLoyaltyTiers();
      
      LoyaltyTier? currentTier;
      for (final tier in tiers) {
        if (userPoints >= tier.pointsRequired) {
          currentTier = tier;
        } else {
          break;
        }
      }

      return currentTier;
    } catch (e) {
      return null;
    }
  }

  // Get leaderboard
  static Future<List<Map<String, dynamic>>> getLeaderboard({
    int limit = 10,
    String period = 'all_time',
  }) async {
    try {
      var query = _client
          .from('loyalty_points')
          .select('''
            *,
            users(first_name, last_name, profile_photo)
          ''')
          .order('total_points', ascending: false)
          .limit(limit);

      final response = await query;
      return response;
    } catch (e) {
      throw Exception('Failed to get leaderboard: ${e.toString()}');
    }
  }

  // Generate random referral code
  static String _generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    final random = DateTime.now().millisecondsSinceEpoch;
    
    String code = '';
    for (int i = 0; i < 8; i++) {
      code += chars[(random + i) % chars.length];
    }
    
    return code;
  }

  // Create special promotion
  static Future<void> createPromotion({
    required String title,
    required String description,
    required String type,
    required int pointsMultiplier,
    required DateTime startDate,
    required DateTime endDate,
    String? targetUserType,
    Map<String, dynamic>? conditions,
  }) async {
    try {
      await _client.from('promotions').insert({
        'id': 'promo_${DateTime.now().millisecondsSinceEpoch}',
        'title': title,
        'description': description,
        'type': type,
        'points_multiplier': pointsMultiplier,
        'start_date': startDate.toIso8601String(),
        'end_date': endDate.toIso8601String(),
        'target_user_type': targetUserType,
        'conditions': conditions,
        'is_active': true,
        'created_at': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      throw Exception('Failed to create promotion: ${e.toString()}');
    }
  }

  // Get active promotions
  static Future<List<Promotion>> getActivePromotions() async {
    try {
      final now = DateTime.now();
      
      final response = await _client
          .from('promotions')
          .select()
          .eq('is_active', true)
          .lte('start_date', now.toIso8601String())
          .gte('end_date', now.toIso8601String())
          .order('created_at', ascending: false);

      return response.map<Promotion>((json) => Promotion.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to get active promotions: ${e.toString()}');
    }
  }

  // Apply promotion points
  static Future<void> applyPromotionPoints({
    required String userId,
    required int basePoints,
    required String type,
    required String description,
  }) async {
    try {
      // Get active promotions
      final promotions = await getActivePromotions();
      
      int totalPoints = basePoints;
      
      for (final promotion in promotions) {
        if (promotion.type == type) {
          totalPoints = (basePoints * promotion.pointsMultiplier).round();
          break;
        }
      }

      await addLoyaltyPoints(
        userId: userId,
        points: totalPoints,
        description: description,
        type: type,
      );
    } catch (e) {
      debugPrint('Failed to apply promotion points: $e');
    }
  }

  // Get loyalty analytics
  static Future<Map<String, dynamic>> getLoyaltyAnalytics(String userId) async {
    try {
      final transactions = await _client
          .from('loyalty_transactions')
          .select()
          .eq('user_id', userId);

      final redemptions = await _client
          .from('reward_redemptions')
          .select()
          .eq('user_id', userId);

      final userPoints = await getUserLoyaltyPoints(userId);
      final userTier = await getUserTier(userId);

      final analytics = {
        'total_points': userPoints,
        'current_tier': userTier?.name,
        'tier_progress': 0.0,
        'total_earned': transactions.where((t) => t['points'] > 0).fold<int>(0, (sum, t) => sum + t['points']),
        'total_spent': transactions.where((t) => t['points'] < 0).fold<int>(0, (sum, t) => sum + t['points'].abs()),
        'total_redemptions': redemptions.length,
        'by_type': <String, int>{},
        'monthly_earnings': <String, int>{},
      };

      // Calculate tier progress
      if (userTier != null) {
        final tiers = await getLoyaltyTiers();
        final nextTier = tiers.firstWhere(
          (tier) => tier.pointsRequired > userPoints,
          orElse: () => userTier,
        );
        
        if (nextTier != userTier) {
          analytics['tier_progress'] = (userPoints - userTier.pointsRequired) / 
                                      (nextTier.pointsRequired - userTier.pointsRequired);
        } else {
          analytics['tier_progress'] = 1.0;
        }
      }

      // Group by type
      for (final transaction in transactions) {
        final type = transaction['type'] as String;
        analytics['by_type'][type] = (analytics['by_type'][type] ?? 0) + transaction['points'];
      }

      // Group by month
      for (final transaction in transactions) {
        final date = DateTime.parse(transaction['created_at']);
        final month = '${date.year}-${date.month.toString().padLeft(2, '0')}';
        analytics['monthly_earnings'][month] = (analytics['monthly_earnings'][month] ?? 0) + transaction['points'];
      }

      return analytics;
    } catch (e) {
      throw Exception('Failed to get loyalty analytics: ${e.toString()}');
    }
  }

  // Send referral invitation
  static Future<void> sendReferralInvitation({
    required String userId,
    required String email,
    required String message,
  }) async {
    try {
      final userCode = await getUserReferralCode(userId);
      
      // Create invitation record
      await _client.from('referral_invitations').insert({
        'id': 'invite_${DateTime.now().millisecondsSinceEpoch}',
        'user_id': userId,
        'email': email,
        'message': message,
        'referral_code': userCode,
        'sent_at': DateTime.now().toIso8601String(),
        'status': 'sent',
      });

      // Send email invitation (would integrate with email service)
      // EmailService.sendReferralInvitation(email, message, userCode);
    } catch (e) {
      throw Exception('Failed to send referral invitation: ${e.toString()}');
    }
  }

  // Get referral invitations
  static Future<List<ReferralInvitation>> getReferralInvitations(String userId) async {
    try {
      final response = await _client
          .from('referral_invitations')
          .select()
          .eq('user_id', userId)
          .order('sent_at', ascending: false);

      return response.map<ReferralInvitation>((json) => ReferralInvitation.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to get referral invitations: ${e.toString()}');
    }
  }
}