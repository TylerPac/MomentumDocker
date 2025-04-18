package dev.tylerpac;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.cfg.Configuration;
import java.io.IOException;
import java.util.logging.*;

@WebServlet("/signin")
public class SignInServlet extends HttpServlet {
    private static final Logger logger = Logger.getLogger(SignInServlet.class.getName());
    static {
        try {
            LogManager.getLogManager().readConfiguration(
                    SignInServlet.class.getClassLoader().getResourceAsStream("logging.properties"));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private SessionFactory factory;

    @Override
    public void init() throws ServletException {
        super.init();
        factory = new Configuration()
                .configure("hibernate_SignIn.cfg.xml")
                .addAnnotatedClass(Users.class)
                .buildSessionFactory();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        String action = request.getParameter("action"); // "signin" or "create"
        String username = request.getParameter("username");
        String password = request.getParameter("password");

        try (Session session = factory.openSession()) {
            Transaction transaction = session.beginTransaction();

            if ("create".equals(action)) {
                logger.info("Attempting to create user: " + username);
                // 🛠️ First, check if username already exists
                Users existingUser = session.createQuery("FROM Users WHERE username = :username", Users.class)
                        .setParameter("username", username)
                        .uniqueResult();

                if (existingUser != null) {
                    logger.warning("Username already taken: " + username);
                    // Username already exists
                    request.setAttribute("errorMessage", "Username already taken. Please choose another one.");
                    request.getRequestDispatcher("/index.jsp").forward(request, response);
                    return; // ⚡ Don't continue creating
                }

                // Otherwise, create new user
                Users newUser = new Users(username, password);
                session.persist(newUser);
                transaction.commit();

                logger.info("✅ User created successfully: " + username);

                HttpSession session1 = request.getSession();
                session1.setAttribute("username", username);

                // Redirect to Dashboard
                response.sendRedirect(request.getContextPath() + "/dashboard");

            } else if ("signin".equals(action)) {
                logger.info("User attempting sign-in: " + username);

                // 🛠️ Correct way: use a QUERY to find user by username
                Users existingUser = session.createQuery("FROM Users WHERE username = :username", Users.class)
                        .setParameter("username", username)
                        .uniqueResult();

                if (existingUser != null && existingUser.isPasswordCorrect(password)) {
                    logger.info("✅ User signed in successfully: " + username);
                    HttpSession session1 = request.getSession();
                    session1.setAttribute("username", username);

                    // Redirect to Dashboard
                    response.sendRedirect(request.getContextPath() + "/dashboard");

                } else {
                    logger.warning("❌ Invalid login attempt for username: " + username);
                    request.setAttribute("errorMessage", "Invalid username or password.");
                    request.getRequestDispatcher("/index.jsp").forward(request, response);
                }

                transaction.commit();
            } else {
                logger.warning("❓ Unknown action received: " + action);
                response.getWriter().println("❓ Unknown action.");
            }
        } catch (Exception e) {
            logger.severe("❌ Exception during processing: " + e.getMessage());
            response.getWriter().println("❌ Error occurred: " + e.getMessage());
        }
    }

    @Override
    public void destroy() {
        if (factory != null) {
            factory.close(); // Close Hibernate SessionFactory properly
        }
        com.mysql.cj.jdbc.AbandonedConnectionCleanupThread.checkedShutdown(); // Cleanup MySQL thread
    }
}
