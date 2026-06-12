import 'package:flutter/material.dart';
import 'app_theme.dart';
import 'onboarding_scaffold.dart';

/// Onboarding Screen 2 — "Build your network"
/// Features an oval/rounded-rectangle photo in the centre.
class OnboardingScreen2 extends StatelessWidget {
  final VoidCallback onContinue;

  const OnboardingScreen2({super.key, required this.onContinue});

  @override
  Widget build(BuildContext context) {
    return OnboardingScaffold(
      totalSteps: 5,
      currentStep: 1,
      onContinue: onContinue,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Oval image — replace AssetImage path with your actual asset
            ClipRRect(
              borderRadius: BorderRadius.circular(120),
              child: Container(
                width: 260,
                height: 200,
                color: AppColors.cardBackground,
                child: Image.asset(
                  'assets/images/connecting.jpg',
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => const _PlaceholderNetworking(),
                ),
              ),
            ),

            const SizedBox(height: 40),

            const Text(
              'Build your network',
              style: AppTextStyles.heading,
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 16),

            const Text(
              'Join clubs, find mentors and start study\ngroup with peers across the continent.',
              style: AppTextStyles.subtitle,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

/// Fallback widget shown when the asset image is not yet added.
class _PlaceholderNetworking extends StatelessWidget {
  const _PlaceholderNetworking();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.cardBackground,
      child: const Center(
        child: Icon(
          Icons.people_alt_outlined,
          size: 64,
          color: AppColors.gold,
        ),
      ),
    );
  }
}