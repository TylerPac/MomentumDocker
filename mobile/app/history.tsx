import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { getWorkoutHistory } from '@/api/workouts';

type HistoryState = {
  isLoading: boolean;
  error?: string;
  items?: unknown[];
};

export default function HistoryScreen() {
  const [state, setState] = useState<HistoryState>({ isLoading: true });

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const items = await getWorkoutHistory();
        if (!isMounted) return;
        setState({ isLoading: false, items });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load history.';
        if (!isMounted) return;
        setState({ isLoading: false, error: message });
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>History</Text>
        <Pressable onPress={() => router.push('/add-workout')}>
          <Text style={styles.link}>Add</Text>
        </Pressable>
      </View>

      {state.isLoading ? <Text style={styles.body}>Loading…</Text> : null}
      {state.error ? <Text style={[styles.body, styles.error]}>{state.error}</Text> : null}


      {state.items?.length ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Workouts</Text>
          {state.items.map((item: any, idx: number) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.body}>{item.workoutName || 'Workout'} ({item.workoutType || ''})</Text>
                <Text style={styles.small}>{item.workoutDate || ''}</Text>
              </View>
              <Pressable
                style={{ marginLeft: 8, padding: 4 }}
                onPress={() => Alert.alert('Edit', 'Edit workout coming soon!')}
              >
                <Text style={styles.link}>Edit</Text>
              </Pressable>
              <Pressable
                style={{ marginLeft: 4, padding: 4 }}
                onPress={() => Alert.alert('Delete', 'Delete workout coming soon!')}
              >
                <Text style={[styles.link, { color: 'red' }]}>Delete</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      <Pressable
        style={styles.secondaryButton}
        onPress={async () => {
          try {
            setState({ isLoading: true });
            const items = await getWorkoutHistory();
            setState({ isLoading: false, items });
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load history.';
            setState({ isLoading: false, error: message });
            Alert.alert('Error', message);
          }
        }}
      >
        <Text style={styles.secondaryButtonText}>Refresh</Text>
      </Pressable>
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
  link: {
    color: '#9fb4ff',
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
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#c7cbe0',
    fontSize: 16,
    fontWeight: '600',
  },
});
