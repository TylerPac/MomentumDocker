package dev.tylerpac;

import jakarta.persistence.*;

@Entity
@Table(name = "workout_details")
public class WorkoutDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "detail_id")
    private int detailId;

    @ManyToOne
    @JoinColumn(name = "workout_id", nullable = false)
    private Workout workout;

    @Column(name = "metric_type", nullable = false)
    private String metricType;

    @Column(name = "metric_value", nullable = false)
    private float metricValue;

    @Column(name = "metric_unit")
    private String metricUnit;  // 🔥 New field!

    // Getters and Setters

    public int getDetailId() {
        return detailId;
    }

    public Workout getWorkout() {
        return workout;
    }

    public void setWorkout(Workout workout) {
        this.workout = workout;
    }

    public String getMetricType() {
        return metricType;
    }

    public void setMetricType(String metricType) {
        this.metricType = metricType;
    }

    public float getMetricValue() {
        return metricValue;
    }

    public void setMetricValue(float metricValue) {
        this.metricValue = metricValue;
    }

    public String getMetricUnit() {
        return metricUnit;
    }

    public void setMetricUnit(String metricUnit) {
        this.metricUnit = metricUnit;
    }
}
