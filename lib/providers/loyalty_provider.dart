import 'package:flutter/foundation.dart';
import '../models/loyalty_model.dart';
import '../services/supabase_service.dart';

class LoyaltyProvider extends ChangeNotifier {
  LoyaltyModel? _loyaltyProfile;
  List<LoyaltyTransaction> _transactions = [];
  List<LoyaltyReward> _availableRewards = [];
  List<LoyaltyReward> _redeemedRewards = [];
  bool _isLoading = false;
  String? _errorMessage;

  // Getters
  LoyaltyModel? get loyaltyProfile => _loyaltyProfile;
  List<LoyaltyTransaction> get transactions => _transactions;
  List<LoyaltyReward> get availableRewards => _availableRewards;
  List<LoyaltyReward> get redeemedRewards => _redeemedRewards;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Set loading state
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  // Set error message
  void _setError(String error) {
    _errorMessage = error;
    if (kDebugMode) {
      print('Loyalty Provider Error: $error');
    }
    notifyListeners();
  }

  // Get loyalty profile
  Future<void> getLoyaltyProfile(String employeeId) async {
    try {
      _setLoading(true);
      clearError();

      final response = await SupabaseService.client
          .from('loyalty_profiles')
          .select('*')
          .eq('employee_id', employeeId)
          .single();

      _loyaltyProfile = LoyaltyModel.fromJson(response);
      notifyListeners();
    } catch (e) {
      if (e.toString().contains('No rows returned')) {
        // Create new loyalty profile
        await createLoyaltyProfile(employeeId);
      } else {
        _setError('Failed to load loyalty profile: ${e.toString()}');
      }
    } finally {
      _setLoading(false);
    }
  }

  // Create loyalty profile
  Future<bool> createLoyaltyProfile(String employeeId) async {
    try {
      _setLoading(true);
      clearError();

      final profilePayload = {
        'employee_id': employeeId,
        'total_points': 0,
        'available_points': 0,
        'redeemed_points': 0,
        'tier': LoyaltyTier.bronze.value,
        'year_of_service': 0,
        'performance_rating': 0.0,
        'created_at': DateTime.now().toIso8601String(),
        'last_updated': DateTime.now().toIso8601String(),
      };

      final response = await SupabaseService.client
          .from('loyalty_profiles')
          .insert(profilePayload)
          .select()
          .single();

      _loyaltyProfile = LoyaltyModel.fromJson(response);
      notifyListeners();

      return true;
    } catch (e) {
      _setError('Failed to create loyalty profile: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Add loyalty points
  Future<bool> addLoyaltyPoints({
    required String employeeId,
    required int points,
    required LoyaltyTransactionType type,
    required String description,
    String? referenceId,
  }) async {
    try {
      _setLoading(true);
      clearError();

      // Create transaction
      final transactionPayload = {
        'employee_id': employeeId,
        'type': type.value,
        'points': points,
        'description': description,
        'reference_id': referenceId,
        'created_at': DateTime.now().toIso8601String(),
      };

      await SupabaseService.client
          .from('loyalty_transactions')
          .insert(transactionPayload);

      // Update loyalty profile
      if (_loyaltyProfile != null) {
        final newTotalPoints = _loyaltyProfile!.totalPoints + points;
        final newAvailablePoints = _loyaltyProfile!.availablePoints + points;
        final newTier = LoyaltyTier.fromPoints(newTotalPoints);

        await SupabaseService.client
            .from('loyalty_profiles')
            .update({
              'total_points': newTotalPoints,
              'available_points': newAvailablePoints,
              'tier': newTier.value,
              'last_updated': DateTime.now().toIso8601String(),
            })
            .eq('employee_id', employeeId);

        // Refresh profile
        await getLoyaltyProfile(employeeId);
      }

      return true;
    } catch (e) {
      _setError('Failed to add loyalty points: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Redeem loyalty points
  Future<bool> redeemLoyaltyPoints({
    required String employeeId,
    required String rewardId,
    required int pointsCost,
  }) async {
    try {
      _setLoading(true);
      clearError();

      if (_loyaltyProfile == null ||
          _loyaltyProfile!.availablePoints < pointsCost) {
        _setError('Insufficient points for redemption');
        return false;
      }

      // Create redemption transaction
      final transactionPayload = {
        'employee_id': employeeId,
        'type': LoyaltyTransactionType.redeemed.value,
        'points': -pointsCost,
        'description': 'Reward redemption',
        'reference_id': rewardId,
        'created_at': DateTime.now().toIso8601String(),
      };

      await SupabaseService.client
          .from('loyalty_transactions')
          .insert(transactionPayload);

      // Create reward redemption record
      final redemptionPayload = {
        'employee_id': employeeId,
        'reward_id': rewardId,
        'points_used': pointsCost,
        'redeemed_at': DateTime.now().toIso8601String(),
        'status': 'pending',
      };

      await SupabaseService.client
          .from('reward_redemptions')
          .insert(redemptionPayload);

      // Update loyalty profile
      final newAvailablePoints = _loyaltyProfile!.availablePoints - pointsCost;
      final newRedeemedPoints = _loyaltyProfile!.redeemedPoints + pointsCost;

      await SupabaseService.client
          .from('loyalty_profiles')
          .update({
            'available_points': newAvailablePoints,
            'redeemed_points': newRedeemedPoints,
            'last_updated': DateTime.now().toIso8601String(),
          })
          .eq('employee_id', employeeId);

      // Refresh profile and transactions
      await getLoyaltyProfile(employeeId);
      await getLoyaltyTransactions(employeeId);

      return true;
    } catch (e) {
      _setError('Failed to redeem loyalty points: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Get loyalty transactions
  Future<void> getLoyaltyTransactions(String employeeId) async {
    try {
      _setLoading(true);
      clearError();

      final response = await SupabaseService.client
          .from('loyalty_transactions')
          .select('*')
          .eq('employee_id', employeeId)
          .order('created_at', ascending: false);

      _transactions = response
          .map<LoyaltyTransaction>((json) => LoyaltyTransaction.fromJson(json))
          .toList();

      notifyListeners();
    } catch (e) {
      _setError('Failed to load loyalty transactions: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  // Get available rewards
  Future<void> getAvailableRewards([LoyaltyTier? minimumTier]) async {
    try {
      _setLoading(true);
      clearError();

      var query = SupabaseService.client
          .from('loyalty_rewards')
          .select('*')
          .eq('is_active', true);

      if (minimumTier != null) {
        query = query.lte('minimum_tier_points', minimumTier.minimumPoints);
      }

      final response = await query.order('points_cost', ascending: true);

      _availableRewards = response
          .map<LoyaltyReward>((json) => LoyaltyReward.fromJson(json))
          .toList();

      notifyListeners();
    } catch (e) {
      _setError('Failed to load available rewards: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  // Get redeemed rewards
  Future<void> getRedeemedRewards(String employeeId) async {
    try {
      _setLoading(true);
      clearError();

      final response = await SupabaseService.client
          .from('reward_redemptions')
          .select('''
            *,
            loyalty_rewards:reward_id (*)
          ''')
          .eq('employee_id', employeeId)
          .order('redeemed_at', ascending: false);

      _redeemedRewards = response
          .map<LoyaltyReward>(
            (json) => LoyaltyReward.fromJson(json['loyalty_rewards']),
          )
          .toList();

      notifyListeners();
    } catch (e) {
      _setError('Failed to load redeemed rewards: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  // Calculate points for performance
  int calculatePerformancePoints(double rating, int yearsOfService) {
    int basePoints = 0;

    // Points based on rating
    if (rating >= 4.5) {
      basePoints += 100;
    } else if (rating >= 4.0) {
      basePoints += 75;
    } else if (rating >= 3.5) {
      basePoints += 50;
    } else if (rating >= 3.0) {
      basePoints += 25;
    }

    // Bonus points for years of service
    basePoints += yearsOfService * 10;

    return basePoints;
  }

  // Award performance points
  Future<bool> awardPerformancePoints({
    required String employeeId,
    required double performanceRating,
    required int yearsOfService,
  }) async {
    try {
      final points = calculatePerformancePoints(
        performanceRating,
        yearsOfService,
      );

      if (points > 0) {
        await addLoyaltyPoints(
          employeeId: employeeId,
          points: points,
          type: LoyaltyTransactionType.earned,
          description: 'Performance bonus (Rating: $performanceRating)',
        );

        // Update performance rating in profile
        await SupabaseService.client
            .from('loyalty_profiles')
            .update({
              'performance_rating': performanceRating,
              'year_of_service': yearsOfService,
              'last_updated': DateTime.now().toIso8601String(),
            })
            .eq('employee_id', employeeId);
      }

      return true;
    } catch (e) {
      _setError('Failed to award performance points: ${e.toString()}');
      return false;
    }
  }

  // Create new reward (for admins)
  Future<bool> createReward({
    required String title,
    required String description,
    required int pointsCost,
    required LoyaltyRewardType type,
    LoyaltyTier minimumTier = LoyaltyTier.bronze,
    String? imageUrl,
    DateTime? expiryDate,
  }) async {
    try {
      _setLoading(true);
      clearError();

      final rewardPayload = {
        'title': title,
        'description': description,
        'points_cost': pointsCost,
        'type': type.value,
        'minimum_tier': minimumTier.value,
        'image_url': imageUrl,
        'expiry_date': expiryDate?.toIso8601String(),
        'is_active': true,
      };

      await SupabaseService.client
          .from('loyalty_rewards')
          .insert(rewardPayload);

      // Refresh available rewards
      await getAvailableRewards();

      return true;
    } catch (e) {
      _setError('Failed to create reward: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Get loyalty leaderboard
  Future<List<Map<String, dynamic>>> getLoyaltyLeaderboard({
    int limit = 10,
  }) async {
    try {
      final response = await SupabaseService.client
          .from('loyalty_profiles')
          .select('''
            *,
            users:employee_id (full_name, avatar_url)
          ''')
          .order('total_points', ascending: false)
          .limit(limit);

      return response.cast<Map<String, dynamic>>();
    } catch (e) {
      _setError('Failed to load leaderboard: ${e.toString()}');
      return [];
    }
  }

  // Get affordable rewards
  List<LoyaltyReward> get affordableRewards {
    if (_loyaltyProfile == null) return [];

    return _availableRewards
        .where(
          (reward) => reward.pointsCost <= _loyaltyProfile!.availablePoints,
        )
        .toList();
  }

  // Get tier progress percentage
  double get tierProgress {
    return _loyaltyProfile?.tierProgress ?? 0.0;
  }

  // Get points to next tier
  int get pointsToNextTier {
    return _loyaltyProfile?.pointsToNextTier ?? 0;
  }

  // Check if can upgrade tier
  bool get canUpgradeTier {
    return _loyaltyProfile?.canUpgradeTier ?? false;
  }

  // Get recent transactions
  List<LoyaltyTransaction> get recentTransactions {
    return _transactions.take(10).toList();
  }

  // Calculate total points earned
  int get totalPointsEarned {
    return _transactions
        .where((t) => t.points > 0)
        .fold(0, (sum, t) => sum + t.points);
  }

  // Calculate total points redeemed
  int get totalPointsRedeemed {
    return _transactions
        .where((t) => t.points < 0)
        .fold(0, (sum, t) => sum + t.points.abs());
  }

  // Clear all data
  void clearData() {
    _loyaltyProfile = null;
    _transactions.clear();
    _availableRewards.clear();
    _redeemedRewards.clear();
    clearError();
    notifyListeners();
  }
}
