package dev.tylerpac;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

import dev.tylerpac.model.Users;
import dev.tylerpac.model.Workout;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.hibernate.query.Query;

import java.io.IOException;
import java.util.*;
import com.google.gson.Gson;

@WebServlet("/dashboard")
public class DashboardServlet extends HttpServlet {

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
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession httpSession = request.getSession(false);
        String username = (httpSession != null) ? (String) httpSession.getAttribute("username") : null;

        if (username == null) {
            response.sendRedirect("index.jsp");
            return;
        }

        try (Session session = factory.openSession()) {
            Users user = session.createQuery("FROM Users WHERE username = :username", Users.class)
                    .setParameter("username", username)
                    .uniqueResult();

            if (user == null) {
                response.sendRedirect("index.jsp");
                return;
            }

            Workout latestWorkout = session.createQuery(
                            "FROM Workout w WHERE w.user = :user ORDER BY w.workoutDate DESC", Workout.class)
                    .setParameter("user", user)
                    .setMaxResults(1)
                    .uniqueResult();


            Long totalWorkouts = session.createQuery(
                            "SELECT COUNT(w) FROM Workout w WHERE w.user = :user", Long.class)
                    .setParameter("user", user) // Bind the user parameter
                    .uniqueResult();


            List<Workout> relevantWorkouts = new ArrayList<>();
            List<Float> graph1Values = new ArrayList<>();
            List<Float> graph2Values = new ArrayList<>();
            List<java.sql.Date> sortedDates = new ArrayList<>();

            if (latestWorkout != null) {
                String workoutType = latestWorkout.getWorkoutType();

                Query<Workout> query = session.createQuery("FROM Workout w WHERE w.user = :user AND w.workoutType = :type ORDER BY w.workoutDate ASC", Workout.class);
                query.setParameter("user", user);
                query.setParameter("type", workoutType);

                relevantWorkouts = query.list();

                for (Workout w : relevantWorkouts) {
                    sortedDates.add(w.getWorkoutDate());

                    if ("Cardio".equals(workoutType) && w.getDistance() != null && w.getTime() != null && w.getDistance() > 0) {
                        float pace = w.getTime() / w.getDistance();
                        graph1Values.add(pace); // pace
                        graph2Values.add(w.getDistance());
                    } else if ("Weightlifting".equals(workoutType) && w.getWeight() != null && w.getReps() != null) {
                        graph1Values.add(w.getWeight());
                        graph2Values.add(w.getReps().floatValue());
                    }
                }
            }

            Gson gson = new Gson();
            request.setAttribute("totalWorkouts", totalWorkouts);
            request.setAttribute("jsonGraph1Values", gson.toJson(graph1Values));
            request.setAttribute("jsonGraph2Values", gson.toJson(graph2Values));
            request.setAttribute("jsonSortedDates", gson.toJson(sortedDates));

            request.setAttribute("latestWorkout", latestWorkout);
            request.setAttribute("workoutDetails", relevantWorkouts); // now List<Workout>
            request.setAttribute("graph1Values", graph1Values);
            request.setAttribute("graph2Values", graph2Values);
            request.setAttribute("sortedDates", sortedDates);

            request.getRequestDispatcher("/Dashboard.jsp").forward(request, response);

        } catch (Exception e) {
            e.printStackTrace();
            throw new ServletException(e);
        }
    }

    @Override
    public void destroy() {
        factory.close();
        super.destroy();
    }
}
