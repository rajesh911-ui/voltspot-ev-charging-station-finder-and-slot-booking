package com.voltspot.servlet.admin;

import com.voltspot.dao.PaymentDAO;
import com.voltspot.dao.ReportDAO;
import com.voltspot.model.Payment;
import com.voltspot.model.User;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@WebServlet("/admin/payments")
public class AdminPaymentServlet extends HttpServlet {

    private final PaymentDAO paymentDAO = new PaymentDAO();
    private final ReportDAO reportDAO = new ReportDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;
        if (user == null || !user.isAdmin()) {
            resp.sendRedirect(req.getContextPath() + "/login.jsp");
            return;
        }

        List<Payment> paymentList = paymentDAO.findAll();
        BigDecimal totalRevenue = paymentDAO.getTotalRevenue();
        List<Map<String, Object>> methodBreakdown = reportDAO.getRevenueByPaymentMethod();

        req.setAttribute("payments", paymentList);
        req.setAttribute("totalRevenue", totalRevenue);
        req.setAttribute("methodBreakdown", methodBreakdown);

        req.getRequestDispatcher("/admin/payments.jsp").forward(req, resp);
    }
}

