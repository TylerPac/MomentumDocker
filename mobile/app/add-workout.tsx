import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Pressable } from 'react-native';
import { router } from 'expo-router';
import { addWorkout, WorkoutUpsertRequest, WorkoutType } from '@/api/workouts';

const WORKOUT_TYPES: WorkoutType[] = ['Cardio', 'Weightlifting'];

export default function AddWorkoutScreen() {
  const [form, setForm] = useState<WorkoutUpsertRequest>({
    workoutType: 'Cardio',
    workoutName: '',
    workoutDate: new Date().toISOString().slice(0, 10),
    distance: null,
    time: null,
    weight: null,
    sets: null,
    reps: null,
  });
  const [loading, setLoading] = useState(false);

  const isCardio = form.workoutType === 'Cardio';

  function setType(t: WorkoutType) {
    setForm(f => ({
      ...f,
      workoutType: t,
      distance: null,
      time: null,
      weight: null,
      sets: null,
      reps: null,
    }));
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      await addWorkout(form);
      Alert.alert('Success', 'Workout added!');
      router.replace('/history');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to add workout.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Workout</Text>

      {/* Type selector */}
      <View style={styles.typeRow}>
        {WORKOUT_TYPES.map(t => (
          <Pressable
            key={t}
            style={[styles.typeBtn, form.workoutType === t && styles.typeBtnActive]}
            onPress={() => setType(t)}
          >
            <Text style={[styles.typeBtnText, form.workoutType === t && styles.typeBtnTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Workout Name"
        value={form.workoutName}
        onChangeText={v => setForm(f => ({ ...f, workoutName: v }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        value={form.workoutDate}
        onChangeText={v => setForm(f => ({ ...f, workoutDate: v }))}
      />

      {isCardio ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Distance (km)"
            keyboardType="numeric"
            value={form.distance?.toString() ?? ''}
            onChangeText={v => setForm(f => ({ ...f, distance: v ? parseFloat(v) : null }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Time (min)"
            keyboardType="numeric"
            value={form.time?.toString() ?? ''}
            onChangeText={v => setForm(f => ({ ...f, time: v ? parseFloat(v) : null }))}
          />
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Weight (kg)"
            keyboardType="numeric"
            value={form.weight?.toString() ?? ''}
            onChangeText={v => setForm(f => ({ ...f, weight: v ? parseFloat(v) : null }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Sets"
            keyboardType="numeric"
            value={form.sets?.toString() ?? ''}
            onChangeText={v => setForm(f => ({ ...f, sets: v ? parseInt(v, 10) : null }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Reps"
            keyboardType="numeric"
            value={form.reps?.toString() ?? ''}
            onChangeText={v => setForm(f => ({ ...f, reps: v ? parseInt(v, 10) : null }))}
          />
        </>
      )}

      <Button title={loading ? 'Adding...' : 'Add Workout'} onPress={handleSubmit} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0b0f19' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  typeBtnActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  typeBtnText: { color: '#94a3b8', fontWeight: '700' },
  typeBtnTextActive: { color: '#fff' },
  input: { backgroundColor: '#fff', marginBottom: 12, padding: 8, borderRadius: 4 },
});

