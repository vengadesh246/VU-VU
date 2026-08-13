import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

function AdminPanel({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [formData, setFormData] = useState({
    productName: '',
    productDetails: '',
    price: '',
    discount: '',
    youtubeVideoId: '',
    instagramUrl: '',
    image: null,
    imagePreview: '',
    discountImage: null,
    discountImagePreview: '',
    discountText: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [showDeliveredDropdown, setShowDeliveredDropdown] = useState(false);
  const [showCancelledDropdown, setShowCancelledDropdown] = useState(false);

  useEffect(() => {
    loadProducts();
    loadAllOrders();
  }, []);

  const getDefaultProducts = () => [
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
      price: 252,
      discount: 2,
      finalPrice: 246.96,
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
    const defaultProducts = getDefaultProducts();
    setProducts(defaultProducts);
    localStorage.setItem('riceProducts', JSON.stringify(defaultProducts));
  };

  const loadAllOrders = () => {
    const allOrders = [];
    const allKeys = Object.keys(localStorage);
    const orderKeys = allKeys.filter(key => key.endsWith('_orders'));
    const guestOrdersKey = 'guestOrders';
    const guestOrders = localStorage.getItem(guestOrdersKey);
    if (guestOrders) {
      try {
        const parsedGuestOrders = JSON.parse(guestOrders);
        allOrders.push(...parsedGuestOrders);
      } catch (e) {}
    }
    orderKeys.forEach(key => {
      const ordersData = localStorage.getItem(key);
      if (ordersData) {
        try {
          const parsedOrders = JSON.parse(ordersData);
          allOrders.push(...parsedOrders);
        } catch (e) {}
      }
    });
    allOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    setOrders(allOrders);
  };

  const calculateFinalPrice = (price, discount) => {
    if (!discount || discount === 0) return price;
    return price - (price * discount / 100);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiscountImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          discountImage: reader.result,
          discountImagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.productName || !formData.productDetails || !formData.price) {
      setMessage('❌ Please fill all required fields!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    const finalPrice = calculateFinalPrice(parseFloat(formData.price), parseFloat(formData.discount || 0));
    const productData = {
      id: editingId || Date.now(),
      productName: formData.productName,
      productDetails: formData.productDetails,
      price: parseFloat(formData.price),
      discount: parseFloat(formData.discount || 0),
      finalPrice: finalPrice,
      youtubeVideoId: extractYouTubeId(formData.youtubeVideoId),
      instagramUrl: formData.instagramUrl || '',
      image: formData.image || 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400',
      discountImage: formData.discountImage || '',
      discountText: formData.discountText || '',
      createdAt: new Date().toISOString()
    };

    let updatedProducts;
    if (editingId) {
      updatedProducts = products.map(p => p.id === editingId ? productData : p);
      setMessage('✅ Product updated successfully!');
    } else {
      updatedProducts = [productData, ...products];
      setMessage('✅ Product added successfully!');
    }
    setProducts(updatedProducts);
    localStorage.setItem('riceProducts', JSON.stringify(updatedProducts));
    resetForm();
    setTimeout(() => setMessage(''), 3000);
  };

  const resetForm = () => {
    setFormData({
      productName: '',
      productDetails: '',
      price: '',
      discount: '',
      youtubeVideoId: '',
      instagramUrl: '',
      image: null,
      imagePreview: '',
      discountImage: null,
      discountImagePreview: '',
      discountText: ''
    });
    setEditingId(null);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      productName: product.productName,
      productDetails: product.productDetails,
      price: product.price,
      discount: product.discount,
      youtubeVideoId: product.youtubeVideoId,
      instagramUrl: product.instagramUrl || '',
      image: product.image,
      imagePreview: product.image,
      discountImage: product.discountImage || '',
      discountImagePreview: product.discountImage || '',
      discountText: product.discountText || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const updatedProducts = products.filter(p => p.id !== id);
      setProducts(updatedProducts);
      localStorage.setItem('riceProducts', JSON.stringify(updatedProducts));
      setMessage('✅ Product deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // ===== Orders: updateOrderStatus (sets confirmationDate) =====
  const updateOrderStatus = (orderId, status) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) {
      setMessage('❌ Order not found!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const isGuest = orderToUpdate.isGuest || false;
    const customerId = orderToUpdate.customerId;

    const updateOrderInStorage = (storageKey) => {
      const storedOrders = localStorage.getItem(storageKey);
      if (storedOrders) {
        try {
          const parsedOrders = JSON.parse(storedOrders);
          const updatedOrders = parsedOrders.map(order => {
            if (order.id === orderId) {
              const updatedOrder = {
                ...order,
                status: status,
                statusUpdateDate: new Date().toISOString()
              };
              if (status === 'Confirmed') {
                updatedOrder.confirmationDate = new Date().toISOString();
              }
              if (status === 'Delivered') {
                updatedOrder.deliveredDate = new Date().toISOString();
              }
              return updatedOrder;
            }
            return order;
          });
          localStorage.setItem(storageKey, JSON.stringify(updatedOrders));
          return true;
        } catch (e) {
          return false;
        }
      }
      return false;
    };

    let success = false;
    if (isGuest) {
      success = updateOrderInStorage('guestOrders');
    } else if (customerId) {
      const customerKey = `${customerId}_orders`;
      const legacyKey = `${customerId}orders`;
      success = updateOrderInStorage(customerKey);
      if (!success) {
        success = updateOrderInStorage(legacyKey);
      }
    }

    if (!success) {
      const allKeys = Object.keys(localStorage);
      const orderKeys = allKeys.filter(key => key.endsWith('_orders') || key === 'guestOrders');
      orderKeys.forEach(key => {
        updateOrderInStorage(key);
      });
    }

    loadAllOrders();
    setMessage(`✅ Order status updated to ${status}!`);
    setTimeout(() => setMessage(''), 3000);
  };

  const getOrderStats = () => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'Pending').length;
    const confirmed = orders.filter(o => o.status === 'Confirmed').length;
    const delivered = orders.filter(o => o.status === 'Delivered').length;
    const cancelled = orders.filter(o => o.status === 'Cancelled').length;
    return { total, pending, confirmed, delivered, cancelled };
  };

  const getFilteredOrders = () => {
    if (orderFilter === 'all') return orders;
    if (orderFilter === 'delivered') return orders.filter(o => o.status === 'Delivered');
    if (orderFilter === 'cancelled') return orders.filter(o => o.status === 'Cancelled');
    if (orderFilter === 'pending') return orders.filter(o => o.status === 'Pending');
    return orders.filter(o => o.status === orderFilter); // for 'confirmed'
  };

  const stats = getOrderStats();
  const filteredOrders = getFilteredOrders();
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled');

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>👑 SRM Admin Panel</h1>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>

      {message && <div className="message-popup">{message}</div>}

      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
          📦 Products ({products.length})
        </button>
        <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          📋 Orders ({orders.length})
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'products' ? (
          // Product Management Section
          <>
            <div className="product-form-container">
              <h2>{editingId ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
              <form onSubmit={handleSubmit} className="product-form">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input type="text" name="productName" value={formData.productName} onChange={handleInputChange} placeholder="e.g., Basmati Rice" required />
                </div>

                <div className="form-group">
                  <label>Product Details *</label>
                  <textarea name="productDetails" value={formData.productDetails} onChange={handleInputChange} placeholder="Describe the product..." rows="4" required />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="e.g., 120" step="0.01" required />
                  </div>
                  <div className="form-group">
                    <label>Discount (%)</label>
                    <input type="number" name="discount" value={formData.discount} onChange={handleInputChange} placeholder="Leave empty for no discount" step="0.01" />
                  </div>
                </div>

                <div className="discount-section">
                  <h3>🎯 Discount Image & Text</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Discount Image (GIF/Animated)</label>
                      <input type="file" accept="image/*" onChange={handleDiscountImageUpload} className="file-input" />
                      {formData.discountImagePreview && (
                        <div className="discount-image-preview">
                          <img src={formData.discountImagePreview} alt="Discount" />
                          <div className="discount-overlay-text">{formData.discountText || 'Add your text here'}</div>
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Discount Text</label>
                      <input type="text" name="discountText" value={formData.discountText} onChange={handleInputChange} placeholder="e.g., Special Offer! 20% Off" className="discount-text-input" />
                      <small className="help-text">💡 This text will appear on the discount image</small>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>YouTube Video URL</label>
                    <input type="text" name="youtubeVideoId" value={formData.youtubeVideoId} onChange={handleInputChange} placeholder="https://youtube.com/watch?v=... or video ID" />
                  </div>
                  <div className="form-group">
                    <label>Instagram URL</label>
                    <input type="text" name="instagramUrl" value={formData.instagramUrl} onChange={handleInputChange} placeholder="https://instagram.com/p/..." />
                  </div>
                </div>

                <div className="form-group">
                  <label>Product Image *</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />
                  {formData.imagePreview && (
                    <div className="image-preview">
                      <img src={formData.imagePreview} alt="Preview" />
                    </div>
                  )}
                </div>

                <div className="form-buttons">
                  <button type="submit" className="submit-btn">{editingId ? 'Update Product' : 'Add Product'}</button>
                  {editingId && <button type="button" onClick={resetForm} className="cancel-btn">Cancel Edit</button>}
                </div>
              </form>
            </div>

            <div className="products-list-container">
              <h2>📦 Manage Products ({products.length})</h2>
              <div className="admin-products-grid">
                {products.map(product => (
                  <div key={product.id} className="admin-product-card">
                    <img src={product.image} alt={product.productName} />
                    <div className="product-info">
                      <h3>{product.productName}</h3>
                      <p className="product-desc">{product.productDetails.substring(0, 60)}...</p>
                      <div className="price-info">
                        {product.discount > 0 ? (
                          <>
                            <span className="original-price">₹{product.price}</span>
                            <span className="discount">-{product.discount}%</span>
                            <span className="final-price">₹{product.finalPrice}</span>
                          </>
                        ) : (
                          <span className="final-price">₹{product.price}</span>
                        )}
                      </div>
                      {product.discountImage && (
                        <div className="product-discount-banner">
                          <img src={product.discountImage} alt="Discount" />
                          {product.discountText && <div className="discount-banner-text">{product.discountText}</div>}
                        </div>
                      )}
                      <div className="social-links">
                        {product.youtubeVideoId && <span className="youtube-icon">📺 Watch Video</span>}
                        {product.instagramUrl && (
                          <a href={product.instagramUrl} target="_blank" rel="noopener noreferrer" className="instagram-link">📸 Instagram</a>
                        )}
                      </div>
                    </div>
                    <div className="admin-actions">
                      <button onClick={() => handleEdit(product)} className="edit-btn">✏️ Edit</button>
                      <button onClick={() => handleDelete(product.id)} className="delete-btn">🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          // Orders Tab
          <>
            <div className="orders-stats">
              <div className="stat-card">
                <span className="stat-label">Total Orders</span>
                <span className="stat-value">{stats.total}</span>
              </div>
              <div className="stat-card pending">
                <span className="stat-label">Pending</span>
                <span className="stat-value">{stats.pending}</span>
              </div>
              <div className="stat-card confirmed">
                <span className="stat-label">Confirmed</span>
                <span className="stat-value">{stats.confirmed}</span>
              </div>
              <div className="stat-card delivered">
                <span className="stat-label">Delivered</span>
                <span className="stat-value">{stats.delivered}</span>
              </div>
              <div className="stat-card cancelled">
                <span className="stat-label">Cancelled</span>
                <span className="stat-value">{stats.cancelled}</span>
              </div>
            </div>

            <div className="order-dropdowns">
              <div className="dropdown-section">
                <button className={`dropdown-toggle ${showDeliveredDropdown ? 'active' : ''}`} onClick={() => setShowDeliveredDropdown(!showDeliveredDropdown)}>
                  ✅ Delivered Orders ({deliveredOrders.length})
                  <span className="dropdown-arrow">{showDeliveredDropdown ? '▲' : '▼'}</span>
                </button>
                {showDeliveredDropdown && (
                  <div className="dropdown-content">
                    {deliveredOrders.length === 0 ? (
                      <p className="dropdown-empty">No delivered orders</p>
                    ) : (
                      deliveredOrders.map(order => (
                        <div key={order.id} className="dropdown-order-card">
                          <div className="dropdown-order-header">
                            <span className="order-id">Order #{order.orderId}</span>
                            <span className="delivered-badge-small">✅ Delivered</span>
                          </div>
                          <div className="dropdown-order-details">
                            <p><strong>Customer:</strong> {order.customerName || order.shippingDetails?.fullName || 'N/A'}</p>
                            <p><strong>Items:</strong> {order.items.map(item => item.productName).join(', ')}</p>
                            <p><strong>Total:</strong> ₹{order.totalAmount.toFixed(2)}</p>
                            {order.deliveredDate && <p><strong>Delivered on:</strong> {new Date(order.deliveredDate).toLocaleString()}</p>}
                          </div>
                          <button className="revert-btn-small" onClick={() => updateOrderStatus(order.id, 'Confirmed')}>↩️ Revert to Confirmed</button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="dropdown-section">
                <button className={`dropdown-toggle ${showCancelledDropdown ? 'active' : ''}`} onClick={() => setShowCancelledDropdown(!showCancelledDropdown)}>
                  ❌ Cancelled Orders ({cancelledOrders.length})
                  <span className="dropdown-arrow">{showCancelledDropdown ? '▲' : '▼'}</span>
                </button>
                {showCancelledDropdown && (
                  <div className="dropdown-content">
                    {cancelledOrders.length === 0 ? (
                      <p className="dropdown-empty">No cancelled orders</p>
                    ) : (
                      cancelledOrders.map(order => (
                        <div key={order.id} className="dropdown-order-card">
                          <div className="dropdown-order-header">
                            <span className="order-id">Order #{order.orderId}</span>
                            <span className="cancelled-badge-small">❌ Cancelled</span>
                          </div>
                          <div className="dropdown-order-details">
                            <p><strong>Customer:</strong> {order.customerName || order.shippingDetails?.fullName || 'N/A'}</p>
                            <p><strong>Items:</strong> {order.items.map(item => item.productName).join(', ')}</p>
                            <p><strong>Total:</strong> ₹{order.totalAmount.toFixed(2)}</p>
                            {order.statusUpdateDate && <p><strong>Cancelled on:</strong> {new Date(order.statusUpdateDate).toLocaleString()}</p>}
                          </div>
                          <button className="revert-btn-small" onClick={() => updateOrderStatus(order.id, 'Confirmed')}>↩️ Revert to Confirmed</button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="orders-list-container">
              <div className="orders-header-with-filter">
                <h2>📋 All Orders</h2>
                <div className="filter-buttons">
                  <button className={`filter-btn ${orderFilter === 'all' ? 'active' : ''}`} onClick={() => setOrderFilter('all')}>All ({stats.total})</button>
                  <button className={`filter-btn pending ${orderFilter === 'pending' ? 'active' : ''}`} onClick={() => setOrderFilter('pending')}>Pending ({stats.pending})</button>
                  <button className={`filter-btn confirmed ${orderFilter === 'confirmed' ? 'active' : ''}`} onClick={() => setOrderFilter('confirmed')}>Confirmed ({stats.confirmed})</button>
                  <button className={`filter-btn delivered ${orderFilter === 'delivered' ? 'active' : ''}`} onClick={() => setOrderFilter('delivered')}>Delivered ({stats.delivered})</button>
                  <button className={`filter-btn cancelled ${orderFilter === 'cancelled' ? 'active' : ''}`} onClick={() => setOrderFilter('cancelled')}>Cancelled ({stats.cancelled})</button>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="no-orders"><p>No orders found</p></div>
              ) : (
                <div className="orders-grid">
                  {filteredOrders.map(order => (
                    <div key={order.id} className="order-management-card">
                      <div className="order-header">
                        <div className="order-id-section">
                          <span className="order-id">Order #{order.orderId}</span>
                          <span className={`order-status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
                          {order.isGuest && <span className="guest-badge">🎭 Guest</span>}
                        </div>
                        <div className="order-date">📅 {new Date(order.orderDate).toLocaleString()}</div>
                      </div>

                      <div className="customer-info">
                        <h4>Customer Details</h4>
                        <div className="customer-details">
                          <p><strong>Name:</strong> {order.customerName || order.shippingDetails?.fullName || 'N/A'}</p>
                          <p><strong>Customer ID:</strong> {order.customerId || 'N/A'}</p>
                          <p><strong>Login ID:</strong> {order.loginId || 'N/A'}</p>
                          <p><strong>Phone:</strong> {order.shippingDetails?.mobileNumber || order.shippingDetails?.phone || 'N/A'}</p>
                          <p><strong>Address:</strong> {order.shippingDetails?.address || 'N/A'}</p>
                          <p><strong>City:</strong> {order.shippingDetails?.city || 'N/A'}</p>
                          <p><strong>Pincode:</strong> {order.shippingDetails?.pincode || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="order-items">
                        <h4>Order Items</h4>
                        {order.items.map((item, index) => (
                          <div key={index} className="order-item-row">
                            <span>{item.productName} x {item.quantity}</span>
                            <span>₹{item.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-summary">
                        <div className="payment-info">
                          <span>💳 {order.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}</span>
                          <span className="order-total">Total: ₹{order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="order-actions">
                        {order.status === 'Pending' && (
                          <>
                            <button className="confirm-btn-order" onClick={() => updateOrderStatus(order.id, 'Confirmed')}>
                              ✅ Confirm Order
                            </button>
                            <button className="cancel-btn-order" onClick={() => updateOrderStatus(order.id, 'Cancelled')}>
                              ❌ Cancel Order
                            </button>
                          </>
                        )}
                        {order.status === 'Confirmed' && (
                          <>
                            <button className="deliver-btn" onClick={() => updateOrderStatus(order.id, 'Delivered')}>
                              🚚 Mark as Delivered
                            </button>
                            <button className="cancel-btn-order" onClick={() => updateOrderStatus(order.id, 'Cancelled')}>
                              ❌ Cancel Order
                            </button>
                          </>
                        )}
                        {order.status === 'Delivered' && (
                          <>
                            <div className="delivered-info">
                              <span className="delivered-badge">✅ Delivered</span>
                              {order.deliveredDate && (
                                <span className="delivered-date">📅 Delivered on: {new Date(order.deliveredDate).toLocaleString()}</span>
                              )}
                            </div>
                            <button className="revert-btn" onClick={() => updateOrderStatus(order.id, 'Confirmed')}>
                              ↩️ Revert to Confirmed
                            </button>
                          </>
                        )}
                        {order.status === 'Cancelled' && (
                          <>
                            <div className="cancelled-info"><span className="cancelled-badge">❌ Cancelled</span></div>
                            <button className="revert-btn" onClick={() => updateOrderStatus(order.id, 'Confirmed')}>
                              ↩️ Revert to Confirmed
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;