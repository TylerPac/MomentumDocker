package dev.tylerpac;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class WorkoutDetailTest {

    @Test
    public void testWorkoutDetailAttributes() {
        WorkoutDetail detail = new WorkoutDetail();
        detail.setMetricType("weight");
        detail.setMetricValue(225.5f);
        detail.setMetricUnit("lbs");

        assertEquals("weight", detail.getMetricType());
        assertEquals(225.5f, detail.getMetricValue(), 0.001);
        assertEquals("lbs", detail.getMetricUnit());
    }
}
