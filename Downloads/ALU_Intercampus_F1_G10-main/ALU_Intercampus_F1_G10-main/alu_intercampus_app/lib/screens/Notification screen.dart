import 'package:flutter/material.dart';
import 'package:alu_intercampus_app/onboarding/app_theme.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final List<_NotifItem> _notifications = [
    _NotifItem(
      icon: Icons.calendar_today_outlined,
      title: 'Your RSVP is confirmed',
      subtitle: 'AI for Social Impact Workshop · Jun 5',
      time: '2h',
      isUnread: true,
    ),
    _NotifItem(
      icon: Icons.alternate_email,
      title: 'Fatima mentioned you',
      subtitle: 'in Entrepreneurship Club',
      time: '5h',
      isUnread: true,
    ),
    _NotifItem(
      icon: Icons.chat_bubble_outline,
      title: 'New message from David',
      subtitle: 'Don\'t forget the meeting',
      time: '1d',
      isUnread: false,
    ),
    _NotifItem(
      icon: Icons.group_outlined,
      title: 'You joined Tech & Innovation Hub',
      subtitle: 'Welcome aboard ',
      time: '2d',
      isUnread: false,
    ),
    _NotifItem(
      icon: Icons.notifications_outlined,
      title: 'Pitch Night starts tomorrow',
      subtitle: 'Kigali Campus · 6:30 PM',
      time: '3d',
      isUnread: false,
    ),
  ];

  int get _unreadCount => _notifications.where((n) => n.isUnread).length;

  void _markAllRead() {
    setState(() {
      for (final n in _notifications) {
        n.isUnread = false;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // App bar 
            Padding(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: const Icon(Icons.arrow_back,
                        color: Colors.white, size: 22),
                  ),
                  const SizedBox(width: 14),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Notifications',
                          style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: Colors.white)),
                      if (_unreadCount > 0)
                        Text('$_unreadCount new updates',
                            style: const TextStyle(
                                fontSize: 12, color: Colors.white54)),
                    ],
                  ),
                  const Spacer(),
                  if (_unreadCount > 0)
                    GestureDetector(
                      onTap: _markAllRead,
                      child: const Text('Mark all read',
                          style: TextStyle(
                              color: Colors.white70, fontSize: 13)),
                    ),
                ],
              ),
            ),

            Divider(
                height: 1, color: Colors.white.withOpacity(0.08)),

            //  List 
            Expanded(
              child: ListView.separated(
                itemCount: _notifications.length,
                separatorBuilder: (_, __) => Divider(
                    height: 1,
                    color: Colors.white.withOpacity(0.06),
                    indent: 64),
                itemBuilder: (_, i) {
                  final n = _notifications[i];
                  return _NotifTile(
                    item: n,
                    onTap: () =>
                        setState(() => n.isUnread = false),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

//  Data model 
class _NotifItem {
  final IconData icon;
  final String title;
  final String subtitle;
  final String time;
  bool isUnread;

  _NotifItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.time,
    required this.isUnread,
  });
}

// Tile 
class _NotifTile extends StatelessWidget {
  final _NotifItem item;
  final VoidCallback onTap;

  const _NotifTile({required this.item, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        color: item.isUnread
            ? Colors.white.withOpacity(0.04)
            : Colors.transparent,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon circle
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: AppColors.cardBackground,
                shape: BoxShape.circle,
              ),
              child: Icon(item.icon, color: Colors.white70, size: 20),
            ),

            const SizedBox(width: 12),

            // Text
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item.title,
                      style: TextStyle(
                          color: Colors.white,
                          fontWeight: item.isUnread
                              ? FontWeight.bold
                              : FontWeight.normal,
                          fontSize: 14)),
                  const SizedBox(height: 3),
                  Text(item.subtitle,
                      style: const TextStyle(
                          color: Colors.white54, fontSize: 12)),
                ],
              ),
            ),

            const SizedBox(width: 8),

            // Time + unread dot
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(item.time,
                    style: const TextStyle(
                        color: Colors.white38, fontSize: 12)),
                if (item.isUnread) ...[
                  const SizedBox(height: 6),
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}