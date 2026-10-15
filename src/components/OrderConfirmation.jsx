// src/components/OrderConfirmation.jsx
import React from 'react';
import './OrderConfirmation.css';

function OrderConfirmation({ order, onContinue }) {
  if (!order) {
    return (
      <div className="confirmation-container">
        <h2>No order to display</h2>
        <button className="confirm-btn" onClick={onContinue}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="confirmation-container">
      <h2>✅ Order Confirmed!</h2>
      <p>Thank you for your purchase. Your order has been placed successfully.</p>

      <div className="order-summary">
        <p><strong>Order ID:</strong> {order.orderId}</p>
        <p><strong>Total Amount:</strong> ₹{order.totalAmount?.toFixed(2)}</p>
        <p><strong>Payment Method:</strong> {order.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}</p>
        <p><strong>Status:</strong> {order.status}</p>
      </div>

      <div className="action-buttons">
        <button className="confirm-btn" onClick={onContinue}>Continue Shopping</button>
      </div>
    </div>
  );
}

export default OrderConfirmation;