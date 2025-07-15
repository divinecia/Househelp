import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseConfig {
  static const String supabaseUrl = 'https://vxvegxuiefezdkzaempn.supabase.co';
  static const String supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4dmVneHVpZWZlemRremFlbXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTQxOTMsImV4cCI6MjA2ODE5MDE5M30.qwzXDLkZ4ObVjtKkeZjPBQ4JwbPoxoB5TJEI7hwGi1I';
  
  static Future<void> initialize() async {
    await Supabase.initialize(
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
    );
  }
  
  static SupabaseClient get client => Supabase.instance.client;
}