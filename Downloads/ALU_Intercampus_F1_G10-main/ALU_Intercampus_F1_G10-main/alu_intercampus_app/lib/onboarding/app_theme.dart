import 'package:flutter/material.dart';

class AppColors {
  static const Color background = Color(0xFF0B1437);
  static const Color gold = Color(0xFFC9A227);
  static const Color cardBackground = Color(0xFF1A2347);
  static const Color white = Colors.white;
  static const Color subtitleGrey = Color(0xFFCCCCCC);
}

class AppTextStyles {
  static const TextStyle heading = TextStyle(
    fontSize: 26,
    fontWeight: FontWeight.bold,
    color: AppColors.white,
  );

  static const TextStyle subtitle = TextStyle(
    fontSize: 15,
    color: AppColors.subtitleGrey,
    height: 1.5,
  );

  static const TextStyle continueButton = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: Color(0xFF1A1A1A),
  );
}