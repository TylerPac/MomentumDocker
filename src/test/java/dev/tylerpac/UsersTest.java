package dev.tylerpac;

import dev.tylerpac.model.Users;
import org.junit.jupiter.api.Test;
import org.mindrot.jbcrypt.BCrypt;

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
        String plainPassword = "password123";
        String hashedPassword = BCrypt.hashpw(plainPassword, BCrypt.gensalt());

        assertTrue(BCrypt.checkpw(plainPassword, hashedPassword), "Passwords should match");
    }
}
