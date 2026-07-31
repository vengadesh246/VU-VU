import React, { useState, useEffect } from 'react';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mobileError, setMobileError] = useState('');

  useEffect(() => {
    const savedSession = localStorage.getItem('userSession');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (session.expiry && new Date(session.expiry) > new Date()) {
          if (session.userType === 'user' || session.userType === 'guest') {
            onLogin('user', {
              customerId: session.customerId,
              loginId: session.loginId,
              name: session.name,
              isGuest: session.isGuest || false
            });
          }
          return;
        } else {
          localStorage.removeItem('userSession');
        }
      } catch (e) {
        localStorage.removeItem('userSession');
      }
    }
  }, [onLogin]);

  const validateIndianMobile = (mobile) => {
    const cleanMobile = mobile.replace(/\s/g, '');
    if (!cleanMobile.startsWith('+91')) {
      return { valid: false, message: '❌ Mobile number must start with +91 (India)' };
    }
    const numberPart = cleanMobile.substring(3);
    if (!/^\d{10}$/.test(numberPart)) {
      return { valid: false, message: '❌ Please enter exactly 10 digits after +91' };
    }
    if (!/^[6-9]/.test(numberPart)) {
      return { valid: false, message: '❌ Mobile number must start with 6, 7, 8, or 9' };
    }
    return { valid: true, message: '✅ Valid mobile number' };
  };

  const formatMobileNumber = (value) => {
    if (value.startsWith('+91')) {
      const numberPart = value.substring(3).replace(/\D/g, '');
      const limitedNumber = numberPart.substring(0, 10);
      return `+91${limitedNumber}`;
    }
    if (value.trim() !== '' && !value.startsWith('+91')) {
      const cleanNumber = value.replace(/\D/g, '');
      const limitedNumber = cleanNumber.substring(0, 10);
      return `+91${limitedNumber}`;
    }
    return value;
  };

  const handleMobileChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatMobileNumber(rawValue);
    setEmailOrMobile(formattedValue);
    if (formattedValue.length > 0) {
      const validation = validateIndianMobile(formattedValue);
      setMobileError(validation.valid ? '' : validation.message);
    } else {
      setMobileError('');
    }
  };

  const handleCustomerLogin = (loginId, customerName) => {
    const existingCustomers = JSON.parse(localStorage.getItem('customerUsers') || '[]');
    let existingCustomer = existingCustomers.find(c => c.loginId === loginId);
    let customerData;
    let userProfile = {};

    if (existingCustomer) {
      customerData = {
        customerId: existingCustomer.customerId,
        loginId: loginId,
        name: existingCustomer.name || customerName || loginId,
        isNew: false
      };
      userProfile = JSON.parse(localStorage.getItem(`profile_${existingCustomer.customerId}`) || '{}');
    } else {
      const newCustomerId = `CUST${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;
      const newCustomer = {
        customerId: newCustomerId,
        loginId: loginId,
        name: customerName || loginId,
        createdDate: new Date().toISOString()
      };
      existingCustomers.push(newCustomer);
      localStorage.setItem('customerUsers', JSON.stringify(existingCustomers));
      customerData = {
        customerId: newCustomerId,
        loginId: loginId,
        name: newCustomer.name,
        isNew: true
      };
      userProfile = {
        name: newCustomer.name,
        mobile: loginId,
        address: '',
        city: '',
        pincode: '',
        profilePicture: ''
      };
      localStorage.setItem(`profile_${newCustomerId}`, JSON.stringify(userProfile));
      alert(`✅ Welcome ${customerData.name}! Your account has been created.`);
    }

    const session = {
      userType: 'user',
      customerId: customerData.customerId,
      loginId: loginId,
      name: customerData.name,
      profile: userProfile,
      expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    localStorage.setItem('userSession', JSON.stringify(session));
    onLogin('user', customerData);
  };

  const handleGuestLogin = () => {
    const guestId = `GUEST${Date.now().toString().slice(-8)}`;
    const guestName = 'Guest User';
    const guestData = {
      customerId: guestId,
      loginId: `guest_${guestId}`,
      name: guestName,
      isGuest: true,
      isNew: true
    };
    localStorage.setItem('guestSession', JSON.stringify({
      guestId: guestId,
      loginTime: new Date().toISOString()
    }));
    const session = {
      userType: 'guest',
      customerId: guestId,
      loginId: `guest_${guestId}`,
      name: guestName,
      isGuest: true,
      expiry: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
    };
    localStorage.setItem('userSession', JSON.stringify(session));
    alert('👋 Continuing as Guest! Your cart will be saved temporarily.');
    onLogin('user', guestData);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const validation = validateIndianMobile(emailOrMobile);
    if (!validation.valid) {
      setError(validation.message);
      setIsLoading(false);
      return;
    }
    if (password.trim() === '') {
      setError('❌ Please enter your password');
      setIsLoading(false);
      return;
    }

    const mobileNumber = emailOrMobile.substring(3);
    const customerName = `User_${mobileNumber}`;
    handleCustomerLogin(emailOrMobile, customerName);
    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>🌾 SRM </h2>
        <p className="login-subtitle">Welcome Back!</p>

        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>📱 Mobile Number</label>
            <input
              type="text"
              value={emailOrMobile}
              onChange={handleMobileChange}
              placeholder="+919876543210"
              required
              className={mobileError ? 'input-error' : ''}
            />
            {mobileError && (
              <div className="mobile-validation-error">{mobileError}</div>
            )}
            {emailOrMobile && !mobileError && emailOrMobile.length > 0 && (
              <div className="mobile-validation-success">✅ Valid mobile number</div>
            )}
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          )}

          <button type="submit" className="login-btn customer-login-btn" disabled={isLoading || !!mobileError}>
            {isLoading ? 'Logging in...' : '🔑 Login'}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button onClick={handleGuestLogin} className="guest-login-btn">
          🚀 Continue Without Login (Guest)
        </button>

        <div className="guest-info">
          <small>🛍️ Browse and purchase as a guest</small>
          <small className="guest-sub">Your cart will be saved temporarily on this device</small>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;