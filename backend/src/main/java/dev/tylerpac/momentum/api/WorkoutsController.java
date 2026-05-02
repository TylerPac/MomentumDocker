package dev.tylerpac.momentum.api;

import java.sql.Date;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import dev.tylerpac.momentum.api.dto.WorkoutDto;
import dev.tylerpac.momentum.api.dto.WorkoutUpsertRequest;
import dev.tylerpac.momentum.model.Users;
import dev.tylerpac.momentum.model.Workout;
import dev.tylerpac.momentum.repository.UsersRepository;
import dev.tylerpac.momentum.repository.WorkoutRepository;

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
    public Map<String, Object> history(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String workoutType,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            Authentication authentication
    ) {
        Users user = requireUser(authentication);
        int clampedSize = Math.min(Math.max(size, 1), 200);
        PageRequest pageRequest = PageRequest.of(Math.max(page, 0), clampedSize, Sort.by(Sort.Direction.DESC, "workoutDate", "workoutId"));

        java.sql.Date sqlFrom = (dateFrom != null && !dateFrom.isBlank()) ? parseDate(dateFrom) : null;
        java.sql.Date sqlTo = (dateTo != null && !dateTo.isBlank()) ? parseDate(dateTo) : null;

        Page<Workout> result = workoutRepository.findHistoryFiltered(user, search, workoutType, sqlFrom, sqlTo, pageRequest);

        List<WorkoutDto> items = result.getContent().stream().map(WorkoutsController::toDto).toList();
        return Map.of(
                "items", items,
                "page", result.getNumber(),
                "pageSize", result.getSize(),
                "totalItems", result.getTotalElements(),
                "totalPages", result.getTotalPages()
        );
    }

    @GetMapping("/names")
    public List<String> workoutNames(Authentication authentication) {
        Users user = requireUser(authentication);
        return workoutRepository.findDistinctWorkoutNamesByUser(user);
    }

    @GetMapping("/last")
    public WorkoutDto lastByName(@RequestParam String name, Authentication authentication) {
        Users user = requireUser(authentication);
        return workoutRepository
                .findFirstByUserAndWorkoutNameOrderByWorkoutDateDescWorkoutIdDesc(user, name)
                .map(WorkoutsController::toDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No previous workout found"));
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

    @PostMapping("/batch")
    public List<WorkoutDto> createBatch(@RequestBody List<WorkoutUpsertRequest> reqs, Authentication authentication) {
        Users user = requireUser(authentication);
        if (reqs == null || reqs.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No workouts provided");
        }
        if (reqs.size() > 20) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Too many workouts in one submission (max 20)");
        }
        List<Workout> saved = reqs.stream().map(req -> {
            Workout w = new Workout();
            w.setUser(user);
            applyRequest(w, req);
            return workoutRepository.save(w);
        }).toList();
        return saved.stream().map(WorkoutsController::toDto).toList();
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
        workout.setSets(req.sets());
        workout.setReps(req.reps());
        workout.setNotes(req.notes());
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
                w.getSets(),
                w.getReps(),
                w.getNotes()
        );
    }

    private static java.sql.Date parseDate(String s) {
        try {
            return java.sql.Date.valueOf(s);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}

