import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

function AdminPanel({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [formData, setFormData] = useState({
    productName: '',
    productDetails: '',
    price: '',
    discount: '',
    category: '',
    stock: '',
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

  // Coupon form state
  const [couponForm, setCouponForm] = useState({
    id: null,
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrder: '',
    expiry: '',
    maxUses: '',
    active: true
  });
  const [editingCouponId, setEditingCouponId] = useState(null);

  // Review modal
  const [selectedProductReviews, setSelectedProductReviews] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // ---- Load data ----
  useEffect(() => {
    loadProducts();
    loadAllOrders();
    loadCategories();
    loadCoupons();
  }, []);

  // ---- Categories ----
  const loadCategories = () => {
    const saved = localStorage.getItem('categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed);
          return;
        }
      } catch (e) {}
    }
    const defaultCats = ['Basmati', 'Brown', 'White', 'Specialty', 'Organic'];
    setCategories(defaultCats);
    localStorage.setItem('categories', JSON.stringify(defaultCats));
  };

  const saveCategories = (cats) => {
    setCategories(cats);
    localStorage.setItem('categories', JSON.stringify(cats));
  };

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (categories.includes(name)) {
      setMessage('❌ Category already exists');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    const updated = [...categories, name];
    saveCategories(updated);
    setNewCategoryName('');
    setMessage('✅ Category added');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteCategory = (cat) => {
    if (window.confirm(`Delete category "${cat}"?`)) {
      const updated = categories.filter(c => c !== cat);
      saveCategories(updated);
      setMessage('✅ Category deleted');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // ---- Coupons ----
  const loadCoupons = () => {
    const saved = localStorage.getItem('coupons');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCoupons(parsed);
        return;
      } catch (e) {}
    }
    setCoupons([]);
    localStorage.setItem('coupons', JSON.stringify([]));
  };

  const saveCoupons = (coups) => {
    setCoupons(coups);
    localStorage.setItem('coupons', JSON.stringify(coups));
  };

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    const { code, discountType, discountValue, minOrder, expiry, maxUses, active } = couponForm;
    if (!code || !discountValue || !minOrder || !expiry || !maxUses) {
      setMessage('❌ Please fill all fields');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    const newCoupon = {
      id: editingCouponId || Date.now(),
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: parseFloat(discountValue),
      minOrder: parseFloat(minOrder),
      expiry: new Date(expiry).toISOString(),
      maxUses: parseInt(maxUses, 10),
      usedCount: 0,
      active: active !== undefined ? active : true
    };
    let updatedCoupons;
    if (editingCouponId) {
      updatedCoupons = coupons.map(c => c.id === editingCouponId ? { ...newCoupon, usedCount: c.usedCount || 0 } : c);
    } else {
      if (coupons.some(c => c.code === newCoupon.code)) {
        setMessage('❌ Coupon code already exists');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      updatedCoupons = [...coupons, newCoupon];
    }
    saveCoupons(updatedCoupons);
    resetCouponForm();
    setMessage(editingCouponId ? '✅ Coupon updated' : '✅ Coupon created');
    setTimeout(() => setMessage(''), 3000);
  };

  const resetCouponForm = () => {
    setCouponForm({ id: null, code: '', discountType: 'percentage', discountValue: '', minOrder: '', expiry: '', maxUses: '', active: true });
    setEditingCouponId(null);
  };

  const handleEditCoupon = (coupon) => {
    setEditingCouponId(coupon.id);
    setCouponForm({
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrder: coupon.minOrder,
      expiry: new Date(coupon.expiry).toISOString().slice(0, 16),
      maxUses: coupon.maxUses,
      active: coupon.active
    });
  };

  const handleDeleteCoupon = (id) => {
    if (window.confirm('Delete this coupon?')) {
      const updated = coupons.filter(c => c.id !== id);
      saveCoupons(updated);
      setMessage('✅ Coupon deleted');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // ---- Products ----
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
      createdAt: new Date().toISOString(),
      category: 'Basmati',
      stock: 50,
      reviews: [],
      averageRating: 0
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
      createdAt: new Date().toISOString(),
      category: 'White',
      stock: 40,
      reviews: [],
      averageRating: 0
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
      createdAt: new Date().toISOString(),
      category: 'Brown',
      stock: 30,
      reviews: [],
      averageRating: 0
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
      createdAt: new Date().toISOString(),
      category: 'Basmati',
      stock: 25,
      reviews: [],
      averageRating: 0
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
      createdAt: new Date().toISOString(),
      category: 'White',
      stock: 60,
      reviews: [],
      averageRating: 0
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
      createdAt: new Date().toISOString(),
      category: 'White',
      stock: 35,
      reviews: [],
      averageRating: 0
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
      createdAt: new Date().toISOString(),
      category: 'Brown',
      stock: 20,
      reviews: [],
      averageRating: 0
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
      createdAt: new Date().toISOString(),
      category: 'Specialty',
      stock: 15,
      reviews: [],
      averageRating: 0
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
      createdAt: new Date().toISOString(),
      category: 'Specialty',
      stock: 10,
      reviews: [],
      averageRating: 0
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
      createdAt: new Date().toISOString(),
      category: 'Basmati',
      stock: 22,
      reviews: [],
      averageRating: 0
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
      createdAt: new Date().toISOString(),
      category: 'White',
      stock: 45,
      reviews: [],
      averageRating: 0
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
      createdAt: new Date().toISOString(),
      category: 'Basmati',
      stock: 18,
      reviews: [],
      averageRating: 0
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
      createdAt: new Date().toISOString(),
      category: 'Specialty',
      stock: 12,
      reviews: [],
      averageRating: 0
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
      createdAt: new Date().toISOString(),
      category: 'White',
      stock: 28,
      reviews: [],
      averageRating: 0
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
      createdAt: new Date().toISOString(),
      category: 'Organic',
      stock: 32,
      reviews: [],
      averageRating: 0
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
    const defaults = getDefaultProducts();
    setProducts(defaults);
    localStorage.setItem('riceProducts', JSON.stringify(defaults));
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
    if (!formData.productName || !formData.productDetails || !formData.price || !formData.category || !formData.stock) {
      setMessage('❌ Please fill all required fields (including category and stock)');
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
      category: formData.category,
      stock: parseInt(formData.stock, 10),
      youtubeVideoId: extractYouTubeId(formData.youtubeVideoId),
      instagramUrl: formData.instagramUrl || '',
      image: formData.image || 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400',
      discountImage: formData.discountImage || '',
      discountText: formData.discountText || '',
      createdAt: new Date().toISOString(),
      reviews: editingId ? products.find(p => p.id === editingId)?.reviews || [] : [],
      averageRating: editingId ? products.find(p => p.id === editingId)?.averageRating || 0 : 0
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
      category: categories.length > 0 ? categories[0] : '',
      stock: '',
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
      category: product.category || (categories.length > 0 ? categories[0] : ''),
      stock: product.stock || 0,
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

  // Review modal handlers
  const openReviewModal = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProductReviews(product);
      setShowReviewModal(true);
    }
  };

  const handleDeleteReview = (productId, reviewId) => {
    if (window.confirm('Delete this review?')) {
      const updatedProducts = products.map(p => {
        if (p.id === productId) {
          const updatedReviews = p.reviews.filter(r => r.id !== reviewId);
          const avg = updatedReviews.length > 0 ? updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length : 0;
          return { ...p, reviews: updatedReviews, averageRating: avg };
        }
        return p;
      });
      setProducts(updatedProducts);
      localStorage.setItem('riceProducts', JSON.stringify(updatedProducts));
      setMessage('✅ Review deleted');
      setTimeout(() => setMessage(''), 3000);
      // Refresh modal
      const updatedProduct = updatedProducts.find(p => p.id === productId);
      setSelectedProductReviews(updatedProduct);
    }
  };

  // Order management functions (unchanged)
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
      success = updateOrderInStorage(customerKey);
      if (!success) {
        success = updateOrderInStorage(`${customerId}orders`);
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
    return orders.filter(o => o.status === orderFilter);
  };

  const stats = getOrderStats();
  const filteredOrders = getFilteredOrders();
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled');

  // ---- Render ----
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
        <button className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
          🏷️ Categories
        </button>
        <button className={`tab-btn ${activeTab === 'coupons' ? 'active' : ''}`} onClick={() => setActiveTab('coupons')}>
          🎫 Coupons ({coupons.length})
        </button>
      </div>

      <div className="admin-content">
        {/* ----- PRODUCTS TAB ----- */}
        {activeTab === 'products' && (
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

                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} required>
                      <option value="">Select Category</option>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Stock Quantity *</label>
                    <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} placeholder="e.g., 50" min="0" step="1" required />
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
                      <div className="product-meta">
                        <span className="category-badge">🏷️ {product.category || 'Uncategorized'}</span>
                        <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                          {product.stock > 0 ? `📦 ${product.stock} left` : '❌ Out of Stock'}
                        </span>
                        <span className="rating-badge">
                          ⭐ {product.averageRating ? product.averageRating.toFixed(1) : 'No ratings'}
                        </span>
                      </div>
                      <div className="social-links">
                        {product.youtubeVideoId && <span className="youtube-icon">📺 Watch Video</span>}
                        {product.instagramUrl && (
                          <a href={product.instagramUrl} target="_blank" rel="noopener noreferrer" className="instagram-link">📸 Instagram</a>
                        )}
                      </div>
                      <button onClick={() => openReviewModal(product.id)} className="view-reviews-btn">📝 Reviews ({product.reviews?.length || 0})</button>
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
        )}

        {/* ----- ORDERS TAB (unchanged) ----- */}
        {activeTab === 'orders' && (
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
                          {order.couponCode && <span className="coupon-applied">🎫 Coupon: {order.couponCode} (Save ₹{order.couponDiscount?.toFixed(2)})</span>}
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

        {/* ----- CATEGORIES TAB ----- */}
        {activeTab === 'categories' && (
          <div className="categories-management">
            <h2>🏷️ Manage Categories</h2>
            <div className="category-form">
              <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="New category name" />
              <button onClick={handleAddCategory} className="add-category-btn">Add Category</button>
            </div>
            <div className="category-list">
              {categories.map(cat => (
                <div key={cat} className="category-item">
                  <span>{cat}</span>
                  <button onClick={() => handleDeleteCategory(cat)} className="delete-cat-btn">🗑️</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----- COUPONS TAB ----- */}
        {activeTab === 'coupons' && (
          <div className="coupons-management">
            <h2>🎫 Manage Coupons</h2>
            <form onSubmit={handleCouponSubmit} className="coupon-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Coupon Code *</label>
                  <input type="text" value={couponForm.code} onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} placeholder="e.g., SAVE10" required />
                </div>
                <div className="form-group">
                  <label>Discount Type</label>
                  <select value={couponForm.discountType} onChange={(e) => setCouponForm({...couponForm, discountType: e.target.value})}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Discount Value *</label>
                  <input type="number" value={couponForm.discountValue} onChange={(e) => setCouponForm({...couponForm, discountValue: e.target.value})} placeholder="e.g., 10" step="0.01" required />
                </div>
                <div className="form-group">
                  <label>Min Order (₹) *</label>
                  <input type="number" value={couponForm.minOrder} onChange={(e) => setCouponForm({...couponForm, minOrder: e.target.value})} placeholder="e.g., 500" step="0.01" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input type="datetime-local" value={couponForm.expiry} onChange={(e) => setCouponForm({...couponForm, expiry: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Max Uses *</label>
                  <input type="number" value={couponForm.maxUses} onChange={(e) => setCouponForm({...couponForm, maxUses: e.target.value})} placeholder="e.g., 100" min="1" required />
                </div>
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" checked={couponForm.active} onChange={(e) => setCouponForm({...couponForm, active: e.target.checked})} />
                  Active
                </label>
              </div>
              <div className="form-buttons">
                <button type="submit" className="submit-btn">{editingCouponId ? 'Update Coupon' : 'Create Coupon'}</button>
                {editingCouponId && <button type="button" onClick={resetCouponForm} className="cancel-btn">Cancel</button>}
              </div>
            </form>
            <div className="coupons-list">
              {coupons.map(coupon => (
                <div key={coupon.id} className="coupon-card">
                  <div className="coupon-header">
                    <span className="coupon-code">{coupon.code}</span>
                    <span className={`coupon-status ${coupon.active ? 'active' : 'inactive'}`}>
                      {coupon.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="coupon-details">
                    <p>Discount: {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</p>
                    <p>Min Order: ₹{coupon.minOrder}</p>
                    <p>Expires: {new Date(coupon.expiry).toLocaleString()}</p>
                    <p>Used: {coupon.usedCount || 0} / {coupon.maxUses}</p>
                  </div>
                  <div className="coupon-actions">
                    <button onClick={() => handleEditCoupon(coupon)} className="edit-btn">✏️</button>
                    <button onClick={() => handleDeleteCoupon(coupon.id)} className="delete-btn">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedProductReviews && (
        <div className="modal" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setShowReviewModal(false)}>&times;</span>
            <h2>📝 Reviews for {selectedProductReviews.productName}</h2>
            {selectedProductReviews.reviews && selectedProductReviews.reviews.length > 0 ? (
              selectedProductReviews.reviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <strong>{review.customerName}</strong>
                    <span className="review-rating">⭐ {review.rating}</span>
                    <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  <button onClick={() => handleDeleteReview(selectedProductReviews.id, review.id)} className="delete-review-btn">🗑️ Delete</button>
                </div>
              ))
            ) : (
              <p>No reviews yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;