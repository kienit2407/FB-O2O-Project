# FaB-O2O API - Modular Monolith

Modular monolithic NestJS application with MongoDB.

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT
- **Validation**: class-validator, class-transformer

## Architecture

### Modular Structure

The application follows a modular monolith architecture where each domain is organized as a separate module:

```
src/
├── main.ts                    # Application entry point
├── app.module.ts              # Root module with all imports
├── config/                    # Configuration management
│   └── config.service.ts      # Environment variables
├── database/                  # Database configuration
│   └── database.module.ts     # MongoDB connection
├── common/                    # Shared utilities
│   ├── decorators/            # Custom decorators (@Public, @Roles)
│   ├── guards/                # Auth guards (JWT, Roles)
│   ├── interceptors/          # Global interceptors (Response)
│   ├── pipes/                 # Custom pipes
│   ├── utils/                 # Helper functions
│   └── dto/                   # Common DTOs
├── types/                     # TypeScript interfaces
│   └── common.types.ts       # Shared types
└── modules/                    # Feature modules
    ├── auth/                  # Authentication (JWT, OTP)
    │   ├── controllers/
    │   ├── services/
    │   ├── dto/
    │   ├── schemas/
    │   ├── guards/
    │   └── strategies/
    ├── users/                 # User management
    │   ├── controllers/
    │   ├── services/
    │   ├── dto/
    │   └── schemas/
    ├── merchants/              # Merchant & brand management
    ├── orders/                # Order & cart management
    ├── rides/                 # Ride & driver matching
    ├── payments/               # Payments, wallets, withdrawals
    ├── promotions/            # Promotions, vouchers
    └── notifications/          # Push, email, chat
```

## Modules Overview

### Auth Module
- JWT authentication
- OTP verification (phone)
- User login/logout
- Token refresh

### Users Module
- User profiles (customers, drivers, merchants)
- CRUD operations
- User status management

### Merchants Module
- Brand management
- Store/branch management
- Business hours
- Merchant approval workflow

### Orders Module
- Order creation & management
- Cart management
- Table sessions (dine-in)
- Order status workflow

### Rides Module
- Ride requests
- Driver matching algorithm
- Real-time location tracking
- Route planning

### Payments Module
- Payment gateway integration
- Wallet management
- Withdrawal requests
- Commission calculation

### Promotions Module
- Promotion campaigns
- Voucher management
- Flash sales
- Discount rules

### Notifications Module
- Push notifications (FCM)
- Email notifications (Resend)
- Real-time chat (WebSocket)
- In-app notifications

## Getting Started

### Prerequisites

- Node.js >= 20
- MongoDB >= 6.0
- npm >= 8

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod
```

### Environment Variables

Create a `.env` file in the root directory:

```
MONGO_URI=mongodb://localhost:27017/fabo2o
JWT_SECRET=your-super-secret-key
JWT_EXPIRATION=7d
PORT=4000
NODE_ENV=development
```

## API Endpoints

### Auth Endpoints

```
POST   /auth/login          # Email/Password login
POST   /auth/otp/request     # Request OTP
POST   /auth/otp/verify      # Verify OTP
POST   /auth/refresh         # Refresh token
POST   /auth/logout          # Logout
```

### Users Endpoints

```
GET    /users               # Get all users (paginated)
GET    /users/:id           # Get user by ID
POST   /users               # Create user
PUT    /users/:id           # Update user
DELETE /users/:id           # Delete user
GET    /users/me            # Get current user
PATCH  /users/me            # Update current user
```

## Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Test with coverage
npm run test:cov
```

## License

Private - All rights reserved
