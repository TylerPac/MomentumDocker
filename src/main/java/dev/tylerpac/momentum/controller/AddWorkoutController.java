package dev.tylerpac.momentum.controller;

import dev.tylerpac.momentum.model.Users;
import dev.tylerpac.momentum.model.Workout;
import dev.tylerpac.momentum.repository.WorkoutRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.util.List;
import java.util.stream.Collectors;

@Controller
public class AddWorkoutController {

    @Autowired
    private WorkoutRepository workoutRepo;

    @GetMapping("/addWorkout")
    public String showAddWorkoutForm(HttpServletRequest request, Model model) {
        Users user = (Users) request.getSession().getAttribute("user");
        if (user == null) return "redirect:/";

        List<Workout> existing = workoutRepo.findByUser(user);
        model.addAttribute("workoutNames", existing.stream().map(Workout::getWorkoutName).distinct().collect(Collectors.toList()));
        return "addWorkout";
    }

    @PostMapping("/addWorkout")
    public String handleAddWorkout(@RequestParam String workoutType,
                                   @RequestParam Date workoutDate,
                                   @RequestParam String workoutName,
                                   @RequestParam(required = false) Float distance,
                                   @RequestParam(required = false) Float time,
                                   @RequestParam(required = false) Float weight,
                                   @RequestParam(required = false) Integer reps,
                                   HttpServletRequest request) {
        Users user = (Users) request.getSession().getAttribute("user");
        if (user == null) return "redirect:/";

        Workout w = new Workout();
        w.setWorkoutType(workoutType);
        w.setWorkoutDate(workoutDate);
        w.setWorkoutName(workoutName);
        w.setUser(user);

        if ("Cardio".equals(workoutType)) {
            w.setDistance(distance);
            w.setTime(time);
        } else if ("Weightlifting".equals(workoutType)) {
            w.setWeight(weight);
            w.setReps(reps);
        }

        workoutRepo.save(w);
        return "redirect:/dashboard";
    }

    @GetMapping("/workouts/data")
    @ResponseBody
    public List<Workout> getWorkoutsData(HttpServletRequest request) {
        Users user = (Users) request.getSession().getAttribute("user");
        if (user == null) return List.of(); // Return an empty list if user is not logged in

        // Fetch and return all workouts for the user
        return workoutRepo.findByUser(user);
    }

    @GetMapping("/workouts/last")
    @ResponseBody
    public Workout getLastWorkout(HttpServletRequest request) {
        // Get the logged-in user (assuming user is stored in session)
        Users user = (Users) request.getSession().getAttribute("user");

        if (user == null) {
            throw new IllegalStateException("User is not logged in.");
        }

        // Retrieve the most recent workout for the user
        return workoutRepo.findFirstByUserOrderByIdDesc(user);
    }

}
