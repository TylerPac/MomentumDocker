package dev.tylerpac.momentum.controller;

import dev.tylerpac.momentum.model.Users;
import dev.tylerpac.momentum.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class AuthController {

    @Autowired
    private UserRepository userRepo;

    @GetMapping("/")
    public String showLoginForm() {
        return "Login"; // Login.jsp
    }
    @PostMapping("/auth")
    public String handleAuth(@RequestParam("username") String username,
                             @RequestParam("password") String password,
                             @RequestParam("action") String action,
                             HttpServletRequest request,
                             Model model)
    {
        Users user = userRepo.findByUsername(username);

        if ("signin".equals(action)) {
            if (user == null || !user.checkPassword(password)) {
                model.addAttribute("errorMessage", "Invalid username or password.");
                return "Login";
            }
            request.getSession().setAttribute("user", user);
            return "redirect:/dashboard";

        } else if ("create".equals(action)) {
            if (user != null) {
                model.addAttribute("errorMessage", "Username already exists.");
                return "Login";
            }
            Users newUser = new Users();
            newUser.setUsername(username);
            newUser.setPassword(password);
            userRepo.save(newUser);
            request.getSession().setAttribute("user", newUser);
            return "redirect:/dashboard";
        }

        model.addAttribute("errorMessage", "Unknown action.");
        return "Login";
    }



    @GetMapping("/dashboard")
    public String showDashboard(HttpServletRequest request) {
        Users user = (Users) request.getSession().getAttribute("user");
        if (user == null) {
            return "redirect:/";
        }
        request.setAttribute("username", user.getUsername());
        return "Dashboard"; // Dashboard.jsp
    }

    @GetMapping("/logout")
    public String logout(HttpServletRequest request) {
        request.getSession().invalidate();
        return "redirect:/";
    }
}
