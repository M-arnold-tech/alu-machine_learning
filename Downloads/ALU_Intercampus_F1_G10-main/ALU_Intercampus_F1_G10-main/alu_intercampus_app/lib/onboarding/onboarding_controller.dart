import 'package:flutter/material.dart';
import 'package:alu_intercampus_app/onboarding/onboarding_screen1.dart';
import 'package:alu_intercampus_app/onboarding/onboarding_screen2.dart';
import 'package:alu_intercampus_app/onboarding/onboarding_screen3.dart';
import 'package:alu_intercampus_app/onboarding/onboarding_screen4.dart';
import 'package:alu_intercampus_app/onboarding/onboarding_screen5.dart';
import 'package:alu_intercampus_app/screens/Main nav.dart';

/// Root widget that hosts all 5 onboarding screens inside a [PageView].
/// Replace the `_finishOnboarding` body with your actual navigation logic
/// (e.g. Navigator.pushReplacementNamed(context, '/home')).
class OnboardingController extends StatefulWidget {
  const OnboardingController({super.key});

  @override
  State<OnboardingController> createState() => _OnboardingControllerState();
}

class _OnboardingControllerState extends State<OnboardingController> {
  final PageController _pageController = PageController();

  void _nextPage() {
    final current = _pageController.page?.round() ?? 0;
    if (current < 4) {
      _pageController.animateToPage(
        current + 1,
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOut,
      );
    } else {
      _finishOnboarding();
    }
  }

  void _finishOnboarding() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const MainNav()),
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PageView(
      controller: _pageController,
      physics: const NeverScrollableScrollPhysics(), // dots-driven only
      children: [
        OnboardingScreen1(onContinue: _nextPage),
        OnboardingScreen2(onContinue: _nextPage),
        OnboardingScreen3(onContinue: _nextPage),
        OnboardingScreen4(
          onContinue: _nextPage,
          onSkip: _nextPage,
        ),
        OnboardingScreen5(
          onContinue: _finishOnboarding,
          onSkip: _finishOnboarding,
        ),
      ],
    );
  }
}