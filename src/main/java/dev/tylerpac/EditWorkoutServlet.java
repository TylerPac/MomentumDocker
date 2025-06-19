package dev.tylerpac;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

import dev.tylerpac.model.Users;
import dev.tylerpac.model.Workout;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.cfg.Configuration;
import java.io.IOException;
import java.sql.Date;
import java.util.Collections;
import java.util.List;

@WebServlet("/editWorkout")
public class EditWorkoutServlet   extends HttpServlet{
    private SessionFactory factory;

    @Override
    public void init() throws ServletException {
        super.init();
        factory = new Configuration()
                .configure("hibernate_SignIn.cfg.xml")
                .addAnnotatedClass(Users.class)
                .addAnnotatedClass(Workout.class)
                .buildSessionFactory();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String workoutIdParam = request.getParameter("workoutId");

        if (workoutIdParam == null) {
            response.sendRedirect("workout_history"); // Redirect if no workout ID is provided
            return;
        }

        try {
            int workoutId = Integer.parseInt(workoutIdParam);

            try (Session session = factory.openSession()) {
                // Fetch the workout by ID
                Workout workout = session.get(Workout.class, workoutId);

                if (workout != null) {
                    // Pass the workout object to the JSP
                    request.setAttribute("workout", workout);
                    request.getRequestDispatcher("/editWorkout.jsp").forward(request, response);
                } else {
                    response.sendRedirect("workout_history"); // Redirect if the workout is not found
                }
            }
        } catch (NumberFormatException e) {
            e.printStackTrace();
            response.sendRedirect("workout_history");
        }
    }

    @Override
    public void destroy() {
        factory.close();
    }
}

