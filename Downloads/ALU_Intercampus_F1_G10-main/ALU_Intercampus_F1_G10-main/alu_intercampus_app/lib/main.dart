import 'package:flutter/material.dart';
import 'onboarding/onboarding_controller.dart';
import 'onboarding/app_theme.dart';

void main() {
  runApp(const AluApp());
}

class AluApp extends StatelessWidget {
  const AluApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ALU',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: AppColors.background,
        fontFamily: 'SF Pro Display', // replace with your project font
        colorScheme: ColorScheme.dark(
          primary: AppColors.gold,
          surface: AppColors.background,
        ),
      ),
      home: const OnboardingController(),
    );
  }
}