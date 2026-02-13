# FaB-O2O Customer App

Customer-facing mobile app for ordering food, calling rides, and scanning QR codes for dine-in.

## Tech Stack

- **Framework**: Flutter 3.35.4
- **State Management**: Riverpod ^3.2.1
- **Navigation**: go_router ^14.0.0
- **HTTP Client**: Dio ^5.0.0
- **Architecture**: MVVM with Clean Architecture

## Project Structure

```
lib/
├── main.dart                 # Entry point with ProviderScope
├── app/
│   ├── router/               # go_router configuration
│   ├── theme/                # App theme, colors
│   └── di/                   # Dependency injection setup
├── core/
│   ├── network/              # Dio client, interceptors
│   ├── storage/              # Secure storage, shared preferences
│   ├── error/                # Error handling
│   ├── utils/                # Formatters, helpers
│   └── constants/            # App constants
├── data/
│   ├── datasources/          # Remote/local data sources
│   ├── models/               # DTOs (freezed, json_serializable)
│   └── repositories/         # Repository implementations
├── domain/
│   ├── entities/             # Business entities
│   ├── repositories/         # Repository contracts
│   └── usecases/             # Business logic
└── presentation/
    ├── common_widgets/       # Shared widgets
    └── features/
        └── {feature}/
            ├── view/         # Screens, widgets
            ├── viewmodel/    # Riverpod Notifiers/Providers
            └── state/        # State classes (freezed)
```

## Getting Started

### Prerequisites

- Flutter SDK >= 3.9.2
- Dart SDK >= 3.9.2
- Xcode (for iOS)
- Android Studio (for Android)

### Installation

```bash
# Install dependencies
flutter pub get

# Generate code (freezed, json_serializable, riverpod)
flutter pub run build_runner build --delete-conflicting-outputs

# Run the app
flutter run
```

### Build for Release

```bash
# Android
flutter build apk --release
flutter build appbundle --release

# iOS
flutter build ios --release
```

## Features

- [ ] Authentication (Login/Register with Email & Phone)
- [ ] Food Ordering
- [ ] Ride Hailing
- [ ] Dine-in QR Scanning
- [ ] Cart Management
- [ ] Order Tracking
- [ ] Payment Integration
- [ ] Notifications

## Environment Variables

Create a `.env` file in the root directory:

```
API_BASE_URL=http://localhost:3000
```

## Key Dependencies

- `flutter_riverpod: ^3.2.1` - State management
- `go_router: ^14.0.0` - Navigation
- `dio: ^5.0.0` - HTTP client
- `freezed: ^2.4.7` - Immutable models
- `flutter_secure_storage: ^9.0.0` - Secure storage

## License

Private - All rights reserved
