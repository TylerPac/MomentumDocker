package dev.tylerpac;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.cfg.Configuration;
import java.io.IOException;
import java.sql.Date;
import java.util.List;

@WebServlet("/addWorkout")
public class AddWorkoutServlet extends HttpServlet {

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
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession httpSession = request.getSession(false);
        String username = (httpSession != null) ? (String) httpSession.getAttribute("username") : null;

        if (username == null) {
            response.sendRedirect("index.jsp");  // Not logged in
            return;
        }

        try (Session session = factory.openSession()) {
            Transaction transaction = session.beginTransaction();

            // 1. Find the user
            Users user = session.createQuery("FROM Users WHERE username = :username", Users.class)
                    .setParameter("username", username)
                    .uniqueResult();

            if (user == null) {
                response.sendRedirect("index.jsp");
                return;
            }

            // 2. Grab form data
            String workoutType = request.getParameter("workoutType");   // Cardio or Weightlifting
            String workoutName = request.getParameter("workoutName");   // Workout name entered
            String workoutDateStr = request.getParameter("workoutDate");

            // 3. Save Workout
            Workout workout = new Workout();
            workout.setUser(user);
            workout.setWorkoutType(workoutName);  // ⭐️ Use the entered name (not just type)
            workout.setWorkoutDate(Date.valueOf(workoutDateStr));

            session.persist(workout);
            session.flush();  // Get ID ready for WorkoutDetail

            // 4. Save WorkoutDetails based on type
            if ("Cardio".equals(workoutType)) {
                String distanceStr = request.getParameter("distance");
                String timeStr = request.getParameter("time");

                float distance = Float.parseFloat(distanceStr);
                float time = Float.parseFloat(timeStr);

                WorkoutDetail distanceDetail = new WorkoutDetail();
                distanceDetail.setWorkout(workout);
                distanceDetail.setMetricType("Distance");
                distanceDetail.setMetricValue(distance);
                distanceDetail.setMetricUnit("Miles");
                session.persist(distanceDetail);

                WorkoutDetail timeDetail = new WorkoutDetail();
                timeDetail.setWorkout(workout);
                timeDetail.setMetricType("Time");
                timeDetail.setMetricValue(time);
                timeDetail.setMetricUnit("Minutes");
                session.persist(timeDetail);

            } else if ("Weightlifting".equals(workoutType)) {
                String weightStr = request.getParameter("weight");
                String repsStr = request.getParameter("reps");

                float weight = Float.parseFloat(weightStr);
                float reps = Float.parseFloat(repsStr);

                WorkoutDetail weightDetail = new WorkoutDetail();
                weightDetail.setWorkout(workout);
                weightDetail.setMetricType("Weight");
                weightDetail.setMetricValue(weight);
                weightDetail.setMetricUnit("Pounds");
                session.persist(weightDetail);

                WorkoutDetail repsDetail = new WorkoutDetail();
                repsDetail.setWorkout(workout);
                repsDetail.setMetricType("Reps");
                repsDetail.setMetricValue(reps);
                repsDetail.setMetricUnit("Reps");
                session.persist(repsDetail);
            }

            transaction.commit();

            response.sendRedirect(request.getContextPath() + "/dashboard");

        } catch (Exception e) {
            e.printStackTrace();      // ✅ Log error
            throw new ServletException(e); // ✅ Crash cleanly if needed
        }
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

            List<String> workoutNames = session.createQuery(
                            "SELECT DISTINCT w.workoutType FROM Workout w WHERE w.user = :user", String.class)
                    .setParameter("user", user)
                    .list();

            request.setAttribute("workoutNames", workoutNames != null ? workoutNames : List.of()); // ⬅️ Prevent null crash

            request.getRequestDispatcher("/addWorkout.jsp").forward(request, response);
        } catch (Exception e) {
            e.printStackTrace();      // ✅ Log error
            throw new ServletException(e); // ✅ Crash cleanly if needed
        }
    }


    @Override
    public void destroy() {
        factory.close();
        super.destroy();
    }
}
