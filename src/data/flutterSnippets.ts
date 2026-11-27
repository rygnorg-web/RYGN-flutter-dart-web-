import { FlutterSnippet } from '../types/flutter';
import { RYGN_HOME_PAGE_DART_CODE } from './rygnWidgetCode';

export const FLUTTER_SNIPPETS: FlutterSnippet[] = [
  {
    id: 'rygn_home_page',
    title: 'RYGN - Rohingya Young Generation Network Home Page',
    category: 'ui_widgets',
    description: 'Accessible, responsive non-profit homepage with Top Bar, Yellow LISTEN button (flutter_tts), About Us box, and Activity Report PDF launcher.',
    tags: ['rygn', 'rohingya', 'accessibility', 'flutter_tts', 'url_launcher', 'mobile_first'],
    complexity: 'Intermediate',
    code: RYGN_HOME_PAGE_DART_CODE,
  },
  {
    id: 'riverpod_notifier',
    title: 'Riverpod 2.0 AsyncNotifier & StateNotifier',
    category: 'state_management',
    description: 'Modern asynchronous state management in Riverpod using AsyncNotifier and Ref generator annotations.',
    tags: ['riverpod', 'async_notifier', 'state_management', 'dart3'],
    complexity: 'Intermediate',
    code: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// 1. Immutable State Model
@immutable
class UserProfile {
  final string id;
  final String name;
  final String email;

  const UserProfile({required this.id, required this.name, required this.email});
}

// 2. AsyncNotifier Controller
class UserProfileNotifier extends AsyncNotifier<UserProfile> {
  @override
  Future<UserProfile> build() async {
    // Fetch initial user profile asynchronously
    return _fetchUserFromApi();
  }

  Future<UserProfile> _fetchUserFromApi() async {
    await Future.delayed(const Duration(seconds: 1));
    return const UserProfile(
      id: 'usr_101',
      name: 'Alex Developer',
      email: 'alex@fluttercraft.dev',
    );
  }

  Future<void> updateName(String newName) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final current = state.value!;
      await Future.delayed(const Duration(milliseconds: 500));
      return UserProfile(id: current.id, name: newName, email: current.email);
    });
  }
}

// 3. Provider Registration
final userProfileProvider = AsyncNotifierProvider<UserProfileNotifier, UserProfile>(
  UserProfileNotifier.new,
);

// 4. ConsumerWidget View
class UserProfileCard extends ConsumerWidget {
  const UserProfileCard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userAsync = ref.watch(userProfileProvider);

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: userAsync.when(
          data: (user) => Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircleAvatar(
                radius: 36,
                backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                child: Text(
                  user.name[0],
                  style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 12),
              Text(user.name, style: Theme.of(context).textTheme.headlineSmall),
              Text(user.email, style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => ref.read(userProfileProvider.notifier).updateName('Alex (Flutter GDE)'),
                icon: const Icon(Icons.edit),
                label: const Text('Update Profile'),
              ),
            ],
          ),
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, stack) => Text('Error loading user: $err'),
        ),
      ),
    );
  }
}`
  },
  {
    id: 'flutter_bloc_cubit',
    title: 'Flutter BLoC 8.1 Cubit Pattern',
    category: 'state_management',
    description: 'Predictable state management using BLoC Cubit with immutable state classes.',
    tags: ['bloc', 'cubit', 'state_management', 'clean_architecture'],
    complexity: 'Intermediate',
    code: `import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

// --- States ---
sealed class CounterState {
  final int count;
  const CounterState(this.count);
}

final class CounterInitial extends CounterState {
  const CounterInitial() : super(0);
}

final class CounterValue extends CounterState {
  const CounterValue(super.count);
}

// --- Cubit Controller ---
class CounterCubit extends Cubit<CounterState> {
  CounterCubit() : super(const CounterInitial());

  void increment() => emit(CounterValue(state.count + 1));
  void decrement() => emit(CounterValue(state.count - 1));
  void reset() => emit(const CounterInitial());
}

// --- UI View ---
class BlocCounterPage extends StatelessWidget {
  const BlocCounterPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => CounterCubit(),
      child: Scaffold(
        appBar: AppBar(title: const Text('Flutter BLoC Cubit Example')),
        body: Center(
          child: BlocBuilder<CounterCubit, CounterState>(
            builder: (context, state) {
              return Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Counter Value:', style: TextStyle(fontSize: 18)),
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 300),
                    transitionBuilder: (child, anim) => ScaleTransition(scale: anim, child: child),
                    child: Text(
                      '\${state.count}',
                      key: ValueKey(state.count),
                      style: Theme.of(context).textTheme.displayMedium,
                    ),
                  ),
                ],
              );
            },
          ),
        ),
        floatingActionButton: Column(
          mainAxisAlignment: MainAxisSize.min,
          children: [
            Builder(
              builder: (ctx) => FloatingActionButton(
                heroTag: 'add',
                onPressed: () => ctx.read<CounterCubit>().increment(),
                child: const Icon(Icons.add),
              ),
            ),
            const SizedBox(height: 10),
            Builder(
              builder: (ctx) => FloatingActionButton(
                heroTag: 'remove',
                onPressed: () => ctx.read<CounterCubit>().decrement(),
                child: const Icon(Icons.remove),
              ),
            ),
          ],
        ),
      ),
    );
  }
}`
  },
  {
    id: 'dart3_pattern_matching',
    title: 'Dart 3 Pattern Matching & Sealed Classes',
    category: 'dart_3',
    description: 'Leveraging Dart 3 sealed class hierarchies, switch expressions, destructuring, and records.',
    tags: ['dart3', 'pattern_matching', 'sealed_classes', 'records'],
    complexity: 'Advanced',
    code: `import 'package:flutter/material.dart';

// 1. Sealed class hierarchy for API States
sealed class ApiResult<T> {}

class Success<T> extends ApiResult<T> {
  final T data;
  Success(this.data);
}

class Failure<T> extends ApiResult<T> {
  final String errorMessage;
  final int statusCode;
  Failure(this.errorMessage, {this.statusCode = 500});
}

class Loading<T> extends ApiResult<T> {}

// 2. Pattern Matching Switch Expression
Widget renderApiState(ApiResult<(String title, double score)> result) {
  return switch (result) {
    Loading() => const CircularProgressIndicator(),
    Success(data: (final title, final score)) => ListTile(
        leading: const Icon(Icons.star, color: Colors.amber),
        title: Text(title),
        subtitle: Text('Score: \${score.toStringAsFixed(1)} / 5.0'),
      ),
    Failure(errorMessage: final msg, statusCode: final code) when code == 401 =>
      Text('Unauthorized Access: \$msg', style: const TextStyle(color: Colors.orange)),
    Failure(errorMessage: final msg) =>
      Text('Error occurred: \$msg', style: const TextStyle(color: Colors.red)),
  };
}

// 3. Dart 3 Records Function returning multiple values
(double min, double max, double average) calculateMetrics(List<double> values) {
  if (values.isEmpty) return (0.0, 0.0, 0.0);
  double sum = 0.0;
  double min = values.first;
  double max = values.first;

  for (final v in values) {
    sum += v;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return (min, max, sum / values.length);
}

void main() {
  final (low, high, avg) = calculateMetrics([4.5, 9.2, 1.3, 7.8, 8.0]);
  debugPrint('Metrics - Min: \$low, Max: \$high, Avg: \$avg');
}`
  }
];
