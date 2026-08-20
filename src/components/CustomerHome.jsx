import React, { useState, useEffect } from 'react';
import ShippingPage from './ShippingPage';
import PaymentPage from './PaymentPage';
import './CustomerHome.css';

// Replace with your actual UPI ID (used for online payments)
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

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  // Review modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

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

    loadProducts();
    loadCart();
    loadWishlist();
    loadOrders();
    loadCategories();
    startOrderTimers();
  }, [customerId]);

  // ---- Data loading functions ----
  const loadProducts = () => {
    const savedProducts = localStorage.getItem('riceProducts');
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          return;
        }
      } catch (e) {}
    }
    // Fallback: if no products, set empty array (admin should have created them)
    setProducts([]);
  };

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

  const loadOrders = () => {
    let savedOrders = [];
    if (isGuest) {
      savedOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
    } else {
      savedOrders = JSON.parse(localStorage.getItem(`${customerId}_orders`) || '[]');
    }
    setOrders(savedOrders);
    const timers = {};
    savedOrders.forEach(order => {
      if (order.status === 'Confirmed' && order.confirmationDate) {
        timers[order.id] = calculateRemainingTime(order);
      }
    });
    setOrderTimers(timers);
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

  const startOrderTimers = () => {
    setInterval(() => {
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
  };

  // ---- Cart & Wishlist actions ----
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

  const handleBackToShipping = () => {
    setShowPayment(false);
    setShowShipping(true);
  };

  // ---- Review functions ----
  const hasPurchasedProduct = (productId) => {
    const userOrders = orders.filter(o => o.customerId === customerId || o.isGuest === isGuest);
    return userOrders.some(order => order.items.some(item => item.id === productId));
  };

  const handleSubmitReview = () => {
    if (!reviewProduct) return;
    if (!reviewComment.trim()) {
      showToast('Please write a comment.');
      return;
    }
    const newReview = {
      id: Date.now(),
      customerId: customerId,
      customerName: customerName,
      rating: reviewRating,
      comment: reviewComment.trim(),
      date: new Date().toISOString()
    };
    const updatedProducts = products.map(p => {
      if (p.id === reviewProduct.id) {
        const updatedReviews = [...(p.reviews || []), newReview];
        const avg = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
        return { ...p, reviews: updatedReviews, averageRating: avg };
      }
      return p;
    });
    setProducts(updatedProducts);
    localStorage.setItem('riceProducts', JSON.stringify(updatedProducts));
    setShowReviewModal(false);
    setReviewProduct(null);
    setReviewComment('');
    setReviewRating(5);
    showToast('✅ Thank you for your review!');
  };

  // ---- Order confirmation (with coupon support) ----
  const handleConfirmPurchase = (method, amount, paymentSuccess, couponCode, couponDiscount) => {
    const order = {
      id: Date.now(),
      orderId: `ORD${Date.now().toString().slice(-8)}`,
      customerId: customerId,
      customerName: isGuest ? 'Guest User' : customerName,
      loginId: customerLoginId || 'guest',
      isGuest: isGuest,
      items: cart.map(item => ({
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
      orderDate: new Date().toISOString(),
      status: 'Pending',
      deliveryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    // Save order
    let existingOrders = [];
    const storageKey = isGuest ? 'guestOrders' : `${customerId}_orders`;
    const storedOrders = localStorage.getItem(storageKey);
    if (storedOrders) {
      try {
        existingOrders = JSON.parse(storedOrders);
      } catch (e) {
        existingOrders = [];
      }
    }
    existingOrders.unshift(order);
    localStorage.setItem(storageKey, JSON.stringify(existingOrders));
    setOrders(existingOrders);

    // Update coupon usage if applied
    if (couponCode && !isGuest && customerId) {
      const coupons = JSON.parse(localStorage.getItem('coupons') || '[]');
      const updatedCoupons = coupons.map(c => {
        if (c.code === couponCode) {
          return { ...c, usedCount: (c.usedCount || 0) + 1 };
        }
        return c;
      });
      localStorage.setItem('coupons', JSON.stringify(updatedCoupons));
      // Update user profile
      const userProfile = JSON.parse(localStorage.getItem(`profile_${customerId}`) || '{}');
      if (!userProfile.usedCoupons) userProfile.usedCoupons = [];
      userProfile.usedCoupons.push(couponCode);
      localStorage.setItem(`profile_${customerId}`, JSON.stringify(userProfile));
    }

    // Clear cart
    setCart([]);
    const cartKey = isGuest ? 'guestCart' : getCustomerKey('userCart');
    localStorage.setItem(cartKey, JSON.stringify([]));

    setShowPayment(false);
    setShowShipping(false);
    setPaymentMethod('');
    setShippingDetails(null);

    // WhatsApp message to admin
    const itemsList = order.items.map(item => `${item.productName} x ${item.quantity}`).join('\n');
    let message = `🆕 *New Order Placed!*\n\n` +
                  `*Order ID:* ${order.orderId}\n` +
                  `*Customer:* ${order.customerName}\n` +
                  `*Total:* ₹${order.totalAmount.toFixed(2)}\n` +
                  `*Payment Method:* ${method === 'online' ? 'Online Payment' : 'Cash on Delivery'}`;
    if (couponCode) {
      message += `\n*Coupon Applied:* ${couponCode} (Save ₹${couponDiscount.toFixed(2)})`;
    }
    if (method === 'cod') {
      message += `\n*Payment Status:* Pending (Cash on Delivery)`;
    } else {
      message += `\n*Payment Status:* Paid (Online)`;
    }
    message += `\n\n*Items:*\n${itemsList}\n\n` +
               `*Shipping Address:*\n${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.state} - ${shippingDetails.pincode}\n` +
               `*Contact:* ${shippingDetails.mobileNumber}\n`;
    if (shippingDetails.locationLink) {
      message += `📍 *Location:* ${shippingDetails.locationLink}\n\n`;
    }
    message += `Please confirm or cancel this order from the Admin Panel.`;

    const adminNumber = '917092492023'; // Change to your admin number
    const whatsappUrl = `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    alert(`✅ Order placed successfully! Order ID: ${order.orderId}\n\nWe will confirm your order shortly.`);
  };

  // ---- Formatting ----
  const formatTime = (hours, minutes, seconds) =>
    `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // ---- Filter products ----
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.productDetails.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // ---- Render ----
  if (showShipping) {
    return (
      <ShippingPage
        cart={cart}
        onBack={handleBackToCart}
        onProceedToPayment={handleProceedToPayment}
        customerId={customerId}
        customerName={customerName}
      />
    );
  }

  if (showPayment) {
    return (
      <PaymentPage
        cart={cart}
        shippingDetails={shippingDetails}
        onBack={handleBackToShipping}
        onConfirmPurchase={handleConfirmPurchase}
        customerId={customerId}
        customerName={customerName}
        isGuest={isGuest}
      />
    );
  }

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
            <button onClick={() => setShowOrders(true)} className="orders-icon">
              📦 Orders ({orders.length})
            </button>
            <button onClick={() => setShowCart(true)} className="cart-icon">
              🛒 Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            </button>
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
                        <span className="discounted-price">₹{product.finalPrice.toFixed(2)}</span>
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
                  <div className="product-actions">
                    <button
                      onClick={() => addToCart(product)}
                      className="add-to-cart"
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
                    </button>
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
            ))}
          </div>
        )}
      </div>

      {/* ===== MODALS ===== */}

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
                        📅 {new Date(order.orderDate).toLocaleString()}
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
                  <span className="discounted">₹{selectedProduct.finalPrice.toFixed(2)}</span>
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
                              <span className="discounted-price">₹{product.finalPrice.toFixed(2)}</span>
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
                      <p>₹{item.finalPrice.toFixed(2)} x {item.quantity}</p>
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