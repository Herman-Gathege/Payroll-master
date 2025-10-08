class User {
  final int id;
  final String username;
  final String email;
  final String role;
  final int? employeeId;

  User({
    required this.id,
    required this.username,
    required this.email,
    required this.role,
    this.employeeId,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      username: json['username'],
      email: json['email'],
      role: json['role'],
      employeeId: json['employee_id'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'role': role,
      'employee_id': employeeId,
    };
  }
}
