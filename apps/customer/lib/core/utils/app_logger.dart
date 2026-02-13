class AppLogger {
  static const String _tag = 'FaB-O2O';

  static void debug(String message) {
    print('[$_tag] DEBUG: $message');
  }

  static void info(String message) {
    print('[$_tag] INFO: $message');
  }

  static void warning(String message) {
    print('[$_tag] WARNING: $message');
  }

  static void error(String message, [Object? error, StackTrace? stackTrace]) {
    print('[$_tag] ERROR: $message');
    if (error != null) {
      print(error);
    }
    if (stackTrace != null) {
      print(stackTrace);
    }
  }
}
