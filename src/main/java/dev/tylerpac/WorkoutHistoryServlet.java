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
        protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

            Transaction transaction = null;
            try (Session session = factory.openSession()) {
                transaction = session.beginTransaction();

                // Get the logged-in user
                Users user = (Users) request.getSession().getAttribute("currentUser");

                // Debugging: Check if the user exists
                if (user == null) {
                    System.out.println("No user currently logged in.");
                    request.setAttribute("workouts", Collections.emptyList()); // Use an empty list instead of null// Set workouts explicitly as null
                } else {
                    // Fetch the user's workouts
                    List<Workout> workouts = session.createQuery(
                                    "FROM Workout w WHERE w.user = :user ORDER BY w.workoutDate DESC", Workout.class)
                            .setParameter("user", user)
                            .getResultList();

                    System.out.println("Workouts fetched: " + workouts.size());
                    request.setAttribute("workouts", workouts); // Pass workouts to JSP
                }


                transaction.commit();
            } catch (Exception e) {
                if (transaction != null) transaction.rollback();
                e.printStackTrace();
                throw new ServletException("Error retrieving workout history", e);
            }
            // Always close the session
            request.getRequestDispatcher("/WorkoutHistory.jsp").forward(request, response);
        }

}

