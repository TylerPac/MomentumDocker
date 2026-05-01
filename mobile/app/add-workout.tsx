import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { addWorkout, WorkoutUpsertRequest, WorkoutType } from '@/api/workouts';

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
      <TextInput
        style={styles.input}
        placeholder="Distance (km)"
        keyboardType="numeric"
        value={form.distance?.toString() || ''}
        onChangeText={v => setForm(f => ({ ...f, distance: v ? parseFloat(v) : null }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Time (min)"
        keyboardType="numeric"
        value={form.time?.toString() || ''}
        onChangeText={v => setForm(f => ({ ...f, time: v ? parseFloat(v) : null }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Weight (kg)"
        keyboardType="numeric"
        value={form.weight?.toString() || ''}
        onChangeText={v => setForm(f => ({ ...f, weight: v ? parseFloat(v) : null }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Sets"
        keyboardType="numeric"
        value={form.sets?.toString() || ''}
        onChangeText={v => setForm(f => ({ ...f, sets: v ? parseInt(v) : null }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Reps"
        keyboardType="numeric"
        value={form.reps?.toString() || ''}
        onChangeText={v => setForm(f => ({ ...f, reps: v ? parseInt(v) : null }))}
      />
      <Button title={loading ? 'Adding...' : 'Add Workout'} onPress={handleSubmit} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0b0f19' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  input: { backgroundColor: '#fff', marginBottom: 12, padding: 8, borderRadius: 4 },
});
