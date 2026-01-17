# FaB-O2O - Super App

Super App kết hợp Food Delivery, Ride-hailing và Dine-in QR.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Mobile | Flutter |
| Web | React + Vite |
| Backend | NestJS |
| Database | MongoDB |
| Cache | Redis |
| Message Queue | Kafka |

## Project Structure

```
fab-o2o/
├── apps/
│   ├── api/          # NestJS Backend
│   ├── web/          # React Web Portal
│   └── mobile/       # Flutter Mobile App
├── packages/
│   ├── contracts/    # Shared types & schemas
│   └── tsconfig/     # Shared TS config
├── infra/            # Docker, K8s, Scripts
└── docs/             # Documentation
```

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 8
- Flutter >= 3.16
- Docker & Docker Compose

### Installation

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev
```

## Documentation

- [Requirements](./requirement.md)
- [Database Schema](./database-schema.md)
- [Project Structure](./structure.md)

## License

Private - All rights reserved
