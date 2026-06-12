import 'package:flutter/material.dart';
import 'package:alu_intercampus_app/onboarding/app_theme.dart';

class StudyGroupsScreen extends StatefulWidget {
  const StudyGroupsScreen({super.key});

  @override
  State<StudyGroupsScreen> createState() => _StudyGroupsScreenState();
}

class _StudyGroupsScreenState extends State<StudyGroupsScreen> {
  final List<_StudyGroup> _groups = [
    _StudyGroup(
      name: 'Quantitative Methods',
      host: 'Brian K.',
      time: 'Tue 6:00 PM',
      location: 'Library Room 3',
      seats: 4,
      totalSeats: 8,
      filled: 4,
    ),
    _StudyGroup(
      name: 'Entrepreneurial Leadership',
      host: 'Aline U.',
      time: 'Wed 7:30 PM',
      location: 'Online · Zoom',
      seats: 2,
      totalSeats: 10,
      filled: 8,
    ),
    _StudyGroup(
      name: 'Data Structures',
      host: 'Tinashe M.',
      time: 'Thu 5:00 PM',
      location: 'Tech Lab',
      seats: 5,
      totalSeats: 12,
      filled: 3,
    ),
    _StudyGroup(
      name: 'Public Speaking Lab',
      host: 'Mariam S.',
      time: 'Fri 4:00 PM',
      location: 'Auditorium',
      seats: 6,
      totalSeats: 15,
      filled: 9,
    ),
  ];

  final Set<int> _joined = {};

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            //   App bar 
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
                    children: const [
                      Text('Study Groups',
                          style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: Colors.white)),
                      Text('Learn together, ship together',
                          style: TextStyle(
                              fontSize: 12, color: Colors.white54)),
                    ],
                  ),
                  const Spacer(),
                  // Create group button
                  Container(
                    width: 36,
                    height: 36,
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.add,
                        color: Colors.black, size: 20),
                  ),
                ],
              ),
            ),

            Divider(
                height: 1, color: Colors.white.withOpacity(0.08)),

            //   Group list 
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: _groups.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (_, i) => _GroupCard(
                  group: _groups[i],
                  isJoined: _joined.contains(i),
                  onJoin: () {
                    setState(() {
                      if (_joined.contains(i)) {
                        _joined.remove(i);
                      } else {
                        _joined.add(i);
                      }
                    });
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

//   Data model 

class _StudyGroup {
  final String name;
  final String host;
  final String time;
  final String location;
  final int seats;
  final int totalSeats;
  final int filled;

  const _StudyGroup({
    required this.name,
    required this.host,
    required this.time,
    required this.location,
    required this.seats,
    required this.totalSeats,
    required this.filled,
  });

  double get fillRatio => filled / totalSeats;
}

//  Card 
class _GroupCard extends StatelessWidget {
  final _StudyGroup group;
  final bool isJoined;
  final VoidCallback onJoin;

  const _GroupCard({
    required this.group,
    required this.isJoined,
    required this.onJoin,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title row + seats badge
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(group.name,
                        style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 16)),
                    const SizedBox(height: 2),
                    Text('Hosted by ${group.host}',
                        style: const TextStyle(
                            color: Colors.white54, fontSize: 12)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF2E7D32),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text('${group.seats} seats',
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w600)),
              ),
            ],
          ),

          const SizedBox(height: 10),

          // Time & location row
          Row(
            children: [
              const Icon(Icons.access_time,
                  color: Colors.white54, size: 14),
              const SizedBox(width: 4),
              Text(group.time,
                  style: const TextStyle(
                      color: Colors.white54, fontSize: 12)),
              const SizedBox(width: 16),
              const Icon(Icons.location_on_outlined,
                  color: Colors.white54, size: 14),
              const SizedBox(width: 4),
              Text(group.location,
                  style: const TextStyle(
                      color: Colors.white54, fontSize: 12)),
            ],
          ),

          const SizedBox(height: 12),

          // Capacity progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: group.fillRatio,
              minHeight: 5,
              backgroundColor: Colors.white12,
              valueColor: const AlwaysStoppedAnimation<Color>(Colors.white70),
            ),
          ),

          const SizedBox(height: 12),

          // Join button
          SizedBox(
            width: double.infinity,
            height: 44,
            child: ElevatedButton(
              onPressed: onJoin,
              style: ElevatedButton.styleFrom(
                backgroundColor:
                    isJoined ? AppColors.gold : Colors.white,
                foregroundColor: Colors.black,
                elevation: 0,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
              ),
              child: Text(
                isJoined ? 'Leave group' : 'Join group',
                style: const TextStyle(
                    fontWeight: FontWeight.w600, fontSize: 14),
              ),
            ),
          ),
        ],
      ),
    );
  }
}