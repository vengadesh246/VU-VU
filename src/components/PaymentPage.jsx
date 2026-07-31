// PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import './PaymentPage.css';

// 🔁 Replace this with your actual UPI ID
const UPI_ID = 'your-upi@upi'; // e.g., 'example@paytm' or 'example@upi'

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

  // ... (location functions remain unchanged) ...

  // Generate UPI deep link and QR code URL
  const getUpiUri = () => {
    const merchantName = encodeURIComponent('SRM Rice Store');
    const amount = totalAmount.toFixed(2);
    return `upi://pay?pa=${UPI_ID}&pn=${merchantName}&am=${amount}&cu=INR`;
  };

  const getQrCodeUrl = () => {
    const upiUri = getUpiUri();
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`;
  };

  const handlePayment = () => {
    if (!paymentMethod) {
      setErrors({ payment: 'Please select a payment method' });
      return;
    }

    if (isLoadingLocation) {
      alert('⏳ Please wait, fetching your location...');
      return;
    }

    // If online payment, start UPI simulation
    if (paymentMethod === 'online') {
      setUpiPaymentStep('processing');
      setIsProcessing(true);
      // Simulate payment processing
      setTimeout(() => {
        setIsProcessing(false);
        setUpiPaymentStep('success');
        setOrderConfirmed(true);
        // Share on WhatsApp after successful payment
        shareOnWhatsApp(paymentMethod, totalAmount);
        // Confirm purchase with payment success flag
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

  // ... (shareOnWhatsApp, retryLocation, generateGoogleMapsLink remain the same) ...

  return (
    <div className="payment-page">
      <button className="back-button" onClick={onBack}>
        ← Back to Shipping
      </button>

      <div className="payment-container">
        <h2>Payment</h2>

        {/* Address Review (unchanged) */}
        <div className="address-review">...</div>

        {/* Order Review (unchanged) */}
        <div className="order-review">...</div>

        {/* Delivery Info (unchanged) */}
        <div className="delivery-info">...</div>

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

        {/* UPI Payment Section (shown only when online is selected) */}
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
                <button 
                  className="pay-now-btn"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  💳 Pay ₹{totalAmount.toFixed(2)}
                </button>
              )}
              {upiPaymentStep === 'processing' && (
                <button className="pay-now-btn processing" disabled>
                  ⏳ Processing Payment...
                </button>
              )}
              {upiPaymentStep === 'success' && (
                <div className="payment-success">
                  ✅ Payment Successful! Your order is confirmed.
                </div>
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