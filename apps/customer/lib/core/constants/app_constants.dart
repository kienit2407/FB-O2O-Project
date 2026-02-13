class AppConstants {
  static const String appName = 'FaB-O2O Customer';
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000',
  );
  static const Duration requestTimeout = Duration(seconds: 30);
}
