# API Documentation - HR Management System

Base URL: `http://your-domain.com/api`

## Authentication

All endpoints except login require a JWT token in the Authorization header:
```
Authorization: Bearer {token}
```

### POST /auth/login
Login to the system

**Request:**
```json
{
  "username": "admin",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@company.com",
    "role": "admin",
    "employee_id": null
  }
}
```

## Employees

### GET /employees
Get all active employees

**Response:**
```json
{
  "records": [
    {
      "id": 1,
      "employee_number": "EMP20240001",
      "full_name": "John Doe",
      "department_name": "IT",
      "position_title": "Software Developer",
      "employment_status": "active"
    }
  ]
}
```

### GET /employees?id={id}
Get single employee details

**Response:**
```json
{
  "id": 1,
  "employee_number": "EMP20240001",
  "first_name": "John",
  "last_name": "Doe",
  "national_id": "12345678",
  "kra_pin": "A001234567X",
  "shif_number": "123456789",
  "nssf_number": "987654321",
  "phone_number": "+254712345678",
  "work_email": "john.doe@company.com"
}
```

### POST /employees
Create new employee

**Request:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "national_id": "87654321",
  "kra_pin": "A009876543Z",
  "date_of_birth": "1990-05-15",
  "gender": "female",
  "phone_number": "+254723456789",
  "employment_type": "permanent",
  "hire_date": "2024-01-15",
  "department_id": 1,
  "position_id": 2
}
```

### PUT /employees
Update employee

**Request:**
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+254712345678",
  "employment_status": "active"
}
```

### DELETE /employees?id={id}
Terminate employee (soft delete)

## Leave Management

### GET /leave
Get all leave applications

**Response:**
```json
{
  "records": [
    {
      "id": 1,
      "employee_name": "John Doe",
      "leave_type_name": "Annual Leave",
      "start_date": "2024-12-20",
      "end_date": "2024-12-31",
      "days_requested": 10,
      "status": "pending"
    }
  ]
}
```

### POST /leave
Apply for leave

**Request:**
```json
{
  "employee_id": 1,
  "leave_type_id": 1,
  "start_date": "2024-12-20",
  "end_date": "2024-12-31",
  "days_requested": 10,
  "reason": "Family vacation"
}
```

### PUT /leave/approve
Approve leave application

**Request:**
```json
{
  "id": 1,
  "reviewed_by": 2,
  "comments": "Approved"
}
```

### PUT /leave/reject
Reject leave application

**Request:**
```json
{
  "id": 1,
  "reviewed_by": 2,
  "comments": "Insufficient leave balance"
}
```

### GET /leave/balance?employee_id={id}&year={year}
Get leave balance

**Response:**
```json
{
  "records": [
    {
      "leave_type_name": "Annual Leave",
      "total_days": 21,
      "days_taken": 5,
      "days_pending": 2,
      "days_remaining": 14
    }
  ]
}
```

## Attendance

### POST /attendance/clock-in
Clock in

**Request:**
```json
{
  "employee_id": 1,
  "method": "mobile",
  "latitude": -1.286389,
  "longitude": 36.817223,
  "location": "Nairobi Office"
}
```

### POST /attendance/clock-out
Clock out

**Request:**
```json
{
  "employee_id": 1,
  "method": "mobile",
  "latitude": -1.286389,
  "longitude": 36.817223,
  "location": "Nairobi Office"
}
```

### GET /attendance?employee_id={id}&month={m}&year={y}
Get attendance records

**Response:**
```json
{
  "records": [
    {
      "attendance_date": "2024-10-01",
      "clock_in": "2024-10-01 08:00:00",
      "clock_out": "2024-10-01 17:00:00",
      "work_hours": 8.5,
      "overtime_hours": 0.5,
      "status": "present"
    }
  ]
}
```

### GET /attendance/summary?employee_id={id}&month={m}&year={y}
Get attendance summary

**Response:**
```json
{
  "total_days": 22,
  "present_days": 20,
  "absent_days": 2,
  "late_days": 3,
  "total_work_hours": 168,
  "total_overtime_hours": 5
}
```

## Payroll

### POST /payroll/generate
Generate payroll for employee

**Request:**
```json
{
  "employee_id": 1,
  "month": 10,
  "year": 2024
}
```

**Response:**
```json
{
  "message": "Payroll generated successfully",
  "payroll": {
    "employee_id": 1,
    "period_month": 10,
    "period_year": 2024,
    "basic_salary": 50000,
    "allowances": 15000,
    "gross_pay": 65000,
    "paye": 9750,
    "shif_deduction": 1787.50,
    "nssf_deduction": 2160,
    "housing_levy": 975,
    "total_deductions": 14672.50,
    "net_pay": 50327.50
  }
}
```

### GET /payroll?month={m}&year={y}
Get payroll for all employees

**Response:**
```json
{
  "records": [
    {
      "employee_name": "John Doe",
      "employee_number": "EMP20240001",
      "gross_pay": 65000,
      "total_deductions": 14672.50,
      "net_pay": 50327.50,
      "status": "processed"
    }
  ]
}
```

### GET /payroll/payslip?employee_id={id}
Get employee payslips

**Response:**
```json
{
  "records": [
    {
      "period_month": 10,
      "period_year": 2024,
      "gross_pay": 65000,
      "net_pay": 50327.50,
      "payment_date": "2024-10-28"
    }
  ]
}
```

## Recruitment

### POST /recruitment/jobs
Create job posting

**Request:**
```json
{
  "position_id": 5,
  "job_title": "Senior Developer",
  "description": "We are looking for...",
  "requirements": "5+ years experience...",
  "application_deadline": "2024-11-30",
  "vacancies": 2,
  "employment_type": "permanent",
  "salary_range": "KES 80,000 - 120,000"
}
```

### POST /recruitment/applicants
Submit job application

**Request:**
```json
{
  "job_posting_id": 1,
  "first_name": "Alice",
  "last_name": "Johnson",
  "email": "alice@email.com",
  "phone_number": "+254734567890",
  "cv_file_path": "/uploads/cv_alice.pdf",
  "years_of_experience": 6,
  "expected_salary": 100000
}
```

### GET /recruitment/applicants?job_posting_id={id}
Get applicants for job

### POST /recruitment/interviews
Schedule interview

**Request:**
```json
{
  "applicant_id": 5,
  "interview_type": "technical",
  "interview_date": "2024-11-05 10:00:00",
  "location": "Head Office",
  "interviewer_ids": "2,3,4"
}
```

## Performance

### POST /performance/reviews
Create performance review

**Request:**
```json
{
  "employee_id": 1,
  "reviewer_id": 2,
  "template_id": 1,
  "review_period_start": "2024-01-01",
  "review_period_end": "2024-06-30",
  "overall_rating": 4.5,
  "strengths": "Excellent technical skills...",
  "areas_for_improvement": "Time management..."
}
```

## Reports

### GET /reports/headcount
Get headcount report

**Response:**
```json
{
  "total_employees": 245,
  "by_department": [
    {
      "department": "IT",
      "count": 45
    }
  ],
  "by_employment_type": [
    {
      "type": "permanent",
      "count": 200
    }
  ]
}
```

### GET /reports/turnover?year={year}
Get turnover report

### GET /reports/payroll-summary?month={m}&year={y}
Get payroll summary

**Response:**
```json
{
  "total_employees": 245,
  "total_gross_pay": 15925000,
  "total_paye": 2388750,
  "total_shif": 437937.50,
  "total_nssf": 529200,
  "total_housing_levy": 238875,
  "total_net_pay": 12330237.50
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "message": "Error description",
  "error_code": "ERROR_CODE"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

- Maximum 100 requests per minute per IP
- Exceeded limit returns 429 status code

## Pagination

Endpoints returning lists support pagination:

**Request:**
```
GET /employees?page=2&limit=50
```

**Response:**
```json
{
  "records": [...],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 245,
    "total_pages": 5
  }
}
```

## Webhooks

System supports webhooks for real-time notifications:

### Available Events
- `employee.created`
- `employee.updated`
- `leave.applied`
- `leave.approved`
- `attendance.clocked_in`
- `payroll.generated`

Configure webhooks in Settings > Integrations
