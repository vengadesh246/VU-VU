import React, { useState, useEffect } from 'react';
import ShippingPage from './ShippingPage';
import PaymentPage from './PaymentPage';
import './CustomerHome.css';

// 🔁 Replace with your actual UPI ID
const UPI_ID = 'sowdammalricemill246@okicici';

// Default products – same as AdminPanel
const DEFAULT_PRODUCTS = [
  {
    id: 1,
    productName: 'Basmati Rice – Premium Long Grain',
    productDetails: 'Aged 2 years, aromatic and fluffy, perfect for biryani and pulao.',
    price: 220,
    discount: 15,
    finalPrice: 187,
    youtubeVideoId: 'dQw4w9WgXcQ',
    instagramUrl: 'https://instagram.com/p/example1',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400',
    discountImage: 'https://media.giphy.com/media/3o7abldj0b3rxrZUxW/giphy.gif',
    discountText: '🎉 Special Offer! 15% Off',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    productName: 'Ponni Boiled Rice',
    productDetails: 'Traditional boiled rice, ideal for daily meals with excellent texture.',
    price: 160,
    discount: 10,
    finalPrice: 144,
    youtubeVideoId: 'dQw4w9WgXcQ',
    instagramUrl: 'https://instagram.com/p/example2',
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400',
    discountImage: 'https://media.giphy.com/media/3o7abldj0b3rxrZUxW/giphy.gif',
    discountText: '🔥 10% OFF – Daily Use',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    productName: 'Brown Rice – Organic',
    productDetails: 'High fiber, nutrient-rich, unpolished organic brown rice.',
    price: 190,
    discount: 8,
    finalPrice: 174.8,
    youtubeVideoId: 'dQw4w9WgXcQ',
    instagramUrl: 'https://instagram.com/p/example3',
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400',
    discountImage: 'https://media.giphy.com/media/3o7abldj0b3rxrZUxW/giphy.gif',
    discountText: '🌾 Organic & Healthy',
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    productName: 'Jasmine Rice – Fragrant',
    productDetails: 'Exquisite Thai jasmine rice, long grain with a floral aroma.',
    price: 250,
    discount: 12,
    finalPrice: 220,
    youtubeVideoId: 'dQw4w9WgXcQ',
    instagramUrl: 'https://instagram.com/p/example4',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400',
    discountImage: 'https://media.giphy.com/media/3o7abldj0b3rxrZUxW/giphy.gif',
    discountText: '✨ Premium Aroma',
    createdAt: new Date().toISOString()
  },
  {
    id: 5,
    productName: 'Sona Masuri Rice',
    productDetails: 'Medium grain, lightweight, and perfect for everyday South Indian meals.',
    price: 140,
    discount: 5,
    finalPrice: 133,
    youtubeVideoId: 'dQw4w9WgXcQ',
    instagramUrl: 'https://instagram.com/p/example5',
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400',
    discountImage: 'https://media.giphy.com/media/3o7abldj0b3rxrZUxW/giphy.gif',
    discountText: '🏡 Daily Essential',
    createdAt: new Date().toISOString()
  },
  {
    id: 6,
    productName: 'Idly Rice – Parboiled',
    productDetails: 'Specially processed for soft and fluffy idlis and dosas.',
    price: 130,
    discount: 0,
    finalPrice: 130,
    youtubeVideoId: 'dQw4w9WgXcQ',
    instagramUrl: 'https://instagram.com/p/example6',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400',
    discountImage: '',
    discountText: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 7,
    productName: 'Kerala Matta Red Rice',
    productDetails: 'Traditional red rice with nutty flavour, high in antioxidants.',
    price: 210,
    discount: 10,
    finalPrice: 189,
    youtubeVideoId: 'dQw4w9WgXcQ',
    instagramUrl: 'https://instagram.com/p/example7',
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400',
    discountImage: 'https://media.giphy.com/media/3o7abldj0b3rxrZUxW/giphy.gif',
    discountText: '❤️ Rich in Nutrients',
    createdAt: new Date().toISOString()
  },
  {
    id: 8,
    productName: 'Black Rice – Forbidden',
    productDetails: 'Exotic black rice, rich in anthocyanins and fibre.',
    price: 320,
    discount: 20,
    finalPrice: 256,
    youtubeVideoId: 'dQw4w9WgXcQ',
    instagramUrl: 'https://instagram.com/p/example8',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400',
    discountImage: 'https://media.giphy.com/media/3o7abldj0b3rxrZUxW/giphy.gif',
    discountText: '⚡ Superfood – 20% Off',
    createdAt: new Date().toISOString()
  },
  {
    id: 9,
    productName: 'Wild Rice – Gourmet',
    productDetails: 'Nutty, chewy, and high-protein wild rice blend.',
    price: 380,
    discount: 18,
    finalPrice: 311.6,
    youtubeVideoId: 'dQw4w9WgXcQ',
    instagramUrl: 'https://instagram.com/p/example9',
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400',
    discountImage: 'https://media.giphy.com/media/3o7abldj0b3rxrZUxW/giphy.gif',
    discountText: '🌟 Gourmet Delight',
    createdAt: new Date().toISOString()
  },
  {
    id: 10,
    productName: 'Ambemohar – Aromatic',
    productDetails: 'Fragrant short-grain rice, famous for its sweet aroma.',
    price: 200,
    discount: 10,
    finalPrice: 180,
    youtubeVideoId: 'dQw4w9WgXcQ',
    instagramUrl: 'https://instagram.com/p/example10',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400',
    discountImage: 'https://media.giphy.com/media/3o7abldj0b3rxrZUxW/giphy.gif',
    discountText: '🌹 Fragrant & Soft',
    createdAt: new Date().toISOString()
  },
  {
    id: 11,
    productName: 'Kolam Rice – Daily Use',
    productDetails: 'Light and fluffy, excellent for everyday cooking.',
    price: 120,
    discount: 5,
    finalPrice: 114,
    youtubeVideoId: 'dQw4w9WgXcQ',
    instagramUrl: 'https://instagram.com/p/example11',
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400',
    discountImage: '',
    discountText: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 12,
    productName: 'Pusa Basmati 1121',
    productDetails: 'Extra-long grain basmati with a distinct aroma, perfect for festive meals.',
    price: 20,
    discount: 2,
    finalPrice: 246.4,
    youtubeVideoId: 'dQw4w9WgXcQ',
    instagramUrl: 'https://instagram.com/p/example12',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400',
    discountImage: 'https://media.giphy.com/media/3o7abldj0b3rxrZUxW/giphy.gif',
    discountText: '🎊 Festival Special',
    createdAt: new Date().toISOString()
  },
  {
    id: 13,
    productName: 'Sharbati Rice – Premium',
    productDetails: 'Short-grain, sweet-smelling rice often used in desserts.',
    price: 240,
    discount: 8,
    finalPrice: 220.8,
    youtubeVideoId: 'dQw4w9WgXcQ',
    instagramUrl: 'https://instagram.com/p/example13',
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400',
    discountImage: 'https://media.giphy.com/media/3o7abldj0b3rxrZUxW/giphy.gif',
    discountText: '🍚 Sweet & Aromatic',
    createdAt: new Date().toISOString()
  },
  {
    id: 14,
    productName: 'Tandoori Rice – Special',
    productDetails: 'Coarse grain, ideal for tandoori and grilled dishes.',
    price: 170,
    discount: 0,
    finalPrice: 170,
    youtubeVideoId: 'dQw4w9WgXcQ',
    instagramUrl: 'https://instagram.com/p/example14',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400',
    discountImage: '',
    discountText: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 15,
    productName: 'Organic White Rice',
    productDetails: 'Certified organic white rice, smooth and versatile.',
    price: 195,
    discount: 10,
    finalPrice: 175.5,
    youtubeVideoId: 'dQw4w9WgXcQ',
    instagramUrl: 'https://instagram.com/p/example15',
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400',
    discountImage: 'https://media.giphy.com/media/3o7abldj0b3rxrZUxW/giphy.gif',
    discountText: '🌿 Pure Organic',
    createdAt: new Date().toISOString()
  }
];

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
  const [orderTimers, setOrderTimers] = useState({});
  const [customerName, setCustomerName] = useState('');
  const [isGuest, setIsGuest] = useState(false);

  const getCustomerKey = (baseKey) => `${customerId}_${baseKey}`;

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
    startOrderTimers();
  }, [customerId]);

  const loadProducts = () => {
    let savedProducts = localStorage.getItem('riceProducts');
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          return;
        }
      } catch (e) { }
    }
    localStorage.setItem('riceProducts', JSON.stringify(DEFAULT_PRODUCTS));
    setProducts(DEFAULT_PRODUCTS);
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
      if (order.orderDate) timers[order.id] = calculateRemainingTime(order.orderDate);
    });
    setOrderTimers(timers);
  };

  const calculateRemainingTime = (orderDate) => {
    const orderTime = new Date(orderDate).getTime();
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
          if (order.orderDate) updatedTimers[order.id] = calculateRemainingTime(order.orderDate);
        });
        setOrderTimers(updatedTimers);
        return prevOrders;
      });
    }, 1000);
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    let updatedCart;
    if (existingItem) {
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

  const playVideo = (videoId) => {
    if (videoId) {
      setCurrentVideo(videoId);
      setShowVideo(true);
    } else {
      alert('No video available for this product');
    }
  };

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

  // ===== UPDATED handleConfirmPurchase =====
  const handleConfirmPurchase = (method, amount, paymentSuccess = false) => {
    // Create order object
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
      orderDate: new Date().toISOString(),
      status: 'Confirmed',
      deliveryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    // Save order to localStorage
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
    // Avoid duplicates
    const exists = existingOrders.find(o => o.id === order.id);
    if (!exists) {
      existingOrders.unshift(order);
      localStorage.setItem(storageKey, JSON.stringify(existingOrders));
    }

    // Update state
    setOrders(existingOrders);
    const timer = calculateRemainingTime(order.orderDate);
    setOrderTimers(prev => ({ ...prev, [order.id]: timer }));

    // Clear cart
    setCart([]);
    const cartKey = isGuest ? 'guestCart' : getCustomerKey('userCart');
    localStorage.setItem(cartKey, JSON.stringify([]));

    // Reset payment/shipping states
    setShowPayment(false);
    setShowShipping(false);
    setPaymentMethod('');
    setShippingDetails(null);

    // ----- WhatsApp Share (with UPI ID for online) -----
    const itemsList = order.items.map(item => `${item.productName} x ${item.quantity}`).join('\n');
    let message = `✅ *Order Confirmed!*\n\n` +
                  `*Order ID:* ${order.orderId}\n` +
                  `*Total:* ₹${order.totalAmount.toFixed(2)}\n` +
                  `*Payment Method:* ${method === 'online' ? 'Online Payment' : 'Cash on Delivery'}\n` +
                  `*Payment Status:* ${method === 'online' ? 'Paid' : 'Pending'}\n\n` +
                  `*Items:*\n${itemsList}\n\n` +
                  `*Shipping Address:*\n${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.state} - ${shippingDetails.pincode}\n` +
                  `*Contact:* ${shippingDetails.mobileNumber}\n\n`;

    if (method === 'online') {
      message += `*For Online Payment, please pay to:*\nUPI ID: ${UPI_ID}\n\n`;
    }

    message += `Thank you for shopping with SRM Rice Store! 🌾\n\n` +
               `⏰ Your order will be delivered within 24 hours.`;

   const whatsappUrl = `https://wa.me/917092492023?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // Show success alert
    alert(`✅ Order placed successfully! Order ID: ${order.orderId}\n\nYour order will be delivered within 24 hours.`);
  };

  const handleBackToCart = () => {
    setShowShipping(false);
    setShowCart(true);
  };

  const handleBackToShipping = () => {
    setShowPayment(false);
    setShowShipping(true);
  };

  const formatTime = (hours, minutes, seconds) =>
    `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const filteredProducts = products.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.productDetails.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      />
    );
  }

  return (
    <div className="customer-home">
      <header className="customer-header">
        <div className="header-content">
          <div>
            <h1>🌾 SRM </h1>
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
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

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
                  <div className="product-actions">
                    <button onClick={() => addToCart(product)} className="add-to-cart">
                      🛒 Add to Cart
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
                  const timer = orderTimers[order.id] || calculateRemainingTime(order.orderDate);
                  return (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <span className="order-id">Order #{order.orderId}</span>
                        <span className={`order-status ${order.status.toLowerCase()}`}>
                          {order.status === 'Delivered' ? '✅ Delivered' :
                            order.status === 'Cancelled' ? '❌ Cancelled' :
                              '⏳ Confirmed'}
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
                        <div className="delivery-status cancelled">❌ Order Cancelled</div>
                      )}
                      {order.status === 'Confirmed' && (
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
                                width: timer.expired ? '100%' : `${((24 * 60 * 60 * 1000 - (new Date().getTime() - new Date(order.orderDate).getTime())) / (24 * 60 * 60 * 1000)) * 100}%`
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

      {/* Product Details Modal */}
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
            {selectedProduct.youtubeVideoId && (
              <div className="modal-video">
                <button onClick={() => playVideo(selectedProduct.youtubeVideoId)} className="watch-video-btn">
                  📺 Watch Product Video
                </button>
              </div>
            )}
            <div className="modal-actions">
              <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} className="buy-now">
                🛒 Add to Cart
              </button>
              <button onClick={() => { addToWishlist(selectedProduct); }} className="wishlist-modal-btn">
                {wishlist.find(item => item.id === selectedProduct.id) ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
              </button>
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