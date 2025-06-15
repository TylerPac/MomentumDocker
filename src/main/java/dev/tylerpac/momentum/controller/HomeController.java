package dev.TylerPac.Momentum.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class HomeController {
    @GetMapping("/")
    public String home() {
        return "home"; // resolves to /WEB-INF/jsp/home.jsp
    }
}
