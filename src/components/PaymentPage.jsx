// PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import './PaymentPage.css';

// 🔁 Replace with your actual UPI ID
const UPI_ID = 'sowdammalricemill246@okicici'; // e.g., 'example@paytm'

function PaymentPage({ cart, shippingDetails, onBack, onConfirmPurchase }) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [upiPaymentStep, setUpiPaymentStep] = useState('idle'); // idle | processing | success

  const totalAmount = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

  // Get location on mount
  useEffect(() => {
    getCustomerLocation();
  }, []);

  // ----- Location Functions -----
  const getCustomerLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLoadingLocation(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCustomerLocation({ latitude, longitude, accuracy });
        setIsLoadingLocation(false);
      },
      (error) => {
        setIsLoadingLocation(false);
        setLocationError('Unable to retrieve location. Please check your permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const retryLocation = () => {
    getCustomerLocation();
  };

  const generateGoogleMapsLink = () => {
    if (!customerLocation) return '#';
    const { latitude, longitude } = customerLocation;
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  };

  // ----- UPI -----
  const getUpiUri = () => {
    const merchantName = encodeURIComponent('SRM Rice Store');
    const amount = totalAmount.toFixed(2);
    return `upi://pay?pa=${UPI_ID}&pn=${merchantName}&am=${amount}&cu=INR`;
  };

  const getQrCodeUrl = () => {
    const upiUri = getUpiUri();
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`;
  };

  // ----- Share on WhatsApp -----
  const shareOnWhatsApp = (method, amount) => {
    const message = `✅ Order Confirmed!\n\n` +
                    `Order Total: ₹${amount.toFixed(2)}\n` +
                    `Payment Method: ${method === 'online' ? 'Online Payment (UPI)' : 'Cash on Delivery'}\n` +
                    `Shipping Address: ${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.state} - ${shippingDetails.pincode}\n` +
                    `Thank you for shopping with SRM Rice Store! 🌾`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // ----- Payment Handling -----
  const handlePayment = () => {
    if (!paymentMethod) {
      setErrors({ payment: 'Please select a payment method' });
      return;
    }

    if (isLoadingLocation) {
      alert('⏳ Please wait, fetching your location...');
      return;
    }

    // Online payment flow
    if (paymentMethod === 'online') {
      setUpiPaymentStep('processing');
      setIsProcessing(true);
      // Simulate payment processing
      setTimeout(() => {
        setIsProcessing(false);
        setUpiPaymentStep('success');
        setOrderConfirmed(true);
        shareOnWhatsApp(paymentMethod, totalAmount);
        onConfirmPurchase(paymentMethod, totalAmount, true);
      }, 2500);
      return;
    }

    // COD flow
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setOrderConfirmed(true);
      shareOnWhatsApp(paymentMethod, totalAmount);
      onConfirmPurchase(paymentMethod, totalAmount, false);
    }, 2000);
  };

  return (
    <div className="payment-page">
      <button className="back-button" onClick={onBack}>← Back to Shipping</button>

      <div className="payment-container">
        <h2>Payment</h2>

        {/* Address Review */}
        <div className="address-review">
          <h3>📍 Shipping Address</h3>
          <p><strong>{shippingDetails.customerName}</strong></p>
          <p>{shippingDetails.address}</p>
          <p>{shippingDetails.city}, {shippingDetails.state} - {shippingDetails.pincode}</p>
          {shippingDetails.landmark && <p>📍 Landmark: {shippingDetails.landmark}</p>}
          <p>📱 {shippingDetails.mobileNumber}</p>
          {customerLocation && (
            <div className="location-link-container">
              <a href={generateGoogleMapsLink()} target="_blank" rel="noopener noreferrer" className="maps-link">
                🗺️ View on Google Maps
              </a>
            </div>
          )}
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
                  setUpiPaymentStep('idle');
                }}
              />
              <div className="payment-option-content">
                <span>💳 Online Payment (UPI)</span>
                <span className="payment-sub">Pay via UPI, Credit/Debit Card, Net Banking</span>
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
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="payment-option-content">
                <span>💰 Cash on Delivery</span>
                <span className="payment-sub">Pay when you receive</span>
              </div>
            </label>
          </div>

          {errors.payment && <span className="error">{errors.payment}</span>}
        </div>

        {/* UPI Payment Section */}
        {paymentMethod === 'online' && (
          <div className="upi-payment-section">
            <h3>🔹 Pay with UPI</h3>
            <div className="upi-details">
              <p><strong>UPI ID:</strong> {UPI_ID}</p>
              <button
                className="copy-upi-btn"
                onClick={() => {
                  navigator.clipboard.writeText(UPI_ID);
                  alert('UPI ID copied to clipboard!');
                }}
              >
                📋 Copy UPI ID
              </button>
            </div>

            <div className="qr-container">
              <img src={getQrCodeUrl()} alt="UPI QR Code" className="qr-code" />
              <p className="qr-hint">Scan with any UPI app to pay</p>
            </div>

            <div className="upi-actions">
              {upiPaymentStep === 'idle' && (
                <button className="pay-now-btn" onClick={handlePayment} disabled={isProcessing}>
                  💳 Pay ₹{totalAmount.toFixed(2)}
                </button>
              )}
              {upiPaymentStep === 'processing' && (
                <button className="pay-now-btn processing" disabled>⏳ Processing Payment...</button>
              )}
              {upiPaymentStep === 'success' && (
                <div className="payment-success">✅ Payment Successful! Your order is confirmed.</div>
              )}
            </div>

            <div className="upi-note">
              <p>💡 After payment, click the "Confirm Purchase" button below to place your order.</p>
            </div>
          </div>
        )}

        {/* Confirm Purchase Button */}
        <div className="payment-actions">
          <button
            onClick={handlePayment}
            className={`confirm-btn ${orderConfirmed ? 'confirmed' : ''}`}
            disabled={
              isProcessing ||
              orderConfirmed ||
              (paymentMethod === 'online' && upiPaymentStep !== 'success')
            }
          >
            {isProcessing ? '⏳ Processing...' :
             orderConfirmed ? '✅ Order Confirmed!' :
             paymentMethod === 'online' && upiPaymentStep === 'success' ? '✅ Place Order' :
             '✅ Confirm Purchase'}
          </button>
          {paymentMethod === 'online' && upiPaymentStep === 'idle' && (
            <p className="payment-hint">Please complete the UPI payment first.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;