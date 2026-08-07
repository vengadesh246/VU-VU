import React, { useState } from 'react';
import './PaymentPage.css';

function PaymentPage({ cart, shippingDetails, onBack, onConfirmPurchase }) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const totalAmount = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

  const handleConfirm = () => {
    if (!paymentMethod) {
      setErrors({ payment: 'Please select a payment method' });
      return;
    }
    setIsProcessing(true);
    // Simulate a short delay (optional)
    setTimeout(() => {
      setIsProcessing(false);
      // Pass the payment method and total amount to parent
      // For online, we consider it as "paid" (since the seller will receive payment via WhatsApp)
      const paymentSuccess = paymentMethod === 'online';
      onConfirmPurchase(paymentMethod, totalAmount, paymentSuccess);
    }, 500);
  };

  return (
    <div className="payment-page">
      <button className="back-button" onClick={onBack}>← Back to Shipping</button>

      <div className="payment-container">
        <h2>💳 Payment</h2>

        {/* Address Review */}
        <div className="address-review">
          <h3>📍 Shipping Address</h3>
          <p><strong>{shippingDetails.customerName}</strong></p>
          <p>{shippingDetails.address}</p>
          <p>{shippingDetails.city}, {shippingDetails.state} - {shippingDetails.pincode}</p>
          {shippingDetails.landmark && <p>📍 Landmark: {shippingDetails.landmark}</p>}
          <p>📱 {shippingDetails.mobileNumber}</p>
        </div>

        {/* Order Review */}
        <div className="order-review">
          <h3>🛒 Order Summary</h3>
          {cart.map((item, index) => (
            <div key={index} className="review-item">
              <span>{item.productName} x {item.quantity}</span>
              <span>₹{(item.finalPrice * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="review-total">Total: ₹{totalAmount.toFixed(2)}</div>
        </div>

        {/* Delivery Info */}
        <div className="delivery-info">
          <span className="delivery-icon">🚚</span>
          <div className="delivery-details">
            <h4>Estimated Delivery</h4>
            <p>Within 24 hours of order confirmation</p>
            <p className="delivery-time">⏰ Free delivery</p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="payment-methods">
          <h3>Select Payment Method</h3>

          <div className="payment-option">
            <label className="payment-label">
              <input
                type="radio"
                name="payment"
                value="online"
                checked={paymentMethod === 'online'}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  setErrors({});
                }}
              />
              <div className="payment-option-content">
                <span>💳 Online Payment</span>
                <span className="payment-sub">Pay via UPI, Bank Transfer, etc.</span>
              </div>
            </label>
          </div>

          <div className="payment-option">
            <label className="payment-label">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  setErrors({});
                }}
              />
              <div className="payment-option-content">
                <span>💰 Cash on Delivery</span>
                <span className="payment-sub">Pay when you receive</span>
              </div>
            </label>
          </div>

          {errors.payment && <span className="error">{errors.payment}</span>}
        </div>

        {/* Confirm Purchase Button */}
        <div className="payment-actions">
          <button
            onClick={handleConfirm}
            className="confirm-btn"
            disabled={isProcessing}
          >
            {isProcessing ? '⏳ Processing...' : '✅ Confirm Purchase'}
          </button>
          {paymentMethod === 'online' && (
            <p className="payment-hint">After confirmation, order details will be shared via WhatsApp for payment.</p>
          )}
          {paymentMethod === 'cod' && (
            <p className="payment-hint">You can pay cash when your order arrives.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;