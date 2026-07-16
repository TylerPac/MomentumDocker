package dev.tylerpac.momentum.dto.dashboard;

import java.util.List;
import java.util.Map;

import dev.tylerpac.momentum.dto.workout.WorkoutDto;

public record DashboardResponse(
        String workoutType,
        String workoutName,
        long totalWorkouts,
        WorkoutDto latestWorkout,
        List<WorkoutDto> workoutDetails,
        List<String> sortedDates,
        List<Float> graph1Values,
        List<Float> graph2Values,
        Map<String, List<String>> workoutMap
) {}
