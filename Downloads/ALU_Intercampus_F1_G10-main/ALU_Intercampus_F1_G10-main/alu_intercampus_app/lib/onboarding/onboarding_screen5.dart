import 'package:flutter/material.dart';
import 'app_theme.dart';
import 'onboarding_scaffold.dart';

/// Onboarding Screen 5 — "What are you into?"
/// Users pick at least 3 interest chips to personalise their feed.
class OnboardingScreen5 extends StatefulWidget {
  final VoidCallback onContinue;
  final VoidCallback onSkip;

  const OnboardingScreen5({
    super.key,
    required this.onContinue,
    required this.onSkip,
  });

  @override
  State<OnboardingScreen5> createState() => _OnboardingScreen5State();
}

class _OnboardingScreen5State extends State<OnboardingScreen5> {
  final List<String> _interests = [
    'Entrepreneurship',
    'Tech & AI',
    'Climate',
    'Design',
    'Leadership',
    'Finance',
    'Arts',
    'wellness',
    'Debate',
    'Sports',
  ];

  final Set<String> _selected = {};

  static const int _minRequired = 3;

  bool get _canContinue => _selected.length >= _minRequired;

  @override
  Widget build(BuildContext context) {
    return OnboardingScaffold(
      totalSteps: 5,
      currentStep: 4,
      showSkip: true,
      onSkip: widget.onSkip,
      onContinue: _canContinue ? widget.onContinue : _showMinWarning,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 24),

            const Text(
              'What are you into?',
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.bold,
                color: AppColors.white,
              ),
            ),

            const SizedBox(height: 8),

            Text(
              'Pick at least $_minRequired - we\'ll tailor your feed',
              style: AppTextStyles.subtitle,
            ),

            const SizedBox(height: 28),

            // Wrap chip layout
            Wrap(
              spacing: 10,
              runSpacing: 12,
              children: _interests.map((interest) {
                final isSelected = _selected.contains(interest);
                return _InterestChip(
                  label: interest,
                  isSelected: isSelected,
                  onTap: () {
                    setState(() {
                      isSelected
                          ? _selected.remove(interest)
                          : _selected.add(interest);
                    });
                  },
                );
              }).toList(),
            ),

            const SizedBox(height: 16),

            // Minimum selection hint
            if (_selected.isNotEmpty && !_canContinue)
              Text(
                'Select ${_minRequired - _selected.length} more',
                style: const TextStyle(
                  color: AppColors.gold,
                  fontSize: 13,
                ),
              ),
          ],
        ),
      ),
    );
  }

  void _showMinWarning() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Please select at least $_minRequired interests',
          style: const TextStyle(color: AppColors.white),
        ),
        backgroundColor: AppColors.cardBackground,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}

class _InterestChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _InterestChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.gold : AppColors.cardBackground,
          borderRadius: BorderRadius.circular(32),
          border: Border.all(
            color: isSelected ? AppColors.gold : Colors.transparent,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? const Color(0xFF1A1A1A) : AppColors.white,
            fontWeight:
                isSelected ? FontWeight.w600 : FontWeight.normal,
            fontSize: 14,
          ),
        ),
      ),
    );
  }
}