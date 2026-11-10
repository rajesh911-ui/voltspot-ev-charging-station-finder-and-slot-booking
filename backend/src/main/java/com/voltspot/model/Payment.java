package com.voltspot.model;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class Payment {
    private int id;
    private int bookingId;
    private int userId;
    private BigDecimal amount;
    private String paymentMethod; // 'CARD', 'UPI', 'NET_BANKING', 'WALLET'
    private String transactionId;
    private String paymentStatus; // 'PAID', 'PENDING', 'FAILED', 'REFUNDED'
    private Timestamp paymentDate;

    // Associated fields
    private String bookingNumber;
    private String userName;

    public Payment() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getBookingId() { return bookingId; }
    public void setBookingId(int bookingId) { this.bookingId = bookingId; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public Timestamp getPaymentDate() { return paymentDate; }
    public void setPaymentDate(Timestamp paymentDate) { this.paymentDate = paymentDate; }

    public String getBookingNumber() { return bookingNumber; }
    public void setBookingNumber(String bookingNumber) { this.bookingNumber = bookingNumber; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
}

