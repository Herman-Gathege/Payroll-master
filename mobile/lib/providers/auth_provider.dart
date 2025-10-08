import 'package:flutter/foundation.dart';
import 'package:hr_mobile/models/user.dart';
import 'package:hr_mobile/services/api_service.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  bool _isAuthenticated = false;
  final ApiService _apiService = ApiService();

  User? get user => _user;
  bool get isAuthenticated => _isAuthenticated;

  Future<bool> login(String username, String password) async {
    try {
      final response = await _apiService.post('/auth/login', {
        'username': username,
        'password': password,
      });

      if (response['token'] != null) {
        await _apiService.setToken(response['token']);
        _user = User.fromJson(response['user']);
        _isAuthenticated = true;
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Login error: $e');
      return false;
    }
  }

  Future<void> logout() async {
    await _apiService.clearToken();
    _user = null;
    _isAuthenticated = false;
    notifyListeners();
  }

  Future<void> checkAuthStatus() async {
    final token = await _apiService.getToken();
    if (token != null) {
      try {
        final response = await _apiService.get('/auth/me');
        _user = User.fromJson(response);
        _isAuthenticated = true;
      } catch (e) {
        await logout();
      }
    }
    notifyListeners();
  }
}
