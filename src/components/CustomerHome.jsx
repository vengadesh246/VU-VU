// src/components/CustomerHome.jsx
import React, { useState, useEffect } from 'react';
import ShippingPage from './ShippingPage';
import PaymentPage from './PaymentPage';
import { db } from '../firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import './CustomerHome.css';

// Replace with your actual UPI ID
const UPI_ID = 'sowdammalricemill246@okicici';

function CustomerHome({ onLogout, customerId, customerLoginId }) {
  // ---- State ----
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [currentVideo, setCurrentVideo] = useState('');
  const [wishlist, setWishlist] = useState([]);
  const [showShipping, setShowShipping] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [shippingDetails, setShippingDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showWishlist, setShowWishlist] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState([]);
  const [orderTimers, setOrderTimers] = useState({});
  const [customerName, setCustomerName] = useState('');
  const [isGuest, setIsGuest] = useState(false);

  // Buy Now direct flow (independent of cart)
  const [buyNowProduct, setBuyNowProduct] = useState(null);

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  // Review modal
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Footer modals
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // ---- Helper functions ----
  const getCustomerKey = (baseKey) => `${customerId}_${baseKey}`;

  // ---- Load data on mount ----
useEffect(() => {
  const isGuestUser = customerId?.startsWith('GUEST');
  setIsGuest(isGuestUser);

  if (isGuestUser) {
    setCustomerName('Guest User');
  } else {
    const savedName = localStorage.getItem(getCustomerKey('customerName'));
    if (savedName) {
      setCustomerName(savedName);
    } else {
      const name = prompt('Please enter your name to continue:', '');
      if (name) {
        setCustomerName(name);
        localStorage.setItem(getCustomerKey('customerName'), name);
      } else {
        setCustomerName('Customer');
        localStorage.setItem(getCustomerKey('customerName'), 'Customer');
      }
    }
  }

  // Load cart, wishlist, categories from localStorage (these stay local)
  loadCart();
  loadWishlist();
  loadCategories();

  // ---- REAL-TIME PRODUCTS from Firestore ----
  const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
    const productsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setProducts(productsData);
  }, (error) => {
    console.error('Error loading products:', error);
  });

  // ---- REAL-TIME ORDERS for this customer from Firestore ----
  const ordersQuery = query(
    collection(db, 'orders'),
    where('customerId', '==', customerId),
    orderBy('orderDate', 'desc')
  );
  const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
    const ordersData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setOrders(ordersData);
    const timers = {};
    ordersData.forEach(order => {
      if (order.status === 'Confirmed' && order.confirmationDate) {
        timers[order.id] = calculateRemainingTime(order);
      }
    });
    setOrderTimers(timers);
  }, (error) => {
    console.error('Error loading orders:', error);
  });

  // ---- Start timer interval ----
  const interval = setInterval(() => {
    setOrders(prevOrders => {
      const updatedTimers = {};
      prevOrders.forEach(order => {
        if (order.status === 'Confirmed' && order.confirmationDate) {
          updatedTimers[order.id] = calculateRemainingTime(order);
        }
      });
      setOrderTimers(updatedTimers);
      return prevOrders;
    });
  }, 1000);

  return () => {
    unsubscribeProducts();
    unsubscribeOrders();
    clearInterval(interval);
  };
}, [customerId]);

  // ---- Data loading from localStorage (cart, wishlist, categories) ----
  const loadCategories = () => {
    const saved = localStorage.getItem('categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCategories(parsed);
        return;
      } catch (e) {}
    }
    setCategories(['Basmati', 'Brown', 'White', 'Specialty', 'Organic']);
  };

  const loadCart = () => {
    const savedCart = isGuest ? localStorage.getItem('guestCart') : localStorage.getItem(getCustomerKey('userCart'));
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      setCart([]);
    }
  };

  const loadWishlist = () => {
    const savedWishlist = isGuest ? localStorage.getItem('guestWishlist') : localStorage.getItem(getCustomerKey('userWishlist'));
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    } else {
      setWishlist([]);
    }
  };

  // ---- Timer for delivery ----
  const calculateRemainingTime = (order) => {
    const startDate = order.status === 'Confirmed' && order.confirmationDate
      ? order.confirmationDate
      : order.orderDate;
    const orderTime = new Date(startDate).getTime();
    const currentTime = new Date().getTime();
    const elapsed = currentTime - orderTime;
    const remaining = 24 * 60 * 60 * 1000 - elapsed;
    if (remaining <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, expired: true };
    }
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
    return { hours, minutes, seconds, expired: false };
  };

  // ---- Cart & Wishlist actions (unchanged, use localStorage) ----
  const addToCart = (product) => {
    if (product.stock <= 0) {
      showToast('❌ Sorry, this product is out of stock!');
      return;
    }
    const existingItem = cart.find(item => item.id === product.id);
    let updatedCart;
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        showToast(`⚠️ Only ${product.stock} available in stock.`);
        return;
      }
      updatedCart = cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }
    setCart(updatedCart);
    const storageKey = isGuest ? 'guestCart' : getCustomerKey('userCart');
    localStorage.setItem(storageKey, JSON.stringify(updatedCart));
    showToast(`✅ Added ${product.productName} to cart!`);
  };

  const handleBuyNow = (product) => {
    if (product.stock <= 0) {
      showToast('❌ Sorry, this product is out of stock!');
      return;
    }
    setBuyNowProduct(product);
    setShowCart(false);
    setSelectedProduct(null);
    setShowShipping(true);
  };

  const addToWishlist = (product) => {
    const exists = wishlist.find(item => item.id === product.id);
    let updatedWishlist;
    if (exists) {
      updatedWishlist = wishlist.filter(item => item.id !== product.id);
      showToast(`❌ Removed ${product.productName} from wishlist`);
    } else {
      updatedWishlist = [...wishlist, product];
      showToast(`❤️ Added ${product.productName} to wishlist`);
    }
    setWishlist(updatedWishlist);
    const storageKey = isGuest ? 'guestWishlist' : getCustomerKey('userWishlist');
    localStorage.setItem(storageKey, JSON.stringify(updatedWishlist));
  };

  const showToast = (message) => {
    const Toast = document.createElement('div');
    Toast.className = 'toast-message';
    Toast.innerHTML = message;
    document.body.appendChild(Toast);
    setTimeout(() => Toast.remove(), 2000);
  };

  // ---- Video player ----
  const playVideo = (videoId) => {
    if (videoId) {
      setCurrentVideo(videoId);
      setShowVideo(true);
    } else {
      alert('No video available for this product');
    }
  };

  // ---- Checkout flow ----
  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    setBuyNowProduct(null);
    setShowCart(false);
    setShowShipping(true);
  };

  const handleProceedToPayment = (details) => {
    setShippingDetails(details);
    setShowShipping(false);
    setShowPayment(true);
  };

  const handleBackToCart = () => {
    setShowShipping(false);
    setShowCart(true);
  };

  const handleBackFromBuyNow = () => {
    setBuyNowProduct(null);
    setShowShipping(false);
  };

  const handleBackToShipping = () => {
    setShowPayment(false);
    setShowShipping(true);
  };

  // ---- Review functions ----
  const hasPurchasedProduct = (productId) => {
    return orders.some(order => order.items.some(item => item.id === productId));
  };

  const handleSubmitReview = async () => {
    if (!reviewProduct) return;
    if (!reviewComment.trim()) {
      showToast('Please write a comment.');
      return;
    }
    // In a full implementation, you would write the review to Firestore
    // For now, we'll keep it simple and just show a toast
    showToast('✅ Thank you for your review!');
    setReviewProduct(null);
    setReviewComment('');
    setReviewRating(5);
  };

  // ---- Order confirmation: Save to Firestore ----
  const handleConfirmPurchase = async (method, amount, paymentSuccess, couponCode, couponDiscount) => {
  const isBuyNow = !!buyNowProduct;
  const sourceItems = isBuyNow
    ? [{ ...buyNowProduct, quantity: 1 }]
    : cart;

  const orderData = {
    orderId: `ORD${Date.now().toString().slice(-8)}`,
    customerId: customerId,
    customerName: isGuest ? 'Guest User' : customerName,
    loginId: customerLoginId || 'guest',
    isGuest: isGuest,
    items: sourceItems.map(item => ({
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      price: item.finalPrice,
      total: item.finalPrice * item.quantity
    })),
    shippingDetails: shippingDetails,
    paymentMethod: method,
    paymentStatus: (method === 'online' && paymentSuccess) ? 'Paid' : 'Pending',
    totalAmount: amount,
    couponCode: couponCode || null,
    couponDiscount: couponDiscount || 0,
    orderDate: serverTimestamp(),
    status: 'Pending',
    deliveryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };

  try {
    await addDoc(collection(db, 'orders'), orderData);

    if (couponCode && !isGuest && customerId) {
      const coupons = JSON.parse(localStorage.getItem('coupons') || '[]');
      const updatedCoupons = coupons.map(c => {
        if (c.code === couponCode) {
          return { ...c, usedCount: (c.usedCount || 0) + 1 };
        }
        return c;
      });
      localStorage.setItem('coupons', JSON.stringify(updatedCoupons));
    }

    if (!isBuyNow) {
      setCart([]);
      const cartKey = isGuest ? 'guestCart' : getCustomerKey('userCart');
      localStorage.setItem(cartKey, JSON.stringify([]));
    }
    setBuyNowProduct(null);

    setShowPayment(false);
    setShowShipping(false);
    setPaymentMethod('');
    setShippingDetails(null);

    // Send WhatsApp notification (keep existing code)
    const itemsList = orderData.items.map(item => `${item.productName} x ${item.quantity}`).join('\n');
    let message = `🆕 *New Order Placed!*\n\n` +
                  `*Order ID:* ${orderData.orderId}\n` +
                  `*Customer:* ${orderData.customerName}\n` +
                  `*Total:* ₹${orderData.totalAmount.toFixed(2)}\n` +
                  `*Payment Method:* ${method === 'online' ? 'Online Payment' : 'Cash on Delivery'}`;
    if (couponCode) {
      message += `\n*Coupon Applied:* ${couponCode} (Save ₹${couponDiscount.toFixed(2)})`;
    }
    message += `\n*Payment Status:* ${method === 'cod' ? 'Pending (Cash on Delivery)' : 'Paid (Online)'}`;
    message += `\n\n*Items:*\n${itemsList}\n\n` +
               `*Shipping Address:*\n${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.state} - ${shippingDetails.pincode}\n` +
               `*Contact:* ${shippingDetails.mobileNumber}\n`;
    if (shippingDetails.locationLink) {
      message += `📍 *Location:* ${shippingDetails.locationLink}\n\n`;
    }
    message += `Please confirm or cancel this order from the Admin Panel.`;

    const adminNumber = '917092492023';
    const whatsappUrl = `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    alert(`✅ Order placed successfully! Order ID: ${orderData.orderId}\n\nWe will confirm your order shortly.`);
  } catch (error) {
    console.error('Error saving order:', error);
    alert('❌ Failed to place order. Please try again.');
  }
};

  // ---- Formatting ----
  const formatTime = (hours, minutes, seconds) =>
    `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // ---- Filter products ----
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.productDetails?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // ---- Render ----
  if (showShipping) {
    const checkoutCart = buyNowProduct ? [{ ...buyNowProduct, quantity: 1 }] : cart;
    return (
      <ShippingPage
        cart={checkoutCart}
        onBack={buyNowProduct ? handleBackFromBuyNow : handleBackToCart}
        onProceedToPayment={handleProceedToPayment}
        customerId={customerId}
        customerName={customerName}
      />
    );
  }

  if (showPayment) {
    const checkoutCart = buyNowProduct ? [{ ...buyNowProduct, quantity: 1 }] : cart;
    return (
      <PaymentPage
        cart={checkoutCart}
        shippingDetails={shippingDetails}
        onBack={handleBackToShipping}
        onConfirmPurchase={handleConfirmPurchase}
        customerId={customerId}
        customerName={customerName}
        isGuest={isGuest}
      />
    );
  }

  // ... (The rest of the return statement with all the JSX remains exactly the same as the version you have.
  // The only changes are in the data loading and order saving logic above.)
  // Copy the entire JSX return block from your existing CustomerHome.jsx here.
  // The JSX does not need any changes because the state variables (products, orders, etc.) are the same.

  return (
    <div className="customer-home">
      {/* Header */}
      <header className="customer-header">
        <div className="header-content">
          <div>
            <h1>🌾 SRM</h1>
            <p className="customer-greeting">
              {isGuest ? '👋 Welcome, Guest User!' : `👋 Welcome, ${customerName}!`}
              {isGuest && <span className="guest-badge"> 🎭 Guest</span>}
            </p>
          </div>
          <div className="header-right">
            <div className="header-action-wrapper">
              <button
                onClick={() => setShowOrders(true)}
                className="orders-icon header-action-btn"
                aria-label="My Orders"
              >
                <span className="btn-icon">📦</span>
                <span className="btn-label">Orders</span>
              </button>
              {orders.length > 0 && (
                <span className="btn-badge">{orders.length}</span>
              )}
            </div>

            <div className="header-action-wrapper">
              <button
                onClick={() => setShowCart(true)}
                className="cart-icon header-action-btn"
                aria-label="My Cart"
              >
                <span className="btn-icon">🛒</span>
                <span className="btn-label">Cart</span>
              </button>
              {cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
                <span className="btn-badge">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </div>

            <button onClick={() => setShowWishlist(true)} className="wishlist-icon">
              ❤️ Wishlist ({wishlist.length})
            </button>
            <button onClick={onLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      {/* Guest banner */}
      {isGuest && (
        <div className="guest-banner">
          <span>🛍️ You're browsing as a Guest</span>
          <span className="guest-banner-text">Login to save your cart, wishlist & orders permanently!</span>
        </div>
      )}

      {/* Hero + Search */}
      <div className="hero-section">
        <div className="hero-content">
          <h2>Premium Quality Rice</h2>
          <p>Directly from our mill to your kitchen</p>
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Search for rice products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <button className={`cat-btn ${selectedCategory === 'all' ? 'active' : ''}`} onClick={() => setSelectedCategory('all')}>
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Section */}
      <div className="products-section">
        <h2>Our Premium Rice Collection</h2>
        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <p>No products found. Check back later!</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  <img src={product.image} alt={product.productName} />
                  {product.discount > 0 && (
                    <div className="discount-badge">{product.discount}% OFF</div>
                  )}
                  {product.stock === 0 && (
                    <div className="out-of-stock-overlay">Out of Stock</div>
                  )}
                  <button
                    onClick={() => addToWishlist(product)}
                    className={`wishlist-btn ${wishlist.find(item => item.id === product.id) ? 'active' : ''}`}
                  >
                    {wishlist.find(item => item.id === product.id) ? '❤️' : '🤍'}
                  </button>
                </div>
                <div className="product-details">
                  <h3>{product.productName}</h3>
                  <p className="description">{product.productDetails}</p>
                  <div className="price-container">
                    {product.discount > 0 ? (
                      <>
                        <span className="original-price">₹{product.price}</span>
                        <span className="discounted-price">₹{product.finalPrice?.toFixed(2)}</span>
                        <span className="save-price">Save ₹{(product.price - product.finalPrice).toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="price">₹{product.price}</span>
                    )}
                  </div>
                  <div className="product-meta">
                    <span className="category-tag">🏷️ {product.category || 'General'}</span>
                    <span className={`stock-tag ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {product.stock > 0 ? (product.stock <= 5 ? `⚠️ Only ${product.stock} left` : '✅ In Stock') : '❌ Out of Stock'}
                    </span>
                    <span className="rating-tag">⭐ {product.averageRating ? product.averageRating.toFixed(1) : 'No ratings'}</span>
                  </div>

                  {/* PRIMARY ACTION ROW: Add to Cart | Buy Now */}
                  <div className="product-actions">
                    <div className="product-actions-primary">
                      <button
                        onClick={() => addToCart(product)}
                        className="add-to-cart"
                        disabled={product.stock === 0}
                      >
                        {product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
                      </button>
                      <button
                        onClick={() => handleBuyNow(product)}
                        className="buy-now"
                        disabled={product.stock === 0}
                      >
                        ⚡ Buy Now
                      </button>
                    </div>
                    <div className="product-actions-secondary">
                      {product.youtubeVideoId && (
                        <button onClick={() => playVideo(product.youtubeVideoId)} className="watch-video">
                          📺 Watch
                        </button>
                      )}
                      <button onClick={() => setSelectedProduct(product)} className="view-details">
                        👁️ View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="site-footer">
        <div className="footer-container">
          {/* Contact Us */}
          <div className="footer-section">
            <h3>📞 Contact Us</h3>
            <div className="footer-contact">
              <p>
                <strong>SOWDAMMAL RICE MILL</strong><br />
                12/2, Palani Road,<br />
                KT Hospital Opposite,<br />
                Dindigul – 624001.
              </p>
              <p>📱 <a href="tel:+917092492023">+91 7092492023</a> <span className="whatsapp-badge">(WhatsApp)</span></p>
              <p>✉️ <a href="mailto:SOWDAMMALRICEMILL2025@GMAIL.COM">SOWDAMMALRICEMILL2025@GMAIL.COM</a></p>
            </div>
            <div className="footer-social">
              <a href="https://www.instagram.com/unakkaaga_unmaiyaaga?igsi=eXRhZDRudmJxcWhu" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                <span>📸 Instagram</span>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="social-link youtube">
                <span>▶️ YouTube</span>
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="footer-section">
            <h3>🏷️ Categories</h3>
            <ul className="footer-links">
              <li>
                <button className="footer-link-btn" onClick={() => { setSelectedCategory('all'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  All Products
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat}>
                  <button className="footer-link-btn" onClick={() => { setSelectedCategory(cat); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="footer-section">
            <h3>⚙️ Services</h3>
            <ul className="footer-links">
              <li>
                <button className="footer-link-btn" onClick={() => setShowRefundModal(true)}>
                  🔄 Refunds / Cancellations
                </button>
              </li>
              <li>
                <button className="footer-link-btn" onClick={() => setShowPrivacyModal(true)}>
                  🔒 Privacy Policy
                </button>
              </li>
              <li>
                <button className="footer-link-btn" onClick={() => setShowTermsModal(true)}>
                  📜 Terms & Conditions
                </button>
              </li>
              <li>
                <button className="footer-link-btn" onClick={() => setShowContactModal(true)}>
                  📧 Contact
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SOWDAMMAL RICE MILL. All rights reserved.</p>
        </div>
      </footer>

      {/* ===== FOOTER MODALS ===== */}
      {/* Refunds / Cancellations Modal */}
      {showRefundModal && (
        <div className="modal" onClick={() => setShowRefundModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setShowRefundModal(false)}>&times;</span>
            <h2>🔄 Refunds & Cancellations</h2>
            <div className="modal-body">
              <h3>7‑Day Replacement Guarantee</h3>
              <p>
                At <strong>SOWDAMMAL RICE MILL</strong>, we take pride in the quality of our rice. 
                If you are not completely satisfied with your purchase, we offer a <strong>7‑day 
                replacement</strong> on all rice bags.
              </p>
              <ul>
                <li>✅ <strong>Hassle‑free returns</strong> – Simply contact us within 7 days of delivery.</li>
                <li>✅ <strong>Full replacement</strong> – We’ll replace the product at no extra cost.</li>
                <li>✅ <strong>Quality assured</strong> – Every bag is checked for purity and freshness.</li>
                <li>✅ <strong>No questions asked</strong> – Your satisfaction is our priority.</li>
              </ul>
              <p>
                <strong>How to initiate a return?</strong><br />
                Call or WhatsApp us at <a href="tel:+917092492023">+91 7092492023</a> or email 
                <a href="mailto:SOWDAMMALRICEMILL2025@GMAIL.COM"> SOWDAMMALRICEMILL2025@GMAIL.COM</a> 
                with your order ID. We’ll arrange the replacement within 24 hours.
              </p>
              <p className="refund-note">
                ⚡ <em>“Fresh rice, delivered with care – your trust is our reward.”</em>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="modal" onClick={() => setShowPrivacyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setShowPrivacyModal(false)}>&times;</span>
            <h2>🔒 Privacy Policy</h2>
            <div className="modal-body">
              <p>
                At <strong>SOWDAMMAL RICE MILL</strong>, we respect your privacy and are committed 
                to protecting your personal information. This policy explains how we collect, use, 
                and safeguard your data.
              </p>
              <h4>What we collect:</h4>
              <ul>
                <li>• Name, email, phone number, and shipping address (for order processing).</li>
                <li>• Order history and preferences (to improve our service).</li>
              </ul>
              <h4>How we use your data:</h4>
              <ul>
                <li>• To process and deliver your orders.</li>
                <li>• To communicate with you about your orders and updates.</li>
                <li>• To improve our products and website experience.</li>
              </ul>
              <h4>Data security:</h4>
              <ul>
                <li>• Your data is stored securely and is never shared with third parties.</li>
                <li>• We use industry‑standard measures to protect your information.</li>
              </ul>
              <h4>Your rights:</h4>
              <ul>
                <li>• You can request access, correction, or deletion of your data at any time.</li>
                <li>• Contact us at <a href="mailto:SOWDAMMALRICEMILL2025@GMAIL.COM">SOWDAMMALRICEMILL2025@GMAIL.COM</a> for any privacy concerns.</li>
              </ul>
              <p className="policy-note">
                🌾 <em>“Your trust is the foundation of our business.”</em>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="modal" onClick={() => setShowTermsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setShowTermsModal(false)}>&times;</span>
            <h2>📜 Terms & Conditions</h2>
            <div className="modal-body">
              <p>
                Welcome to <strong>SOWDAMMAL RICE MILL</strong>. By using our website and placing 
                an order, you agree to the following terms.
              </p>
              <h4>Order & Delivery</h4>
              <ul>
                <li>• Orders are processed within 24 hours of confirmation.</li>
                <li>• Delivery is made within 2‑3 business days after confirmation.</li>
                <li>• You will receive a WhatsApp notification with tracking details.</li>
              </ul>
              <h4>Payment</h4>
              <ul>
                <li>• We accept Cash on Delivery (COD) and Online Payments (UPI, Bank Transfer).</li>
                <li>• For online payments, a confirmation link will be sent via WhatsApp.</li>
              </ul>
              <h4>Returns & Cancellations</h4>
              <ul>
                <li>• Cancellations are accepted within 12 hours of placing the order.</li>
                <li>• Returns are accepted within 7 days of delivery (see Refunds policy).</li>
              </ul>
              <h4>Product Quality</h4>
              <ul>
                <li>• All rice is freshly milled and packed with care.</li>
                <li>• If you receive a damaged or defective product, contact us immediately.</li>
              </ul>
              <h4>Contact</h4>
              <ul>
                <li>• For any queries, reach us at <a href="tel:+917092492023">+91 7092492023</a> or 
                  <a href="mailto:SOWDAMMALRICEMILL2025@GMAIL.COM"> SOWDAMMALRICEMILL2025@GMAIL.COM</a>.
                </li>
              </ul>
              <p className="terms-note">
                📌 <em>“We strive to deliver the finest quality rice with the best service.”</em>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="modal" onClick={() => setShowContactModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setShowContactModal(false)}>&times;</span>
            <h2>📧 Contact Us</h2>
            <div className="modal-body">
              <p>
                <strong>SOWDAMMAL RICE MILL</strong><br />
                12/2, Palani Road,<br />
                KT Hospital Opposite,<br />
                Dindigul – 624001.
              </p>
              <p>
                📞 <strong>Phone / WhatsApp:</strong> <a href="tel:+917092492023">+91 7092492023</a>
              </p>
              <p>
                ✉️ <strong>Email:</strong> <a href="mailto:SOWDAMMALRICEMILL2025@GMAIL.COM">SOWDAMMALRICEMILL2025@GMAIL.COM</a>
              </p>
              <hr />
              <p>
                📸 <strong>Instagram:</strong> <a href="https://www.instagram.com/unakkaaga_unmaiyaaga?igsi=eXRhZDRudmJxcWhu" target="_blank" rel="noopener noreferrer">@unakkaaga_unmaiyaaga</a>
              </p>
              <p>
                ▶️ <strong>YouTube:</strong> <a href="#" target="_blank" rel="noopener noreferrer">Our Channel</a> (coming soon)
              </p>
              <p className="contact-note">
                💬 <em>We’d love to hear from you! Reach out anytime.</em>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== OTHER MODALS ===== */}

      {/* Orders Modal */}
      {showOrders && (
        <div className="modal" onClick={() => setShowOrders(false)}>
          <div className="orders-modal" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setShowOrders(false)}>&times;</span>
            <h2>{isGuest ? '📦 Guest Orders' : '📦 My Orders'}</h2>
            {orders.length === 0 ? (
              <div className="empty-orders">
                <p>{isGuest ? 'No guest orders yet' : 'No orders yet'}</p>
                <p className="empty-sub">Start shopping to see your orders here!</p>
                {isGuest && <p className="guest-note">💡 Login to save your orders permanently</p>}
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => {
                  const timer = order.status === 'Confirmed'
                    ? (orderTimers[order.id] || calculateRemainingTime(order))
                    : null;
                  return (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <span className="order-id">Order #{order.orderId}</span>
                        <span className={`order-status ${order.status.toLowerCase()}`}>
                          {order.status === 'Delivered' ? '✅ Delivered' :
                           order.status === 'Cancelled' ? '❌ Cancelled' :
                           order.status === 'Pending' ? '⏳ Pending' :
                           '✅ Confirmed'}
                        </span>
                      </div>
                      <div className="order-date">
                       {order.orderDate ? new Date(order.orderDate.seconds * 1000).toLocaleString() : 'Just now'}
                      </div>
                      <div className="order-customer">
                        👤 Customer: {order.customerName || order.shippingDetails?.fullName || 'N/A'}
                        {order.isGuest && <span className="guest-tag"> (Guest)</span>}
                      </div>
                      <div className="order-items">
                        {order.items.map((item, index) => (
                          <div key={index} className="order-item">
                            <span>{item.productName} x {item.quantity}</span>
                            <span>₹{item.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="order-total">
                        <strong>Total: ₹{order.totalAmount.toFixed(2)}</strong>
                        {order.couponCode && (
                          <span className="coupon-applied"> 🎫 {order.couponCode} (Save ₹{order.couponDiscount?.toFixed(2)})</span>
                        )}
                      </div>
                      <div className="order-payment">
                        💳 {order.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}
                        {order.paymentStatus && <span> ({order.paymentStatus})</span>}
                      </div>
                      {order.status === 'Delivered' && (
                        <div className="delivery-status delivered">
                          ✅ Delivered on: {order.deliveredDate ? new Date(order.deliveredDate).toLocaleString() : 'N/A'}
                        </div>
                      )}
                      {order.status === 'Cancelled' && (
                        <div className="delivery-status cancelled">❌ Order Cancelled by Admin</div>
                      )}
                      {order.status === 'Confirmed' && timer && (
                        <div className="order-delivery">
                          <div className="delivery-timer">
                            <span className="timer-icon">⏰</span>
                            <span className="timer-label">Delivery in:</span>
                            <span className={`timer-value ${timer.expired ? 'expired' : ''}`}>
                              {timer.expired ? 'Delivered Soon' : formatTime(timer.hours, timer.minutes, timer.seconds)}
                            </span>
                          </div>
                          <div className="delivery-progress">
                            <div
                              className="delivery-progress-bar"
                              style={{
                                width: timer.expired ? '100%' : `${((24 * 60 * 60 * 1000 - (new Date().getTime() - new Date(order.confirmationDate || order.orderDate).getTime())) / (24 * 60 * 60 * 1000)) * 100}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Details Modal (with reviews) */}
      {selectedProduct && (
        <div className="modal" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setSelectedProduct(null)}>&times;</span>
            <img src={selectedProduct.image} alt={selectedProduct.productName} />
            <h2>{selectedProduct.productName}</h2>
            <p className="full-description">{selectedProduct.productDetails}</p>
            <div className="modal-price">
              {selectedProduct.discount > 0 ? (
                <>
                  <span className="original">₹{selectedProduct.price}</span>
                  <span className="discounted">₹{selectedProduct.finalPrice?.toFixed(2)}</span>
                  <span className="save">Save ₹{(selectedProduct.price - selectedProduct.finalPrice).toFixed(2)}</span>
                </>
              ) : (
                <span className="discounted">₹{selectedProduct.price}</span>
              )}
            </div>
            <div className="product-meta">
              <span className="category-tag">🏷️ {selectedProduct.category || 'General'}</span>
              <span className={`stock-tag ${selectedProduct.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {selectedProduct.stock > 0 ? (selectedProduct.stock <= 5 ? `⚠️ Only ${selectedProduct.stock} left` : '✅ In Stock') : '❌ Out of Stock'}
              </span>
              <span className="rating-tag">⭐ {selectedProduct.averageRating ? selectedProduct.averageRating.toFixed(1) : 'No ratings'}</span>
            </div>
            {selectedProduct.youtubeVideoId && (
              <button onClick={() => playVideo(selectedProduct.youtubeVideoId)} className="watch-video-btn">
                📺 Watch Product Video
              </button>
            )}
            <div className="modal-actions">
              <button
                onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                className="buy-now"
                disabled={selectedProduct.stock === 0}
              >
                {selectedProduct.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
              </button>
              <button
                onClick={() => handleBuyNow(selectedProduct)}
                className="buy-now-direct"
                disabled={selectedProduct.stock === 0}
              >
                ⚡ Buy Now
              </button>
            </div>
            <div className="modal-actions-secondary">
              <button
                onClick={() => { addToWishlist(selectedProduct); }}
                className="wishlist-modal-btn"
              >
                {wishlist.find(item => item.id === selectedProduct.id) ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
              </button>
            </div>

            {/* Reviews Section */}
            <div className="review-section">
              <h4>Customer Reviews</h4>
              {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? (
                selectedProduct.reviews.map(review => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <strong>{review.customerName}</strong>
                      <span className="review-rating">⭐ {review.rating}</span>
                      <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p>No reviews yet. Be the first to review!</p>
              )}
              {!isGuest && hasPurchasedProduct(selectedProduct.id) && (
                <div className="review-form">
                  <h5>Write a Review</h5>
                  <div className="rating-select">
                    <label>Rating:</label>
                    <select value={reviewRating} onChange={(e) => setReviewRating(parseInt(e.target.value))}>
                      {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Star{r>1?'s':''}</option>)}
                    </select>
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience..."
                    rows="3"
                  ></textarea>
                  <button onClick={handleSubmitReview} className="submit-review-btn">Submit Review</button>
                </div>
              )}
              {isGuest && <p className="guest-review-note">🔒 Login to write a review.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideo && (
        <div className="modal" onClick={() => setShowVideo(false)}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setShowVideo(false)}>&times;</span>
            <iframe
              width="100%"
              height="400"
              src={`https://www.youtube.com/embed/${currentVideo}`}
              title="Product Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* Wishlist Modal */}
      {showWishlist && (
        <div className="modal" onClick={() => setShowWishlist(false)}>
          <div className="wishlist-modal" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setShowWishlist(false)}>&times;</span>
            <h2>❤️ Your Wishlist</h2>
            {wishlist.length === 0 ? (
              <div className="empty-wishlist">
                <p>Your wishlist is empty</p>
                <p className="empty-sub">Start adding products you love!</p>
              </div>
            ) : (
              <>
                <div className="wishlist-grid">
                  {wishlist.map(product => (
                    <div key={product.id} className="wishlist-item">
                      <img src={product.image} alt={product.productName} />
                      <div className="wishlist-item-details">
                        <h4>{product.productName}</h4>
                        <p className="wishlist-description">{product.productDetails}</p>
                        <div className="wishlist-price">
                          {product.discount > 0 ? (
                            <>
                              <span className="original-price">₹{product.price}</span>
                              <span className="discounted-price">₹{product.finalPrice?.toFixed(2)}</span>
                            </>
                          ) : (
                            <span className="price">₹{product.price}</span>
                          )}
                        </div>
                        <div className="wishlist-actions">
                          <button
                            onClick={() => {
                              addToCart(product);
                              const updatedWishlist = wishlist.filter(item => item.id !== product.id);
                              setWishlist(updatedWishlist);
                              const storageKey = isGuest ? 'guestWishlist' : getCustomerKey('userWishlist');
                              localStorage.setItem(storageKey, JSON.stringify(updatedWishlist));
                            }}
                            className="add-to-cart-wishlist"
                          >
                            🛒 Add to Cart
                          </button>
                          <button
                            onClick={() => {
                              const updatedWishlist = wishlist.filter(item => item.id !== product.id);
                              setWishlist(updatedWishlist);
                              const storageKey = isGuest ? 'guestWishlist' : getCustomerKey('userWishlist');
                              localStorage.setItem(storageKey, JSON.stringify(updatedWishlist));
                              showToast(`❌ Removed ${product.productName} from wishlist`);
                            }}
                            className="remove-wishlist-item"
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="wishlist-footer">
                  <button
                    onClick={() => {
                      const updatedCart = [...cart];
                      wishlist.forEach(product => {
                        const existingItem = updatedCart.find(item => item.id === product.id);
                        if (existingItem) {
                          existingItem.quantity += 1;
                        } else {
                          updatedCart.push({ ...product, quantity: 1 });
                        }
                      });
                      setCart(updatedCart);
                      const cartKey = isGuest ? 'guestCart' : getCustomerKey('userCart');
                      localStorage.setItem(cartKey, JSON.stringify(updatedCart));
                      setWishlist([]);
                      const wishlistKey = isGuest ? 'guestWishlist' : getCustomerKey('userWishlist');
                      localStorage.setItem(wishlistKey, JSON.stringify([]));
                      alert(`✅ Added all ${wishlist.length} items to cart!`);
                      setShowWishlist(false);
                    }}
                    className="add-all-to-cart"
                    disabled={wishlist.length === 0}
                  >
                    🛒 Add All to Cart
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear your wishlist?')) {
                        setWishlist([]);
                        const wishlistKey = isGuest ? 'guestWishlist' : getCustomerKey('userWishlist');
                        localStorage.setItem(wishlistKey, JSON.stringify([]));
                      }
                    }}
                    className="clear-wishlist"
                    disabled={wishlist.length === 0}
                  >
                    🗑️ Clear Wishlist
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="modal" onClick={() => setShowCart(false)}>
          <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setShowCart(false)}>&times;</span>
            <h2>Your Cart 🛒</h2>
            {isGuest && (
              <div className="guest-cart-notice">
                <span>💡 Your cart is saved temporarily</span>
                <span className="guest-cart-sub">Login to save your cart permanently!</span>
              </div>
            )}
            {cart.length === 0 ? (
              <p className="empty-cart">Your cart is empty</p>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image} alt={item.productName} />
                    <div className="cart-item-details">
                      <h4>{item.productName}</h4>
                      <p>₹{item.finalPrice?.toFixed(2)} x {item.quantity}</p>
                      <p className="item-total">Total: ₹{(item.finalPrice * item.quantity).toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => {
                        const updatedCart = cart.filter(i => i.id !== item.id);
                        setCart(updatedCart);
                        const cartKey = isGuest ? 'guestCart' : getCustomerKey('userCart');
                        localStorage.setItem(cartKey, JSON.stringify(updatedCart));
                      }}
                      className="remove-item"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                <div className="cart-total">
                  <h3>Grand Total: ₹{cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0).toFixed(2)}</h3>
                  <button className="checkout-btn" onClick={handleProceedToCheckout}>
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerHome;