class Employee {
  final int id;
  final String employeeNumber;
  final String firstName;
  final String? middleName;
  final String lastName;
  final String nationalId;
  final String kraPin;
  final String? shifNumber;
  final String? nssfNumber;
  final String phoneNumber;
  final String? workEmail;
  final String? departmentName;
  final String? positionTitle;
  final String employmentStatus;

  Employee({
    required this.id,
    required this.employeeNumber,
    required this.firstName,
    this.middleName,
    required this.lastName,
    required this.nationalId,
    required this.kraPin,
    this.shifNumber,
    this.nssfNumber,
    required this.phoneNumber,
    this.workEmail,
    this.departmentName,
    this.positionTitle,
    required this.employmentStatus,
  });

  String get fullName => middleName != null
      ? '$firstName $middleName $lastName'
      : '$firstName $lastName';

  factory Employee.fromJson(Map<String, dynamic> json) {
    return Employee(
      id: json['id'],
      employeeNumber: json['employee_number'],
      firstName: json['first_name'],
      middleName: json['middle_name'],
      lastName: json['last_name'],
      nationalId: json['national_id'],
      kraPin: json['kra_pin'],
      shifNumber: json['shif_number'],
      nssfNumber: json['nssf_number'],
      phoneNumber: json['phone_number'],
      workEmail: json['work_email'],
      departmentName: json['department_name'],
      positionTitle: json['position_title'],
      employmentStatus: json['employment_status'],
    );
  }
}
