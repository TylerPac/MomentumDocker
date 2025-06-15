package dev.TylerPac.Momentum;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;


@SpringBootApplication(scanBasePackages = "dev.TylerPac")
public class MomentumApplication extends SpringBootServletInitializer {

	public static void main(String[] args) {
		SpringApplication.run(MomentumApplication.class, args);
	}

}
