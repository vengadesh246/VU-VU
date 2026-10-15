import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import CustomerHome from './components/CustomerHome';
import AdminPanel from './components/AdminPanel';
import Logo from './components/Logo';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [customerLoginId, setCustomerLoginId] = useState(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('ecommerceUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setIsLoggedIn(true);
        setUserRole(user.role);
        if (user.role === 'user' && user.customerId) {
          setCustomerId(user.customerId);
          setCustomerLoginId(user.loginId);
          setIsGuest(user.isGuest || false);
        }
      } catch {
        localStorage.removeItem('ecommerceUser');
      }
    }
  }, []);

  const handleLogin = (role, customerData = null) => {
    setUserRole(role);
    setIsLoggedIn(true);

    if (role === 'user' && customerData) {
      setCustomerId(customerData.customerId);
      setCustomerLoginId(customerData.loginId);
      setIsGuest(customerData.isGuest || false);

      localStorage.setItem('ecommerceUser', JSON.stringify({
        role,
        customerId: customerData.customerId,
        loginId: customerData.loginId,
        isGuest: customerData.isGuest || false
      }));
    } else {
      localStorage.setItem('ecommerceUser', JSON.stringify({ role }));
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setCustomerId(null);
    setCustomerLoginId(null);
    setIsGuest(false);
    localStorage.removeItem('ecommerceUser');
    localStorage.removeItem('userSession');
  };

  const homeElement = isLoggedIn ? (
    <div className="App">
      <div className="app-header">
        <Logo />
      </div>
      {userRole === 'admin' ? (
        <AdminPanel onLogout={handleLogout} />
      ) : (
        <CustomerHome
          onLogout={handleLogout}
          customerId={customerId}
          customerLoginId={customerLoginId}
        />
      )}
    </div>
  ) : (
    <div className="app-container">
      <div className="header-logo">
        <Logo />
      </div>
      <LoginPage onLogin={handleLogin} />
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={homeElement} />
        {/* ✅ Catch-all: any unknown path redirects to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;