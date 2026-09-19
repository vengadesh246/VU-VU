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
  serverTimestamp
} from 'firebase/firestore';
import './CustomerHome.css';

function CustomerHome({ onLogout, customerId, customerLoginId }) {
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
  const [ordersError, setOrdersError] = useState('');
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderTimers, setOrderTimers] = useState({});
  const [customerName, setCustomerName] = useState('');
  const [isGuest, setIsGuest] = useState(false);
  const [buyNowProduct, setBuyNowProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const getCustomerKey = (baseKey) => `${customerId}_${baseKey}`;
  const cartStorageKey = () => (isGuest ? 'guestCart' : `${customerId}_userCart`);
  const wishStorageKey = () => (isGuest ? 'guestWishlist' : `${customerId}_userWishlist`);

  // =====================================================
  // ---- LOAD DATA ----
  // =====================================================
  useEffect(() => {
    const isGuestUser = customerId?.startsWith('GUEST');
    setIsGuest(isGuestUser);

    // Name
    if (isGuestUser) {
      setCustomerName('Guest User');
    } else {
      const savedName = localStorage.getItem(getCustomerKey('customerName'));
      if (savedName) setCustomerName(savedName);
      else {
        const name = prompt('Please enter your name to continue:', '');
        const finalName = name && name.trim() ? name.trim() : 'Customer';
        setCustomerName(finalName);
        localStorage.setItem(getCustomerKey('customerName'), finalName);
      }
    }

    // Cart / Wishlist / Categories (localStorage)
    try {
      const savedCart = localStorage.getItem(isGuestUser ? 'guestCart' : `${customerId}_userCart`);
      setCart(savedCart ? JSON.parse(savedCart) : []);
    } catch { setCart([]); }

    try {
      const savedWish = localStorage.getItem(isGuestUser ? 'guestWishlist' : `${customerId}_userWishlist`);
      setWishlist(savedWish ? JSON.parse(savedWish) : []);
    } catch { setWishlist([]); }

    const savedCats = localStorage.getItem('categories');
    if (savedCats) {
      try { setCategories(JSON.parse(savedCats)); }
      catch { setCategories(['Basmati', 'Brown', 'White', 'Specialty', 'Organic']); }
    } else {
      setCategories(['Basmati', 'Brown', 'White', 'Specialty', 'Organic']);
    }

    // ---- PRODUCTS (real-time) ----
    const unsubProducts = onSnapshot(
      collection(db, 'products'),
      (snap) => {
        const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        arr.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setProducts(arr);
      },
      (err) => console.error('❌ Products listener error:', err)
    );

    // ---- ORDERS (real-time) — only if we have a customerId ----
    let unsubOrders = () => {};
    if (customerId) {
      setOrdersLoading(true);
      setOrdersError('');

      // ⚠️ IMPORTANT: no orderBy() here — sorting is done client-side
      // to avoid the composite-index requirement.
      const ordersQuery = query(
        collection(db, 'orders'),
        where('customerId', '==', customerId)
      );

      unsubOrders = onSnapshot(
        ordersQuery,
        (snap) => {
          const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          arr.sort((a, b) => (b.orderDate?.seconds || 0) - (a.orderDate?.seconds || 0));
          setOrders(arr);
          setOrdersLoading(false);

          // Timers for Confirmed orders
          const timers = {};
          arr.forEach(o => {
            if (o.status === 'Confirmed' && o.confirmationDate) {
              timers[o.id] = calculateRemainingTime(o);
            }
          });
          setOrderTimers(timers);
        },
        (err) => {
          console.error('❌ Orders listener error:', err);
          setOrdersLoading(false);
          setOrdersError(
            `Orders failed to load (${err.code || 'unknown'}). ` +
            `Check Firestore rules and try again.`
          );
        }
      );
    } else {
      setOrdersLoading(false);
      setOrders([]);
    }

    // ---- Timer ticker ----
    const interval = setInterval(() => {
      setOrders(prev => {
        const t = {};
        prev.forEach(o => {
          if (o.status === 'Confirmed' && o.confirmationDate) {
            t[o.id] = calculateRemainingTime(o);
          }
        });
        setOrderTimers(t);
        return prev;
      });
    }, 1000);

    return () => {
      unsubProducts();
      unsubOrders();
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  // =====================================================
  // Helpers
  // =====================================================
  const calculateRemainingTime = (order) => {
    const start = order.status === 'Confirmed' && order.confirmationDate
      ? order.confirmationDate
      : order.orderDate;
    const t = new Date(start).getTime();
    const remaining = 24 * 60 * 60 * 1000 - (Date.now() - t);
    if (remaining <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
      hours: Math.floor(remaining / 3600000),
      minutes: Math.floor((remaining % 3600000) / 60000),
      seconds: Math.floor((remaining % 60000) / 1000),
      expired: false,
    };
  };

  const formatTime = (h, m, s) =>
    `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  const showToast = (message) => {
    const el = document.createElement('div');
    el.className = 'toast-message';
    el.innerHTML = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  };

  const addToCart = (product) => {
    if (!product.stock || product.stock <= 0) {
      showToast('❌ Sorry, this product is out of stock!');
      return;
    }
    const existing = cart.find(i => i.id === product.id);
    let updated;
    if (existing) {
      if (existing.quantity >= product.stock) {
        showToast(`⚠️ Only ${product.stock} available in stock.`);
        return;
      }
      updated = cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
    } else {
      updated = [...cart, { ...product, quantity: 1 }];
    }
    setCart(updated);
    localStorage.setItem(cartStorageKey(), JSON.stringify(updated));
    showToast(`✅ Added ${product.productName} to cart!`);
  };

  const handleBuyNow = (product) => {
    if (!product.stock || product.stock <= 0) {
      showToast('❌ Sorry, this product is out of stock!');
      return;
    }
    setBuyNowProduct(product);
    setShowCart(false);
    setSelectedProduct(null);
    setShowShipping(true);
  };

  const addToWishlist = (product) => {
    const exists = wishlist.find(i => i.id === product.id);
    let updated;
    if (exists) {
      updated = wishlist.filter(i => i.id !== product.id);
      showToast(`❌ Removed ${product.productName} from wishlist`);
    } else {
      updated = [...wishlist, product];
      showToast(`❤️ Added ${product.productName} to wishlist`);
    }
    setWishlist(updated);
    localStorage.setItem(wishStorageKey(), JSON.stringify(updated));
  };

  const playVideo = (id) => {
    if (id) { setCurrentVideo(id); setShowVideo(true); }
    else alert('No video available for this product');
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) { alert('Your cart is empty!'); return; }
    setBuyNowProduct(null);
    setShowCart(false);
    setShowShipping(true);
  };
  const handleProceedToPayment = (details) => {
    setShippingDetails(details);
    setShowShipping(false);
    setShowPayment(true);
  };
  const handleBackToCart = () => { setShowShipping(false); setShowCart(true); };
  const handleBackFromBuyNow = () => { setBuyNowProduct(null); setShowShipping(false); };
  const handleBackToShipping = () => { setShowPayment(false); setShowShipping(true); };

  const hasPurchasedProduct = (pid) =>
    orders.some(o => o.items?.some(i => i.id === pid));

  const handleSubmitReview = () => {
    if (!reviewProduct) return;
    if (!reviewComment.trim()) { showToast('Please write a comment.'); return; }
    showToast('✅ Thank you for your review!');
    setReviewProduct(null);
    setReviewComment('');
    setReviewRating(5);
  };

  // =====================================================
  // SAVE ORDER
  // =====================================================
  const handleConfirmPurchase = async (method, amount, paymentSuccess, couponCode, couponDiscount) => {
    const isBuyNow = !!buyNowProduct;
    const sourceItems = isBuyNow ? [{ ...buyNowProduct, quantity: 1 }] : cart;

    const orderData = {
      orderId: `ORD${Date.now().toString().slice(-8)}`,
      customerId: customerId,
      customerName: isGuest ? 'Guest User' : customerName,
      loginId: customerLoginId || 'guest',
      isGuest: !!isGuest,
      items: sourceItems.map(item => ({
        id: item.id,
        productName: item.productName,
        quantity: item.quantity,
        price: item.finalPrice,
        total: item.finalPrice * item.quantity,
      })),
      shippingDetails: shippingDetails,
      paymentMethod: method,
      paymentStatus: (method === 'online' && paymentSuccess) ? 'Paid' : 'Pending',
      totalAmount: amount,
      couponCode: couponCode || null,
      couponDiscount: couponDiscount || 0,
      orderDate: serverTimestamp(),
      status: 'Pending',
      deliveryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    try {
      await addDoc(collection(db, 'orders'), orderData);

      if (couponCode && !isGuest && customerId) {
        const coupons = JSON.parse(localStorage.getItem('coupons') || '[]');
        localStorage.setItem('coupons', JSON.stringify(
          coupons.map(c => c.code === couponCode ? { ...c, usedCount: (c.usedCount || 0) + 1 } : c)
        ));
      }

      if (!isBuyNow) {
        setCart([]);
        localStorage.setItem(cartStorageKey(), JSON.stringify([]));
      }
      setBuyNowProduct(null);
      setShowPayment(false);
      setShowShipping(false);
      setPaymentMethod('');
      setShippingDetails(null);

      // WhatsApp notification
      const itemsList = orderData.items.map(i => `${i.productName} x ${i.quantity}`).join('\n');
      let message =
        `🆕 *New Order Placed!*\n\n` +
        `*Order ID:* ${orderData.orderId}\n` +
        `*Customer:* ${orderData.customerName}\n` +
        `*Total:* ₹${orderData.totalAmount.toFixed(2)}\n` +
        `*Payment Method:* ${method === 'online' ? 'Online Payment' : 'Cash on Delivery'}`;
      if (couponCode) message += `\n*Coupon Applied:* ${couponCode} (Save ₹${couponDiscount.toFixed(2)})`;
      message += `\n*Payment Status:* ${method === 'cod' ? 'Pending (Cash on Delivery)' : 'Paid (Online)'}`;
      message += `\n\n*Items:*\n${itemsList}\n\n` +
                 `*Shipping Address:*\n${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.state} - ${shippingDetails.pincode}\n` +
                 `*Contact:* ${shippingDetails.mobileNumber}\n`;
      if (shippingDetails.locationLink) message += `📍 *Location:* ${shippingDetails.locationLink}\n\n`;
      message += `Please confirm or cancel this order from the Admin Panel.`;

      window.open(`https://wa.me/917092492023?text=${encodeURIComponent(message)}`, '_blank');

      alert(`✅ Order placed successfully! Order ID: ${orderData.orderId}`);
    } catch (err) {
      console.error('Error saving order:', err);
      alert('❌ Failed to place order. Please try again.');
    }
  };

  const filteredProducts = products.filter(p => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = p.productName?.toLowerCase().includes(s) ||
                          p.productDetails?.toLowerCase().includes(s);
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // =====================================================
  // EARLY RETURNS (Shipping / Payment)
  // =====================================================
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

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="customer-home">
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
              <button onClick={() => setShowOrders(true)} className="orders-icon header-action-btn" aria-label="My Orders">
                <span className="btn-icon">📦</span>
                <span className="btn-label">Orders</span>
              </button>
              {orders.length > 0 && <span className="btn-badge">{orders.length}</span>}
            </div>

            <div className="header-action-wrapper">
              <button onClick={() => setShowCart(true)} className="cart-icon header-action-btn" aria-label="My Cart">
                <span className="btn-icon">🛒</span>
                <span className="btn-label">Cart</span>
              </button>
              {cart.reduce((s, i) => s + i.quantity, 0) > 0 && (
                <span className="btn-badge">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
              )}
            </div>

            <button onClick={() => setShowWishlist(true)} className="wishlist-icon">
              ❤️ Wishlist ({wishlist.length})
            </button>
            <button onClick={onLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      {isGuest && (
        <div className="guest-banner">
          <span>🛍️ You're browsing as a Guest</span>
          <span className="guest-banner-text">Login to save your cart, wishlist & orders permanently!</span>
        </div>
      )}

      <div className="hero-section">
        <div className="hero-content">
          <h2>Premium Quality Rice</h2>
          <p>Directly from our mill to your kitchen</p>
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Search for rice products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="category-filter">
        <button className={`cat-btn ${selectedCategory === 'all' ? 'active' : ''}`} onClick={() => setSelectedCategory('all')}>All</button>
        {categories.map(c => (
          <button key={c} className={`cat-btn ${selectedCategory === c ? 'active' : ''}`} onClick={() => setSelectedCategory(c)}>{c}</button>
        ))}
      </div>

      <div className="products-section">
        <h2>Our Premium Rice Collection</h2>
        {filteredProducts.length === 0 ? (
          <div className="no-products"><p>No products found. Check back later!</p></div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  <img src={product.image} alt={product.productName} />
                  {product.discount > 0 && <div className="discount-badge">{product.discount}% OFF</div>}
                  {product.stock === 0 && <div className="out-of-stock-overlay">Out of Stock</div>}
                  <button
                    onClick={() => addToWishlist(product)}
                    className={`wishlist-btn ${wishlist.find(i => i.id === product.id) ? 'active' : ''}`}
                  >
                    {wishlist.find(i => i.id === product.id) ? '❤️' : '🤍'}
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
                    ) : (<span className="price">₹{product.price}</span>)}
                  </div>
                  <div className="product-meta">
                    <span className="category-tag">🏷️ {product.category || 'General'}</span>
                    <span className={`stock-tag ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {product.stock > 0 ? (product.stock <= 5 ? `⚠️ Only ${product.stock} left` : '✅ In Stock') : '❌ Out of Stock'}
                    </span>
                    <span className="rating-tag">⭐ {product.averageRating ? product.averageRating.toFixed(1) : 'No ratings'}</span>
                  </div>
                  <div className="product-actions">
                    <div className="product-actions-primary">
                      <button onClick={() => addToCart(product)} className="add-to-cart" disabled={product.stock === 0}>
                        {product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
                      </button>
                      <button onClick={() => handleBuyNow(product)} className="buy-now" disabled={product.stock === 0}>⚡ Buy Now</button>
                    </div>
                    <div className="product-actions-secondary">
                      {product.youtubeVideoId && (
                        <button onClick={() => playVideo(product.youtubeVideoId)} className="watch-video">📺 Watch</button>
                      )}
                      <button onClick={() => setSelectedProduct(product)} className="view-details">👁️ View</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-section">
            <h3>📞 Contact Us</h3>
            <div className="footer-contact">
              <p><strong>SOWDAMMAL RICE MILL</strong><br />12/2, Palani Road,<br />KT Hospital Opposite,<br />Dindigul – 624001.</p>
              <p>📱 <a href="tel:+917092492023">+91 7092492023</a> <span className="whatsapp-badge">(WhatsApp)</span></p>
              <p>✉️ <a href="mailto:SOWDAMMALRICEMILL2025@GMAIL.COM">SOWDAMMALRICEMILL2025@GMAIL.COM</a></p>
            </div>
            <div className="footer-social">
              <a href="https://www.instagram.com/unakkaaga_unmaiyaaga" target="_blank" rel="noopener noreferrer" className="social-link instagram"><span>📸 Instagram</span></a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="social-link youtube"><span>▶️ YouTube</span></a>
            </div>
          </div>
          <div className="footer-section">
            <h3>🏷️ Categories</h3>
            <ul className="footer-links">
              <li><button className="footer-link-btn" onClick={() => { setSelectedCategory('all'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>All Products</button></li>
              {categories.map(c => (
                <li key={c}>
                  <button className="footer-link-btn" onClick={() => { setSelectedCategory(c); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{c}</button>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-section">
            <h3>⚙️ Services</h3>
            <ul className="footer-links">
              <li><button className="footer-link-btn" onClick={() => setShowRefundModal(true)}>🔄 Refunds / Cancellations</button></li>
              <li><button className="footer-link-btn" onClick={() => setShowPrivacyModal(true)}>🔒 Privacy Policy</button></li>
              <li><button className="footer-link-btn" onClick={() => setShowTermsModal(true)}>📜 Terms & Conditions</button></li>
              <li><button className="footer-link-btn" onClick={() => setShowContactModal(true)}>📧 Contact</button></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom"><p>© {new Date().getFullYear()} SOWDAMMAL RICE MILL. All rights reserved.</p></div>
      </footer>

      {/* ---- Footer Modals ---- */}
      {showRefundModal && (
        <div className="modal" onClick={() => setShowRefundModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <span className="close" onClick={() => setShowRefundModal(false)}>&times;</span>
            <h2>🔄 Refunds & Cancellations</h2>
            <div className="modal-body">
              <h3>7‑Day Replacement Guarantee</h3>
              <p>Contact us within 7 days of delivery for a full replacement — no extra cost.</p>
              <p>Call/WhatsApp <a href="tel:+917092492023">+91 7092492023</a> with your Order ID.</p>
            </div>
          </div>
        </div>
      )}
      {showPrivacyModal && (
        <div className="modal" onClick={() => setShowPrivacyModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <span className="close" onClick={() => setShowPrivacyModal(false)}>&times;</span>
            <h2>🔒 Privacy Policy</h2>
            <div className="modal-body">
              <p>We respect your privacy. Your data is stored securely and never shared with third parties.</p>
            </div>
          </div>
        </div>
      )}
      {showTermsModal && (
        <div className="modal" onClick={() => setShowTermsModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <span className="close" onClick={() => setShowTermsModal(false)}>&times;</span>
            <h2>📜 Terms & Conditions</h2>
            <div className="modal-body">
              <p>Cancellations within 12 hours of ordering. Returns within 7 days of delivery.</p>
            </div>
          </div>
        </div>
      )}
      {showContactModal && (
        <div className="modal" onClick={() => setShowContactModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <span className="close" onClick={() => setShowContactModal(false)}>&times;</span>
            <h2>📧 Contact Us</h2>
            <div className="modal-body">
              <p>📞 <a href="tel:+917092492023">+91 7092492023</a></p>
              <p>✉️ <a href="mailto:SOWDAMMALRICEMILL2025@GMAIL.COM">SOWDAMMALRICEMILL2025@GMAIL.COM</a></p>
            </div>
          </div>
        </div>
      )}

      {/* ---- ORDERS MODAL (the important one) ---- */}
      {showOrders && (
        <div className="modal" onClick={() => setShowOrders(false)}>
          <div className="orders-modal" onClick={e => e.stopPropagation()}>
            <span className="close" onClick={() => setShowOrders(false)}>&times;</span>
            <h2>{isGuest ? '📦 Guest Orders' : '📦 My Orders'}</h2>

            {ordersLoading && <p style={{ textAlign: 'center', color: '#666' }}>Loading orders...</p>}

            {ordersError && (
              <div style={{
                background: '#fde8e8', color: '#c0392b', padding: '12px 16px',
                borderRadius: 8, margin: '10px 0', fontSize: 14,
                borderLeft: '4px solid #c0392b'
              }}>⚠️ {ordersError}</div>
            )}

            {!ordersLoading && !ordersError && orders.length === 0 && (
              <div className="empty-orders">
                <p>{isGuest ? 'No guest orders yet' : 'No orders yet'}</p>
                <p className="empty-sub">Start shopping to see your orders here!</p>
                {isGuest && <p className="guest-note">💡 Login to save your orders permanently</p>}
              </div>
            )}

            {orders.length > 0 && (
              <div className="orders-list">
                {orders.map(order => {
                  const timer = order.status === 'Confirmed'
                    ? (orderTimers[order.id] || calculateRemainingTime(order))
                    : null;
                  const items = order.items || [];
                  const total = Number(order.totalAmount || 0);
                  return (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <span className="order-id">Order #{order.orderId || order.id}</span>
                        <span className={`order-status ${(order.status || 'pending').toLowerCase()}`}>
                          {order.status === 'Delivered' ? '✅ Delivered' :
                           order.status === 'Cancelled' ? '❌ Cancelled' :
                           order.status === 'Pending'   ? '⏳ Pending' :
                           '✅ Confirmed'}
                        </span>
                      </div>

                      <div className="order-date">
                        {order.orderDate
                          ? new Date(order.orderDate.seconds * 1000).toLocaleString()
                          : 'Just now'}
                      </div>

                      <div className="order-customer">
                        👤 Customer: {order.customerName || order.shippingDetails?.fullName || 'N/A'}
                        {order.isGuest && <span className="guest-tag"> (Guest)</span>}
                      </div>

                      <div className="order-items">
                        {items.map((item, i) => (
                          <div key={i} className="order-item">
                            <span>{item.productName} x {item.quantity}</span>
                            <span>₹{Number(item.total || 0).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-total">
                        <strong>Total: ₹{total.toFixed(2)}</strong>
                        {order.couponCode && (
                          <span className="coupon-applied">
                            {' '}🎫 {order.couponCode} (Save ₹{Number(order.couponDiscount || 0).toFixed(2)})
                          </span>
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
                        </div>
                      )}

                      {order.status === 'Pending' && (
                        <div className="delivery-status" style={{
                          background: '#fff3cd', color: '#856404',
                          padding: '8px 12px', borderRadius: 8, marginTop: 10,
                          textAlign: 'center', fontWeight: 600, fontSize: 13
                        }}>⏳ Waiting for admin confirmation</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---- PRODUCT MODAL ---- */}
      {selectedProduct && (
        <div className="modal" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
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
              ) : (<span className="discounted">₹{selectedProduct.price}</span>)}
            </div>
            {selectedProduct.youtubeVideoId && (
              <button onClick={() => playVideo(selectedProduct.youtubeVideoId)} className="watch-video-btn">📺 Watch Product Video</button>
            )}
            <div className="modal-actions">
              <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} className="buy-now" disabled={selectedProduct.stock === 0}>
                {selectedProduct.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
              </button>
              <button onClick={() => handleBuyNow(selectedProduct)} className="buy-now-direct" disabled={selectedProduct.stock === 0}>⚡ Buy Now</button>
            </div>
            <div className="modal-actions-secondary">
              <button onClick={() => addToWishlist(selectedProduct)} className="wishlist-modal-btn">
                {wishlist.find(i => i.id === selectedProduct.id) ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
              </button>
            </div>
            <div className="review-section">
              <h4>Customer Reviews</h4>
              {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? (
                selectedProduct.reviews.map(r => (
                  <div key={r.id} className="review-item">
                    <div className="review-header">
                      <strong>{r.customerName}</strong>
                      <span className="review-rating">⭐ {r.rating}</span>
                      <span className="review-date">{new Date(r.date).toLocaleDateString()}</span>
                    </div>
                    <p className="review-comment">{r.comment}</p>
                  </div>
                ))
              ) : (<p>No reviews yet. Be the first to review!</p>)}
              {!isGuest && hasPurchasedProduct(selectedProduct.id) && (
                <div className="review-form">
                  <h5>Write a Review</h5>
                  <div className="rating-select">
                    <label>Rating:</label>
                    <select value={reviewRating} onChange={e => setReviewRating(parseInt(e.target.value))}>
                      {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                  <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Share your experience..." rows="3" />
                  <button onClick={handleSubmitReview} className="submit-review-btn">Submit Review</button>
                </div>
              )}
              {isGuest && <p className="guest-review-note">🔒 Login to write a review.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ---- VIDEO MODAL ---- */}
      {showVideo && (
        <div className="modal" onClick={() => setShowVideo(false)}>
          <div className="video-modal" onClick={e => e.stopPropagation()}>
            <span className="close" onClick={() => setShowVideo(false)}>&times;</span>
            <iframe
              width="100%" height="400"
              src={`https://www.youtube.com/embed/${currentVideo}`}
              title="Product Video" frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* ---- WISHLIST MODAL ---- */}
      {showWishlist && (
        <div className="modal" onClick={() => setShowWishlist(false)}>
          <div className="wishlist-modal" onClick={e => e.stopPropagation()}>
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
                  {wishlist.map(p => (
                    <div key={p.id} className="wishlist-item">
                      <img src={p.image} alt={p.productName} />
                      <div className="wishlist-item-details">
                        <h4>{p.productName}</h4>
                        <p className="wishlist-description">{p.productDetails}</p>
                        <div className="wishlist-actions">
                          <button
                            onClick={() => {
                              addToCart(p);
                              const u = wishlist.filter(x => x.id !== p.id);
                              setWishlist(u);
                              localStorage.setItem(wishStorageKey(), JSON.stringify(u));
                            }}
                            className="add-to-cart-wishlist"
                          >🛒 Add to Cart</button>
                          <button
                            onClick={() => {
                              const u = wishlist.filter(x => x.id !== p.id);
                              setWishlist(u);
                              localStorage.setItem(wishStorageKey(), JSON.stringify(u));
                              showToast(`❌ Removed ${p.productName} from wishlist`);
                            }}
                            className="remove-wishlist-item"
                          >🗑️ Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="wishlist-footer">
                  <button
                    onClick={() => {
                      const updated = [...cart];
                      wishlist.forEach(p => {
                        const ex = updated.find(x => x.id === p.id);
                        if (ex) ex.quantity += 1;
                        else updated.push({ ...p, quantity: 1 });
                      });
                      setCart(updated);
                      localStorage.setItem(cartStorageKey(), JSON.stringify(updated));
                      setWishlist([]);
                      localStorage.setItem(wishStorageKey(), JSON.stringify([]));
                      alert(`✅ Added all ${wishlist.length} items to cart!`);
                      setShowWishlist(false);
                    }}
                    className="add-all-to-cart" disabled={wishlist.length === 0}
                  >🛒 Add All to Cart</button>
                  <button
                    onClick={() => {
                      if (window.confirm('Clear wishlist?')) {
                        setWishlist([]);
                        localStorage.setItem(wishStorageKey(), JSON.stringify([]));
                      }
                    }}
                    className="clear-wishlist" disabled={wishlist.length === 0}
                  >🗑️ Clear Wishlist</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ---- CART MODAL ---- */}
      {showCart && (
        <div className="modal" onClick={() => setShowCart(false)}>
          <div className="cart-modal" onClick={e => e.stopPropagation()}>
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
                        const u = cart.filter(i => i.id !== item.id);
                        setCart(u);
                        localStorage.setItem(cartStorageKey(), JSON.stringify(u));
                      }}
                      className="remove-item"
                    >🗑️</button>
                  </div>
                ))}
                <div className="cart-total">
                  <h3>Grand Total: ₹{cart.reduce((s, i) => s + i.finalPrice * i.quantity, 0).toFixed(2)}</h3>
                  <button className="checkout-btn" onClick={handleProceedToCheckout}>Proceed to Checkout</button>
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