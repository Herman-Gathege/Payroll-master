# HR Management System

A comprehensive HR Management System built with React (Frontend), PHP (Backend), and Flutter (Mobile), specifically designed for Kenyan businesses with full compliance to local regulations.

## Features

### Core Modules

#### 1. Employee Database
- Digital staff records with ID, KRA PIN, SHIF, NSSF
- Bank account and M-Pesa payment details
- Next of kin information
- Document management

#### 2. Recruitment Management
- Job posting management
- Applicant tracking system (ATS)
- CV parsing and candidate ranking
- Interview scheduling and tracking
- Integration with BrighterMonday and LinkedIn

#### 3. Onboarding
- Digital onboarding checklist
- Contract management
- KRA PIN, SHIF, NSSF registration tracking
- Equipment issuance tracking

#### 4. Leave Management
- Annual leave (21 days)
- Sick leave (14 days with medical certificate)
- Maternity leave (90 days)
- Paternity leave (14 days)
- Compassionate and study leave
- Leave balance tracking
- Approval workflows

#### 5. Attendance & Time Tracking
- Clock in/out via mobile, web, or biometric
- GPS location tracking
- Overtime calculation
- Shift scheduling
- Biometric device integration

#### 6. Payroll & Compensation
- Kenya minimum wage compliance
- PAYE calculation (2024 tax bands)
- SHIF deduction (2.75% of gross salary)
- NSSF contribution (6% up to KES 36,000)
- Housing levy (1.5%)
- Automated payslip generation
- Bank and M-Pesa payment support

#### 7. Benefits Administration
- SHIF (formerly NHIF) management
- NSSF tracking
- SHA registration
- Private insurance tracking
- Pension scheme management

#### 8. Performance Management
- KPI-based appraisals
- Goal setting and tracking
- 360-degree reviews
- Rating templates

#### 9. Learning & Development
- Training program management
- NITA levy utilization tracking
- Certificate management
- Training history

#### 10. Compliance & Legal
- Employment Act 2007 compliance
- OSHA safety incident tracking
- Disciplinary records management
- Grievance handling
- Exit interviews

#### 11. Self-Service Portals
- **Employee Portal**: Leave requests, payslip downloads, profile updates
- **Manager Portal**: Approvals, team management, expense authorization

#### 12. Additional Features
- Succession planning
- Remote/hybrid work tracking
- Headcount forecasting
- Employee engagement surveys
- Recognition and rewards
- Wellness programs
- Internal communication portal
- Expense and reimbursement management

## Technology Stack

### Backend (PHP)
- PHP 7.4+
- MySQL 5.7+
- RESTful API architecture
- JWT authentication

### Frontend (React)
- React 18
- Material-UI components
- React Router for navigation
- React Query for data fetching
- Axios for API calls

### Mobile (Flutter)
- Flutter 3.0+
- Provider for state management
- HTTP package for API calls
- Secure storage for tokens
- Geolocator for attendance tracking

## Installation

### Prerequisites
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Node.js 16+ and npm
- Flutter 3.0+ (for mobile development)
- Composer (PHP package manager)

### Backend Setup

1. **Database Setup**
```bash
# Create database
mysql -u root -p
CREATE DATABASE hr_management_system;

# Import schema
mysql -u root -p hr_management_system < database/schema.sql
```

2. **Configure Database**
Edit `backend/config/database.php` with your database credentials:
```php
private $host = "localhost";
private $database_name = "hr_management_system";
private $username = "your_username";
private $password = "your_password";
```

3. **Configure Application**
Edit `backend/config/config.php`:
- Set `JWT_SECRET_KEY` to a secure random string
- Configure upload directories
- Adjust PAYE, NSSF, SHIF rates as needed

4. **Start PHP Server**
```bash
cd backend
php -S localhost:8000
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Configure API Endpoint**
Create `.env` file in frontend directory:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

3. **Start Development Server**
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Mobile Setup

1. **Install Dependencies**
```bash
cd mobile
flutter pub get
```

2. **Configure API Endpoint**
Edit `mobile/lib/services/api_service.dart`:
```dart
static const String baseUrl = 'http://your-server-ip:8000/api';
```

3. **Run the App**
```bash
# For Android
flutter run

# For iOS
flutter run
```

## Default Login Credentials

After setting up the database, you'll need to create an admin user. Run this SQL:

```sql
INSERT INTO users (username, email, password_hash, role, is_active)
VALUES ('admin', 'admin@company.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1);
-- Default password: password (Change this immediately!)
```

## Kenyan Compliance

This system is designed to comply with:

### Employment Act 2007
- Minimum wage enforcement
- Working hours (8 hours/day, 5 days/week)
- Leave entitlements
- Contract management
- Termination procedures

### Tax Regulations (KRA)
- PAYE calculation based on 2024 tax bands
- Monthly tax remittance tracking
- P9 form generation
- KRA PIN validation

### SHIF (Social Health Insurance Fund)
- Formerly NHIF
- 2.75% of gross salary deduction
- Registration tracking
- Compliance reporting

### NSSF (National Social Security Fund)
- 6% contribution rate
- Tier I (KES 7,000) and Tier II (KES 36,000) limits
- Automated calculation

### Housing Levy
- 1.5% of gross salary
- Automated deduction and tracking

### OSHA (Occupational Safety and Health Act)
- Incident reporting
- Safety drill tracking
- Workplace safety management

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - List all employees
- `GET /api/employees?id={id}` - Get employee by ID
- `POST /api/employees` - Create employee
- `PUT /api/employees` - Update employee
- `DELETE /api/employees?id={id}` - Terminate employee
- `GET /api/employees?search={keyword}` - Search employees

### Leave
- `GET /api/leave` - List all leave applications
- `POST /api/leave` - Apply for leave
- `PUT /api/leave/approve` - Approve leave
- `PUT /api/leave/reject` - Reject leave
- `GET /api/leave/balance?employee_id={id}` - Get leave balance

### Attendance
- `POST /api/attendance/clock-in` - Clock in
- `POST /api/attendance/clock-out` - Clock out
- `GET /api/attendance?employee_id={id}&month={m}&year={y}` - Get attendance

### Payroll
- `POST /api/payroll/generate` - Generate payroll
- `GET /api/payroll?month={m}&year={y}` - Get payroll by month
- `GET /api/payroll/payslip?employee_id={id}` - Get employee payslips

## Project Structure

```
.
├── backend/                 # PHP Backend
│   ├── api/                # API endpoints
│   ├── config/             # Configuration files
│   ├── controllers/        # Business logic
│   ├── models/            # Database models
│   ├── middleware/        # Authentication, validation
│   └── utils/             # Helper functions
│
├── frontend/               # React Frontend
│   ├── public/            # Static files
│   └── src/
│       ├── components/    # Reusable components
│       ├── contexts/      # React contexts
│       ├── pages/         # Page components
│       ├── services/      # API services
│       └── utils/         # Utility functions
│
├── mobile/                # Flutter Mobile App
│   └── lib/
│       ├── models/        # Data models
│       ├── providers/     # State management
│       ├── screens/       # UI screens
│       ├── services/      # API services
│       └── widgets/       # Reusable widgets
│
└── database/              # Database files
    ├── schema.sql         # Database schema
    └── migrations/        # Migration files
```

## Security

- JWT token-based authentication
- Password hashing using bcrypt
- SQL injection prevention using prepared statements
- XSS protection
- CORS configuration
- Secure file upload handling
- Role-based access control

## Support

For issues and questions, please contact your system administrator.

## License

Proprietary software. All rights reserved.

## Changelog

### Version 1.0.0 (2024)
- Initial release
- Full SHIF compliance (replaced NHIF references)
- Kenya Employment Act 2007 compliance
- PAYE, NSSF, Housing Levy calculations
- Employee self-service portal
- Manager approval workflows
- Mobile app for attendance and leave
- Biometric device integration ready
