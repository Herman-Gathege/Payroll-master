import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:8000/api';
  final storage = const FlutterSecureStorage();

  Future<String?> getToken() async {
    return await storage.read(key: 'token');
  }

  Future<void> setToken(String token) async {
    await storage.write(key: 'token', value: token);
  }

  Future<void> clearToken() async {
    await storage.delete(key: 'token');
  }

  Future<Map<String, String>> getHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<dynamic> get(String endpoint) async {
    final headers = await getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else if (response.statusCode == 401) {
      await clearToken();
      throw Exception('Unauthorized');
    } else {
      throw Exception('Failed to load data');
    }
  }

  Future<dynamic> post(String endpoint, Map<String, dynamic> data) async {
    final headers = await getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: json.encode(data),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return json.decode(response.body);
    } else if (response.statusCode == 401) {
      await clearToken();
      throw Exception('Unauthorized');
    } else {
      throw Exception('Request failed');
    }
  }

  Future<dynamic> put(String endpoint, Map<String, dynamic> data) async {
    final headers = await getHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: json.encode(data),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else if (response.statusCode == 401) {
      await clearToken();
      throw Exception('Unauthorized');
    } else {
      throw Exception('Update failed');
    }
  }

  Future<dynamic> delete(String endpoint) async {
    final headers = await getHeaders();
    final response = await http.delete(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else if (response.statusCode == 401) {
      await clearToken();
      throw Exception('Unauthorized');
    } else {
      throw Exception('Delete failed');
    }
  }
}
