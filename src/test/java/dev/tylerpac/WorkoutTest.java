package dev.tylerpac;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.sql.Date;

public class WorkoutTest {
    @Test
    public void testWorkoutCreation() {
        Workout workout = new Workout();
        workout.setWorkoutType("Leg Day");  // Correct method name
        workout.setWorkoutDate(Date.valueOf("2025-04-17"));

        assertEquals("Leg Day", workout.getWorkoutType());  // Correct method name
        assertEquals(Date.valueOf("2025-04-17"), workout.getWorkoutDate());
    }
}
