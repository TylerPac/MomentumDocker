package dev.tylerpac.model;

import jakarta.persistence.*;
import org.mindrot.jbcrypt.BCrypt;

@Entity
@Table(name = "users")
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // Auto-increment!
    @Column(name = "user_id")
    private int userId;

    @Column(name = "username", nullable = false, unique = true)
    private String username;

    @Column(name = "password", nullable = false)
    private String password;

    public Users() {}

    public Users(String username, String plainPassword) {
        this.username = username;
        setPassword(plainPassword);
    }

    public int getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String plainPassword) {
        this.password = BCrypt.hashpw(plainPassword, BCrypt.gensalt());
    }

    public boolean isPasswordCorrect(String plainPassword) {
        return BCrypt.checkpw(plainPassword, this.password);
    }

    @Override
    public String toString() {
        return "Users{" +
                "userId=" + userId +
                ", username='" + username + '\'' +
                ", password='[HIDDEN]'" +
                '}';
    }
}
