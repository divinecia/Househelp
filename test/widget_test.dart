// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:househelp/main.dart';

void main() {
  testWidgets('House Help app smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const HouseHelpApp());

    // Verify that the app bar shows the correct title.
    expect(find.text('House Help'), findsOneWidget);

    // Verify that the welcome message is shown.
    expect(find.text('Welcome to House Help!'), findsOneWidget);

    // Verify that the bottom navigation bar is present.
    expect(find.byType(BottomNavigationBar), findsOneWidget);

    // Verify that the dashboard cards are present.
    expect(find.text('Quick Tasks'), findsOneWidget);
    expect(find.text('Schedule'), findsOneWidget);
    expect(find.text('Reminders'), findsOneWidget);
    expect(find.text('Statistics'), findsOneWidget);
  });
}
