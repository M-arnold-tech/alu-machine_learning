import 'package:flutter/material.dart';
import 'app_theme.dart';
import 'onboarding_scaffold.dart';

/// Onboarding Screen 3 — "Lead the change"
/// Gold circle with a person + badge icon in the centre.
class OnboardingScreen3 extends StatelessWidget {
  final VoidCallback onContinue;

  const OnboardingScreen3({super.key, required this.onContinue});

  @override
  Widget build(BuildContext context) {
    return OnboardingScaffold(
      totalSteps: 5,
      currentStep: 2,
      onContinue: onContinue,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Gold circle with icon
            Container(
              width: 180,
              height: 180,
              decoration: const BoxDecoration(
                color: AppColors.gold,
                shape: BoxShape.circle,
              ),
              child: const Center(
                child: _LeaderIcon(),
              ),
            ),

            const SizedBox(height: 40),

            const Text(
              'lead the change',
              style: AppTextStyles.heading,
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 16),

            const Text(
              'Pitch ideas, host events and grow\nopportunities that make real impact.',
              style: AppTextStyles.subtitle,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

/// Custom stacked icon: person silhouette + award badge overlay.
class _LeaderIcon extends StatelessWidget {
  const _LeaderIcon();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 90,
      height: 90,
      child: Stack(
        children: [
          // Person icon
          const Positioned.fill(
            child: Icon(
              Icons.person_outline,
              size: 80,
              color: Color(0xFF1A1A1A),
            ),
          ),
          // Badge overlay at bottom-right
          Positioned(
            right: 0,
            bottom: 0,
            child: Container(
              padding: const EdgeInsets.all(2),
              decoration: const BoxDecoration(
                color: AppColors.gold,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.military_tech_outlined,
                size: 26,
                color: Color(0xFF1A1A1A),
              ),
            ),
          ),
        ],
      ),
    );
  }
}