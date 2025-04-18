package dev.tylerpac;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class UsersTest {

    @Test
    public void testUsernameSetAndGet() {
        Users user = new Users();
        user.setUsername("Tyler");
        assertEquals("Tyler", user.getUsername(), "Username should be Tyler");
    }

    @Test
    public void testPasswordMatching() {
        Users user = new Users();
        user.setPassword("password123");
        assertEquals("password123", user.getPassword(), "Passwords should match");
    }
}
