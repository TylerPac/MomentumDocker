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

@WebServlet("/settings")
public class SettingsServlet extends HttpServlet {
    private SessionFactory factory;

    @Override
    public void init() throws ServletException {
        factory = new Configuration()
                .configure("hibernate_SignIn.cfg.xml")
                .addAnnotatedClass(Users.class)
                .buildSessionFactory();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String username = (String) request.getSession().getAttribute("username");
        try (Session session = factory.openSession()) {
            Users user = (Users) session
                    .createQuery("FROM Users WHERE username = :username", Users.class)
                    .setParameter("username", username)
                    .uniqueResult();
            request.setAttribute("user", user);
        }
        request.getRequestDispatcher("settings.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        String currentUsername = (String) request.getSession().getAttribute("username");
        String newUsername = request.getParameter("username");
        String currentPassword = request.getParameter("currentPassword");
        String newPassword = request.getParameter("newPassword");

        try (Session session = factory.openSession()) {
            Transaction tx = session.beginTransaction();

            Users user = (Users) session
                    .createQuery("FROM Users WHERE username = :username", Users.class)
                    .setParameter("username", currentUsername)
                    .uniqueResult();

            if (user != null && user.isPasswordCorrect(currentPassword)) {
                user.setUsername(newUsername);

                if (newPassword != null && !newPassword.trim().isEmpty()) {
                    user.setPassword(newPassword);
                }

                session.merge(user);
                tx.commit();

                // Update session with new username
                request.getSession().setAttribute("username", newUsername);
                response.sendRedirect("dashboard");
            } else {
                // Incorrect password
                response.sendRedirect("settings.jsp?error=Invalid current password");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.sendRedirect("error.jsp");
        }
    }

    @Override
    public void destroy() {
        factory.close();
    }
}
