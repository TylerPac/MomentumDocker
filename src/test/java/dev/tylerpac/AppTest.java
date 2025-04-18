package dev.tylerpac;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class AppTest {

    @Test
    public void testAddition() {
        int sum = 2 + 2;
        assertEquals(4, sum, "2 + 2 should equal 4");
    }

    @Test
    public void testFailingCase() {
        assertEquals(1, 2, "This test should fail for demo purposes");
    }
}
