package com.voltspot.servlet.operator;

import com.voltspot.dao.FeedbackDAO;
import com.voltspot.model.Feedback;
import com.voltspot.model.User;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.List;

@WebServlet("/operator/feedback")
public class OperatorFeedbackServlet extends HttpServlet {

    private final FeedbackDAO feedbackDAO = new FeedbackDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;
        if (user == null || (!user.isOperator() && !user.isAdmin())) {
            resp.sendRedirect(req.getContextPath() + "/login.jsp");
            return;
        }

        List<Feedback> feedbackList = feedbackDAO.findByOperatorId(user.getId());
        req.setAttribute("feedbacks", feedbackList);
        req.getRequestDispatcher("/operator/feedback.jsp").forward(req, resp);
    }
}

