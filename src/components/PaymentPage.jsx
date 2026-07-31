// PaymentPage.js
import React, { useState, useEffect } from 'react';
import './PaymentPage.css';

function PaymentPage({ cart, shippingDetails, onBack, onConfirmPurchase }) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  const totalAmount = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

  // Get customer's exact location when component mounts
  useEffect(() => {
    getCustomerLocation();
  }, []);

  const getCustomerLocation = () => {
    setIsLoadingLocation(true);
    setLocationError('');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const accuracy = position.coords.accuracy;
          
          // Create location object
          const location = {
            lat: latitude,
            lng: longitude,
            accuracy: accuracy,
            // Create Google Maps link with exact coordinates
            mapsLink: `https://www.google.com/maps?q=${latitude},${longitude}`,
            // Create Google Maps link for navigation
            navigationLink: `https://www.google.com/maps/dir//${latitude},${longitude}`,
            // Create embedded map link
            embedLink: `https://www.google.com/maps/embed/v1/place?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbV6arttYg&q=${latitude},${longitude}`
          };
          
          setCustomerLocation(location);
          setIsLoadingLocation(false);
          
          console.log('📍 Customer Location Detected:', location);
        },
        (error) => {
          console.error('Location Error:', error);
          let errorMsg = 'Unable to get your location. ';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMsg += 'Please allow location access in your browser.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg += 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMsg += 'Location request timed out.';
              break;
            default:
              errorMsg += 'Please enter your address manually.';
          }
          setLocationError(errorMsg);
          setIsLoadingLocation(false);
          
          // Try to get location from IP as fallback
          getLocationFromIP();
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
      setIsLoadingLocation(false);
      // Try to get location from IP as fallback
      getLocationFromIP();
    }
  };

  // Fallback: Get location from IP address
  const getLocationFromIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        const location = {
          lat: data.latitude,
          lng: data.longitude,
          accuracy: 'IP-based (approximate)',
          mapsLink: `https://www.google.com/maps?q=${data.latitude},${data.longitude}`,
          navigationLink: `https://www.google.com/maps/dir//${data.latitude},${data.longitude}`,
          city: data.city,
          region: data.region,
          country: data.country_name
        };
        setCustomerLocation(location);
        console.log('📍 IP-based Location Detected:', location);
      }
    } catch (error) {
      console.error('IP location error:', error);
    }
    setIsLoadingLocation(false);
  };

  // Function to generate Google Maps link from address (as fallback)
  const generateGoogleMapsLink = (address, city, state, pincode) => {
    // Create a full address string
    const fullAddress = `${address}, ${city}, ${state} - ${pincode}`;
    // Encode the address for URL
    const encodedAddress = encodeURIComponent(fullAddress);
    // Create Google Maps search link
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  };

  const shareOnWhatsApp = (method, amount) => {
    const customerName = shippingDetails.customerName || 'Customer';
    const mobile = shippingDetails.mobileNumber || 'Not provided';
    const address = shippingDetails.address || 'Not provided';
    const city = shippingDetails.city || 'Not provided';
    const state = shippingDetails.state || 'Not provided';
    const pincode = shippingDetails.pincode || 'Not provided';
    const landmark = shippingDetails.landmark || 'Not provided';
    
    // Generate Google Maps link - prefer exact location if available
    let googleMapsLink = '';
    let locationAccuracy = '';
    
    if (customerLocation && customerLocation.lat && customerLocation.lng) {
      // Use exact GPS location
      googleMapsLink = `https://www.google.com/maps?q=${customerLocation.lat},${customerLocation.lng}`;
      locationAccuracy = customerLocation.accuracy ? ` (Accuracy: ${customerLocation.accuracy.toFixed(0)} meters)` : '';
    } else {
      // Fallback to address-based link
      googleMapsLink = generateGoogleMapsLink(address, city, state, pincode);
      locationAccuracy = ' (Address-based location)';
    }
    
    const cartItems = cart.map(item => 
      `${item.productName} x ${item.quantity} = ₹${(item.finalPrice * item.quantity).toFixed(2)}`
    ).join('\n');
    
    const paymentMethodText = method === 'online' ? 'Online Payment' : 'Cash on Delivery';
    
    // Calculate delivery time (24 hours from now)
    const deliveryTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const formattedDeliveryTime = deliveryTime.toLocaleString();
    
    const message = `📦 *NEW ORDER DETAILS* 📦

👤 *Customer Name:* ${customerName}
📱 *Mobile Number:* ${mobile}

🏠 *Address Details:*
${address}
${city}, ${state} - ${pincode}
${landmark ? `📍 Landmark: ${landmark}` : ''}

📍 *Customer Exact Location on Google Maps:*${locationAccuracy}
${googleMapsLink}

📱 *Google Maps Navigation Link:*
https://www.google.com/maps/dir//${customerLocation ? `${customerLocation.lat},${customerLocation.lng}` : encodeURIComponent(`${address}, ${city}, ${state}`)}

🛒 *Order Items:*
${cartItems}

💰 *Total Amount:* ₹${amount.toFixed(2)}
💳 *Payment Method:* ${paymentMethodText}

⏰ *Delivery Time:* Within 24 hours (by ${formattedDeliveryTime})

📅 *Order Date:* ${new Date().toLocaleString()}

Thank you for your order`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = '917092492023';
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappLink, '_blank');
  };

  const handlePayment = () => {
    if (!paymentMethod) {
      setErrors({ payment: 'Please select a payment method' });
      return;
    }

    // Check if location is being fetched
    if (isLoadingLocation) {
      alert('⏳ Please wait, fetching your location...');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setOrderConfirmed(true);
      shareOnWhatsApp(paymentMethod, totalAmount);
      onConfirmPurchase(paymentMethod, totalAmount);
    }, 2000);
  };

  // Retry location detection
  const retryLocation = () => {
    getCustomerLocation();
  };

  return (
    <div className="payment-page">
      <button className="back-button" onClick={onBack}>
        ← Back to Shipping
      </button>

      <div className="payment-container">
        <h2>Payment</h2>

        <div className="address-review">
          <h3>Shipping Address</h3>
          <p><strong>Name:</strong> {shippingDetails.customerName}</p>
          <p><strong>Address:</strong> {shippingDetails.address}</p>
          <p><strong>City:</strong> {shippingDetails.city}, <strong>State:</strong> {shippingDetails.state} - {shippingDetails.pincode}</p>
          {shippingDetails.landmark && <p><strong>Landmark:</strong> {shippingDetails.landmark}</p>}
          <p><strong>📞 Mobile:</strong> {shippingDetails.mobileNumber}</p>
          
          {/* Location Status */}
          <div className="location-status">
            {isLoadingLocation ? (
              <div className="location-loading">
                <span className="spinner">⏳</span> Fetching your exact location...
              </div>
            ) : customerLocation ? (
              <div className="location-found">
                <span className="location-icon">📍</span>
                <span className="location-text">
                  Location detected!
                  {customerLocation.accuracy && customerLocation.accuracy !== 'IP-based (approximate)' && (
                    <span className="accuracy-text"> (Accuracy: {customerLocation.accuracy.toFixed(0)} meters)</span>
                  )}
                </span>
                <a 
                  href={customerLocation.mapsLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="maps-link"
                >
                  🗺️ View on Google Maps
                </a>
              </div>
            ) : locationError ? (
              <div className="location-error">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{locationError}</span>
                <button onClick={retryLocation} className="retry-location-btn">
                  🔄 Retry
                </button>
              </div>
            ) : null}
          </div>

          {customerLocation && (
            <div className="location-map-preview">
              <iframe
                title="Customer Location Map"
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbV6arttYg&q=${customerLocation.lat},${customerLocation.lng}&zoom=16`}
                width="100%"
                height="200"
                style={{ border: 0, borderRadius: '8px' }}
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          )}
        </div>

        <div className="order-review">
          <h3>Order Items</h3>
          {cart.map(item => (
            <div key={item.id} className="review-item">
              <span>{item.productName} x {item.quantity}</span>
              <span>₹{(item.finalPrice * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="review-total">
            <strong>Total Amount: ₹{totalAmount.toFixed(2)}</strong>
          </div>
        </div>

        <div className="delivery-info">
          <div className="delivery-icon">🚚</div>
          <div className="delivery-details">
            <h4>Delivery Information</h4>
            <p>Your order will be delivered within <strong>24 hours</strong></p>
            <p className="delivery-time">
              Estimated delivery by: <strong>{new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString()}</strong>
            </p>
          </div>
        </div>

        <div className="payment-methods">
          <h3>Select Payment Method</h3>
          
          <div className="payment-option">
            <label className="payment-label">
              <input
                type="radio"
                name="payment"
                value="online"
                checked={paymentMethod === 'online'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="payment-option-content">
                <span>💳 Online Payment</span>
                <span className="payment-sub">Credit/Debit Card, UPI, Net Banking</span>
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

        <div className="payment-actions">
          <button 
            onClick={handlePayment} 
            className={`confirm-btn ${orderConfirmed ? 'confirmed' : ''}`}
            disabled={isProcessing || orderConfirmed}
          >
            {isProcessing ? '⏳ Processing...' : orderConfirmed ? '✅ Order Confirmed!' : '✅ Confirm Purchase'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;