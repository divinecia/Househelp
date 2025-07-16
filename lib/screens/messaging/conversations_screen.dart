import 'package:flutter/material.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../constants/app_constants.dart';
import '../../services/messaging_service.dart';
import '../../models/message_model.dart';
import '../../widgets/common/loading_widget.dart';
import '../../widgets/common/error_widget.dart';
import 'chat_screen.dart';

class ConversationsScreen extends StatefulWidget {
  final String userId;

  const ConversationsScreen({Key? key, required this.userId}) : super(key: key);

  @override
  State<ConversationsScreen> createState() => _ConversationsScreenState();
}

class _ConversationsScreenState extends State<ConversationsScreen> {
  List<Conversation> _conversations = [];
  bool _isLoading = true;
  String _searchQuery = '';
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadConversations();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadConversations() async {
    try {
      setState(() => _isLoading = true);
      final conversations = await MessagingService.getConversations(
        widget.userId,
      );
      setState(() {
        _conversations = conversations;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading conversations: $e')),
        );
      }
    }
  }

  List<Conversation> get _filteredConversations {
    if (_searchQuery.isEmpty) {
      return _conversations;
    }
    return _conversations.where((conversation) {
      final otherParticipant = conversation.participants.firstWhere(
        (p) => p.id != widget.userId,
        orElse: () => conversation.participants.first,
      );
      return otherParticipant.name.toLowerCase().contains(
        _searchQuery.toLowerCase(),
      );
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Messages'),
        backgroundColor: AppConstants.primaryBlue,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              showSearch(
                context: context,
                delegate: ConversationSearchDelegate(
                  conversations: _conversations,
                  userId: widget.userId,
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          Expanded(
            child: _isLoading
                ? const LoadingWidget()
                : _buildConversationsList(),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: TextField(
        controller: _searchController,
        decoration: InputDecoration(
          hintText: 'Search conversations...',
          prefixIcon: const Icon(Icons.search),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    setState(() {
                      _searchQuery = '';
                      _searchController.clear();
                    });
                  },
                )
              : null,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        ),
        onChanged: (value) {
          setState(() {
            _searchQuery = value;
          });
        },
      ),
    );
  }

  Widget _buildConversationsList() {
    final filteredConversations = _filteredConversations;

    if (filteredConversations.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.chat_bubble_outline, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              _searchQuery.isEmpty
                  ? 'No conversations yet'
                  : 'No conversations match your search',
              style: TextStyle(fontSize: 16, color: Colors.grey[600]),
            ),
            if (_searchQuery.isEmpty) ...[
              const SizedBox(height: 16),
              Text(
                'Start a conversation by applying for a job\nor posting a job',
                style: TextStyle(fontSize: 14, color: Colors.grey[500]),
                textAlign: TextAlign.center,
              ),
            ],
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadConversations,
      child: ListView.builder(
        itemCount: filteredConversations.length,
        itemBuilder: (context, index) {
          final conversation = filteredConversations[index];
          return _buildConversationTile(conversation);
        },
      ),
    );
  }

  Widget _buildConversationTile(Conversation conversation) {
    final otherParticipant = conversation.participants.firstWhere(
      (p) => p.id != widget.userId,
      orElse: () => conversation.participants.first,
    );

    final hasUnreadMessages = conversation.unreadCount > 0;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      elevation: 1,
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: AppConstants.primaryBlue,
          child: Text(
            otherParticipant.name.substring(0, 1).toUpperCase(),
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        title: Row(
          children: [
            Expanded(
              child: Text(
                otherParticipant.name,
                style: TextStyle(
                  fontWeight: hasUnreadMessages
                      ? FontWeight.bold
                      : FontWeight.normal,
                ),
              ),
            ),
            if (hasUnreadMessages)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppConstants.primaryBlue,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  conversation.unreadCount.toString(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
          ],
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (conversation.lastMessage != null) ...[
              Text(
                _getMessagePreview(conversation.lastMessage!),
                style: TextStyle(
                  color: hasUnreadMessages ? Colors.black87 : Colors.grey[600],
                  fontWeight: hasUnreadMessages
                      ? FontWeight.w500
                      : FontWeight.normal,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 2),
              Text(
                timeago.format(conversation.lastMessage!.createdAt),
                style: TextStyle(color: Colors.grey[500], fontSize: 12),
              ),
            ],
          ],
        ),
        trailing: PopupMenuButton(
          itemBuilder: (context) => [
            if (hasUnreadMessages)
              PopupMenuItem(
                value: 'mark_read',
                child: Row(
                  children: [
                    Icon(Icons.mark_email_read),
                    SizedBox(width: 8),
                    Text('Mark as Read'),
                  ],
                ),
              ),
            PopupMenuItem(
              value: 'delete',
              child: Row(
                children: [
                  Icon(Icons.delete, color: Colors.red),
                  SizedBox(width: 8),
                  Text('Delete', style: TextStyle(color: Colors.red)),
                ],
              ),
            ),
            PopupMenuItem(
              value: 'block',
              child: Row(
                children: [
                  Icon(Icons.block, color: Colors.orange),
                  SizedBox(width: 8),
                  Text('Block User', style: TextStyle(color: Colors.orange)),
                ],
              ),
            ),
          ],
          onSelected: (value) =>
              _handleConversationAction(conversation, value.toString()),
        ),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ChatScreen(
                userId: widget.userId,
                conversationId: conversation.id,
                otherParticipant: otherParticipant,
              ),
            ),
          ).then((_) => _loadConversations());
        },
      ),
    );
  }

  String _getMessagePreview(Message message) {
    if (message.type == MessageType.text) {
      return message.content;
    } else if (message.type == MessageType.image) {
      return '📷 Image';
    } else if (message.type == MessageType.file) {
      return '📎 File';
    } else if (message.type == MessageType.location) {
      return '📍 Location';
    } else if (message.type == MessageType.system) {
      return message.content;
    }
    return 'Message';
  }

  void _handleConversationAction(Conversation conversation, String action) {
    switch (action) {
      case 'mark_read':
        _markConversationAsRead(conversation);
        break;
      case 'delete':
        _showDeleteConversationDialog(conversation);
        break;
      case 'block':
        _showBlockUserDialog(conversation);
        break;
    }
  }

  void _markConversationAsRead(Conversation conversation) async {
    try {
      await MessagingService.markConversationAsRead(
        conversation.id,
        widget.userId,
      );
      _loadConversations();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error marking conversation as read: $e')),
      );
    }
  }

  void _showDeleteConversationDialog(Conversation conversation) {
    final otherParticipant = conversation.participants.firstWhere(
      (p) => p.id != widget.userId,
      orElse: () => conversation.participants.first,
    );

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Conversation'),
        content: Text(
          'Are you sure you want to delete this conversation with ${otherParticipant.name}?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await MessagingService.deleteConversation(
                  conversation.id,
                  widget.userId,
                );
                _loadConversations();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Conversation deleted')),
                );
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Error deleting conversation: $e')),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  void _showBlockUserDialog(Conversation conversation) {
    final otherParticipant = conversation.participants.firstWhere(
      (p) => p.id != widget.userId,
      orElse: () => conversation.participants.first,
    );

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Block User'),
        content: Text(
          'Are you sure you want to block ${otherParticipant.name}? They will no longer be able to send you messages.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await MessagingService.blockUser(
                  widget.userId,
                  otherParticipant.id,
                );
                _loadConversations();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('${otherParticipant.name} has been blocked'),
                  ),
                );
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Error blocking user: $e')),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
            child: const Text('Block'),
          ),
        ],
      ),
    );
  }
}

class ConversationSearchDelegate extends SearchDelegate {
  final List<Conversation> conversations;
  final String userId;

  ConversationSearchDelegate({
    required this.conversations,
    required this.userId,
  });

  @override
  List<Widget> buildActions(BuildContext context) {
    return [
      IconButton(
        icon: const Icon(Icons.clear),
        onPressed: () {
          query = '';
          showSuggestions(context);
        },
      ),
    ];
  }

  @override
  Widget buildLeading(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.arrow_back),
      onPressed: () {
        close(context, null);
      },
    );
  }

  @override
  Widget buildResults(BuildContext context) {
    return _buildSearchResults();
  }

  @override
  Widget buildSuggestions(BuildContext context) {
    return _buildSearchResults();
  }

  Widget _buildSearchResults() {
    final filteredConversations = conversations.where((conversation) {
      final otherParticipant = conversation.participants.firstWhere(
        (p) => p.id != userId,
        orElse: () => conversation.participants.first,
      );
      return otherParticipant.name.toLowerCase().contains(query.toLowerCase());
    }).toList();

    return ListView.builder(
      itemCount: filteredConversations.length,
      itemBuilder: (context, index) {
        final conversation = filteredConversations[index];
        final otherParticipant = conversation.participants.firstWhere(
          (p) => p.id != userId,
          orElse: () => conversation.participants.first,
        );

        return ListTile(
          leading: CircleAvatar(
            backgroundColor: AppConstants.primaryBlue,
            child: Text(
              otherParticipant.name.substring(0, 1).toUpperCase(),
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          title: Text(otherParticipant.name),
          subtitle: conversation.lastMessage != null
              ? Text(
                  conversation.lastMessage!.content,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                )
              : null,
          onTap: () {
            close(context, null);
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => ChatScreen(
                  userId: userId,
                  conversationId: conversation.id,
                  otherParticipant: otherParticipant,
                ),
              ),
            );
          },
        );
      },
    );
  }
}
