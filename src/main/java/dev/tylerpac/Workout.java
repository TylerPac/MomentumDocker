package dev.tylerpac;

import jakarta.persistence.*;

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

    @Column(name = "workout_date")
    private java.sql.Date workoutDate;

    public Workout() {}

    public Workout(Users user, String workoutType, java.sql.Date workoutDate) {
        this.user = user;
        this.workoutType = workoutType;
        this.workoutDate = workoutDate;
    }

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

    public java.sql.Date getWorkoutDate() {
        return workoutDate;
    }

    public void setWorkoutDate(java.sql.Date workoutDate) {
        this.workoutDate = workoutDate;
    }
}
