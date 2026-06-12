import 'package:flutter/material.dart';
import 'app_theme.dart';
import 'onboarding_scaffold.dart';

/// Onboarding Screen 1 — "One ALU, all campuses"
class OnboardingScreen1 extends StatelessWidget {
  final VoidCallback onContinue;

  const OnboardingScreen1({super.key, required this.onContinue});

  @override
  Widget build(BuildContext context) {
    return OnboardingScaffold(
      totalSteps: 5,
      currentStep: 0,
      onContinue: onContinue,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Gold circle with ALU text
            Container(
              width: 180,
              height: 180,
              decoration: const BoxDecoration(
                color: AppColors.gold,
                shape: BoxShape.circle,
              ),
              child: const Center(
                child: Text(
                  'ALU',
                  style: TextStyle(
                    fontSize: 52,
                    fontWeight: FontWeight.bold,
                    color: AppColors.white,
                    letterSpacing: 2,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 40),

            // Heading
            const Text(
              'One ALU,all campuses',
              style: AppTextStyles.heading,
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 16),

            // Subtitle
            const Text(
              'Discover events, communities and people\nfrom Kigali to Mauritius - all in one place',
              style: AppTextStyles.subtitle,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}