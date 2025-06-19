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
import java.util.Collections;
import java.util.List;

@WebServlet("/workout_history")
public class WorkoutHistoryServlet extends HttpServlet
{
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
        // Get action and workoutId from the request parameters
        String action = request.getParameter("action");
        String workoutIdParam = request.getParameter("workoutId");

        if (action == null || workoutIdParam == null) {
            response.sendRedirect("workout_history");
            return;
        }

        int workoutId = Integer.parseInt(workoutIdParam);

        try (Session session = factory.openSession()) {
            Transaction transaction = session.beginTransaction();

            // Fetch the workout by ID
            Workout workout = session.get(Workout.class, workoutId);

            if (workout != null) {
                if ("delete".equals(action)) {
                    // Delete the workout
                    session.delete(workout);
                } else if ("edit".equals(action)) {
                    // Redirect to an edit page or modify accordingly
                    // (Optionally store the workout in the request to pre-fill the form)
                    request.setAttribute("workoutToEdit", workout);
                    request.getRequestDispatcher("/editWorkout.jsp").forward(request, response);
                    return;
                }
            }

            transaction.commit();
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServletException("Error processing workout action", e);
        }

        // Redirect back to workout history after handling the request
        response.sendRedirect("workout_history");
    }

    @Override
        protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

            HttpSession httpSession = request.getSession(false);
            String username = (httpSession != null) ? (String) httpSession.getAttribute("username") : null;

            if (username == null) {
                response.sendRedirect("index.jsp");
                return;
            }

            try (Session session = factory.openSession()) {
                // Fetch the user from the database using the session's username attribute
                Users user = session.createQuery("FROM Users WHERE username = :username", Users.class)
                        .setParameter("username", username)
                        .uniqueResult();

                if (user == null) {
                    response.sendRedirect("index.jsp");
                    return;
                }


                List<Workout> workouts = session.createQuery(
                                "FROM Workout w WHERE w.user = :user ORDER BY w.workoutDate DESC", Workout.class)
                        .setParameter("user", user)
                        .getResultList();

                // Set the list of workouts as a request attribute
                request.setAttribute("workouts", workouts);





            } catch (Exception e) {
                e.printStackTrace();
                throw new ServletException("Error retrieving workout history", e);
            }
            // Always close the session
            request.getRequestDispatcher("/WorkoutHistory.jsp").forward(request, response);
        }

}

