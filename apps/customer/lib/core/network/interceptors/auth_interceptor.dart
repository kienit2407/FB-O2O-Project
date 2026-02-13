import 'package:dio/dio.dart';

class AuthInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 401) {
      // Handle unauthorized - logout user
      // TODO: Implement logout logic
    }
    super.onError(err, handler);
  }
}
