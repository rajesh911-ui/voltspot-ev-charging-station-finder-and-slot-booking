package com.voltspot.servlet.user;

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

@WebServlet("/submit-feedback")
public class FeedbackServlet extends HttpServlet {

    private final FeedbackDAO feedbackDAO = new FeedbackDAO();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;
        if (user == null) {
            resp.sendRedirect(req.getContextPath() + "/login.jsp");
            return;
        }

        String stationIdStr = req.getParameter("stationId");
        String bookingIdStr = req.getParameter("bookingId");
        String ratingStr = req.getParameter("rating");
        String comments = req.getParameter("comments");

        if (stationIdStr == null || ratingStr == null || comments == null ||
            stationIdStr.isEmpty() || ratingStr.isEmpty() || comments.trim().isEmpty()) {
            resp.sendRedirect(req.getContextPath() + "/stations?error=Rating+and+comments+are+required.");
            return;
        }

        try {
            int stationId = Integer.parseInt(stationIdStr);
            int rating = Integer.parseInt(ratingStr);
            Integer bookingId = (bookingIdStr != null && !bookingIdStr.isEmpty()) ? Integer.parseInt(bookingIdStr) : null;

            Feedback feedback = new Feedback();
            feedback.setStationId(stationId);
            feedback.setUserId(user.getId());
            feedback.setBookingId(bookingId);
            feedback.setRating(Math.max(1, Math.min(5, rating)));
            feedback.setComments(comments.trim());

            boolean success = feedbackDAO.addFeedback(feedback);
            if (success) {
                resp.sendRedirect(req.getContextPath() + "/station-detail?id=" + stationId + "&success=Thank+you!+Your+feedback+has+been+submitted.");
            } else {
                resp.sendRedirect(req.getContextPath() + "/station-detail?id=" + stationId + "&error=Failed+to+submit+feedback.");
            }
        } catch (NumberFormatException e) {
            resp.sendRedirect(req.getContextPath() + "/stations");
        }
    }
}

