# Project Directory Structure

```
HR-Management-System/
│
├── 📄 README.md                        # Main documentation
├── 📄 INSTALLATION.md                  # Installation guide
├── 📄 QUICK_START.md                   # Quick setup guide
├── 📄 API_DOCUMENTATION.md             # API reference
├── 📄 PROJECT_SUMMARY.md               # Technical summary
├── 📄 FEATURES_CHECKLIST.md            # Feature status
├── 📄 CONTRIBUTING.md                  # Development guide
├── 📄 CHANGELOG.md                     # Version history
├── 📄 LICENSE                          # License terms
├── 📄 IMPLEMENTATION_COMPLETE.md       # Delivery summary
├── 📄 .gitignore                       # Git ignore rules
├── 📄 docker-compose.yml               # Docker orchestration
│
├── 📁 backend/                         # PHP Backend
│   ├── 📁 api/                         # API Endpoints
│   │   └── employees.php               # Employee CRUD API
│   │
│   ├── 📁 config/                      # Configuration
│   │   ├── config.php                  # App config, tax rates
│   │   ├── database.php                # Database connection
│   │   └── .env.example                # Environment template
│   │
│   ├── 📁 controllers/                 # Business Logic
│   │   └── EmployeeController.php      # Employee operations
│   │
│   ├── 📁 models/                      # Data Models
│   │   ├── Employee.php                # Employee model
│   │   ├── Leave.php                   # Leave management
│   │   ├── Attendance.php              # Attendance tracking
│   │   └── Payroll.php                 # Payroll processing
│   │
│   ├── 📁 middleware/                  # Middleware (Auth, etc.)
│   ├── 📁 utils/                       # Helper functions
│   └── 📄 Dockerfile                   # Backend Docker config
│
├── 📁 frontend/                        # React Frontend
│   ├── 📁 public/                      # Static files
│   │
│   ├── 📁 src/
│   │   ├── 📁 components/              # Reusable Components
│   │   │   └── Layout.jsx              # Main app layout
│   │   │
│   │   ├── 📁 contexts/                # React Contexts
│   │   │   └── AuthContext.jsx         # Authentication state
│   │   │
│   │   ├── 📁 pages/                   # Page Components
│   │   │   ├── Dashboard.jsx           # Main dashboard
│   │   │   ├── Employees.jsx           # Employee management
│   │   │   ├── EmployeeDetail.jsx      # Employee details
│   │   │   ├── Recruitment.jsx         # Recruitment module
│   │   │   ├── Leave.jsx               # Leave management
│   │   │   ├── Attendance.jsx          # Attendance tracking
│   │   │   ├── Payroll.jsx             # Payroll management
│   │   │   ├── Performance.jsx         # Performance reviews
│   │   │   ├── Training.jsx            # L&D module
│   │   │   ├── Reports.jsx             # Reports & analytics
│   │   │   ├── Settings.jsx            # System settings
│   │   │   ├── EmployeePortal.jsx      # Self-service portal
│   │   │   └── Login.jsx               # Login page
│   │   │
│   │   ├── 📁 services/                # API Services
│   │   │   ├── api.js                  # HTTP client (Axios)
│   │   │   ├── authService.js          # Auth API calls
│   │   │   └── employeeService.js      # Employee API calls
│   │   │
│   │   ├── 📁 utils/                   # Utility functions
│   │   ├── 📁 assets/                  # Images, icons
│   │   ├── App.jsx                     # Root component
│   │   ├── main.jsx                    # Entry point
│   │   └── index.css                   # Global styles
│   │
│   ├── 📄 package.json                 # Dependencies
│   ├── 📄 vite.config.js               # Vite configuration
│   ├── 📄 index.html                   # HTML template
│   ├── 📄 Dockerfile                   # Frontend Docker config
│   ├── 📄 nginx.conf                   # Nginx config
│   └── 📄 .env.example                 # Environment template
│
├── 📁 mobile/                          # Flutter Mobile App
│   ├── 📁 lib/
│   │   ├── 📁 models/                  # Data Models
│   │   │   ├── user.dart               # User model
│   │   │   └── employee.dart           # Employee model
│   │   │
│   │   ├── 📁 providers/               # State Management
│   │   │   └── auth_provider.dart      # Auth state
│   │   │
│   │   ├── 📁 screens/                 # UI Screens
│   │   │   ├── login_screen.dart       # Login screen
│   │   │   ├── home_screen.dart        # Dashboard
│   │   │   ├── attendance_screen.dart  # Clock in/out
│   │   │   ├── leave_screen.dart       # Leave management
│   │   │   └── profile_screen.dart     # User profile
│   │   │
│   │   ├── 📁 services/                # API Services
│   │   │   └── api_service.dart        # HTTP client
│   │   │
│   │   ├── 📁 widgets/                 # Reusable Widgets
│   │   ├── 📁 utils/                   # Utilities
│   │   │   └── theme.dart              # App theme
│   │   │
│   │   └── main.dart                   # App entry point
│   │
│   ├── 📁 android/                     # Android config
│   ├── 📁 ios/                         # iOS config
│   └── 📄 pubspec.yaml                 # Dependencies
│
├── 📁 database/                        # Database Files
│   ├── 📄 schema.sql                   # Complete DB schema
│   ├── 📁 migrations/                  # Migration files
│   └── 📁 seeds/                       # Seed data
│
└── 📁 uploads/                         # File Uploads (not in git)
    ├── 📁 documents/                   # Employee documents
    ├── 📁 photos/                      # Profile photos
    ├── 📁 payslips/                    # Payslip PDFs
    └── 📁 certificates/                # Training certificates
```

## File Count Summary

### Documentation (11 files)
- README.md
- INSTALLATION.md
- QUICK_START.md
- API_DOCUMENTATION.md
- PROJECT_SUMMARY.md
- FEATURES_CHECKLIST.md
- CONTRIBUTING.md
- CHANGELOG.md
- LICENSE
- IMPLEMENTATION_COMPLETE.md
- DIRECTORY_STRUCTURE.md (this file)

### Backend (11 files)
- 1 API endpoint (employees.php)
- 3 config files
- 1 controller
- 4 models
- 1 Dockerfile
- 1 .env.example

### Frontend (20+ files)
- 1 App component
- 1 Layout component
- 13 page components
- 1 auth context
- 3 service files
- Configuration files
- 1 Dockerfile
- 1 nginx config

### Mobile (12+ files)
- 1 main.dart
- 2 models
- 1 provider
- 5 screens
- 1 service
- 1 theme
- 1 pubspec.yaml

### Database (1 main file)
- schema.sql (with 40+ tables)

### DevOps (3 files)
- docker-compose.yml
- .gitignore
- 2 Dockerfiles

## Key Directories Explained

### `/backend`
Contains the PHP backend API server. This is where all business logic, data processing, and database operations happen. The API follows RESTful principles and returns JSON responses.

**Key files:**
- `models/` - Direct database interaction
- `controllers/` - Business logic layer
- `api/` - HTTP endpoints
- `config/` - Configuration and constants

### `/frontend`
React-based web application. This is the main user interface for HR staff, managers, and administrators. Built with Material-UI for a modern, responsive design.

**Key directories:**
- `pages/` - Each page of the application
- `components/` - Reusable UI components
- `services/` - API communication layer
- `contexts/` - Global state management

### `/mobile`
Flutter mobile application for employee self-service. Allows employees to clock in/out, apply for leave, view payslips, and manage their profile from their smartphones.

**Key directories:**
- `screens/` - Mobile app pages
- `providers/` - State management (Provider pattern)
- `services/` - API communication
- `models/` - Data structures

### `/database`
Contains the complete database schema with all tables, relationships, indexes, and initial data. One comprehensive SQL file creates the entire database structure.

**40+ Tables covering:**
- Employee management
- Leave tracking
- Attendance records
- Payroll processing
- Recruitment
- Performance reviews
- Training records
- Compliance tracking
- And much more...

### `/uploads`
Runtime directory for file uploads (not tracked in git). Stores employee documents, photos, payslips, and certificates. Ensure proper permissions (755) for this directory.

## Technology Stack by Layer

### Backend Layer
- **Language:** PHP 7.4+
- **Database:** MySQL 5.7+
- **Auth:** JWT tokens
- **Architecture:** RESTful API, MVC pattern

### Frontend Layer
- **Framework:** React 18
- **UI Library:** Material-UI
- **Build Tool:** Vite
- **State:** Context API + React Query
- **Router:** React Router v6
- **HTTP Client:** Axios

### Mobile Layer
- **Framework:** Flutter 3.0+
- **Language:** Dart
- **State:** Provider
- **Storage:** flutter_secure_storage
- **HTTP:** http package
- **Platform:** Android & iOS

### Database Layer
- **RDBMS:** MySQL 8.0
- **Schema:** Normalized, indexed
- **Features:** Foreign keys, constraints
- **Size:** 40+ tables

## Important Configuration Files

| File | Purpose |
|------|---------|
| `backend/config/config.php` | Tax rates, app settings, constants |
| `backend/config/database.php` | Database credentials |
| `backend/.env.example` | Backend environment template |
| `frontend/.env.example` | Frontend environment template |
| `frontend/vite.config.js` | Frontend build config |
| `mobile/pubspec.yaml` | Mobile dependencies |
| `docker-compose.yml` | Docker orchestration |

## Entry Points

| Component | Entry Point | Port |
|-----------|-------------|------|
| Backend API | `backend/api/employees.php` | 8000 |
| Frontend | `frontend/index.html` | 3000 |
| Mobile | `mobile/lib/main.dart` | N/A |
| Database | `database/schema.sql` | 3306 |

## Production Deployment

For production, this structure supports:
- ✅ Docker containerization
- ✅ Nginx reverse proxy
- ✅ Apache web server
- ✅ PHP-FPM
- ✅ MySQL replication
- ✅ Load balancing
- ✅ CDN integration

## Development Workflow

1. **Backend Development**
   ```bash
   cd backend
   php -S localhost:8000
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Mobile Development**
   ```bash
   cd mobile
   flutter run
   ```

4. **Docker Development**
   ```bash
   docker-compose up
   ```

## Git Workflow

Excluded from Git (see .gitignore):
- `node_modules/`
- `vendor/`
- `uploads/`
- `.env` files
- Build artifacts
- IDE configs

Tracked in Git:
- Source code
- Documentation
- Configuration templates
- Docker configs
- Database schema

## Backup Strategy

Important directories to backup:
1. `/database` - Schema and data
2. `/uploads` - User files
3. `backend/config/` - Configuration
4. `.env` files - Environment settings

## Notes

- All file paths are relative to project root
- Ensure proper file permissions on Linux/Unix systems
- Windows users: Use forward slashes in paths
- Keep uploads/ directory outside web root in production
- Use environment variables for sensitive data
- Never commit .env files to version control

---

**This structure supports:**
- ✅ Scalability
- ✅ Maintainability
- ✅ Team collaboration
- ✅ Clear separation of concerns
- ✅ Production deployment
- ✅ Development workflow

**Last Updated:** October 2024
