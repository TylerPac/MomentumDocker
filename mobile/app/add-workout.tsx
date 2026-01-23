import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { addWorkout, getWorkoutNames, type WorkoutType, type WorkoutUpsertRequest } from '@/api/workouts';

function isClockInputMaybeValid(value: string): boolean {
  return /^\d{0,3}(:\d{0,2})?$/.test(value);
}

function parseClockToMinutes(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const parts = trimmed.split(':');
  if (parts.length === 1) return Number(parts[0]);
  const minutes = Number(parts[0]);
  const seconds = Number(parts[1]);
  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return NaN;
  return minutes + seconds / 60;
}

export default function AddWorkoutScreen() {
  const [workoutType, setWorkoutType] = useState<WorkoutType>('Cardio');
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDate, setWorkoutDate] = useState('');

  const [distance, setDistance] = useState('');
  const [time, setTime] = useState('');
  const [weight, setWeight] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');

  const [existingNames, setExistingNames] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCardio = workoutType === 'Cardio';

  useEffect(() => {
    let isMounted = true;
    getWorkoutNames()
      .then((names) => {
        if (!isMounted) return;
        setExistingNames(Array.isArray(names) ? names : []);
      })
      .catch(() => {
        if (!isMounted) return;
        setExistingNames([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const hints = useMemo(() => {
    const names = existingNames.slice(0, 6);
    return names.length ? `Examples: ${names.join(', ')}` : 'Tip: start typing a common workout name.';
  }, [existingNames]);

  async function onSubmit() {
    if (!workoutName.trim()) {
      Alert.alert('Missing workout name', 'Enter a workout name.');
      return;
    }
    if (!workoutDate.trim()) {
      Alert.alert('Missing date', 'Enter a workout date (YYYY-MM-DD).');
      return;
    }

    let parsedTime: number | null = null;
    if (isCardio && time.trim() !== '') {
      const parsed = parseClockToMinutes(time);
      if (!Number.isFinite(parsed)) {
        Alert.alert('Invalid time', 'Use m:ss (e.g. 12:30).');
        return;
      }
      parsedTime = parsed;
    }

    const payload: WorkoutUpsertRequest = {
      workoutType,
      workoutName: workoutName.trim(),
      workoutDate: workoutDate.trim(),
      distance: isCardio && distance.trim() !== '' ? Number(distance) : null,
      time: isCardio ? parsedTime : null,
      weight: !isCardio && weight.trim() !== '' ? Number(weight) : null,
      sets: !isCardio && sets.trim() !== '' ? Number(sets) : null,
      reps: !isCardio && reps.trim() !== '' ? Number(reps) : null,
    };

    setIsSubmitting(true);
    try {
      await addWorkout(payload);
      router.replace('/history');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add workout.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add workout</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Workout type</Text>
        <View style={styles.row}>
          <Pressable
            style={[styles.chip, workoutType === 'Cardio' && styles.chipActive]}
            onPress={() => setWorkoutType('Cardio')}
          >
            <Text style={styles.chipText}>Cardio</Text>
          </Pressable>
          <Pressable
            style={[styles.chip, workoutType === 'Weightlifting' && styles.chipActive]}
            onPress={() => setWorkoutType('Weightlifting')}
          >
            <Text style={styles.chipText}>Weightlifting</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Workout name</Text>
        <TextInput
          placeholder="e.g. Running"
          placeholderTextColor="#8b92a6"
          value={workoutName}
          onChangeText={setWorkoutName}
          style={styles.input}
        />
        <Text style={styles.small}>{hints}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Workout date (YYYY-MM-DD)</Text>
        <TextInput
          placeholder="2026-01-18"
          placeholderTextColor="#8b92a6"
          value={workoutDate}
          onChangeText={setWorkoutDate}
          style={styles.input}
        />
      </View>

      {isCardio ? (
        <>
          <View style={styles.field}>
            <Text style={styles.label}>Distance</Text>
            <TextInput
              keyboardType="decimal-pad"
              placeholder="e.g. 3.1"
              placeholderTextColor="#8b92a6"
              value={distance}
              onChangeText={setDistance}
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Time (m:ss)</Text>
            <TextInput
              keyboardType="numbers-and-punctuation"
              placeholder="e.g. 12:30"
              placeholderTextColor="#8b92a6"
              value={time}
              onChangeText={(next) => {
                if (!isClockInputMaybeValid(next)) return;
                setTime(next);
              }}
              style={styles.input}
            />
          </View>
        </>
      ) : (
        <>
          <View style={styles.field}>
            <Text style={styles.label}>Weight</Text>
            <TextInput
              keyboardType="decimal-pad"
              placeholder="e.g. 135"
              placeholderTextColor="#8b92a6"
              value={weight}
              onChangeText={setWeight}
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Sets</Text>
            <TextInput
              keyboardType="number-pad"
              placeholder="e.g. 3"
              placeholderTextColor="#8b92a6"
              value={sets}
              onChangeText={setSets}
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Reps</Text>
            <TextInput
              keyboardType="number-pad"
              placeholder="e.g. 8"
              placeholderTextColor="#8b92a6"
              value={reps}
              onChangeText={setReps}
              style={styles.input}
            />
          </View>
        </>
      )}

      <Pressable style={[styles.button, isSubmitting && styles.buttonDisabled]} onPress={onSubmit} disabled={isSubmitting}>
        <Text style={styles.buttonText}>{isSubmitting ? 'Saving…' : 'Save'}</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
        <Text style={styles.secondaryButtonText}>Cancel</Text>
      </Pressable>

      <Text style={styles.small}>Matches the website payload fields for parity.</Text>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 10,
  },
  field: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222a3f',
    backgroundColor: '#11162a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    borderColor: '#4f7cff',
  },
  chipText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  label: {
    color: '#c7cbe0',
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#222a3f',
    backgroundColor: '#11162a',
    color: '#ffffff',
  },
  button: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#4f7cff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
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
  small: {
    marginTop: 8,
    color: '#8b92a6',
    fontSize: 12,
  },
});
