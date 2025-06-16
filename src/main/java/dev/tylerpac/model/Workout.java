package dev.tylerpac.model;

import jakarta.persistence.*;
import java.sql.Date;

@Entity
@Table(name = "workouts")
public class Workout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "workout_id")
    private int workoutId;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private Users user;  // Link to the Users table

    @Column(name = "workout_type")
    private String workoutType;


    @Column(name = "workout_name")
    private String workoutName;  // New field for the workout name


    @Column(name = "workout_date")
    private java.sql.Date workoutDate;

    @Column(name = "distance")
    private Float distance; // Distance field for cardio workouts

    @Column(name = "time")
    private Float time; // Time field for cardio workouts

    @Column(name = "weight")
    private Float weight; // Weight field for weightlifting workouts

    @Column(name = "reps")
    private Integer reps; // Reps field for weightlifting workouts



    public Workout() {}

    public Workout(Users user, String workoutType, String workoutName, Date workoutDate,
                   Float distance, Float time, Float weight, Integer reps)
    {
        this.user = user;
        this.workoutType = workoutType;
        this.workoutName = workoutName;
        this.workoutDate = workoutDate;
        this.distance = distance;
        this.time = time;
        this.weight = weight;
        this.reps = reps;

    }

    // Getters and Setters
    // Getters and Setters
    public int getWorkoutId() {
        return workoutId;
    }

    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    public String getWorkoutType() {
        return workoutType;
    }

    public void setWorkoutType(String workoutType) {
        this.workoutType = workoutType;
    }

    public String getWorkoutName() {
        return workoutName;
    }

    public void setWorkoutName(String workoutName) {
        this.workoutName = workoutName;
    }

    public Date getWorkoutDate() {
        return workoutDate;
    }

    public void setWorkoutDate(Date workoutDate) {
        this.workoutDate = workoutDate;
    }

    public Float getDistance() {
        return distance;
    }

    public void setDistance(Float distance) {
        this.distance = distance;
    }

    public Float getTime() {
        return time;
    }

    public void setTime(Float time) {
        this.time = time;
    }

    public Float getWeight() {
        return weight;
    }

    public void setWeight(Float weight) {
        this.weight = weight;
    }

    public Integer getReps() {
        return reps;
    }

    public void setReps(Integer reps) {
        this.reps = reps;
    }

}
