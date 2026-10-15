import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import './PaymentPage.css';

function PaymentPage({ cart, shippingDetails, onBack, onConfirmPurchase, customerId, customerName, isGuest }) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [showCouponPopup, setShowCouponPopup] = useState(false);

  const totalAmount = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
  const [finalTotal, setFinalTotal] = useState(totalAmount);

  // ---- Apply coupon (manual entry only) ----
  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponMessage('Please enter a coupon code');
      return;
    }
    setIsApplying(true);
    setCouponMessage('');

    try {
      const allSnap = await getDocs(collection(db, 'coupons'));
      const allCoupons = allSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (allCoupons.length === 0) {
        setCouponMessage('❌ Invalid coupon code');
        setIsApplying(false);
        return;
      }

      const coupon = allCoupons.find(c =>
        String(c.code || '').trim().toUpperCase() === code
      );

      if (!coupon) {
        setCouponMessage(`❌ Invalid coupon code "${code}"`);
        setIsApplying(false);
        return;
      }

      // Active check (missing/undefined = active)
      if (coupon.active === false) {
        setCouponMessage('❌ This coupon is inactive');
        setIsApplying(false);
        return;
      }

      // Expiry check
      if (coupon.expiry && new Date(coupon.expiry) < new Date()) {
        setCouponMessage('❌ Coupon has expired');
        setIsApplying(false);
        return;
      }

      // Minimum order check
      const minOrder = Number(coupon.minOrder || 0);
      if (totalAmount < minOrder) {
        setCouponMessage(`❌ Minimum order ₹${minOrder} required`);
        setIsApplying(false);
        return;
      }

      // Usage limit check
      const maxUses = Number(coupon.maxUses || 0);
      const usedCount = Number(coupon.usedCount || 0);
      if (maxUses > 0 && usedCount >= maxUses) {
        setCouponMessage('❌ Coupon usage limit reached');
        setIsApplying(false);
        return;
      }

      // Per-user check
      if (!isGuest && customerId) {
        const userProfile = JSON.parse(localStorage.getItem(`profile_${customerId}`) || '{}');
        if (userProfile.usedCoupons && userProfile.usedCoupons.includes(code)) {
          setCouponMessage('❌ You have already used this coupon');
          setIsApplying(false);
          return;
        }
      }

      // Calculate discount
      const val = Number(coupon.discountValue || 0);
      let discount = coupon.discountType === 'percentage'
        ? (totalAmount * val) / 100
        : val;
      if (discount > totalAmount) discount = totalAmount;
      if (discount < 0) discount = 0;

      setDiscountAmount(discount);
      setFinalTotal(totalAmount - discount);
      setAppliedCoupon(coupon);
      setCouponMessage('');
      setShowCouponPopup(true);
      setTimeout(() => setShowCouponPopup(false), 4000);
    } catch (err) {
      console.error('❌ Coupon apply error:', err);
      setCouponMessage('❌ Error applying coupon. Please try again.');
    }
    setIsApplying(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setFinalTotal(totalAmount);
    setCouponMessage('');
    setCouponCode('');
  };

  const handleConfirm = () => {
    if (!paymentMethod) {
      setErrors({ payment: 'Please select a payment method' });
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const paymentSuccess = paymentMethod === 'online';
      onConfirmPurchase(paymentMethod, finalTotal, paymentSuccess, appliedCoupon ? appliedCoupon.code : null, discountAmount);
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
          {appliedCoupon && (
            <div className="review-item coupon-line">
              <span>🎫 Coupon {appliedCoupon.code}</span>
              <span>- ₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="review-total">Total: ₹{finalTotal.toFixed(2)}</div>
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

        {/* Coupon Section — manual entry only */}
        <div className="coupon-section">
          <h3>🎫 Apply Coupon</h3>

          <div className="coupon-input-group">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              disabled={!!appliedCoupon}
            />
            {!appliedCoupon ? (
              <button
                onClick={handleApplyCoupon}
                className="apply-coupon-btn"
                disabled={isApplying}
              >
                {isApplying ? '⏳ Applying...' : 'Apply'}
              </button>
            ) : (
              <button onClick={handleRemoveCoupon} className="remove-coupon-btn">Remove</button>
            )}
          </div>

          {couponMessage && (
            <span className={`coupon-message ${couponMessage.startsWith('✅') ? 'success' : 'error'}`}>
              {couponMessage}
            </span>
          )}
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
                onChange={(e) => { setPaymentMethod(e.target.value); setErrors({}); }}
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
                onChange={(e) => { setPaymentMethod(e.target.value); setErrors({}); }}
              />
              <div className="payment-option-content">
                <span>💰 Cash on Delivery</span>
                <span className="payment-sub">Pay when you receive</span>
              </div>
            </label>
          </div>
          {errors.payment && <span className="error">{errors.payment}</span>}
        </div>

        {/* Confirm Button */}
        <div className="payment-actions">
          <button onClick={handleConfirm} className="confirm-btn" disabled={isProcessing}>
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

      {/* 🎉 Coupon Applied Popup */}
      {showCouponPopup && appliedCoupon && (
        <div className="coupon-popup-overlay" onClick={() => setShowCouponPopup(false)}>
          <div className="coupon-popup" onClick={(e) => e.stopPropagation()}>
            <div className="coupon-popup-sparkles-top">
              <span>✨</span><span>⭐</span><span>✨</span>
            </div>
            <div className="coupon-popup-icon">🎉</div>
            <h3>Coupon Applied!</h3>
            <div className="coupon-popup-code">{appliedCoupon.code}</div>
            <p className="coupon-popup-save">
              You saved ₹{discountAmount.toFixed(2)}
            </p>
            <p className="coupon-popup-sub">
              {appliedCoupon.discountType === 'percentage'
                ? `${appliedCoupon.discountValue}% off on your order`
                : `Flat ₹${appliedCoupon.discountValue} off`}
            </p>
            <div className="coupon-popup-sparkles-bottom">
              <span>✨</span><span>💫</span><span>✨</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentPage;