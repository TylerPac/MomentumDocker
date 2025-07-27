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
                .buildSessionFactory();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession httpSession = request.getSession(false);
        String username = (httpSession != null) ? (String) httpSession.getAttribute("username") : null;

        if (username == null) {
            response.sendRedirect("index.jsp");
            return;
        }

        try (Session session = factory.openSession()) {
            Transaction transaction = session.beginTransaction();

            Users user = session.createQuery("FROM Users WHERE username = :username", Users.class)
                    .setParameter("username", username)
                    .uniqueResult();

            if (user == null) {
                response.sendRedirect("index.jsp");
                return;
            }

            String workoutType = request.getParameter("workoutType");
            String workoutName = request.getParameter("workoutName");
            String workoutDateStr = request.getParameter("workoutDate");

            Float distance = null;
            Float time = null;
            Float weight = null;
            Integer reps = null;

            if ("Cardio".equals(workoutType)) {
                distance = Float.parseFloat(request.getParameter("distance"));
                time = Float.parseFloat(request.getParameter("time"));
            } else if ("Weightlifting".equals(workoutType)) {
                weight = Float.parseFloat(request.getParameter("weight"));
                reps = Integer.parseInt(request.getParameter("reps"));
            }

            Workout workout = new Workout(
                    user,
                    workoutType,
                    workoutName,
                    Date.valueOf(workoutDateStr),
                    distance,
                    time,
                    weight,
                    reps
            );

            session.persist(workout);
            transaction.commit();

            response.sendRedirect(request.getContextPath() + "/dashboard");

        } catch (Exception e) {
            e.printStackTrace();
            throw new ServletException(e);
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
                            "SELECT DISTINCT w.workoutName FROM Workout w WHERE w.user = :user", String.class)
                    .setParameter("user", user)
                    .list();

            request.setAttribute("workoutNames", workoutNames != null ? workoutNames : List.of());
            request.getRequestDispatcher("/addWorkout.jsp").forward(request, response);

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
