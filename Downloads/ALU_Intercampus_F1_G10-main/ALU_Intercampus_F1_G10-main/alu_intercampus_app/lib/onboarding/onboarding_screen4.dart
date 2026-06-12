import 'package:flutter/material.dart';
import 'app_theme.dart';
import 'onboarding_scaffold.dart';

/// Onboarding Screen 4 — "Which campus is home?"
class OnboardingScreen4 extends StatefulWidget {
  final VoidCallback onContinue;
  final VoidCallback onSkip;

  const OnboardingScreen4({
    super.key,
    required this.onContinue,
    required this.onSkip,
  });

  @override
  State<OnboardingScreen4> createState() => _OnboardingScreen4State();
}

class _OnboardingScreen4State extends State<OnboardingScreen4> {
  String? _selectedCampus;

  final List<String> _campuses = [
    'Kigali Campus',
    'Mauritius Campus',
    'Online / Other',
  ];

  @override
  Widget build(BuildContext context) {
    return OnboardingScaffold(
      totalSteps: 5,
      currentStep: 3,
      showSkip: true,
      onSkip: widget.onSkip,
      onContinue: widget.onContinue,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 24),

            const Text(
              'Which campus is home?',
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.bold,
                color: AppColors.white,
              ),
            ),

            const SizedBox(height: 8),

            const Text(
              'you can change this any time in settings',
              style: AppTextStyles.subtitle,
            ),

            const SizedBox(height: 32),

            // Campus selection tiles
            ..._campuses.map((campus) => _CampusTile(
                  label: campus,
                  isSelected: _selectedCampus == campus,
                  onTap: () => setState(() => _selectedCampus = campus),
                )),
          ],
        ),
      ),
    );
  }
}

class _CampusTile extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _CampusTile({
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
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.gold.withOpacity(0.15)
              : AppColors.cardBackground,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.gold : Colors.transparent,
            width: 1.5,
          ),
        ),
        child: Row(
          children: [
            Text(
              label,
              style: TextStyle(
                color: isSelected ? AppColors.gold : AppColors.white,
                fontSize: 16,
                fontWeight:
                    isSelected ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
            const Spacer(),
            if (isSelected)
              const Icon(Icons.check_circle, color: AppColors.gold, size: 20),
          ],
        ),
      ),
    );
  }
}