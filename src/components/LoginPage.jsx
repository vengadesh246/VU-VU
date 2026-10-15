import React, { useState, useEffect } from 'react';
import './LoginPage.css';
import { signInAnonymously, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

function LoginPage({ onLogin }) {
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mobileError, setMobileError] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminMobile, setAdminMobile] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminDebug, setAdminDebug] = useState('');

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

  const handleCustomerLogin = async (loginId, customerName) => {
  try {
    const userCredential = await signInAnonymously(auth);
    const firebaseUid = userCredential.user.uid;

    const existingCustomers = JSON.parse(localStorage.getItem('customerUsers') || '[]');
    let existingCustomer = existingCustomers.find(c => c.loginId === loginId);
    let customerData;
    let userProfile = {};

    if (existingCustomer) {
      customerData = {
        customerId: existingCustomer.customerId,
        loginId: loginId,
        name: existingCustomer.name || customerName || loginId,
        isNew: false,
        firebaseUid: firebaseUid
      };
      userProfile = JSON.parse(localStorage.getItem(`profile_${existingCustomer.customerId}`) || '{}');
    } else {
      const newCustomerId = `CUST${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;
      const newCustomer = {
        customerId: newCustomerId,
        loginId: loginId,
        name: customerName || loginId,
        createdDate: new Date().toISOString(),
        firebaseUid: firebaseUid
      };
      existingCustomers.push(newCustomer);
      localStorage.setItem('customerUsers', JSON.stringify(existingCustomers));
      customerData = {
        customerId: newCustomerId,
        loginId: loginId,
        name: newCustomer.name,
        isNew: true,
        firebaseUid: firebaseUid
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
      firebaseUid: firebaseUid,
      expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    localStorage.setItem('userSession', JSON.stringify(session));
    onLogin('user', customerData);
  } catch (error) {
    console.error('❌ Customer login error:', error);
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);

    let msg = '❌ Login failed.';
    switch (error.code) {
      case 'auth/operation-not-allowed':
        msg = '❌ Anonymous sign-in is DISABLED. Enable it in Firebase Console → Authentication → Sign-in method → Anonymous.';
        break;
      case 'auth/api-key-not-valid':
      case 'auth/invalid-api-key':
        msg = '❌ Firebase API key is invalid. Check src/firebase.jsx config.';
        break;
      case 'auth/network-request-failed':
        msg = '❌ Network error. Check your internet connection.';
        break;
      case 'auth/too-many-requests':
        msg = '❌ Too many requests. Please wait a few minutes and try again.';
        break;
      default:
        msg = '❌ ' + (error.code || 'Unknown error') + ': ' + (error.message || '');
    }
    setError(msg);
    setIsLoading(false);
  }
};

 const handleGuestLogin = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    const firebaseUid = userCredential.user.uid;
    const guestId = `GUEST${Date.now().toString().slice(-8)}`;
    const guestName = 'Guest User';
    const guestData = {
      customerId: guestId,
      loginId: `guest_${guestId}`,
      name: guestName,
      isGuest: true,
      isNew: true,
      firebaseUid: firebaseUid
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
      firebaseUid: firebaseUid,
      expiry: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
    };
    localStorage.setItem('userSession', JSON.stringify(session));
    alert('👋 Continuing as Guest! Your cart will be saved temporarily.');
    onLogin('user', guestData);
  } catch (error) {
    console.error('❌ Guest login error:', error);
    console.error('   Code:', error.code);

    let msg = '❌ Could not start guest session.';
    if (error.code === 'auth/operation-not-allowed') {
      msg = '❌ Anonymous sign-in is DISABLED. Enable it in Firebase Console → Authentication → Sign-in method → Anonymous.';
    } else if (error.code === 'auth/network-request-failed') {
      msg = '❌ Network error. Check your internet.';
    } else {
      msg = '❌ ' + (error.code || 'Unknown error');
    }
    alert(msg);
  }
};

  // ============================================
  // ADMIN LOGIN
  // Field accepts EITHER:
  //   - 7092492023  (or +917092492023)
  //   - sowdammalricemill246@gmail.com
  // Both authenticate against Firebase email:
  //   sowdammalricemill246@gmail.com
  // ============================================
  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setAdminError('');
    setAdminDebug('');

    const ADMIN_MOBILE = '7092492023';
    const ADMIN_EMAIL  = 'sowdammalricemill246@gmail.com';

    // ---- Normalize whatever the user typed ----
    const rawInput     = (adminMobile || '').trim();
    const noSpaces     = rawInput.replace(/\s+/g, '');        // remove ALL whitespace
    const noCountry    = noSpaces.replace(/^\+91/, '');       // strip leading +91
    const noAllDigits  = noCountry.replace(/\D/g, '');        // for mobile compare
    const asEmail      = noCountry.toLowerCase();             // for email compare

    const isMobileMatch = noAllDigits === ADMIN_MOBILE;
    const isEmailMatch  = asEmail === ADMIN_EMAIL.toLowerCase();

    // ---- Debug output (visible on screen + console) ----
    const dbg =
      `Input: "${rawInput}" | Normalized: "${noCountry}" | ` +
      `Mobile match: ${isMobileMatch} | Email match: ${isEmailMatch}`;
    console.log('🟡 Admin login attempt →', dbg);
    setAdminDebug(dbg);

    if (!isMobileMatch && !isEmailMatch) {
      setAdminError('❌ Enter admin mobile 7092492023 or admin email sowdammalricemill246@gmail.com');
      return;
    }

    if (!adminPassword || adminPassword.length < 6) {
      setAdminError('❌ Password must be at least 6 characters');
      return;
    }

    try {
      // Always authenticate against the Firebase email
      const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, adminPassword);
      const adminUid = cred.user.uid;
      console.log('✅ Admin UID:', adminUid);

      const session = {
        userType: 'admin',
        uid: adminUid,
        expiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      localStorage.setItem('userSession', JSON.stringify(session));
      localStorage.setItem('ecommerceUser', JSON.stringify({ role: 'admin' }));
      onLogin('admin');
      setShowAdminModal(false);
    } catch (error) {
      console.error('❌ Admin login error:', error);
      console.error('   Code:', error.code);
      console.error('   Message:', error.message);

      let msg = '❌ Login failed.';
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
          msg = '❌ Wrong password. Reset it in Firebase Console → Authentication → Users.';
          break;
        case 'auth/user-not-found':
          msg = '❌ No Firebase user with email ' + ADMIN_EMAIL + '. Create it in Auth → Users.';
          break;
        case 'auth/operation-not-allowed':
          msg = '❌ Email/Password provider is DISABLED. Enable it in Firebase Console → Authentication → Sign-in method.';
          break;
        case 'auth/invalid-email':
          msg = '❌ Email format is invalid: ' + ADMIN_EMAIL;
          break;
        case 'auth/too-many-requests':
          msg = '❌ Too many attempts. Wait a few minutes and try again.';
          break;
        case 'auth/network-request-failed':
          msg = '❌ Network error. Check your internet connection.';
          break;
        default:
          msg = '❌ ' + (error.code || 'Unknown error') + ': ' + (error.message || '');
      }
      setAdminError(msg);
    }
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
      <button className="admin-icon-btn" onClick={() => setShowAdminModal(true)}>A</button>

      <div className="login-card">
        <h2>🌾 SRM</h2>
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

      {/* Admin Login Modal */}
      {showAdminModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAdminModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>👑 Admin Login</h3>
            <form onSubmit={handleAdminLoginSubmit}>
              <div className="input-group">
                <label>Admin Mobile or Email</label>
                <input
                  type="text"
                  value={adminMobile}
                  onChange={(e) => setAdminMobile(e.target.value)}
                  placeholder="7092492023 or sowdammalricemill246@gmail.com"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoComplete="off"
                  required
                />
              </div>
              {adminError && <div className="error-message">{adminError}</div>}
              {adminDebug && (
                <div style={{
                  fontSize: '11px',
                  color: '#666',
                  background: '#f3f3f3',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  marginTop: '6px',
                  wordBreak: 'break-all'
                }}>
                  <strong>Debug:</strong> {adminDebug}
                </div>
              )}
              <button type="submit" className="login-btn">Login as Admin</button>
              <button type="button" className="cancel-btn" onClick={() => setShowAdminModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;