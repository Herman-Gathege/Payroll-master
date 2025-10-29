# Hosting Architecture Overview

## Current Setup (Local Development)

```
┌─────────────────────────────────────────────────┐
│           Your Computer (Windows)                │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │         XAMPP Control Panel              │   │
│  │  ┌────────────┐      ┌────────────┐    │   │
│  │  │   Apache   │      │   MySQL    │    │   │
│  │  │  Port 80   │      │  Port 3306 │    │   │
│  │  └─────┬──────┘      └──────┬─────┘    │   │
│  └────────┼────────────────────┼──────────┘   │
│           │                    │               │
│           │                    │               │
│  ┌────────▼────────┐  ┌────────▼─────────┐   │
│  │    Backend      │  │    Database      │   │
│  │  C:\xampp\      │  │  hr_management_  │   │
│  │  htdocs\        │  │  system          │   │
│  │  backend\       │  │                  │   │
│  │  - auth.php     │  │  - 24 tables     │   │
│  │  - config/      │  │  - users         │   │
│  │  - models/      │  │  - payroll       │   │
│  └─────────────────┘  └──────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │         Frontend (React)                 │  │
│  │    C:\xampp\htdocs\hrms\                │  │
│  │                                          │  │
│  │    ┌──────────┐  ┌──────────┐          │  │
│  │    │ Employer │  │ Employee │          │  │
│  │    │  Portal  │  │  Portal  │          │  │
│  │    └──────────┘  └──────────┘          │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│         Access: http://localhost/hrms/          │
└─────────────────────────────────────────────────┘
```

---

## Production Setup - Shared Hosting

```
┌──────────────────────────────────────────────────────┐
│              Hosting Provider (cPanel)                │
│                                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │             Apache Web Server                   │ │
│  │                                                 │ │
│  │  public_html/                                   │ │
│  │  ├── index.html  ◄──────┐                      │ │
│  │  ├── assets/            │ Frontend             │ │
│  │  ├── .htaccess          │ (React Build)        │ │
│  │  │                      │                      │ │
│  │  └── api/               │                      │ │
│  │      ├── auth.php   ◄───┼───┐                 │ │
│  │      ├── config/        │   │ Backend         │ │
│  │      └── models/        │   │ (PHP)           │ │
│  └─────────────────────────┼───┼──────────────────┘ │
│                            │   │                    │
│  ┌─────────────────────────┼───┼──────────────────┐ │
│  │         MySQL Database  │   │                  │ │
│  │                         │   │                  │ │
│  │  username_hrms ◄────────┘   │                  │ │
│  │  ├── employer_users          │                  │ │
│  │  ├── employee_users          │                  │ │
│  │  ├── payroll                 │                  │ │
│  │  └── ...                     │                  │ │
│  └──────────────────────────────┘                  │
│                                                     │
│         Access: https://yourdomain.com              │
└─────────────────────────────────────────────────────┘
         ▲
         │
         │ HTTPS/SSL
         │
    ┌────┴────┐
    │ Internet │
    └────┬────┘
         │
    ┌────▼────────┐
    │   Users'    │
    │  Browsers   │
    └─────────────┘
```

---

## Production Setup - VPS (DigitalOcean, Vultr, etc.)

```
┌───────────────────────────────────────────────────────────┐
│           VPS Server (Ubuntu 22.04)                        │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                    Firewall (UFW)                     │ │
│  │   Port 80 (HTTP)  ✓                                   │ │
│  │   Port 443 (HTTPS) ✓                                  │ │
│  │   Port 22 (SSH)    ✓                                  │ │
│  └───────────────────────┬──────────────────────────────┘ │
│                          │                                │
│  ┌───────────────────────▼──────────────────────────────┐ │
│  │            Apache 2.4 + Let's Encrypt SSL            │ │
│  │                                                       │ │
│  │  /var/www/hrms/                                       │ │
│  │  ├── index.html                                       │ │
│  │  ├── assets/                                          │ │
│  │  │   ├── js/                                          │ │
│  │  │   ├── css/                                         │ │
│  │  │   └── images/                                      │ │
│  │  ├── .htaccess (SPA routing)                          │ │
│  │  │                                                    │ │
│  │  └── api/                                             │ │
│  │      ├── employer/                                    │ │
│  │      │   └── auth.php                                 │ │
│  │      ├── employee/                                    │ │
│  │      │   └── auth.php                                 │ │
│  │      ├── config/                                      │ │
│  │      │   └── database.php                             │ │
│  │      └── models/                                      │ │
│  └───────────────────────┬───────────────────────────────┘ │
│                          │                                │
│  ┌───────────────────────▼───────────────────────────────┐ │
│  │         MySQL 8.0 Server (localhost:3306)             │ │
│  │                                                        │ │
│  │  Database: hrms_production                            │ │
│  │  User: hrms_user                                      │ │
│  │  ├── 24 Tables                                        │ │
│  │  ├── Indexes                                          │ │
│  │  └── Stored Procedures                                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                            │
│         IP: 123.45.67.89                                   │
│         Domain: hrms.yourdomain.com                        │
└────────────────────────────────────────────────────────────┘
            ▲
            │ HTTPS (Port 443)
            │ SSL/TLS Encrypted
            │
   ┌────────┴────────┐
   │  Load Balancer  │ (Optional for scale)
   │   (CloudFlare)  │
   └────────┬────────┘
            │
       ┌────▼────┐
       │ Internet │
       └────┬────┘
            │
   ┌────────▼────────────┐
   │    Users Worldwide  │
   │  ├── Desktop        │
   │  ├── Mobile         │
   │  └── Tablet         │
   └─────────────────────┘
```

---

## Docker Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│                Docker Host (Any OS)                       │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Docker Compose Network                  │ │
│  │                                                      │ │
│  │  ┌───────────────────┐  ┌──────────────────────┐  │ │
│  │  │   Frontend        │  │     Backend          │  │ │
│  │  │   Container       │  │     Container        │  │ │
│  │  │                   │  │                      │  │ │
│  │  │  Nginx 1.25       │  │  Apache + PHP 8.2    │  │ │
│  │  │  Port: 3000       │  │  Port: 8080          │  │ │
│  │  │                   │  │                      │  │ │
│  │  │  Serves:          │  │  Serves:             │  │ │
│  │  │  - React App      │  │  - REST API          │  │ │
│  │  │  - Static Assets  │  │  - Auth Endpoints    │  │ │
│  │  └─────────┬─────────┘  └──────────┬───────────┘  │ │
│  │            │                       │              │ │
│  │            │                       │              │ │
│  │            └───────────┬───────────┘              │ │
│  │                        │                          │ │
│  │                        │                          │ │
│  │            ┌───────────▼───────────┐              │ │
│  │            │    MySQL Container    │              │ │
│  │            │                       │              │ │
│  │            │  MySQL 8.0            │              │ │
│  │            │  Port: 3306           │              │ │
│  │            │                       │              │ │
│  │            │  Persistent Volume:   │              │ │
│  │            │  ./mysql-data:/var/   │              │ │
│  │            │  lib/mysql            │              │ │
│  │            └───────────────────────┘              │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│         Access: http://localhost:3000                   │
│                 http://localhost:8080/api               │
└─────────────────────────────────────────────────────────┘

Commands:
$ docker-compose up -d        # Start all services
$ docker-compose down          # Stop all services
$ docker-compose logs -f       # View logs
```

---

## Multi-Server Production (Enterprise Scale)

```
┌────────────────────────────────────────────────────────────┐
│                    Internet / Users                         │
└──────────────────────────┬─────────────────────────────────┘
                           │
                           │ HTTPS
                           │
        ┌──────────────────▼──────────────────┐
        │      Load Balancer / CDN             │
        │      (Cloudflare, AWS ELB)           │
        │  - SSL Termination                   │
        │  - DDoS Protection                   │
        │  - Static Asset Caching              │
        └──────────┬────────────────┬──────────┘
                   │                │
       ┌───────────▼─────┐   ┌─────▼──────────┐
       │  Web Server 1   │   │  Web Server 2   │
       │  (Frontend)     │   │  (Frontend)     │
       │  - React App    │   │  - React App    │
       │  - Nginx        │   │  - Nginx        │
       └───────┬─────────┘   └─────┬───────────┘
               │                   │
               └────────┬──────────┘
                        │
        ┌───────────────▼──────────────────┐
        │    Application Load Balancer     │
        └───────────────┬──────────────────┘
                        │
       ┌────────────────┴────────────────┐
       │                                 │
┌──────▼────────┐              ┌────────▼──────┐
│ API Server 1  │              │ API Server 2  │
│ (Backend)     │              │ (Backend)     │
│ - PHP 8.2     │              │ - PHP 8.2     │
│ - Apache      │              │ - Apache      │
└──────┬────────┘              └────────┬──────┘
       │                                │
       └────────────┬───────────────────┘
                    │
     ┌──────────────▼──────────────┐
     │   Database Cluster          │
     │                             │
     │  ┌────────┐    ┌─────────┐ │
     │  │ Master │───▶│ Replica │ │
     │  │ MySQL  │    │ MySQL   │ │
     │  └────────┘    └─────────┘ │
     │                             │
     │  - Read/Write Split         │
     │  - Automatic Failover       │
     │  - Daily Backups            │
     └─────────────────────────────┘
```

---

## File Structure After Deployment

### Shared Hosting (cPanel)
```
/home/username/
├── public_html/
│   ├── index.html              # React entry point
│   ├── .htaccess               # Apache config
│   ├── assets/
│   │   ├── js/
│   │   │   ├── react-vendor-[hash].js
│   │   │   ├── mui-core-[hash].js
│   │   │   └── index-[hash].js
│   │   ├── css/
│   │   │   └── index-[hash].css
│   │   └── images/
│   │       └── [various images]
│   └── api/
│       ├── employer/
│       │   └── auth.php
│       ├── employee/
│       │   └── auth.php
│       ├── config/
│       │   ├── database.php
│       │   └── payroll_config.php
│       └── models/
│           ├── Employee.php
│           ├── Payroll.php
│           └── Leave.php
└── mysql/ (managed by host)
```

### VPS (Ubuntu)
```
/var/www/hrms/
├── index.html
├── .htaccess
├── assets/
│   ├── js/
│   ├── css/
│   └── images/
└── api/
    ├── employer/
    ├── employee/
    ├── config/
    └── models/

/var/log/
├── apache2/
│   ├── error.log
│   └── access.log
└── mysql/
    └── error.log

/etc/apache2/
├── sites-available/
│   └── hrms.conf
└── sites-enabled/
    └── hrms.conf -> ../sites-available/hrms.conf
```

---

## Network Flow Diagram

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Request: https://yourdomain.com
       │
       ▼
┌──────────────────┐
│   DNS Server     │
│  yourdomain.com  │
│  → 123.45.67.89  │
└──────┬───────────┘
       │
       │ 2. Resolves to IP
       │
       ▼
┌──────────────────┐
│  Web Server      │
│  Apache/Nginx    │
│  Port 80/443     │
└──────┬───────────┘
       │
       │ 3. Serves index.html + assets
       │
       ▼
┌──────────────────┐
│   React App      │
│   (Frontend)     │
└──────┬───────────┘
       │
       │ 4. API Calls (AJAX/Fetch)
       │    POST /api/employer/auth/login.php
       │
       ▼
┌──────────────────┐
│   PHP Backend    │
│   (API Layer)    │
└──────┬───────────┘
       │
       │ 5. Database Queries (PDO)
       │    SELECT * FROM employer_users WHERE...
       │
       ▼
┌──────────────────┐
│   MySQL DB       │
│   (Data Layer)   │
└──────┬───────────┘
       │
       │ 6. Returns Data
       │    {"success": true, "user": {...}}
       │
       ▼
┌──────────────────┐
│   Browser        │
│   (Renders UI)   │
└──────────────────┘
```

---

## Hosting Cost Comparison Chart

```
Annual Cost (USD)

$6000 │                                        ┌──┐
      │                                        │  │ Enterprise
$5000 │                                        │  │ Cloud
      │                                        │  │
$4000 │                                        │  │
      │                                        │  │
$3000 │                                    ┌───┤  │
      │                                    │   │  │
$2000 │                                    │ M │  │
      │                                    │ a │  │
$1000 │                        ┌───┐       │ n │  │
      │              ┌───┐     │   │       │ a │  │
 $500 │      ┌───┐   │   │     │ V │       │ g │  │
      │      │   │   │ S │     │ P │       │ e │  │
 $100 │  ┌───┤ S │   │ h │     │ S │       │ d │  │
      │  │   │ h │   │ a │     │   │       │   │  │
   $0 │ ┌┤ L │ a │   │ r │     │ + │       │ C │  │
      │ ││ o │ r │   │ e │     │ M │       │ l │  │
      │ ││ c │ e │   │ d │     │ o │       │ o │  │
      │ ││ a │ d │   │   │     │ n │       │ u │  │
      └─┴┴───┴───┴───┴───┴─────┴───┴───────┴───┴──┴─
        Free  $36- $120-  $600-   $1200+
              $120  $600  $1200

Features:
- Local: Development only, not accessible online
- Shared: Basic hosting, limited resources
- VPS: Full control, dedicated resources
- Managed: Automatic updates, support
- Cloud: Scalable, high availability
```

---

## Recommended Path by Company Size

```
Start Here ────┐
               │
               ▼
       ┌───────────────┐
       │  Development  │
       │    (XAMPP)    │
       │     FREE      │
       └───────┬───────┘
               │
               │ 1-10 employees?
               ▼
       ┌───────────────┐
       │ Shared Hosting│
       │  $3-10/month  │
       │               │
       │  - cPanel     │
       │  - Easy setup │
       └───────┬───────┘
               │
               │ 10-50 employees?
               ▼
       ┌───────────────┐
       │  VPS Hosting  │
       │ $10-30/month  │
       │               │
       │  - More power │
       │  - Full access│
       └───────┬───────┘
               │
               │ 50-200 employees?
               ▼
       ┌───────────────┐
       │ Managed VPS   │
       │ $30-100/month │
       │               │
       │  - Support    │
       │  - Monitoring │
       └───────┬───────┘
               │
               │ 200+ employees?
               ▼
       ┌───────────────┐
       │ Cloud Hosting │
       │  $100+/month  │
       │               │
       │  - Scalable   │
       │  - Redundant  │
       │  - Global     │
       └───────────────┘
```

---

**Quick Decision Guide:**

| If you have... | Choose... | Why? |
|----------------|-----------|------|
| Just testing | XAMPP Local | Free, easy |
| < 10 employees | Shared Hosting | Affordable, simple |
| 10-50 employees | Basic VPS | More control, better performance |
| 50-200 employees | Managed VPS | Professional support |
| 200+ employees | Cloud Platform | Enterprise features |
| Technical team | Self-managed VPS | Maximum control |
| No tech team | Managed Hosting | Let experts handle it |
| Global users | CDN + Cloud | Fast worldwide |
| Budget < $10/mo | Shared Hosting | Best value |
| Budget $50+/mo | Cloud/Managed | Premium features |

---

**Last Updated**: October 24, 2025
