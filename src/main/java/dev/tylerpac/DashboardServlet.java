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
        Map<String, List<String>> workoutMap = new HashMap<>();

        try (Session session = factory.openSession()) {
            Users user = session.createQuery("FROM Users WHERE username = :username", Users.class)
                    .setParameter("username", username)
                    .uniqueResult();

            if (user == null) {
                response.sendRedirect("index.jsp");
                return;
            }

            /*
            Up to here i validate seesion and user is logged in


             */


            Query<Object[]> Dquery = session.createQuery(
                    "SELECT w.workoutType, w.workoutName FROM Workout w GROUP BY w.workoutType, w.workoutName",
                    Object[].class
            );
            List<Object[]> results = Dquery.getResultList();

            for (Object[] row : results) {
                String workoutType = (String) row[0];
                String workoutName = (String) row[1];

                workoutMap.computeIfAbsent(workoutType, k -> new ArrayList<>()).add(workoutName);
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
            request.setAttribute("workoutMap", workoutMap);
            request.setAttribute("latestWorkout", latestWorkout);
            request.setAttribute("workoutDetails", relevantWorkouts); // now List<Workout>
            /*
            // Dont think i use this anymore
            request.setAttribute("graph1Values", graph1Values);
            request.setAttribute("graph2Values", graph2Values);
            request.setAttribute("sortedDates", sortedDates);
            */

            request.getRequestDispatcher("/Dashboard.jsp").forward(request, response);

        } catch (Exception e) {
            e.printStackTrace();
            throw new ServletException(e);
        }
    }
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String workoutType = request.getParameter("workoutType");
        String workoutName = request.getParameter("workoutName");

        if (workoutType == null || workoutType.isEmpty() || workoutName == null || workoutName.isEmpty()) {
            request.setAttribute("error", "Please select both Workout Type and Workout Name!");
            request.getRequestDispatcher("/dashboard.jsp").forward(request, response);
            return;
        }

        List<Workout> workoutDetails = new ArrayList<>();
        List<String> sortedDates = new ArrayList<>();
        List<Float> graph1Values = new ArrayList<>();
        List<Float> graph2Values = new ArrayList<>();

        try (Session session = factory.openSession()) {
            session.beginTransaction();

            // Query to fetch workouts with the selected type and name
            Query<Workout> query = session.createQuery("FROM Workout w WHERE w.workoutType = :workoutType AND w.workoutName = :workoutName ORDER BY w.workoutDate", Workout.class);
            query.setParameter("workoutType", workoutType);
            query.setParameter("workoutName", workoutName);

            workoutDetails = query.getResultList();

            for (Workout workout : workoutDetails) {
                sortedDates.add(workout.getWorkoutDate().toString());

                // Cardio: Distance and Time
                if ("Cardio".equals(workoutType)) {
                    graph1Values.add(workout.getTime());
                    graph2Values.add(workout.getDistance());
                }
                // Weightlifting: Weight and Reps
                else if ("Weightlifting".equals(workoutType)) {
                    graph1Values.add(workout.getWeight());
                    graph2Values.add((float) workout.getReps());
                }
            }

            session.getTransaction().commit();
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Convert data to JSON for use in JSP/JavaScript
        String jsonSortedDates = new Gson().toJson(sortedDates);
        String jsonGraph1Values = new Gson().toJson(graph1Values);
        String jsonGraph2Values = new Gson().toJson(graph2Values);

        // Set attributes to pass the data to the JSP
        request.setAttribute("workoutType", workoutType);
        request.setAttribute("workoutName", workoutName);
        request.setAttribute("workoutDetails", workoutDetails);
        request.setAttribute("jsonSortedDates", jsonSortedDates);
        request.setAttribute("jsonGraph1Values", jsonGraph1Values);
        request.setAttribute("jsonGraph2Values", jsonGraph2Values);

        // Forward the updated data to the JSP
        request.getRequestDispatcher("/dashboard.jsp").forward(request, response);
    }

    @Override
    public void destroy() {
        factory.close();
        super.destroy();
    }
}
