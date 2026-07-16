package dev.tylerpac.momentum.dto.workout;

public record WorkoutUpsertRequest(
        String workoutType,
        String workoutName,
        String workoutDate,
        Float distance,
        Float time,
        Float weight,
        Integer sets,
        Integer reps,
        String notes
) {}
