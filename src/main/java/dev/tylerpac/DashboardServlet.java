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

            /*
            Up to here i validate session and user is logged in


             */
            Map<String, List<String>> workoutMap = getWorkoutMap(session);
            request.setAttribute("workoutMap", workoutMap);






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
            String workoutType = null;
            String workoutName = null;

            if (latestWorkout != null) {
                workoutType = latestWorkout.getWorkoutType();
                workoutName = latestWorkout.getWorkoutName();

                Query<Workout> query = session.createQuery(
                        "FROM Workout w " +
                                "WHERE w.user = :user " +
                                "  AND w.workoutType = :type " +
                                "  AND w.workoutName = :name " +
                                "ORDER BY w.workoutDate ASC", Workout.class);
                query.setParameter("user", user);
                query.setParameter("type", workoutType);
                query.setParameter("name", workoutName);

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
            request.setAttribute("workoutType", workoutType);
            request.setAttribute("workoutName", workoutName);
            request.setAttribute("totalWorkouts", totalWorkouts);
            request.setAttribute("jsonGraph1Values", gson.toJson(graph1Values));
            request.setAttribute("jsonGraph2Values", gson.toJson(graph2Values));
            request.setAttribute("jsonSortedDates", gson.toJson(sortedDates));
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
        // ── 1.  Validate form fields ───────────────────────────────────────────────
        String workoutType = request.getParameter("workoutType");
        String workoutName = request.getParameter("workoutName");

        if (workoutType == null || workoutType.isEmpty()
                || workoutName == null || workoutName.isEmpty()) {
            request.setAttribute("error", "Please select both Workout Type and Workout Name!");
            request.getRequestDispatcher("/Dashboard.jsp").forward(request, response);
            return;
        }

        // ── 2.  Get the logged-in user from the session ────────────────────────────
        HttpSession httpSession = request.getSession(false);
        String username = (httpSession != null) ? (String) httpSession.getAttribute("username") : null;
        if (username == null) {                      // session expired?
            response.sendRedirect("index.jsp");
            return;
        }

        List<Workout> workoutDetails = new ArrayList<>();
        List<String>        sortedDates  = new ArrayList<>();
        List<Float>         graph1Values = new ArrayList<>();
        List<Float>         graph2Values = new ArrayList<>();

        Workout latestWorkout = null;
        Long totalWorkouts = 0L;

        try (Session session = factory.openSession()) {
            session.beginTransaction();

            // 2a. pull Users entity once
            Users user = session.createQuery(
                            "FROM Users WHERE username = :username", Users.class)
                    .setParameter("username", username)
                    .uniqueResult();
            if (user == null) {                       // should not happen
                response.sendRedirect("index.jsp");
                return;
            }

            // 2b. keep workout-type/name map for the dropdown (unchanged)
            request.setAttribute("workoutMap", getWorkoutMap(session));

            // ── 3.  Fetch only THIS user's workouts ───────────────────────────────
            Query<Workout> q = session.createQuery(
                    "FROM Workout w " +
                            "WHERE w.user = :user " +
                            "  AND w.workoutType = :type " +
                            "  AND w.workoutName = :name " +
                            "ORDER BY w.workoutDate ASC", Workout.class);
            q.setParameter("user",  user);
            q.setParameter("type",  workoutType);
            q.setParameter("name",  workoutName);

            workoutDetails = q.getResultList();

            if (!workoutDetails.isEmpty()) {
                latestWorkout = workoutDetails.get(workoutDetails.size() - 1);
            }

            totalWorkouts = session.createQuery(
                            "SELECT COUNT(w) FROM Workout w WHERE w.user = :user", Long.class)
                    .setParameter("user", user)
                    .uniqueResult();


            session.getTransaction().commit();
        } catch (Exception e) {
            e.printStackTrace();
        }

        // ── 4.  Build graph data (pace + distance for Cardio) ─────────────────────
        for (Workout w : workoutDetails) {
            sortedDates.add(w.getWorkoutDate().toString());

            if ("Cardio".equals(workoutType)
                    && w.getDistance() != null && w.getDistance() > 0
                    && w.getTime() != null) {
                float pace = w.getTime() / w.getDistance();   // min per mile/km
                graph1Values.add(pace);                       // Graph-1: pace
                graph2Values.add(w.getDistance());            // Graph-2: distance
            } else if ("Weightlifting".equals(workoutType)
                    && w.getWeight() != null && w.getReps() != null) {
                graph1Values.add(w.getWeight());              // Graph-1: weight
                graph2Values.add(w.getReps().floatValue());   // Graph-2: reps
            }
        }

        // ── 5.  Pass everything to the JSP ────────────────────────────────────────
        Gson gson = new Gson();
        request.setAttribute("latestWorkout", latestWorkout);
        request.setAttribute("totalWorkouts", totalWorkouts);
        request.setAttribute("workoutType", workoutType);
        request.setAttribute("workoutName", workoutName);
        request.setAttribute("workoutDetails", workoutDetails);
        request.setAttribute("jsonSortedDates",  gson.toJson(sortedDates));
        request.setAttribute("jsonGraph1Values", gson.toJson(graph1Values));
        request.setAttribute("jsonGraph2Values", gson.toJson(graph2Values));

        request.getRequestDispatcher("/Dashboard.jsp").forward(request, response);
    }

    @Override
    public void destroy() {
        factory.close();
        super.destroy();
    }

    private Map<String, List<String>> getWorkoutMap(Session session) {
        Map<String, List<String>> workoutMap = new HashMap<>();
        Query<Object[]> query = session.createQuery(
                "SELECT w.workoutType, w.workoutName FROM Workout w GROUP BY w.workoutType, w.workoutName",
                Object[].class
        );
        for (Object[] row : query.getResultList()) {
            String workoutType = (String) row[0];
            String workoutName = (String) row[1];
            workoutMap.computeIfAbsent(workoutType, k -> new ArrayList<>()).add(workoutName);
        }
        return workoutMap;
    }
}
