package com.voltspot.servlet.user;

import com.voltspot.dao.InvoiceDAO;
import com.voltspot.model.Invoice;
import com.voltspot.model.User;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

@WebServlet(urlPatterns = {"/invoice", "/download-invoice"})
public class InvoiceServlet extends HttpServlet {

    private final InvoiceDAO invoiceDAO = new InvoiceDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;
        if (user == null) {
            resp.sendRedirect(req.getContextPath() + "/login.jsp");
            return;
        }

        String bookingIdStr = req.getParameter("bookingId");
        String invoiceNumber = req.getParameter("invoiceNumber");

        Invoice invoice = null;
        if (bookingIdStr != null && !bookingIdStr.isEmpty()) {
            try {
                invoice = invoiceDAO.findByBookingId(Integer.parseInt(bookingIdStr));
            } catch (NumberFormatException ignored) {}
        } else if (invoiceNumber != null && !invoiceNumber.isEmpty()) {
            invoice = invoiceDAO.findByInvoiceNumber(invoiceNumber);
        }

        if (invoice == null) {
            resp.sendRedirect(req.getContextPath() + "/my-bookings?error=Invoice+not+found+or+payment+pending.");
            return;
        }

        // Authorization check: User must own the invoice, or be Admin/Operator
        if (invoice.getUserId() != user.getId() && !user.isAdmin() && !user.isOperator()) {
            resp.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied.");
            return;
        }

        req.setAttribute("invoice", invoice);
        req.getRequestDispatcher("/invoice.jsp").forward(req, resp);
    }
}

