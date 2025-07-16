enum MessageType {
  text,
  image,
  video,
  audio,
  file,
  location,
  system,
  jobUpdate,
  paymentReminder,
  rating,
}

class Message {
  final String id;
  final String senderId;
  final String recipientId;
  final String content;
  final MessageType type;
  final String? jobId;
  final String? conversationId;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;
  final DateTime? readAt;
  final DateTime? deliveredAt;
  final bool isRead;
  final bool isEdited;
  final DateTime? editedAt;
  final bool isDeleted;
  final DateTime? deletedAt;
  final String? replyToId;
  final List<String>? reactions;

  Message({
    required this.id,
    required this.senderId,
    required this.recipientId,
    required this.content,
    required this.type,
    this.jobId,
    this.conversationId,
    this.metadata,
    required this.createdAt,
    this.readAt,
    this.deliveredAt,
    required this.isRead,
    this.isEdited = false,
    this.editedAt,
    this.isDeleted = false,
    this.deletedAt,
    this.replyToId,
    this.reactions,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'],
      senderId: json['sender_id'],
      recipientId: json['recipient_id'],
      content: json['content'],
      type: MessageType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => MessageType.text,
      ),
      jobId: json['job_id'],
      conversationId: json['conversation_id'],
      metadata: json['metadata'],
      createdAt: DateTime.parse(json['created_at']),
      readAt: json['read_at'] != null ? DateTime.parse(json['read_at']) : null,
      deliveredAt: json['delivered_at'] != null
          ? DateTime.parse(json['delivered_at'])
          : null,
      isRead: json['is_read'] ?? false,
      isEdited: json['is_edited'] ?? false,
      editedAt: json['edited_at'] != null
          ? DateTime.parse(json['edited_at'])
          : null,
      isDeleted: json['is_deleted'] ?? false,
      deletedAt: json['deleted_at'] != null
          ? DateTime.parse(json['deleted_at'])
          : null,
      replyToId: json['reply_to_id'],
      reactions: json['reactions'] != null
          ? List<String>.from(json['reactions'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'sender_id': senderId,
      'recipient_id': recipientId,
      'content': content,
      'type': type.name,
      'job_id': jobId,
      'conversation_id': conversationId,
      'metadata': metadata,
      'created_at': createdAt.toIso8601String(),
      'read_at': readAt?.toIso8601String(),
      'delivered_at': deliveredAt?.toIso8601String(),
      'is_read': isRead,
      'is_edited': isEdited,
      'edited_at': editedAt?.toIso8601String(),
      'is_deleted': isDeleted,
      'deleted_at': deletedAt?.toIso8601String(),
      'reply_to_id': replyToId,
      'reactions': reactions,
    };
  }
}

class Conversation {
  final String id;
  final List<String> participantIds;
  final String? jobId;
  final String? title;
  final String? lastMessageId;
  final String? lastMessageContent;
  final DateTime? lastMessageAt;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final bool isActive;
  final bool isGroupChat;
  final int unreadCount;
  final Map<String, dynamic>? metadata;

  Conversation({
    required this.id,
    required this.participantIds,
    this.jobId,
    this.title,
    this.lastMessageId,
    this.lastMessageContent,
    this.lastMessageAt,
    required this.createdAt,
    this.updatedAt,
    this.isActive = true,
    this.isGroupChat = false,
    this.unreadCount = 0,
    this.metadata,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      id: json['id'],
      participantIds: List<String>.from(json['participant_ids']),
      jobId: json['job_id'],
      title: json['title'],
      lastMessageId: json['last_message_id'],
      lastMessageContent: json['last_message_content'],
      lastMessageAt: json['last_message_at'] != null
          ? DateTime.parse(json['last_message_at'])
          : null,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : null,
      isActive: json['is_active'] ?? true,
      isGroupChat: json['is_group_chat'] ?? false,
      unreadCount: json['unread_count'] ?? 0,
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'participant_ids': participantIds,
      'job_id': jobId,
      'title': title,
      'last_message_id': lastMessageId,
      'last_message_content': lastMessageContent,
      'last_message_at': lastMessageAt?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
      'is_active': isActive,
      'is_group_chat': isGroupChat,
      'unread_count': unreadCount,
      'metadata': metadata,
    };
  }
}

class TypingIndicator {
  final String conversationId;
  final String userId;
  final bool isTyping;
  final DateTime updatedAt;

  TypingIndicator({
    required this.conversationId,
    required this.userId,
    required this.isTyping,
    required this.updatedAt,
  });

  factory TypingIndicator.fromJson(Map<String, dynamic> json) {
    return TypingIndicator(
      conversationId: json['conversation_id'],
      userId: json['user_id'],
      isTyping: json['is_typing'] ?? false,
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'conversation_id': conversationId,
      'user_id': userId,
      'is_typing': isTyping,
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}

class MessageDeliveryStatus {
  final String messageId;
  final String status; // sent, delivered, read, failed
  final DateTime? deliveredAt;
  final DateTime? readAt;

  MessageDeliveryStatus({
    required this.messageId,
    required this.status,
    this.deliveredAt,
    this.readAt,
  });

  factory MessageDeliveryStatus.fromJson(Map<String, dynamic> json) {
    return MessageDeliveryStatus(
      messageId: json['message_id'],
      status: json['status'],
      deliveredAt: json['delivered_at'] != null
          ? DateTime.parse(json['delivered_at'])
          : null,
      readAt: json['read_at'] != null ? DateTime.parse(json['read_at']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'message_id': messageId,
      'status': status,
      'delivered_at': deliveredAt?.toIso8601String(),
      'read_at': readAt?.toIso8601String(),
    };
  }
}

class MessageReaction {
  final String id;
  final String messageId;
  final String userId;
  final String emoji;
  final DateTime createdAt;

  MessageReaction({
    required this.id,
    required this.messageId,
    required this.userId,
    required this.emoji,
    required this.createdAt,
  });

  factory MessageReaction.fromJson(Map<String, dynamic> json) {
    return MessageReaction(
      id: json['id'],
      messageId: json['message_id'],
      userId: json['user_id'],
      emoji: json['emoji'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'message_id': messageId,
      'user_id': userId,
      'emoji': emoji,
      'created_at': createdAt.toIso8601String(),
    };
  }
}

class ConversationParticipant {
  final String conversationId;
  final String userId;
  final String role; // member, admin, moderator
  final DateTime joinedAt;
  final DateTime? leftAt;
  final bool isActive;
  final DateTime? lastSeenAt;
  final Map<String, dynamic>? settings;

  ConversationParticipant({
    required this.conversationId,
    required this.userId,
    required this.role,
    required this.joinedAt,
    this.leftAt,
    this.isActive = true,
    this.lastSeenAt,
    this.settings,
  });

  factory ConversationParticipant.fromJson(Map<String, dynamic> json) {
    return ConversationParticipant(
      conversationId: json['conversation_id'],
      userId: json['user_id'],
      role: json['role'],
      joinedAt: DateTime.parse(json['joined_at']),
      leftAt: json['left_at'] != null ? DateTime.parse(json['left_at']) : null,
      isActive: json['is_active'] ?? true,
      lastSeenAt: json['last_seen_at'] != null
          ? DateTime.parse(json['last_seen_at'])
          : null,
      settings: json['settings'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'conversation_id': conversationId,
      'user_id': userId,
      'role': role,
      'joined_at': joinedAt.toIso8601String(),
      'left_at': leftAt?.toIso8601String(),
      'is_active': isActive,
      'last_seen_at': lastSeenAt?.toIso8601String(),
      'settings': settings,
    };
  }
}

class BlockedUser {
  final String id;
  final String userId;
  final String blockedUserId;
  final String? reason;
  final DateTime createdAt;

  BlockedUser({
    required this.id,
    required this.userId,
    required this.blockedUserId,
    this.reason,
    required this.createdAt,
  });

  factory BlockedUser.fromJson(Map<String, dynamic> json) {
    return BlockedUser(
      id: json['id'],
      userId: json['user_id'],
      blockedUserId: json['blocked_user_id'],
      reason: json['reason'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'blocked_user_id': blockedUserId,
      'reason': reason,
      'created_at': createdAt.toIso8601String(),
    };
  }
}

class ConversationReport {
  final String id;
  final String reporterId;
  final String conversationId;
  final String reason;
  final String? details;
  final String status; // pending, reviewed, resolved, dismissed
  final DateTime createdAt;
  final DateTime? resolvedAt;
  final String? resolvedBy;
  final String? resolution;

  ConversationReport({
    required this.id,
    required this.reporterId,
    required this.conversationId,
    required this.reason,
    this.details,
    required this.status,
    required this.createdAt,
    this.resolvedAt,
    this.resolvedBy,
    this.resolution,
  });

  factory ConversationReport.fromJson(Map<String, dynamic> json) {
    return ConversationReport(
      id: json['id'],
      reporterId: json['reporter_id'],
      conversationId: json['conversation_id'],
      reason: json['reason'],
      details: json['details'],
      status: json['status'],
      createdAt: DateTime.parse(json['created_at']),
      resolvedAt: json['resolved_at'] != null
          ? DateTime.parse(json['resolved_at'])
          : null,
      resolvedBy: json['resolved_by'],
      resolution: json['resolution'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'reporter_id': reporterId,
      'conversation_id': conversationId,
      'reason': reason,
      'details': details,
      'status': status,
      'created_at': createdAt.toIso8601String(),
      'resolved_at': resolvedAt?.toIso8601String(),
      'resolved_by': resolvedBy,
      'resolution': resolution,
    };
  }
}

class MessageTemplate {
  final String id;
  final String name;
  final String content;
  final String category; // greeting, job_update, payment, etc.
  final List<String> variables;
  final bool isActive;
  final DateTime createdAt;

  MessageTemplate({
    required this.id,
    required this.name,
    required this.content,
    required this.category,
    required this.variables,
    this.isActive = true,
    required this.createdAt,
  });

  factory MessageTemplate.fromJson(Map<String, dynamic> json) {
    return MessageTemplate(
      id: json['id'],
      name: json['name'],
      content: json['content'],
      category: json['category'],
      variables: List<String>.from(json['variables']),
      isActive: json['is_active'] ?? true,
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'content': content,
      'category': category,
      'variables': variables,
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
    };
  }
}

class AutoReply {
  final String id;
  final String userId;
  final String trigger;
  final String response;
  final bool isActive;
  final DateTime? startTime;
  final DateTime? endTime;
  final List<String>? keywords;
  final DateTime createdAt;

  AutoReply({
    required this.id,
    required this.userId,
    required this.trigger,
    required this.response,
    this.isActive = true,
    this.startTime,
    this.endTime,
    this.keywords,
    required this.createdAt,
  });

  factory AutoReply.fromJson(Map<String, dynamic> json) {
    return AutoReply(
      id: json['id'],
      userId: json['user_id'],
      trigger: json['trigger'],
      response: json['response'],
      isActive: json['is_active'] ?? true,
      startTime: json['start_time'] != null
          ? DateTime.parse(json['start_time'])
          : null,
      endTime: json['end_time'] != null
          ? DateTime.parse(json['end_time'])
          : null,
      keywords: json['keywords'] != null
          ? List<String>.from(json['keywords'])
          : null,
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'trigger': trigger,
      'response': response,
      'is_active': isActive,
      'start_time': startTime?.toIso8601String(),
      'end_time': endTime?.toIso8601String(),
      'keywords': keywords,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
