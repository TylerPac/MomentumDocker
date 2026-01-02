package dev.tylerpac.momentum.api;

import dev.tylerpac.momentum.api.dto.DashboardResponse;
import dev.tylerpac.momentum.api.dto.WorkoutDto;
import dev.tylerpac.momentum.model.Users;
import dev.tylerpac.momentum.model.Workout;
import dev.tylerpac.momentum.repository.UsersRepository;
import dev.tylerpac.momentum.repository.WorkoutRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final UsersRepository usersRepository;
    private final WorkoutRepository workoutRepository;

    public DashboardController(UsersRepository usersRepository, WorkoutRepository workoutRepository) {
        this.usersRepository = usersRepository;
        this.workoutRepository = workoutRepository;
    }

    @GetMapping
    public DashboardResponse dashboard(
            @RequestParam(required = false) String workoutType,
            @RequestParam(required = false) String workoutName,
            Authentication authentication
    ) {
        Users user = requireUser(authentication);

        Map<String, List<String>> workoutMap = buildWorkoutMap(user);
        long totalWorkouts = workoutRepository.countByUser(user);

        Workout latestWorkoutEntity = workoutRepository.findFirstByUserOrderByWorkoutDateDesc(user).orElse(null);
        WorkoutDto latestWorkout = latestWorkoutEntity != null ? toDto(latestWorkoutEntity) : null;

        String resolvedType = workoutType;
        String resolvedName = workoutName;
        if ((resolvedType == null || resolvedType.isBlank() || resolvedName == null || resolvedName.isBlank())
                && latestWorkoutEntity != null) {
            resolvedType = latestWorkoutEntity.getWorkoutType();
            resolvedName = latestWorkoutEntity.getWorkoutName();
        }

        List<Workout> relevantWorkouts = Collections.emptyList();
        if (resolvedType != null && !resolvedType.isBlank() && resolvedName != null && !resolvedName.isBlank()) {
            relevantWorkouts = workoutRepository.findByUserAndWorkoutTypeAndWorkoutNameOrderByWorkoutDateAsc(
                    user,
                    resolvedType,
                    resolvedName
            );
        }

        List<WorkoutDto> workoutDetails = new ArrayList<>();
        List<String> sortedDates = new ArrayList<>();
        List<Float> graph1Values = new ArrayList<>();
        List<Float> graph2Values = new ArrayList<>();

        for (Workout w : relevantWorkouts) {
            workoutDetails.add(toDto(w));
            if (w.getWorkoutDate() != null) {
                sortedDates.add(w.getWorkoutDate().toString());
            }

            if ("Cardio".equals(resolvedType)
                    && w.getDistance() != null && w.getTime() != null
                    && w.getDistance() > 0) {
                float pace = w.getTime() / w.getDistance();
                graph1Values.add(pace);
                graph2Values.add(w.getDistance());
            } else if ("Weightlifting".equals(resolvedType)
                    && w.getWeight() != null && w.getReps() != null) {
                graph1Values.add(w.getWeight());
                graph2Values.add(w.getReps().floatValue());
            }
        }

        return new DashboardResponse(
                resolvedType,
                resolvedName,
                totalWorkouts,
                latestWorkout,
                workoutDetails,
                sortedDates,
                graph1Values,
                graph2Values,
                workoutMap
        );
    }

    private Map<String, List<String>> buildWorkoutMap(Users user) {
        List<Object[]> pairs = workoutRepository.findDistinctTypeNamePairsByUser(user);
        Map<String, List<String>> map = new HashMap<>();
        for (Object[] row : pairs) {
            String type = (String) row[0];
            String name = (String) row[1];
            if (type == null || name == null) {
                continue;
            }
            map.computeIfAbsent(type, k -> new ArrayList<>()).add(name);
        }
        map.values().forEach(list -> list.sort(String::compareToIgnoreCase));
        return map;
    }

    private Users requireUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not signed in");
        }
        return usersRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not signed in"));
    }

    private static WorkoutDto toDto(Workout w) {
        String date = w.getWorkoutDate() != null ? w.getWorkoutDate().toString() : null;
        return new WorkoutDto(
                w.getWorkoutId(),
                w.getWorkoutType(),
                w.getWorkoutName(),
                date,
                w.getDistance(),
                w.getTime(),
                w.getWeight(),
                w.getReps()
        );
    }
}
