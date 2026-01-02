package dev.tylerpac.momentum.api.dto;

import java.util.List;
import java.util.Map;

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
