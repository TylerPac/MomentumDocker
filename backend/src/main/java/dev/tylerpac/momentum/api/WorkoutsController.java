package dev.tylerpac.momentum.api;

import dev.tylerpac.momentum.api.dto.WorkoutDto;
import dev.tylerpac.momentum.api.dto.WorkoutUpsertRequest;
import dev.tylerpac.momentum.model.Users;
import dev.tylerpac.momentum.model.Workout;
import dev.tylerpac.momentum.repository.UsersRepository;
import dev.tylerpac.momentum.repository.WorkoutRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Date;
import java.util.List;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutsController {

    private final UsersRepository usersRepository;
    private final WorkoutRepository workoutRepository;

    public WorkoutsController(UsersRepository usersRepository, WorkoutRepository workoutRepository) {
        this.usersRepository = usersRepository;
        this.workoutRepository = workoutRepository;
    }

    @GetMapping("/history")
    public List<WorkoutDto> history(Authentication authentication) {
        Users user = requireUser(authentication);
        return workoutRepository.findByUserOrderByWorkoutDateDesc(user)
                .stream()
                .map(WorkoutsController::toDto)
                .toList();
    }

    @GetMapping("/names")
    public List<String> workoutNames(Authentication authentication) {
        Users user = requireUser(authentication);
        return workoutRepository.findDistinctWorkoutNamesByUser(user);
    }

    @GetMapping("/{id}")
    public WorkoutDto getById(@PathVariable int id, Authentication authentication) {
        Users user = requireUser(authentication);
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workout not found"));

        if (workout.getUser() == null || workout.getUser().getUserId() != user.getUserId()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Workout not found");
        }

        return toDto(workout);
    }

    @PostMapping
    public WorkoutDto create(@RequestBody WorkoutUpsertRequest req, Authentication authentication) {
        Users user = requireUser(authentication);

        Workout workout = new Workout();
        workout.setUser(user);
        applyRequest(workout, req);

        Workout saved = workoutRepository.save(workout);
        return toDto(saved);
    }

    @PutMapping("/{id}")
    public WorkoutDto update(@PathVariable int id, @RequestBody WorkoutUpsertRequest req, Authentication authentication) {
        Users user = requireUser(authentication);
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workout not found"));

        if (workout.getUser() == null || workout.getUser().getUserId() != user.getUserId()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Workout not found");
        }

        applyRequest(workout, req);
        Workout saved = workoutRepository.save(workout);
        return toDto(saved);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id, Authentication authentication) {
        Users user = requireUser(authentication);
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workout not found"));

        if (workout.getUser() == null || workout.getUser().getUserId() != user.getUserId()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Workout not found");
        }

        workoutRepository.delete(workout);
    }

    private Users requireUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not signed in");
        }
        return usersRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not signed in"));
    }

    private static void applyRequest(Workout workout, WorkoutUpsertRequest req) {
        workout.setWorkoutType(req.workoutType());
        workout.setWorkoutName(req.workoutName());
        if (req.workoutDate() != null && !req.workoutDate().isBlank()) {
            workout.setWorkoutDate(Date.valueOf(req.workoutDate()));
        } else {
            workout.setWorkoutDate(null);
        }
        workout.setDistance(req.distance());
        workout.setTime(req.time());
        workout.setWeight(req.weight());
        workout.setReps(req.reps());
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
