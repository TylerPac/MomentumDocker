import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { getDashboard } from '@/api/dashboard';
import { clearAuthToken, loadAuthToken } from '@/storage/authToken';
import DashboardChart from './DashboardChart';

type DashboardState = {
  isLoading: boolean;
  error?: string;
  data?: unknown;
};

export default function DashboardScreen() {
  const [state, setState] = useState<DashboardState>({ isLoading: true });

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      const token = await loadAuthToken();
      if (!token) {
        router.replace('/sign-in');
        return;
      }

      try {
        const data = await getDashboard();
        if (!isMounted) return;
        setState({ isLoading: false, data });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load dashboard.';
        if (!isMounted) return;
        setState({ isLoading: false, error: message });
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  async function onSignOut() {
    await clearAuthToken();
    router.replace('/sign-in');
  }

  async function onRefresh() {
    setState({ isLoading: true });
    try {
      const data = await getDashboard();
      setState({ isLoading: false, data });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard.';
      setState({ isLoading: false, error: message });
      Alert.alert('Error', message);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{greeting}</Text>
        <Pressable onPress={onSignOut}>
          <Text style={styles.link}>Sign out</Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>Dashboard</Text>

      {state.isLoading ? <Text style={styles.body}>Loading…</Text> : null}
      {state.error ? <Text style={[styles.body, styles.error]}>{state.error}</Text> : null}


      {state.data ? (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Summary</Text>
            <Text style={styles.cardBody}>Total workouts: <Text style={{ fontWeight: 'bold' }}>{state.data.totalWorkouts ?? 0}</Text></Text>
            <Text style={styles.cardBody}>Latest workout: <Text style={{ fontWeight: 'bold' }}>{state.data.latestWorkout?.workoutName || '—'}</Text></Text>
          </View>
          <DashboardChart
            title="Graph 1"
            labels={state.data.sortedDates || []}
            values={state.data.graph1Values || []}
            yLabel={state.data.workoutType === 'Cardio' ? 'Pace' : 'Weight'}
          />
          <DashboardChart
            title="Graph 2"
            labels={state.data.sortedDates || []}
            values={state.data.graph2Values || []}
            yLabel={state.data.workoutType === 'Cardio' ? 'Distance' : 'Volume'}
          />
        </>
      ) : null}

      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={() => router.push('/history')}>
          <Text style={styles.buttonText}>Workout history</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => router.push('/add-workout')}>
          <Text style={styles.buttonText}>Add workout</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onRefresh}>
          <Text style={styles.secondaryButtonText}>Refresh</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
    backgroundColor: '#0b0f19',
    minHeight: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#c7cbe0',
  },
  body: {
    color: '#c7cbe0',
  },
  error: {
    color: '#ff8a8a',
  },
  card: {
    borderWidth: 1,
    borderColor: '#222a3f',
    backgroundColor: '#11162a',
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  cardTitle: {
    color: '#ffffff',
    fontWeight: '700',
  },
  cardBody: {
    color: '#c7cbe0',
  },
  small: {
    color: '#8b92a6',
    fontSize: 12,
  },
  actions: {
    marginTop: 8,
    gap: 10,
  },
  button: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#4f7cff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#11162a',
    borderWidth: 1,
    borderColor: '#222a3f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#c7cbe0',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: '#9fb4ff',
    fontWeight: '600',
  },
});
