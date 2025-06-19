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
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Extract form data
        String workoutIdParam = request.getParameter("workoutId");
        String workoutName = request.getParameter("workoutName");
        String workoutType = request.getParameter("workoutType");
        String workoutDateParam = request.getParameter("workoutDate");

        if (workoutIdParam == null || workoutName == null || workoutType == null || workoutDateParam == null) {
            response.sendRedirect("workout_history"); // Redirect if any parameter is missing
            return;
        }


        try {
            int workoutId = Integer.parseInt(workoutIdParam);
            Date workoutDate = Date.valueOf(workoutDateParam); // Convert String to java.sql.Date

            try (Session session = factory.openSession()) {
                Transaction transaction = session.beginTransaction();

                // Fetch the workout entity to update
                Workout workout = session.get(Workout.class, workoutId);
                if (workout != null) {
                    workout.setWorkoutName(workoutName);
                    workout.setWorkoutType(workoutType);
                    workout.setWorkoutDate(workoutDate); // Set the correctly converted Date

                    // Handle optional fields based on workout type
                    if ("Cardio".equalsIgnoreCase(workoutType)) {
                        workout.setDistance(Float.parseFloat(request.getParameter("distance")));
                        workout.setTime(Float.parseFloat(request.getParameter("time")));
                    } else if ("Weightlifting".equalsIgnoreCase(workoutType)) {
                        workout.setWeight(Float.parseFloat(request.getParameter("weight")));
                        workout.setReps(Integer.parseInt(request.getParameter("reps")));
                    }

                    // Save changes to the database
                    session.update(workout);
                }
                transaction.commit();
            }
        } catch (IllegalArgumentException e) {
            e.printStackTrace();
            throw new ServletException("Error parsing date or numeric values", e);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServletException("Error updating workout", e);
        }
        // Redirect back to the workout history page after updating
        response.sendRedirect("workout_history");
    }


    @Override
    public void destroy() {
        factory.close();
    }
}
