import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/message_model.dart';
import 'supabase_service.dart';
import 'notification_service.dart';

class MessagingService {
  static final _client = SupabaseService.client;

  // Send a message
  static Future<Message> sendMessage({
    required String senderId,
    required String recipientId,
    required String content,
    MessageType type = MessageType.text,
    String? jobId,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      final messageId = 'msg_${DateTime.now().millisecondsSinceEpoch}';

      final message = Message(
        id: messageId,
        senderId: senderId,
        recipientId: recipientId,
        content: content,
        type: type,
        jobId: jobId,
        metadata: metadata,
        createdAt: DateTime.now(),
        isRead: false,
      );

      await _client.from('messages').insert(message.toJson());

      // Send real-time notification
      await NotificationService.sendNotification(
        userId: recipientId,
        title: 'New Message',
        message: type == MessageType.text
            ? content
            : 'You received a ${type.name}',
        type: 'message',
        data: {'message_id': messageId, 'sender_id': senderId, 'job_id': jobId},
      );

      return message;
    } catch (e) {
      throw Exception('Failed to send message: ${e.toString()}');
    }
  }

  // Get messages between users
  static Future<List<Message>> getMessages({
    required String userId,
    required String otherUserId,
    String? jobId,
    int limit = 50,
  }) async {
    try {
      var query = _client
          .from('messages')
          .select()
          .or('sender_id.eq.$userId,recipient_id.eq.$userId')
          .or('sender_id.eq.$otherUserId,recipient_id.eq.$otherUserId')
          .order('created_at', ascending: false)
          .limit(limit);

      if (jobId != null) {
        query = query.eq('job_id', jobId);
      }

      final response = await query;
      return response.map<Message>((json) => Message.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to get messages: ${e.toString()}');
    }
  }

  // Get conversations for a user
  static Future<List<Conversation>> getConversations(String userId) async {
    try {
      final response = await _client
          .from('conversations')
          .select('''
            *,
            last_message(*),
            participants(
              user_id,
              users(first_name, last_name, profile_photo)
            )
          ''')
          .contains('participant_ids', [userId])
          .order('last_message_at', ascending: false);

      return response
          .map<Conversation>((json) => Conversation.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to get conversations: ${e.toString()}');
    }
  }

  // Create or get conversation
  static Future<Conversation> createOrGetConversation({
    required String userId1,
    required String userId2,
    String? jobId,
  }) async {
    try {
      // Check if conversation exists
      final existing = await _client
          .from('conversations')
          .select()
          .contains('participant_ids', [userId1])
          .contains('participant_ids', [userId2])
          .eq('job_id', jobId ?? '')
          .limit(1);

      if (existing.isNotEmpty) {
        return Conversation.fromJson(existing.first);
      }

      // Create new conversation
      final conversationId = 'conv_${DateTime.now().millisecondsSinceEpoch}';
      final conversation = Conversation(
        id: conversationId,
        participantIds: [userId1, userId2],
        jobId: jobId,
        createdAt: DateTime.now(),
        lastMessageAt: DateTime.now(),
        isActive: true,
      );

      await _client.from('conversations').insert(conversation.toJson());

      return conversation;
    } catch (e) {
      throw Exception('Failed to create conversation: ${e.toString()}');
    }
  }

  // Mark message as read
  static Future<void> markAsRead(String messageId) async {
    try {
      await _client
          .from('messages')
          .update({
            'is_read': true,
            'read_at': DateTime.now().toIso8601String(),
          })
          .eq('id', messageId);
    } catch (e) {
      throw Exception('Failed to mark message as read: ${e.toString()}');
    }
  }

  // Mark all messages in conversation as read
  static Future<void> markConversationAsRead(
    String conversationId,
    String userId,
  ) async {
    try {
      await _client
          .from('messages')
          .update({
            'is_read': true,
            'read_at': DateTime.now().toIso8601String(),
          })
          .eq('conversation_id', conversationId)
          .eq('recipient_id', userId)
          .eq('is_read', false);
    } catch (e) {
      throw Exception('Failed to mark conversation as read: ${e.toString()}');
    }
  }

  // Get unread message count
  static Future<int> getUnreadCount(String userId) async {
    try {
      final response = await _client
          .from('messages')
          .select('id')
          .eq('recipient_id', userId)
          .eq('is_read', false);

      return response.length;
    } catch (e) {
      return 0;
    }
  }

  // Delete message
  static Future<void> deleteMessage(String messageId) async {
    try {
      await _client.from('messages').delete().eq('id', messageId);
    } catch (e) {
      throw Exception('Failed to delete message: ${e.toString()}');
    }
  }

  // Upload media message
  static Future<Message> sendMediaMessage({
    required String senderId,
    required String recipientId,
    required String filePath,
    required MessageType type,
    String? caption,
    String? jobId,
  }) async {
    try {
      // Upload file to storage
      final fileName =
          'messages/${DateTime.now().millisecondsSinceEpoch}_${filePath.split('/').last}';
      final response = await _client.storage
          .from('media')
          .upload(fileName, filePath);

      if (response.isEmpty) {
        throw Exception('Failed to upload media');
      }

      // Get public URL
      final publicUrl = _client.storage.from('media').getPublicUrl(fileName);

      // Send message with media URL
      return await sendMessage(
        senderId: senderId,
        recipientId: recipientId,
        content: caption ?? '',
        type: type,
        jobId: jobId,
        metadata: {'media_url': publicUrl, 'file_name': fileName},
      );
    } catch (e) {
      throw Exception('Failed to send media message: ${e.toString()}');
    }
  }

  // Real-time message subscription
  static Stream<List<Message>> subscribeToMessages(String conversationId) {
    return _client
        .from('messages')
        .stream(primaryKey: ['id'])
        .eq('conversation_id', conversationId)
        .order('created_at', ascending: true)
        .map(
          (data) =>
              data.map<Message>((json) => Message.fromJson(json)).toList(),
        );
  }

  // Real-time conversation subscription
  static Stream<List<Conversation>> subscribeToConversations(String userId) {
    return _client
        .from('conversations')
        .stream(primaryKey: ['id'])
        .contains('participant_ids', [userId])
        .order('last_message_at', ascending: false)
        .map(
          (data) => data
              .map<Conversation>((json) => Conversation.fromJson(json))
              .toList(),
        );
  }

  // Send typing indicator
  static Future<void> sendTypingIndicator({
    required String conversationId,
    required String userId,
    required bool isTyping,
  }) async {
    try {
      await _client.from('typing_indicators').upsert({
        'conversation_id': conversationId,
        'user_id': userId,
        'is_typing': isTyping,
        'updated_at': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      debugPrint('Failed to send typing indicator: $e');
    }
  }

  // Get typing indicators
  static Stream<List<TypingIndicator>> subscribeToTypingIndicators(
    String conversationId,
  ) {
    return _client
        .from('typing_indicators')
        .stream(primaryKey: ['conversation_id', 'user_id'])
        .eq('conversation_id', conversationId)
        .eq('is_typing', true)
        .map(
          (data) => data
              .map<TypingIndicator>((json) => TypingIndicator.fromJson(json))
              .toList(),
        );
  }

  // Send automated message
  static Future<void> sendAutomatedMessage({
    required String recipientId,
    required String content,
    required String type,
    String? jobId,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      await sendMessage(
        senderId: 'system',
        recipientId: recipientId,
        content: content,
        type: MessageType.system,
        jobId: jobId,
        metadata: {'automated': true, 'type': type, ...?metadata},
      );
    } catch (e) {
      debugPrint('Failed to send automated message: $e');
    }
  }

  // Send job-related messages
  static Future<void> sendJobMessage({
    required String jobId,
    required String senderId,
    required String recipientId,
    required String messageType,
    Map<String, dynamic>? data,
  }) async {
    try {
      String content;
      switch (messageType) {
        case 'job_application':
          content = 'I have applied for your job listing';
          break;
        case 'job_accepted':
          content = 'Your job application has been accepted';
          break;
        case 'job_started':
          content = 'The job has started';
          break;
        case 'job_completed':
          content = 'The job has been completed';
          break;
        case 'job_cancelled':
          content = 'The job has been cancelled';
          break;
        case 'payment_reminder':
          content = 'Payment reminder for completed job';
          break;
        default:
          content = 'Job update';
      }

      await sendMessage(
        senderId: senderId,
        recipientId: recipientId,
        content: content,
        type: MessageType.system,
        jobId: jobId,
        metadata: {'job_event': messageType, ...?data},
      );
    } catch (e) {
      debugPrint('Failed to send job message: $e');
    }
  }

  // Get conversation analytics
  static Future<Map<String, dynamic>> getConversationAnalytics(
    String userId,
  ) async {
    try {
      final conversations = await _client
          .from('conversations')
          .select()
          .contains('participant_ids', [userId]);

      final messages = await _client
          .from('messages')
          .select()
          .or('sender_id.eq.$userId,recipient_id.eq.$userId');

      final analytics = {
        'total_conversations': conversations.length,
        'active_conversations': conversations
            .where((c) => c['is_active'])
            .length,
        'total_messages_sent': messages
            .where((m) => m['sender_id'] == userId)
            .length,
        'total_messages_received': messages
            .where((m) => m['recipient_id'] == userId)
            .length,
        'average_response_time': 0.0,
        'most_active_hour': 0,
        'message_types': <String, int>{},
      };

      // Calculate message type distribution
      for (final message in messages) {
        final type = message['type'] as String;
        analytics['message_types'][type] =
            (analytics['message_types'][type] ?? 0) + 1;
      }

      return analytics;
    } catch (e) {
      throw Exception('Failed to get conversation analytics: ${e.toString()}');
    }
  }

  // Search messages
  static Future<List<Message>> searchMessages({
    required String userId,
    required String query,
    String? conversationId,
    MessageType? type,
    int limit = 20,
  }) async {
    try {
      var dbQuery = _client
          .from('messages')
          .select()
          .or('sender_id.eq.$userId,recipient_id.eq.$userId')
          .textSearch('content', query)
          .order('created_at', ascending: false)
          .limit(limit);

      if (conversationId != null) {
        dbQuery = dbQuery.eq('conversation_id', conversationId);
      }

      if (type != null) {
        dbQuery = dbQuery.eq('type', type.name);
      }

      final response = await dbQuery;
      return response.map<Message>((json) => Message.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to search messages: ${e.toString()}');
    }
  }

  // Block user
  static Future<void> blockUser(String userId, String blockedUserId) async {
    try {
      await _client.from('blocked_users').insert({
        'user_id': userId,
        'blocked_user_id': blockedUserId,
        'created_at': DateTime.now().toIso8601String(),
      });

      // Update conversations to inactive
      await _client
          .from('conversations')
          .update({'is_active': false})
          .contains('participant_ids', [userId])
          .contains('participant_ids', [blockedUserId]);
    } catch (e) {
      throw Exception('Failed to block user: ${e.toString()}');
    }
  }

  // Unblock user
  static Future<void> unblockUser(String userId, String blockedUserId) async {
    try {
      await _client
          .from('blocked_users')
          .delete()
          .eq('user_id', userId)
          .eq('blocked_user_id', blockedUserId);

      // Reactivate conversations
      await _client
          .from('conversations')
          .update({'is_active': true})
          .contains('participant_ids', [userId])
          .contains('participant_ids', [blockedUserId]);
    } catch (e) {
      throw Exception('Failed to unblock user: ${e.toString()}');
    }
  }

  // Get blocked users
  static Future<List<String>> getBlockedUsers(String userId) async {
    try {
      final response = await _client
          .from('blocked_users')
          .select('blocked_user_id')
          .eq('user_id', userId);

      return response.map<String>((json) => json['blocked_user_id']).toList();
    } catch (e) {
      return [];
    }
  }

  // Check if user is blocked
  static Future<bool> isUserBlocked(String userId, String otherUserId) async {
    try {
      final response = await _client
          .from('blocked_users')
          .select('id')
          .eq('user_id', userId)
          .eq('blocked_user_id', otherUserId)
          .limit(1);

      return response.isNotEmpty;
    } catch (e) {
      return false;
    }
  }

  // Report conversation
  static Future<void> reportConversation({
    required String reporterId,
    required String conversationId,
    required String reason,
    String? details,
  }) async {
    try {
      await _client.from('conversation_reports').insert({
        'id': 'report_${DateTime.now().millisecondsSinceEpoch}',
        'reporter_id': reporterId,
        'conversation_id': conversationId,
        'reason': reason,
        'details': details,
        'status': 'pending',
        'created_at': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      throw Exception('Failed to report conversation: ${e.toString()}');
    }
  }

  // Get message delivery status
  static Future<MessageDeliveryStatus> getMessageDeliveryStatus(
    String messageId,
  ) async {
    try {
      final response = await _client
          .from('message_delivery_status')
          .select()
          .eq('message_id', messageId)
          .single();

      return MessageDeliveryStatus.fromJson(response);
    } catch (e) {
      return MessageDeliveryStatus(
        messageId: messageId,
        status: 'failed',
        deliveredAt: null,
        readAt: null,
      );
    }
  }

  // Update message delivery status
  static Future<void> updateMessageDeliveryStatus({
    required String messageId,
    required String status,
    DateTime? deliveredAt,
    DateTime? readAt,
  }) async {
    try {
      await _client.from('message_delivery_status').upsert({
        'message_id': messageId,
        'status': status,
        'delivered_at': deliveredAt?.toIso8601String(),
        'read_at': readAt?.toIso8601String(),
        'updated_at': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      debugPrint('Failed to update message delivery status: $e');
    }
  }
}
