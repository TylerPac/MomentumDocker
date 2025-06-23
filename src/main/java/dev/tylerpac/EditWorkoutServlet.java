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
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // Retrieve form data
        String workoutIdParam = request.getParameter("workoutId"); // Hidden input field
        String workoutType = request.getParameter("workoutType");
        String workoutDateParam = request.getParameter("workoutDate");
        String workoutName = request.getParameter("workoutName");

        try {
            // Parse workoutId and workoutDate
            int workoutId = Integer.parseInt(workoutIdParam);
            Date workoutDate = Date.valueOf(workoutDateParam); // Convert to SQL Date

            // Open a Hibernate session
            try (Session session = factory.openSession()) {
                Transaction transaction = session.beginTransaction();

                // Fetch the workout object by ID
                Workout workout = session.get(Workout.class, workoutId);

                if (workout != null) {
                    // Update workout details
                    workout.setWorkoutType(workoutType);
                    workout.setWorkoutDate(workoutDate);
                    workout.setWorkoutName(workoutName);

                    // Update specific fields based on workout type
                    if ("Cardio".equalsIgnoreCase(workoutType)) {
                        String distanceParam = request.getParameter("distance");
                        String timeParam = request.getParameter("time");

                        workout.setDistance(Float.parseFloat(distanceParam));
                        workout.setTime(Float.parseFloat(timeParam));
                        workout.setWeight((float) 0); // Reset unused fields
                        workout.setReps(0);
                    } else if ("Weightlifting".equalsIgnoreCase(workoutType)) {
                        String weightParam = request.getParameter("weight");
                        String repsParam = request.getParameter("reps");

                        workout.setWeight(Float.parseFloat(weightParam));
                        workout.setReps(Integer.parseInt(repsParam));
                        workout.setDistance((float) 0); // Reset unused fields
                        workout.setTime((float) 0);
                    }

                    // Save updated workout to the database
                    session.merge(workout);
                    transaction.commit();

                    // Redirect to workout history or success page
                    response.sendRedirect("workout_history");
                } else {
                    // If workout is not found, redirect
                    response.sendRedirect("workout_history");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.sendRedirect("error.jsp"); // Redirect to an error page
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        int workoutId = Integer.parseInt(request.getParameter("workoutId"));
        Session session = factory.openSession();
        Workout workout = session.get(Workout.class, workoutId);
        request.setAttribute("workout", workout);
        session.close();

        request.getRequestDispatcher("editWorkout.jsp").forward(request, response);
    }

    @Override
    public void destroy() {
        factory.close();
    }
}

