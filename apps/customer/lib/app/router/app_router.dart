import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'app_router.g.dart';

@riverpod
GoRouter router(Ref ref) {
  return GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        name: 'home',
        builder: (context, state) => Scaffold(
          appBar: AppBar(title: const Text('FaB-O2O Customer')),
          body: const Center(
            child: Text('Customer App - Home'),
          ),
        ),
      ),
    ],
  );
}
