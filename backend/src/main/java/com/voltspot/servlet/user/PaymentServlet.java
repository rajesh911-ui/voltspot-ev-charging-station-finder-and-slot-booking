package com.voltspot.servlet.user;

import com.voltspot.dao.BookingDAO;
import com.voltspot.dao.InvoiceDAO;
import com.voltspot.dao.PaymentDAO;
import com.voltspot.model.Invoice;
import com.voltspot.model.Payment;
import com.voltspot.model.SlotBooking;
import com.voltspot.model.User;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;

@WebServlet(urlPatterns = {"/payment", "/process-payment", "/payment-success"})
public class PaymentServlet extends HttpServlet {

    private final BookingDAO bookingDAO = new BookingDAO();
    private final PaymentDAO paymentDAO = new PaymentDAO();
    private final InvoiceDAO invoiceDAO = new InvoiceDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String servletPath = req.getServletPath();

        if ("/payment-success".equals(servletPath)) {
            handlePaymentSuccessView(req, resp);
        } else {
            handlePaymentCheckoutView(req, resp);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        handleProcessPayment(req, resp);
    }

    private void handlePaymentCheckoutView(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String bookingIdStr = req.getParameter("bookingId");
        if (bookingIdStr == null || bookingIdStr.isEmpty()) {
            resp.sendRedirect(req.getContextPath() + "/my-bookings");
            return;
        }

        try {
            int bookingId = Integer.parseInt(bookingIdStr);
            SlotBooking booking = bookingDAO.findById(bookingId);
            if (booking == null) {
                resp.sendRedirect(req.getContextPath() + "/my-bookings?error=Booking+not+found.");
                return;
            }

            // If already booked/paid, redirect to invoice
            if ("BOOKED".equalsIgnoreCase(booking.getStatus()) || "COMPLETED".equalsIgnoreCase(booking.getStatus())) {
                resp.sendRedirect(req.getContextPath() + "/invoice?bookingId=" + bookingId);
                return;
            }

            BigDecimal baseAmount = booking.getAmount();
            BigDecimal taxAmount = baseAmount.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);
            BigDecimal totalAmount = baseAmount.add(taxAmount);

            req.setAttribute("booking", booking);
            req.setAttribute("baseAmount", baseAmount);
            req.setAttribute("taxAmount", taxAmount);
            req.setAttribute("totalAmount", totalAmount);

            req.getRequestDispatcher("/payment.jsp").forward(req, resp);
        } catch (NumberFormatException e) {
            resp.sendRedirect(req.getContextPath() + "/my-bookings");
        }
    }

    private void handleProcessPayment(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;
        if (user == null) {
            resp.sendRedirect(req.getContextPath() + "/login.jsp");
            return;
        }

        String bookingIdStr = req.getParameter("bookingId");
        String paymentMethod = req.getParameter("paymentMethod");
        String amountStr = req.getParameter("totalAmount");

        if (bookingIdStr == null || paymentMethod == null || bookingIdStr.isEmpty() || paymentMethod.isEmpty()) {
            resp.sendRedirect(req.getContextPath() + "/my-bookings?error=Invalid+payment+request.");
            return;
        }

        try {
            int bookingId = Integer.parseInt(bookingIdStr);
            SlotBooking booking = bookingDAO.findById(bookingId);
            if (booking == null) {
                resp.sendRedirect(req.getContextPath() + "/my-bookings?error=Booking+not+found.");
                return;
            }

            BigDecimal totalAmount = (amountStr != null && !amountStr.isEmpty()) 
                    ? new BigDecimal(amountStr)
                    : booking.getAmount().multiply(new BigDecimal("1.18")).setScale(2, RoundingMode.HALF_UP);

            String transactionId = "TXN-" + (System.currentTimeMillis() % 100000000);

            Payment payment = new Payment();
            payment.setBookingId(bookingId);
            payment.setUserId(user.getId());
            payment.setAmount(totalAmount);
            payment.setPaymentMethod(paymentMethod.toUpperCase());
            payment.setTransactionId(transactionId);
            payment.setPaymentStatus("PAID");

            boolean success = paymentDAO.processPayment(payment);
            if (success) {
                resp.sendRedirect(req.getContextPath() + "/payment-success?bookingId=" + bookingId);
            } else {
                resp.sendRedirect(req.getContextPath() + "/payment?bookingId=" + bookingId + "&error=Payment+gateway+error.+Please+try+again.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            resp.sendRedirect(req.getContextPath() + "/my-bookings?error=" + e.getMessage());
        }
    }

    private void handlePaymentSuccessView(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String bookingIdStr = req.getParameter("bookingId");
        if (bookingIdStr == null || bookingIdStr.isEmpty()) {
            resp.sendRedirect(req.getContextPath() + "/my-bookings");
            return;
        }

        try {
            int bookingId = Integer.parseInt(bookingIdStr);
            SlotBooking booking = bookingDAO.findById(bookingId);
            Payment payment = paymentDAO.findByBookingId(bookingId);
            Invoice invoice = invoiceDAO.findByBookingId(bookingId);

            req.setAttribute("booking", booking);
            req.setAttribute("payment", payment);
            req.setAttribute("invoice", invoice);

            req.getRequestDispatcher("/payment-success.jsp").forward(req, resp);
        } catch (NumberFormatException e) {
            resp.sendRedirect(req.getContextPath() + "/my-bookings");
        }
    }
}

