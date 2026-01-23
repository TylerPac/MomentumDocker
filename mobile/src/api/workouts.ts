import { apiRequest } from './http';

export type WorkoutType = 'Cardio' | 'Weightlifting';

export type WorkoutUpsertRequest = {
  workoutType: WorkoutType;
  workoutName: string;
  workoutDate: string;
  distance: number | null;
  time: number | null;
  weight: number | null;
  sets: number | null;
  reps: number | null;
};

export async function getWorkoutHistory(): Promise<unknown[]> {
  return apiRequest<unknown[]>('/api/workouts/history', 'GET');
}

export async function getWorkoutNames(): Promise<string[]> {
  return apiRequest<string[]>('/api/workouts/names', 'GET');
}

export async function addWorkout(request: WorkoutUpsertRequest): Promise<void> {
  await apiRequest<void>('/api/workouts', 'POST', request);
}
