package dev.tylerpac;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;

import dev.tylerpac.model.Users;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.cfg.Configuration;

@WebServlet("/createAccount")
public class CreateAccountServlet extends HttpServlet {

    private SessionFactory factory;

    @Override
    public void init() throws ServletException {
        super.init();
        factory = new Configuration()
                .configure("hibernate_SignIn.cfg.xml")
                .addAnnotatedClass(Users.class)
                .buildSessionFactory();  // ❌ No more UserData.class
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        // Get form inputs
        String username = request.getParameter("username");
        String plainPassword = request.getParameter("password");

        try (Session hibernateSession = factory.openSession()) {
            Transaction transaction = hibernateSession.beginTransaction();

            // Save new user
            Users user = new Users(username, plainPassword);
            hibernateSession.persist(user);

            transaction.commit();
        } catch (Exception e) {
            e.printStackTrace();
        }

        response.sendRedirect(request.getContextPath() + "/welcome.jsp");
    }

    @Override
    public void destroy() {
        factory.close();
        super.destroy();
    }
}
