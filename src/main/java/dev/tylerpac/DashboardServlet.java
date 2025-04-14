package dev.tylerpac;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import java.io.IOException;
import java.sql.Date;
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
                .addAnnotatedClass(WorkoutDetail.class)
                .buildSessionFactory();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession httpSession = request.getSession(false);
        String username = (httpSession != null) ? (String) httpSession.getAttribute("username") : null;

        if (username == null) {
            response.sendRedirect("index.jsp");  // ❌ Not logged in, go to login page
            return;
        }

        try (Session session = factory.openSession()) {
            // 1. Find the logged-in user
            Users user = session.createQuery("FROM Users WHERE username = :username", Users.class)
                    .setParameter("username", username)
                    .uniqueResult();

            if (user == null) {
                response.sendRedirect("index.jsp");
                return;
            }

            // 2. Find all workouts for this user
            Workout latestWorkout = session.createQuery(
                            "FROM Workout w WHERE w.user = :user ORDER BY w.workoutDate DESC", Workout.class)
                    .setParameter("user", user)
                    .setMaxResults(1)
                    .uniqueResult();

            // Get metrics for that workout type (ex: all running distances)
            List<WorkoutDetail> workoutDetails = null;
            if (latestWorkout != null) {
                workoutDetails = session.createQuery(
                                "FROM WorkoutDetail d WHERE d.workout.workoutType = :workoutType AND d.workout.user = :user", WorkoutDetail.class)
                        .setParameter("workoutType", latestWorkout.getWorkoutType())
                        .setParameter("user", user)
                        .list();
            }
            List<Float> graph1Values = new ArrayList<>();
            List<Float> graph2Values = new ArrayList<>();
            List<java.sql.Date> sortedDates = new ArrayList<>();  // <-- 🛠️ Add this here
            if (workoutDetails != null) {
                Map<java.sql.Date, Float> distances = new HashMap<>();
                Map<java.sql.Date, Float> times = new HashMap<>();


                for (WorkoutDetail detail : workoutDetails) {
                    java.sql.Date workoutDate = detail.getWorkout().getWorkoutDate();

                    if ("Cardio".equals(latestWorkout.getWorkoutType())) {
                        if ("Distance".equals(detail.getMetricType())) {
                            distances.put(workoutDate, detail.getMetricValue());
                        } else if ("Time".equals(detail.getMetricType())) {
                            times.put(workoutDate, detail.getMetricValue());
                        }
                    } else if ("Weightlifting".equals(latestWorkout.getWorkoutType())) {
                        if ("Weight".equals(detail.getMetricType())) {
                            graph1Values.add(detail.getMetricValue());
                        } else if ("Reps".equals(detail.getMetricType())) {
                            graph2Values.add(detail.getMetricValue());
                        }
                    }
                }

// After collecting, calculate Pace// 🛠️ Just FILL your existing sortedDates list now:
                sortedDates.addAll(distances.keySet());
                if (!sortedDates.isEmpty()) {
                    Collections.sort(sortedDates);
                }

                for (java.sql.Date date : sortedDates) {
                    if (times.containsKey(date)) {
                        float distance = distances.get(date);
                        float time = times.get(date);

                        if (distance > 0) {
                            float pace = time / distance;
                            graph1Values.add(pace);    // Top graph: Pace (min/mile)
                            graph2Values.add(distance); // Bottom graph: Distance (miles)
                        }
                    }
                }


            }
            Gson gson = new Gson();
            String jsonGraph1Values = gson.toJson(graph1Values);
            String jsonGraph2Values = gson.toJson(graph2Values);
            String jsonSortedDates = gson.toJson(sortedDates);
            request.setAttribute("jsonGraph1Values", jsonGraph1Values);
            request.setAttribute("jsonGraph2Values", jsonGraph2Values);
            request.setAttribute("jsonSortedDates", jsonSortedDates);

            // 3. Pass workouts to JSP
            request.setAttribute("latestWorkout", latestWorkout);
            request.setAttribute("workoutDetails", workoutDetails);
            request.setAttribute("graph1Values", graph1Values);
            request.setAttribute("graph2Values", graph2Values);
            request.setAttribute("sortedDates", sortedDates);

            // 4. Forward to Dashboard.jsp
            request.getRequestDispatcher("/Dashboard.jsp").forward(request, response);

        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().println("❌ Error loading dashboard: " + e.getMessage());
        }
    }

    @Override
    public void destroy() {
        factory.close();
        super.destroy();
    }
}
