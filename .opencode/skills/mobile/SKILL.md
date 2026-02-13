---
name: mobile
description: Flutter MVVM + Riverpod for mobile apps (apps/customer, apps/driver). Use when working on Flutter mobile development with MVVM architecture and Riverpod state management (version ^3.2.1). Does NOT modify entire files at once - works incrementally.
---

# Flutter Mobile Development Guide (MVVM + Riverpod)

## Architecture Overview

Follow this MVVM architecture with Riverpod for mobile apps (apps/customer, apps/driver):

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

## Key Dependencies

- riverpod: ^3.2.1 (state management)
- flutter_riverpod: ^3.2.1
- hooks_riverpod: ^3.2.1
- riverpod_annotation: ^3.2.1
- go_router: ^14.0.0 (navigation)
- dio: ^5.0.0 (HTTP client)
- freezed: ^2.0.0 (immutable models)
- freezed_annotation: ^2.0.0
- json_serializable: ^6.0.0
- json_annotation: ^4.0.0

## Riverpod State Management Pattern

### 1. State Class (use Freezed)

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'auth_state.freezed.dart';

@freezed
class AuthState with _$AuthState {
  const factory AuthState.initial() = _Initial;
  const factory AuthState.loading() = _Loading;
  const factory AuthState.authenticated(User user) = _Authenticated;
  const factory AuthState.unauthenticated() = _Unauthenticated;
  const factory AuthState.error(String message) = _Error;
}
```

### 2. ViewModel (Riverpod Notifier)

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'auth_state.dart';

// State provider
final authStateProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});

// Notifier
class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(AuthState.initial());

  Future<void> login(String email, String password) async {
    state = AuthState.loading();
    try {
      final user = await authRepository.login(email, password);
      state = AuthState.authenticated(user);
    } catch (e) {
      state = AuthState.error(e.toString());
    }
  }

  Future<void> logout() async {
    await authRepository.logout();
    state = AuthState.unauthenticated();
  }
}
```

### 3. View (Consumer Widget)

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class LoginScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);
    final authNotifier = ref.read(authStateProvider.notifier);

    return Scaffold(
      body: authState.when(
        initial: () => LoginForm(onLogin: authNotifier.login),
        loading: () => CircularProgressIndicator(),
        authenticated: (user) => HomeScreen(),
        error: (msg) => LoginForm(
          onLogin: authNotifier.login,
          errorMessage: msg,
        ),
      ),
    );
  }
}
```

### 4. Repository Pattern

```dart
// Domain - Repository contract
abstract class AuthRepository {
  Future<User> login(String email, String password);
  Future<void> logout();
}

// Data - Repository implementation
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(
    remoteDataSource: ref.watch(authRemoteDataSourceProvider),
  );
});

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;

  AuthRepositoryImpl({required this.remoteDataSource});

  @override
  Future<User> login(String email, String password) async {
    return await remoteDataSource.login(email, password);
  }

  @override
  Future<void> logout() async {
    await remoteDataSource.logout();
  }
}
```

## Important Rules

1. **Do NOT modify entire files** - work incrementally, only change necessary parts
2. Use Riverpod providers for global state management
3. Keep ViewModels focused on UI state and business logic coordination
4. Use UseCases for business logic in domain layer
5. Keep repositories focused on data access
6. Use Freezed for immutable state and models
7. Always include proper error handling
8. Use ConsumerWidget or ConsumerStatefulWidget for views

## MANDATORY: Always Run Flutter Analyze

**After ANY code modification in apps/customer or apps/driver, you MUST run:**

```bash
cd apps/customer && flutter analyze
cd apps/driver && flutter analyze
```

**Never skip this step** - it ensures code quality and catches issues early. If analyze shows errors or warnings, fix them before moving on.

## Code Generation Requirements

When using Freezed or json_serializable, after creating models:

```bash
cd apps/customer && flutter pub run build_runner build --delete-conflicting-outputs
cd apps/driver && flutter pub run build_runner build --delete-conflicting-outputs
```

Then run `flutter analyze` again to verify.

## When to Load This Skill

- Creating new features for apps/customer or apps/driver
- Implementing state management with Riverpod
- Setting up MVVM architecture
- Working on Flutter mobile code
- Fixing code issues in mobile apps

## App-Specific Context

- **apps/customer**: Customer-facing app (order food, call ride, scan QR)
- **apps/driver**: Driver-facing app (receive orders, navigation, earnings)
- Both apps share the same architecture but different features

## Development Workflow

1. Define State class with Freezed
2. Create Riverpod Notifier for state management
3. Implement Repository in data layer
4. Create UseCase in domain layer (if needed)
5. Build View with ConsumerWidget
6. Wire up providers in di/
7. Add routes in router/
8. **Run `flutter pub run build_runner build --delete-conflicting-outputs`** (if using freezed/json_serializable)
9. **Run `flutter analyze` and fix all errors/warnings**
