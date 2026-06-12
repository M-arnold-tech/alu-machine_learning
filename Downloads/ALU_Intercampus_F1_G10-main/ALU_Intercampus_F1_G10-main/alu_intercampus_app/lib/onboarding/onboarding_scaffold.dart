import 'package:flutter/material.dart';
import 'app_theme.dart';

/// Shared scaffold used by every onboarding screen.
/// Provides the dark background, progress dots, optional Skip,
/// centred content area, and the gold Continue button.
class OnboardingScaffold extends StatelessWidget {
  final int totalSteps;
  final int currentStep; // 0-based index
  final bool showSkip;
  final VoidCallback onContinue;
  final VoidCallback? onSkip;
  final Widget child;

  const OnboardingScaffold({
    super.key,
    required this.totalSteps,
    required this.currentStep,
    required this.onContinue,
    required this.child,
    this.showSkip = false,
    this.onSkip,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            //  Top bar: dots + optional skip 
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Row(
                children: [
                  // Progress dots
                  Row(
                    children: List.generate(totalSteps, (i) {
                      final isActive = i <= currentStep;
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        margin: const EdgeInsets.only(right: 6),
                        height: 6,
                        width: isActive ? 30 : 22,
                        decoration: BoxDecoration(
                          color: isActive
                              ? AppColors.white
                              : AppColors.white.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(3),
                        ),
                      );
                    }),
                  ),
                  const Spacer(),
                  if (showSkip)
                    GestureDetector(
                      onTap: onSkip,
                      child: const Text(
                        'Skip',
                        style: TextStyle(
                          color: AppColors.white,
                          fontSize: 16,
                        ),
                      ),
                    ),
                ],
              ),
            ),

            //  Main content 
            Expanded(child: child),

            //  Continue button 
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
              child: SizedBox(
                width: double.infinity,
                height: 58,
                child: ElevatedButton(
                  onPressed: onContinue,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.gold,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(32),
                    ),
                    elevation: 0,
                  ),
                  child: const Text('Continue', style: AppTextStyles.continueButton),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}