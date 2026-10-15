// ShippingPage.js
import React, { useState, useEffect } from 'react';
import './ShippingPage.css';

function ShippingPage({ cart, onBack, onProceedToPayment, customerId, customerName }) {
  const [formData, setFormData] = useState({
    customerName: customerName || '',
    mobileNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    addressType: 'home'
  });
  const [errors, setErrors] = useState({});
  const [isLocationDetected, setIsLocationDetected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [locationLink, setLocationLink] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);

  useEffect(() => {
    loadSavedAddresses();
  }, [customerId]);

  const loadSavedAddresses = () => {
    const saved = localStorage.getItem(`addresses_${customerId}`);
    if (saved) {
      try {
        const addresses = JSON.parse(saved);
        setSavedAddresses(addresses);
      } catch (e) {
        setSavedAddresses([]);
      }
    } else {
      setSavedAddresses([]);
    }
  };

  const saveAddresses = (addresses) => {
    localStorage.setItem(`addresses_${customerId}`, JSON.stringify(addresses));
    setSavedAddresses(addresses);
  };

  const detectLocation = () => {
    setIsLoading(true);
    setErrors({});
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
          setLocationLink(mapsLink);
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`)
            .then(response => response.json())
            .then(data => {
              if (data && data.display_name) {
                const addressParts = data.address || {};
                const houseNumber = addressParts.house_number || '';
                const road = addressParts.road || addressParts.street || '';
                const suburb = addressParts.suburb || addressParts.neighbourhood || '';
                const city = addressParts.city || addressParts.town || addressParts.village || '';
                const state = addressParts.state || '';
                const pincode = addressParts.postcode || '';
                const country = addressParts.country || '';
                let detailedAddress = '';
                if (houseNumber) detailedAddress += `${houseNumber}, `;
                if (road) detailedAddress += `${road}, `;
                if (suburb) detailedAddress += `${suburb}, `;
                if (city) detailedAddress += `${city}, `;
                if (state) detailedAddress += `${state} - `;
                if (pincode) detailedAddress += `${pincode}, `;
                if (country) detailedAddress += `${country}`;
                if (detailedAddress.length < 20) {
                  detailedAddress = data.display_name;
                }
                setFormData(prev => ({
                  ...prev,
                  address: detailedAddress || prev.address,
                  city: city || prev.city,
                  state: state || prev.state,
                  pincode: pincode || prev.pincode
                }));
                setIsLocationDetected(true);
                setIsLoading(false);
                validateField('address', detailedAddress);
                validateField('city', city);
                validateField('state', state);
                validateField('pincode', pincode);
              }
            })
            .catch(() => setIsLoading(false));
        },
        (error) => {
          setIsLoading(false);
          setErrors(prev => ({
            ...prev,
            location: '❌ Unable to detect location. Please enter address manually.'
          }));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setIsLoading(false);
      setErrors(prev => ({
        ...prev,
        location: '❌ Geolocation is not supported by your browser.'
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };
    const val = value || formData[fieldName];
    switch (fieldName) {
      case 'customerName':
        if (!val || val.trim() === '') newErrors.customerName = 'Customer name is required';
        else delete newErrors.customerName;
        break;
      case 'mobileNumber':
        if (!val) newErrors.mobileNumber = 'Mobile number is required';
        else if (!/^[6-9]\d{9}$/.test(val)) newErrors.mobileNumber = 'Enter a valid 10-digit mobile number';
        else delete newErrors.mobileNumber;
        break;
      case 'address':
        if (!val || val.trim() === '') newErrors.address = 'Address is required';
        else delete newErrors.address;
        break;
      case 'city':
        if (!val || val.trim() === '') newErrors.city = 'City is required';
        else delete newErrors.city;
        break;
      case 'state':
        if (!val || val.trim() === '') newErrors.state = 'State is required';
        else delete newErrors.state;
        break;
      case 'pincode':
        if (!val) newErrors.pincode = 'Pincode is required';
        else if (!/^[1-9][0-9]{5}$/.test(val)) newErrors.pincode = 'Enter a valid 6-digit pincode';
        else delete newErrors.pincode;
        break;
      default: break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    if (!selectedAddressId && !formData.address) {
      newErrors.address = 'Please select an address or enter a new one';
      isValid = false;
    }
    if (!formData.customerName || formData.customerName.trim() === '') {
      newErrors.customerName = 'Customer name is required';
      isValid = false;
    }
    if (!formData.mobileNumber) {
      newErrors.mobileNumber = 'Mobile number is required';
      isValid = false;
    } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Enter a valid 10-digit mobile number';
      isValid = false;
    }
    if (!formData.address || formData.address.trim() === '') {
      newErrors.address = 'Address is required';
      isValid = false;
    }
    if (!formData.city || formData.city.trim() === '') {
      newErrors.city = 'City is required';
      isValid = false;
    }
    if (!formData.state || formData.state.trim() === '') {
      newErrors.state = 'State is required';
      isValid = false;
    }
    if (!formData.pincode) {
      newErrors.pincode = 'Pincode is required';
      isValid = false;
    } else if (!/^[1-9][0-9]{5}$/.test(formData.pincode)) {
      newErrors.pincode = 'Enter a valid 6-digit pincode';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      if (!selectedAddressId && !isEditing) {
        const newAddress = {
          id: Date.now(),
          customerName: formData.customerName,
          mobileNumber: formData.mobileNumber,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          landmark: formData.landmark,
          addressType: formData.addressType,
          locationLink: locationLink,
          createdAt: new Date().toISOString(),
          isDefault: savedAddresses.length === 0
        };
        const updatedAddresses = [...savedAddresses, newAddress];
        saveAddresses(updatedAddresses);
      }
      // Pass form data + location link
      onProceedToPayment({ ...formData, locationLink });
    }
  };

  const handleSelectAddress = (addressId) => {
    const address = savedAddresses.find(a => a.id === addressId);
    if (address) {
      setSelectedAddressId(addressId);
      setFormData({
        customerName: address.customerName || formData.customerName,
        mobileNumber: address.mobileNumber || formData.mobileNumber,
        address: address.address,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        landmark: address.landmark || '',
        addressType: address.addressType || 'home'
      });
      setLocationLink(address.locationLink || '');
      setIsEditing(false);
      setEditAddressId(null);
      setErrors(prev => ({ ...prev, address: '' }));
    }
  };

  const handleEditAddress = (addressId) => {
    const address = savedAddresses.find(a => a.id === addressId);
    if (address) {
      setEditAddressId(addressId);
      setFormData({
        customerName: address.customerName || formData.customerName,
        mobileNumber: address.mobileNumber || formData.mobileNumber,
        address: address.address,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        landmark: address.landmark || '',
        addressType: address.addressType || 'home'
      });
      setLocationLink(address.locationLink || '');
      setIsEditing(true);
      setSelectedAddressId(null);
    }
  };

  const handleDeleteAddress = (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      const updatedAddresses = savedAddresses.filter(a => a.id !== addressId);
      saveAddresses(updatedAddresses);
      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
        setFormData({
          customerName: customerName || '',
          mobileNumber: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          landmark: '',
          addressType: 'home'
        });
        setLocationLink('');
      }
      if (editAddressId === addressId) {
        setIsEditing(false);
        setEditAddressId(null);
      }
    }
  };

  const handleSetDefaultAddress = (addressId) => {
    const updatedAddresses = savedAddresses.map(a => ({
      ...a,
      isDefault: a.id === addressId
    }));
    saveAddresses(updatedAddresses);
  };

  const handleAddNewAddress = () => {
    setSelectedAddressId(null);
    setEditAddressId(null);
    setIsEditing(false);
    setFormData({
      customerName: customerName || '',
      mobileNumber: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      addressType: 'home'
    });
    setLocationLink('');
    setErrors({});
  };

  const handleUpdateAddress = () => {
    if (validateForm()) {
      const updatedAddresses = savedAddresses.map(a => {
        if (a.id === editAddressId) {
          return {
            ...a,
            customerName: formData.customerName,
            mobileNumber: formData.mobileNumber,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            landmark: formData.landmark,
            addressType: formData.addressType,
            locationLink: locationLink
          };
        }
        return a;
      });
      saveAddresses(updatedAddresses);
      setSelectedAddressId(editAddressId);
      setIsEditing(false);
      setEditAddressId(null);
      showNotification('✅ Address updated successfully!');
    }
  };

  const showNotification = (message) => {
    const Toast = document.createElement('div');
    Toast.className = 'toast-message';
    Toast.innerHTML = message;
    document.body.appendChild(Toast);
    setTimeout(() => Toast.remove(), 3000);
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

  const getAddressTypeIcon = (type) => {
    switch(type) {
      case 'home': return '🏠';
      case 'work': return '💼';
      case 'other': return '📍';
      default: return '📍';
    }
  };

  const getAddressTypeLabel = (type) => {
    switch(type) {
      case 'home': return 'Home';
      case 'work': return 'Work';
      case 'other': return 'Other';
      default: return 'Other';
    }
  };

  return (
    <div className="shipping-page">
      <button className="back-button" onClick={onBack}>← Back to Cart</button>
      <div className="shipping-container">
        <h2>📦 Shipping Details</h2>
        <div className="order-summary-mini">
          <h3>Order Summary</h3>
          <p>Items: {cart.reduce((sum, item) => sum + item.quantity, 0)}</p>
          <p className="total-amount">Total: ₹{totalAmount.toFixed(2)}</p>
        </div>

        {savedAddresses.length > 0 && (
          <div className="saved-addresses-section">
            <div className="section-header">
              <h3>📍 Saved Addresses</h3>
              <button onClick={handleAddNewAddress} className="add-address-btn">➕ Add New</button>
            </div>
            <div className="address-list">
              {savedAddresses.map(address => (
                <div
                  key={address.id}
                  className={`address-card ${selectedAddressId === address.id ? 'selected' : ''}`}
                >
                  <div className="address-card-header">
                    <span className="address-type-badge">
                      {getAddressTypeIcon(address.addressType)} {getAddressTypeLabel(address.addressType)}
                      {address.isDefault && <span className="default-badge">Default</span>}
                    </span>
                    <div className="address-actions">
                      <button onClick={() => handleEditAddress(address.id)} className="edit-address-btn">✏️</button>
                      <button onClick={() => handleDeleteAddress(address.id)} className="delete-address-btn">🗑️</button>
                    </div>
                  </div>
                  <div className="address-card-content" onClick={() => handleSelectAddress(address.id)}>
                    <p className="address-name">{address.customerName || customerName}</p>
                    <p className="address-detail">{address.address}</p>
                    <p className="address-detail">{address.city}, {address.state} - {address.pincode}</p>
                    {address.landmark && <p className="address-landmark">📍 Landmark: {address.landmark}</p>}
                    <p className="address-phone">📱 {address.mobileNumber}</p>
                    {!address.isDefault && (
                      <button onClick={(e) => { e.stopPropagation(); handleSetDefaultAddress(address.id); }} className="set-default-btn">
                        Set as Default
                      </button>
                    )}
                  </div>
                  {selectedAddressId === address.id && <div className="address-selected-badge">✅ Selected</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="address-form-container">
          <h3>
            {isEditing ? '✏️ Edit Address' :
             selectedAddressId ? '📌 Selected Address' :
             '📝 Enter Shipping Address'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Customer Name *</label>
              <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} onBlur={() => validateField('customerName')} placeholder="Enter your full name" />
              {errors.customerName && <span className="error">{errors.customerName}</span>}
            </div>

            <div className="form-group">
              <label>Mobile Number *</label>
              <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} onBlur={() => validateField('mobileNumber')} placeholder="Enter 10-digit mobile number" maxLength="10" />
              {errors.mobileNumber && <span className="error">{errors.mobileNumber}</span>}
            </div>

            <div className="form-group">
              <label>Address Type</label>
              <div className="address-type-selector">
                <button type="button" className={`type-btn ${formData.addressType === 'home' ? 'active' : ''}`} onClick={() => setFormData(prev => ({ ...prev, addressType: 'home' }))}>🏠 Home</button>
                <button type="button" className={`type-btn ${formData.addressType === 'work' ? 'active' : ''}`} onClick={() => setFormData(prev => ({ ...prev, addressType: 'work' }))}>💼 Work</button>
                <button type="button" className={`type-btn ${formData.addressType === 'other' ? 'active' : ''}`} onClick={() => setFormData(prev => ({ ...prev, addressType: 'other' }))}>📍 Other</button>
              </div>
            </div>

            <div className="form-group">
              <label>Address *</label>
              <textarea name="address" value={formData.address} onChange={handleChange} onBlur={() => validateField('address')} placeholder="Enter your full address" rows="3" />
              {errors.address && <span className="error">{errors.address}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} onBlur={() => validateField('city')} placeholder="Enter city" />
                {errors.city && <span className="error">{errors.city}</span>}
              </div>
              <div className="form-group">
                <label>State *</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} onBlur={() => validateField('state')} placeholder="Enter state" />
                {errors.state && <span className="error">{errors.state}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Pincode *</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} onBlur={() => validateField('pincode')} placeholder="Enter 6-digit pincode" maxLength="6" />
                {errors.pincode && <span className="error">{errors.pincode}</span>}
              </div>
              <div className="form-group">
                <label>Landmark (Optional)</label>
                <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Nearby landmark" />
              </div>
            </div>

            <div className="location-actions">
              <button type="button" onClick={detectLocation} className={`detect-location-btn ${isLocationDetected ? 'detected' : ''}`} disabled={isLoading}>
                {isLoading ? '🔍 Detecting...' : '📍 Detect My Location'}
                {isLocationDetected && <span className="green-dot">●</span>}
              </button>
              <button type="button" onClick={() => window.open('https://www.google.com/maps', '_blank')} className="open-maps-btn">🗺️ Open Google Maps</button>
            </div>

            {errors.location && <span className="error location-error">{errors.location}</span>}
            {isLocationDetected && locationLink && (
              <div className="location-link-container">
                <a href={locationLink} target="_blank" rel="noopener noreferrer" className="location-link">📍 View on Google Maps</a>
              </div>
            )}

            <div className="form-actions">
              {isEditing ? (
                <>
                  <button type="button" onClick={handleUpdateAddress} className="proceed-btn">💾 Update Address</button>
                  <button type="button" onClick={() => { setIsEditing(false); setEditAddressId(null); if (selectedAddressId) handleSelectAddress(selectedAddressId); else handleAddNewAddress(); }} className="cancel-btn">Cancel</button>
                </>
              ) : (
                <button type="submit" className="proceed-btn">
                  {selectedAddressId ? '✅ Use This Address' : 'Proceed to Payment →'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ShippingPage;