# FaB-O2O - Super App

Super App kết hợp Food Delivery, Ride-hailing và Dine-in QR.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | NestJS (Modular Monolith) |
| Database | MongoDB |
| Frontend - Merchant | React + Vite (port 3000) |
| Frontend - Admin | React + Vite (port 4000) |
| Mobile - Customer | Flutter |
| Mobile - Driver | Flutter |

## Project Structure

```
fab-o2o/
├── apps/
│   ├── api/                 # NestJS Modular Monolith (Backend)
│   ├── merchant-web/         # React Merchant Portal (port 3000)
│   ├── admin-web/            # React Admin Portal (port 4000)
│   ├── customer/             # Flutter Customer App
│   └── driver/               # Flutter Driver App
├── packages/
│   ├── contracts/            # Shared types & schemas
│   └── tsconfig/             # Shared TS config
├── infra/                        # Docker, K8s, Scripts
└── docs/                         # Documentation
```

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 8
- Flutter >= 3.16
- MongoDB >= 6.0
- Docker & Docker Compose

### Installation

```bash
# Install all dependencies
pnpm install

# Start backend API (NestJS)
cd apps/api && npm install && npm run start:dev

# Start merchant web portal
cd apps/merchant-web && npm install && npm run dev

# Start admin web portal
cd apps/admin-web && npm install && npm run dev

# Start customer app
cd apps/customer && flutter pub get && flutter run

# Start driver app
cd apps/driver && flutter pub get && flutter run
```

## Documentation

- [Requirements](./requirement.md)
- [Database Schema](./database-schema.md)
- [Project Structure](./structure.md)
- [API Documentation](./docs/api/README.md)

## Architecture Overview

### Backend - Modular Monolith

The backend follows a **modular monolith** architecture with NestJS:

- **Single codebase** with domain-driven modules
- **Shared infrastructure** (database, config, common utilities)
- **Modular organization** by domain (auth, users, merchants, orders, etc.)
- **Easier to deploy** - 1 service instead of many microservices
- **Simpler development** - no inter-service communication complexity

### Modules

| Module | Description |
|---------|-------------|
| `auth` | Authentication (JWT, OTP), User login/logout |
| `users` | User profiles (customers, drivers, merchants) |
| `merchants` | Brand & store management, merchant approval |
| `orders` | Order & cart management, table sessions |
| `rides` | Ride requests, driver matching, location tracking |
| `payments` | Payments, wallets, withdrawals, commissions |
| `promotions` | Promotions, vouchers, flash sales |
| `notifications` | Push, email, chat notifications |

### Frontend - Web Portals

Two separate React + Vite applications:

| Portal | Port | Target Users |
|--------|-------|--------------|
| Merchant Web | 3000 | Store owners, staff |
| Admin Web | 4000 | Super admins |

### Frontend - Mobile Apps

Two Flutter applications:

| App | Target Users | Features |
|-----|--------------|----------|
| Customer | End customers | Order food, call ride, scan QR |
| Driver | Drivers | Receive orders, navigation, earnings |

## License

Private - All rights reserved
