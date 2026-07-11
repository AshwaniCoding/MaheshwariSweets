import React, { useState, useEffect } from "react";
import { 
  Sparkles, ShoppingCart, Search, Mic, Phone, MapPin, Gift, Clock, Star, 
  ShieldCheck, Heart, Trash2, ArrowRight, Check, Compass, FileText, Send, 
  Info, AlertCircle, RefreshCw, X, Eye
} from "lucide-react";
import Header from "./components/Header.tsx";
import Footer from "./components/Footer.tsx";
import ProductCard from "./components/ProductCard.tsx";
import GiftBoxBuilder from "./components/GiftBoxBuilder.tsx";
import CateringEstimator from "./components/CateringEstimator.tsx";
import AdminPanel from "./components/AdminPanel.tsx";
import InvoiceModal from "./components/InvoiceModal.tsx";
import Chatbot from "./components/Chatbot.tsx";
import CustomerAccountDashboard from "./components/CustomerAccountDashboard.tsx";
import { Product, Order, Review } from "./types.ts";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // User Authentication States
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  // Customer Login/OTP Flow Modal States
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [receivedOtp, setReceivedOtp] = useState(""); // SMS gateway simulated preview code
  const [isNewUser, setIsNewUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Wishlist Products State
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

  // Saved Addresses Edit States
  const [newStreet, setNewStreet] = useState("");
  const [newArea, setNewArea] = useState("Civil Lines");
  const [newPincode, setNewPincode] = useState("485001");
  const [newLandmark, setNewLandmark] = useState("");
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  
  // Shopping Cart States (Persistent via LocalStorage)
  const [cart, setCart] = useState<{
    product: Product;
    quantity: number;
    selectedUnit: string;
    price: number;
  }[]>(() => {
    try {
      const saved = localStorage.getItem("maheshwari_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isGiftWrap, setIsGiftWrap] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0); // value in rupees
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // Customer Checkout States
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  useEffect(() => {
    if (user) {
      setCustomerName(user.name || "");
      setCustomerEmail(user.email || "");
      setCustomerPhone(user.phone || "");
    }
  }, [user]);
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [streetAddress, setStreetAddress] = useState("");
  const [selectedArea, setSelectedArea] = useState("Civil Lines");
  const [pincode, setPincode] = useState("485001");
  const [landmark, setLandmark] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");

  // Simulated Payment Modal
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [fakeCardNumber, setFakeCardNumber] = useState("");
  const [fakeCardExpiry, setFakeCardExpiry] = useState("");
  const [fakeCardCVV, setFakeCardCVV] = useState("");

  // Order Success & Invoice states
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Active tracking order
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

  // Product Filter & Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  
  // Simulated Voice Search
  const [isListening, setIsListening] = useState(false);

  // Customer Review Form States
  const [revName, setRevName] = useState("");
  const [revLoc, setRevLoc] = useState("");
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState("");
  const [revSuccess, setRevSuccess] = useState(false);

  // Admin Mode state (toggled from header)
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Satna Locations List for delivery dropdown
  const satnaAreas = [
    "Civil Lines", "Bharhut Nagar", "Pateri", "Station Road", "Sherganj", 
    "Sajjanpur", "Birla Colony", "Dhawari", "Kolgawan", "Kothi Road", "Prem Nagar"
  ];

  // Fetch initial products and reviews from server
  const fetchData = async () => {
    try {
      const prodRes = await fetch("/api/products");
      const revRes = await fetch("/api/reviews");
      if (prodRes.ok) setProducts(await prodRes.json());
      if (revRes.ok) setReviews(await revRes.json());
    } catch (err) {
      console.error("Error fetching initial client catalog:", err);
    }
  };

  // Load customer profile and wishlist from server
  const fetchUserProfileAndWishlist = async (authToken: string) => {
    try {
      const profRes = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${authToken}` },
      });
      if (profRes.ok) {
        const data = await profRes.json();
        setUser(data.user);
        localStorage.setItem("maheshwari_user", JSON.stringify(data.user));
      } else if (profRes.status === 401) {
        handleLogout();
        return;
      }

      const wishRes = await fetch("/api/wishlist", {
        headers: { "Authorization": `Bearer ${authToken}` },
      });
      if (wishRes.ok) {
        setWishlistProducts(await wishRes.json());
      }
    } catch (err) {
      console.error("Error fetching user profile/wishlist:", err);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("maheshwari_token");
    const savedUser = localStorage.getItem("maheshwari_user");
    const savedAdminToken = localStorage.getItem("maheshwari_adminToken");
    const savedAdminUser = localStorage.getItem("maheshwari_adminUser");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    if (savedAdminToken && savedAdminUser) {
      setAdminToken(savedAdminToken);
      setAdminUser(JSON.parse(savedAdminUser));
    }
    
    fetchData();
  }, []);

  useEffect(() => {
    if (token) {
      fetchUserProfileAndWishlist(token);
    } else {
      setWishlistProducts([]);
    }
  }, [token]);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("maheshwari_cart", JSON.stringify(cart));
  }, [cart]);

  // Auth Logout Handlers
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("maheshwari_token");
    localStorage.removeItem("maheshwari_user");
    setWishlistProducts([]);
    if (currentTab === "account") {
      setCurrentTab("home");
    }
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    setAdminToken(null);
    localStorage.removeItem("maheshwari_adminToken");
    localStorage.removeItem("maheshwari_adminUser");
    if (currentTab === "admin-dashboard" || currentTab === "admin-login") {
      setCurrentTab("home");
    }
  };

  // Toggle Item in Wishlist
  const handleWishlistToggle = async (product: Product) => {
    if (!token) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      const res = await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: Number(product.id) }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.wishlisted) {
          setWishlistProducts((prev) => [...prev, product]);
        } else {
          setWishlistProducts((prev) => prev.filter((p) => p.id !== product.id));
        }
      }
    } catch (err) {
      console.error("Error toggling wishlist item:", err);
    }
  };

  // Sync data again if user makes edits inside admin panel (using admin JWT token)
  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      const headers: any = { "Content-Type": "application/json" };
      if (adminToken) {
        headers["Authorization"] = `Bearer ${adminToken}`;
      }
      const res = await fetch(`/api/products/${updatedProduct.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(updatedProduct),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProduct = async (newProduct: Omit<Product, "id" | "rating" | "reviewsCount">) => {
    try {
      const headers: any = { "Content-Type": "application/json" };
      if (adminToken) {
        headers["Authorization"] = `Bearer ${adminToken}`;
      }
      const res = await fetch("/api/products", {
        method: "POST",
        headers,
        body: JSON.stringify(newProduct),
      });
      if (res.ok) {
        const added = await res.json();
        setProducts((prev) => [...prev, added]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const headers: any = {};
      if (adminToken) {
        headers["Authorization"] = `Bearer ${adminToken}`;
      }
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add customized gift box directly from builder
  const handleAddCustomBoxToCart = (boxDetails: {
    name: string;
    description: string;
    price: number;
    image: string;
    quantity: number;
  }) => {
    // Generate mock custom product to fit Cart structure
    const customProduct: Product = {
      id: "box_" + Math.random().toString(36).substr(2, 9),
      name: boxDetails.name,
      category: "Gift Boxes",
      description: boxDetails.description,
      pricePerUnit: boxDetails.price,
      unit: "1 Box",
      price: boxDetails.price,
      image: boxDetails.image,
      ingredients: ["Assorted premium sweets"],
      shelfLife: "15 Days",
      isVeg: true,
      rating: 5.0,
      reviewsCount: 1,
    };

    setCart((prev) => [
      ...prev,
      {
        product: customProduct,
        quantity: boxDetails.quantity,
        selectedUnit: "1 Box",
        price: boxDetails.price,
      },
    ]);
  };

  // Standard Add to Cart
  const handleAddToCart = (product: Product, quantity: number, unit: string) => {
    // Check if unit price scale differs from base product price
    let finalUnitPrice = product.price;
    const baseMatch = product.unit.match(/(\d+)\s*(g|kg)/i);
    const selectedMatch = unit.match(/(\d+)\s*(g|kg)/i);
    
    if (baseMatch && selectedMatch) {
      const baseVal = parseFloat(baseMatch[1]) * (baseMatch[2].toLowerCase() === "kg" ? 1000 : 1);
      const selVal = parseFloat(selectedMatch[1]) * (selectedMatch[2].toLowerCase() === "kg" ? 1000 : 1);
      finalUnitPrice = Math.round((product.price / baseVal) * selVal);
    }

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedUnit === unit
      );
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity, selectedUnit: unit, price: finalUnitPrice }];
    });
  };

  const handleUpdateCartQty = (idx: number, delta: number) => {
    setCart((prev) => {
      const updated = [...prev];
      updated[idx].quantity = Math.max(1, updated[idx].quantity + delta);
      return updated;
    });
  };

  const handleRemoveCartItem = (idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  // Cart calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gstTax = Math.round(cartSubtotal * 0.05); // 5% standard sweet tax
  const deliveryCharge = deliveryMethod === "delivery" && cartSubtotal < 300 ? 30 : 0;
  const grandTotal = cartSubtotal - appliedDiscount + gstTax + deliveryCharge + (isGiftWrap ? 30 : 0);

  // Apply Coupon
  const handleApplyCoupon = () => {
    setCouponError("");
    setCouponSuccess("");
    const code = couponCode.trim().toUpperCase();
    if (code === "FESTIVE10") {
      const discount = Math.round(cartSubtotal * 0.1);
      setAppliedDiscount(discount);
      setCouponSuccess(`Coupon applied successfully! 10% discount (₹${discount}) has been deducted.`);
    } else if (code === "WELCOME15") {
      const discount = Math.round(cartSubtotal * 0.15);
      setAppliedDiscount(discount);
      setCouponSuccess(`Welcome Coupon applied! 15% discount (₹${discount}) deducted.`);
    } else {
      setCouponError("Invalid coupon code. Try FESTIVE10 or WELCOME15!");
      setAppliedDiscount(0);
    }
  };

  // Checkout process trigger
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Your shopping cart is empty!");
      return;
    }
    if (!customerName || !customerPhone) {
      alert("Please fill in your Name and Phone Number to complete the order!");
      return;
    }

    if (paymentMethod === "online") {
      setShowPaymentGateway(true);
    } else {
      completeOrderPlacement();
    }
  };

  // Simulated gateway confirmation
  const handleFakePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentLoading(true);
    setTimeout(() => {
      setPaymentLoading(false);
      setShowPaymentGateway(false);
      completeOrderPlacement();
    }, 2000); // 2 second simulated payment confirmation delay
  };

  // POST completed order to Express backend server
  const completeOrderPlacement = async () => {
    try {
      const payload = {
        items: cart,
        customerName,
        customerEmail,
        customerPhone,
        deliveryMethod,
        address: deliveryMethod === "delivery" ? {
          street: streetAddress,
          city: "Satna",
          pincode,
          landmark,
        } : undefined,
        paymentMethod,
        couponCode: appliedDiscount > 0 ? couponCode : undefined,
        subtotal: cartSubtotal,
        discount: appliedDiscount,
        tax: gstTax,
        deliveryFee: deliveryCharge,
        total: grandTotal,
      };

      const headers: any = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Order placement failed");

      const data = await res.json();
      setLastPlacedOrder(data);
      setTrackedOrder(data); // set current active tracker
      setShowInvoiceModal(true); // open royal invoice immediately

      // Reset Cart and Form State
      setCart([]);
      setIsCartOpen(false);
      setIsGiftWrap(false);
      setCouponCode("");
      setAppliedDiscount(0);
      setStreetAddress("");
      setLandmark("");
    } catch (err) {
      console.error(err);
      alert("Error placing order. Please try again.");
    }
  };

  // Submit Feedback / Review Form
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName || !revComment) {
      alert("Please enter your name and comment!");
      return;
    }

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: revName,
          location: revLoc || "Satna",
          rating: revRating,
          comment: revComment,
        }),
      });

      if (res.ok) {
        const added = await res.json();
        setReviews((prev) => [added, ...prev]);
        setRevName("");
        setRevLoc("");
        setRevComment("");
        setRevSuccess(true);
        setTimeout(() => setRevSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Simulated Voice Search Action
  const startSimulatedVoiceSearch = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      // random selection of popular sweets to simulate voice typing
      const voicesMock = ["Kaju Katli", "Rasmalai", "Samosa", "Laddu", "Namkeen"];
      const randomSweet = voicesMock[Math.floor(Math.random() * voicesMock.length)];
      setSearchTerm(randomSweet);
    }, 2000);
  };

  // Sorting and Filtering logic
  const filteredProducts = products
    .filter((p) => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ingredients.some((i) => i.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price_low") return a.price - b.price;
      if (sortBy === "price_high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return b.reviewsCount - a.reviewsCount; // Default popularity
    });

  const categoriesList = [
    "All", "Traditional Sweets", "Dry Fruit Sweets", "Milk Sweets", 
    "Bengali Sweets", "Namkeen", "Breakfast", "Snacks", "Chaat", "Gift Boxes"
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between selection:bg-maroon-900 selection:text-white">
      
      {/* HEADER NAVIGATION */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        user={user}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        adminUser={adminUser}
        onAdminLoginClick={() => setCurrentTab("admin-login")}
        onAdminLogout={handleAdminLogout}
      />

      {/* CORE PAGES ROUTER */}
      <main className="flex-1">
        
        {/* VIEW: ADMIN PANEL */}
        {currentTab === "admin-dashboard" ? (
          adminUser ? (
            <AdminPanel
              products={products}
              onUpdateProduct={handleUpdateProduct}
              onAddProduct={handleAddProduct}
              onDeleteProduct={handleDeleteProduct}
              adminToken={adminToken}
            />
          ) : (
            <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6 animate-in fade-in duration-200">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-serif font-black text-maroon-900">Administrative Access Denied</h2>
              <p className="text-stone-500 text-xs max-w-xs mx-auto leading-relaxed">
                You do not have active staff credentials loaded. Please authenticate via the administrative sign-in gateway.
              </p>
              <button
                onClick={() => setCurrentTab("admin-login")}
                className="px-6 py-2.5 bg-maroon-900 hover:bg-maroon-800 text-gold-100 font-extrabold rounded-xl transition-all text-xs uppercase tracking-wider shadow"
              >
                Go to Admin Sign-In
              </button>
            </div>
          )
        ) : (
          <>
            {/* VIEW: HOME & MENU SECTION */}
            {currentTab === "home" && (
              <div className="space-y-16 pb-16">
                
                {/* 1. Hero Gilded Banner Section */}
                <section className="relative bg-gradient-to-br from-maroon-900 to-maroon-800 text-white overflow-hidden py-16 sm:py-24 border-b-8 border-gold-500">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-maroon-800/45 via-black/40 to-black/60 z-0"></div>
                  
                  {/* Decorative mandalas / vectors in background */}
                  <div className="absolute top-10 right-10 text-gold-500/10 font-serif text-9xl pointer-events-none select-none">
                    M
                  </div>
                  <div className="absolute bottom-10 left-10 text-gold-500/10 font-serif text-9xl pointer-events-none select-none">
                    ॐ
                  </div>

                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    
                    {/* Left Column Text details */}
                    <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                      <span className="inline-flex items-center gap-1.5 bg-gold-500/20 text-gold-300 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-gold-500/30">
                        <Sparkles size={12} className="animate-pulse text-gold-400" />
                        Est. 2001 in Satna, MP
                      </span>
                      
                      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-none text-white">
                        Bringing Happiness Through <br />
                        <span className="text-gold-400 font-serif italic font-normal">Every Sweet</span> Since Generations
                      </h2>
                      
                      <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
                        Experience the royal, authentic taste of Satna's most trusted premium sweet brand. Crafted with pure cow ghee, organic ingredients, and high standards of hygienic culinary craftsmanship.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                        <a
                          href="#menu-section"
                          className="px-8 py-3.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-maroon-950 font-extrabold text-xs tracking-wider uppercase transition-colors shadow-md hover:shadow-lg text-center"
                        >
                          Explore Live Menu
                        </a>
                        <button
                          onClick={() => setCurrentTab("box-builder")}
                          className="px-8 py-3.5 rounded-xl bg-transparent border-2 border-gold-500 hover:bg-gold-500 hover:text-maroon-950 text-gold-400 font-extrabold text-xs tracking-wider uppercase transition-all text-center flex items-center justify-center gap-1.5"
                        >
                          <Gift size={14} /> Custom Gift Box
                        </button>
                      </div>
                    </div>

                    {/* Right Column visual display card */}
                    <div className="lg:col-span-5 relative flex justify-center">
                      <div className="w-full max-w-sm rounded-3xl overflow-hidden border-4 border-gold-500 shadow-2xl relative bg-maroon-950/40 p-1">
                        <img
                          src="https://images.unsplash.com/photo-1505575967455-40e256f7377c?auto=format&fit=crop&q=80&w=500"
                          alt="Premium Maheshwari Gifting"
                          className="w-full h-80 object-cover rounded-2xl"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-x-4 bottom-4 bg-black/75 backdrop-blur-md p-4 rounded-xl border border-gold-400/30 text-center space-y-1">
                          <p className="text-[10px] text-gold-400 font-bold uppercase tracking-wider">🌟 Fresh Sweet counters 🌟</p>
                          <p className="text-xs font-serif font-bold text-white">"Satna Special Poha Jalebi breakfast served fresh daily!"</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </section>

                {/* 2. Trust Numbers Panel */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y lg:divide-y-0 lg:divide-x divide-stone-150">
                    <div className="space-y-1.5 pt-4 lg:pt-0">
                      <span className="text-3xl sm:text-4xl font-serif font-black text-maroon-900 block font-mono">25+</span>
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-widest block">Years of Trust</span>
                    </div>
                    <div className="space-y-1.5 pt-4 lg:pt-0">
                      <span className="text-3xl sm:text-4xl font-serif font-black text-maroon-900 block font-mono">100+</span>
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-widest block">Authentic Products</span>
                    </div>
                    <div className="space-y-1.5 pt-4 lg:pt-0">
                      <span className="text-3xl sm:text-4xl font-serif font-black text-maroon-900 block font-mono">10K+</span>
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-widest block">Happy Families</span>
                    </div>
                    <div className="space-y-1.5 pt-4 lg:pt-0">
                      <span className="text-3xl sm:text-4xl font-serif font-black text-maroon-900 block font-mono">365</span>
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-widest block">Days Fresh Sweets</span>
                    </div>
                  </div>
                </section>

                {/* 3. Real-Time Order Tracking Block */}
                {trackedOrder && (
                  <section className="max-w-3xl mx-auto px-4 sm:px-6">
                    <div className="bg-gradient-to-br from-[#FAF5EE] to-[#FFF] rounded-3xl border border-gold-300/60 shadow-xl p-5 sm:p-6 space-y-4 relative">
                      
                      {/* Close Tracker */}
                      <button
                        onClick={() => setTrackedOrder(null)}
                        className="absolute top-4 right-4 p-1 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700"
                      >
                        <X size={15} />
                      </button>

                      <div className="flex justify-between items-center border-b border-gold-200/50 pb-3">
                        <div>
                          <span className="text-[10px] text-stone-400 font-bold uppercase block">Live Order Tracking</span>
                          <h4 className="font-serif font-bold text-maroon-950 text-sm">
                            Order ID: <strong className="font-mono font-black">{trackedOrder.id}</strong>
                          </h4>
                        </div>
                        <button
                          onClick={() => setShowInvoiceModal(true)}
                          className="text-xs text-maroon-900 hover:underline font-bold flex items-center gap-1"
                        >
                          <Eye size={12} /> View Invoice Receipt
                        </button>
                      </div>

                      {/* Horizontal progress dots */}
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px] sm:text-xs">
                        {[
                          { id: "received", label: "Order Received", bg: "bg-green-600", border: "border-green-600", text: "text-green-700 font-bold" },
                          { id: "preparing", label: "Kitchen Preparing", bg: "bg-amber-500", border: "border-amber-500", text: "text-amber-700 font-bold" },
                          { id: "out_for_delivery", label: trackedOrder.deliveryMethod === "delivery" ? "Out for Delivery" : "Ready for Pickup", bg: "bg-sky-500", border: "border-sky-500", text: "text-sky-700 font-bold" },
                          { id: "completed", label: "Completed", bg: "bg-indigo-600", border: "border-indigo-600", text: "text-indigo-700 font-bold" },
                        ].map((step, idx) => {
                          const statuses = ["received", "preparing", "out_for_delivery", "completed"];
                          const currentIdx = statuses.indexOf(trackedOrder.orderStatus);
                          const stepIdx = statuses.indexOf(step.id);
                          const isActive = stepIdx <= currentIdx;

                          return (
                            <div key={step.id} className="space-y-2 flex flex-col items-center">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 font-bold font-mono text-xs ${
                                isActive ? `${step.bg} text-white ${step.border}` : "bg-stone-100 border-stone-300 text-stone-400"
                              }`}>
                                {idx + 1}
                              </div>
                              <span className={`text-[10px] leading-tight ${isActive ? step.text : "text-stone-400 font-medium"}`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="text-center text-[11px] text-stone-500 italic pt-2">
                        *Progresses automatically as our kitchen crafts and packs your fresh delicacies!
                      </div>
                    </div>
                  </section>
                )}

                {/* 4. Live Sweet Counter Display */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="bg-[#FAF6EE] rounded-3xl border border-gold-300 p-5 sm:p-6 flex flex-col md:flex-row justify-between items-center gap-5">
                    <div className="flex gap-4 items-start md:items-center">
                      <div className="p-3 bg-gold-100 text-gold-600 rounded-2xl border border-gold-300">
                        <Clock size={24} className="animate-spin" />
                      </div>
                      <div>
                        <h3 className="font-serif font-black text-maroon-900 text-base flex items-center gap-1.5">
                          ⭐ Live Fresh Counter Highlight ⭐
                        </h3>
                        <p className="text-stone-500 text-xs max-w-xl">
                          Authentic sweets made fresh right now! Look for the <strong className="text-amber-700">"Fresh Today"</strong> badge in our catalog for sweets cooked in pure ghee and delivered straight out of our station road kitchen.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCategory("All");
                        setSortBy("rating");
                        document.getElementById("menu-section")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-5 py-2.5 bg-maroon-900 text-gold-200 hover:text-white rounded-xl text-xs font-bold shrink-0 shadow-sm"
                    >
                      Browse Hot Favorites
                    </button>
                  </div>
                </section>

                {/* 5. Menu Section (Search, Categories & Grid) */}
                <section id="menu-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 Scroll-mt-20">
                  
                  {/* Category Section Header */}
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 border-b border-stone-200 pb-5">
                    <div className="space-y-1.5">
                      <span className="text-xs font-black uppercase tracking-widest text-gold-600">Fresh Daily Selection</span>
                      <h3 className="text-2xl sm:text-3xl font-serif font-black text-maroon-950">
                        Browse Our Premium Mithai Menu
                      </h3>
                      <p className="text-stone-400 text-xs sm:text-sm">Explore traditional ghee laddoos, milk sweets, kaju diamonds, and spicy namkeens of Satna.</p>
                    </div>

                    {/* Integrated Search & Sort panel */}
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
                      
                      {/* Search Input */}
                      <div className="relative flex-1 sm:w-64">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search sweets, ingredients..."
                          className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-8 py-2 text-xs text-stone-800 focus:border-maroon-500 focus:outline-none shadow-sm"
                        />
                        <Search size={14} className="text-stone-400 absolute left-3 top-3" />
                        
                        {/* Voice Search Mock Button */}
                        <button
                          onClick={startSimulatedVoiceSearch}
                          className={`absolute right-2.5 top-2 p-1 rounded-full ${
                            isListening ? "bg-red-500 text-white animate-ping" : "text-stone-400 hover:text-maroon-900"
                          }`}
                          title="Simulate Voice Search"
                        >
                          <Mic size={14} />
                        </button>
                      </div>

                      {/* Sorting selector */}
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700 focus:outline-none shadow-sm"
                      >
                        <option value="popular">Popularity (Bestsellers)</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="rating">Top Rated</option>
                      </select>
                    </div>
                  </div>

                  {/* Horizontal Categories Tab List */}
                  <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin no-scrollbar">
                    {categoriesList.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4.5 py-2 rounded-full text-xs font-bold cursor-pointer shrink-0 border transition-all ${
                          selectedCategory === cat
                            ? "bg-maroon-900 border-maroon-850 text-gold-100 shadow-md"
                            : "bg-white border-stone-200 text-stone-600 hover:border-stone-300"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Visualizer Voice Wave Listening Mock */}
                  {isListening && (
                    <div className="p-4 bg-maroon-900 text-gold-100 rounded-2xl flex items-center justify-between animate-pulse max-w-sm mx-auto shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <span className="w-1 h-3.5 bg-gold-400 rounded-full animate-bounce"></span>
                          <span className="w-1 h-3.5 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></span>
                          <span className="w-1 h-3.5 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                        </div>
                        <span className="text-xs font-bold font-sans">Listening to your sweet request...</span>
                      </div>
                      <span className="text-[10px] text-stone-300 italic font-medium">Say "Kaju Katli"</span>
                    </div>
                  )}

                  {/* PRODUCTS GRID */}
                  {filteredProducts.length === 0 ? (
                    <div className="p-16 text-center text-stone-400 text-xs">
                      No matching delicious sweets found. Try searching for something else, like "Kaju" or "Jalebi".
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredProducts.map((prod) => (
                        <ProductCard
                          key={prod.id}
                          product={prod}
                          onAddToCart={handleAddToCart}
                          isWishlisted={wishlistProducts.some((p) => String(p.id) === String(prod.id))}
                          onWishlistToggle={handleWishlistToggle}
                        />
                      ))}
                    </div>
                  )}

                </section>

                {/* 6. Testimonial section */}
                <section className="bg-stone-50 border-y border-stone-200 py-16">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    
                    <div className="text-center max-w-xl mx-auto space-y-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-gold-600">Pure Love from Customers</span>
                      <h3 className="text-2xl sm:text-3xl font-serif font-black text-maroon-950">
                        Satna Families Share Their Experiences
                      </h3>
                      <p className="text-stone-400 text-xs sm:text-sm">Real reviews from our beloved Satna families, event organizers, and customers.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="bg-white rounded-2xl border border-stone-150 p-5 shadow-sm space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-sm text-stone-900 leading-tight">{rev.customerName}</h4>
                              <span className="text-[10px] text-stone-400 font-medium">{rev.location}</span>
                            </div>
                            <div className="flex text-amber-500">
                              {Array.from({ length: rev.rating }).map((_, i) => (
                                <Star key={i} size={11} fill="currentColor" />
                              ))}
                            </div>
                          </div>
                          
                          <p className="text-xs text-stone-600 leading-relaxed font-serif italic">
                            "{rev.comment}"
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Submit Review Form */}
                    <div className="max-w-xl mx-auto bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-4">
                      <h4 className="font-serif font-black text-sm text-maroon-950 border-b border-stone-150 pb-2.5 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-gold-500" />
                        Share Your Maheshwari Sweets Experience!
                      </h4>

                      <form onSubmit={handleReviewSubmit} className="space-y-3.5">
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Your Name *"
                            value={revName}
                            onChange={(e) => setRevName(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-1.5 text-xs text-stone-800 focus:border-maroon-500 focus:outline-none"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Location (e.g. Civil Lines)"
                            value={revLoc}
                            onChange={(e) => setRevLoc(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-1.5 text-xs text-stone-800 focus:border-maroon-500 focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          <span>Rating:</span>
                          <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => setRevRating(num)}
                                className={`p-1 rounded text-sm font-bold ${
                                  revRating >= num ? "text-amber-500" : "text-stone-300"
                                }`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>

                        <textarea
                          placeholder="Tell us what you liked (e.g. Poha Jalebi breakfast, Kaju Katli freshness, premium boxes...)"
                          value={revComment}
                          onChange={(e) => setRevComment(e.target.value)}
                          rows={2.5}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-800 focus:border-maroon-500 focus:outline-none"
                          required
                        />

                        <button
                          type="submit"
                          className="w-full py-2 bg-maroon-900 hover:bg-maroon-850 text-gold-100 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                        >
                          Submit Experience Review
                        </button>
                      </form>

                      {revSuccess && (
                        <div className="p-2 bg-green-50 rounded-xl text-green-700 text-[11px] font-bold border border-green-200">
                          Thank you! Your wonderful review was saved and is now live on our testimonial list.
                        </div>
                      )}
                    </div>

                  </div>
                </section>

              </div>
            )}

            {/* VIEW: CUSTOM GIFT BOX BUILDER */}
            {currentTab === "box-builder" && (
              <GiftBoxBuilder onAddBoxToCart={handleAddCustomBoxToCart} />
            )}

            {/* VIEW: CATERING ESTIMATOR */}
            {currentTab === "catering" && (
              <CateringEstimator />
            )}

            {/* VIEW: ADMIN LOGIN */}
            {currentTab === "admin-login" && (
              <div className="max-w-md mx-auto px-4 sm:px-6 py-12 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-maroon-950 to-maroon-900 text-center p-6 text-white">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400 block mb-1 font-extrabold">Staff Credentials Checked</span>
                    <h2 className="font-serif font-black text-xl tracking-tight">Administrative Staff Sign-In</h2>
                    <p className="text-xs text-stone-300 mt-1">Access restricted to authorized supervisors only.</p>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const identifier = (form.elements.namedItem("identifier") as HTMLInputElement).value;
                      const password = (form.elements.namedItem("password") as HTMLInputElement).value;

                      setAuthError("");
                      setAuthLoading(true);
                      try {
                        const res = await fetch("/api/admin/login", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ emailOrPhone: identifier, password }),
                        });
                        const data = await res.json();
                        if (res.ok) {
                          setAdminToken(data.token);
                          setAdminUser(data.user);
                          localStorage.setItem("maheshwari_adminToken", data.token);
                          localStorage.setItem("maheshwari_adminUser", JSON.stringify(data.user));
                          setCurrentTab("admin-dashboard");
                        } else {
                          setAuthError(data.error || "Invalid administrative credentials.");
                        }
                      } catch (err) {
                        setAuthError("Network failure. Please try again.");
                      } finally {
                        setAuthLoading(false);
                      }
                    }}
                    className="p-6 space-y-4 text-xs text-stone-700"
                  >
                    {authError && (
                      <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-center font-bold">
                        ⚠️ {authError}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="font-extrabold text-stone-600 uppercase tracking-wider text-[9px] block">Email or Phone Link</label>
                      <input
                        type="text"
                        name="identifier"
                        placeholder="admin@maheshwarisweets.com"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-800 font-medium focus:border-maroon-500 focus:outline-none"
                        required
                        disabled={authLoading}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-extrabold text-stone-600 uppercase tracking-wider text-[9px] block">Security Password</label>
                      <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-800 font-mono text-sm focus:border-maroon-500 focus:outline-none"
                        required
                        disabled={authLoading}
                      />
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1 text-[11px] text-stone-600 leading-relaxed">
                      <strong className="font-bold text-amber-800 block mb-1">🔑 Staff Login Demonstration Credentials:</strong>
                      <div><strong>Admin ID:</strong> <span className="font-mono bg-white px-1 border rounded">admin@maheshwarisweets.com</span></div>
                      <div><strong>Password:</strong> <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200 font-bold">admin123</span></div>
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-3 bg-maroon-900 hover:bg-maroon-800 text-gold-100 font-black uppercase tracking-wider rounded-xl transition-all shadow-md text-center cursor-pointer disabled:opacity-50"
                    >
                      {authLoading ? "Verifying..." : "Authorize Administrative Session"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* VIEW: CUSTOMER ACCOUNT DASHBOARD */}
            {currentTab === "account" && (
              !user ? (
                <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6 animate-in fade-in duration-200">
                  <div className="w-16 h-16 bg-maroon-50 rounded-full flex items-center justify-center mx-auto text-maroon-900 border border-maroon-100">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-serif font-black text-maroon-900">Royal Club Access Restricted</h2>
                  <p className="text-stone-500 text-xs max-w-xs mx-auto leading-relaxed">
                    Please log in with your mobile number to view your active sweet orders, manage saved addresses, and access your personalized wishlist.
                  </p>
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="px-6 py-2.5 bg-maroon-900 hover:bg-maroon-800 text-gold-100 font-extrabold rounded-xl transition-all text-xs uppercase tracking-wider shadow"
                  >
                    Log In Now
                  </button>
                </div>
              ) : (
                <CustomerAccountDashboard
                  user={user}
                  token={token}
                  wishlistProducts={wishlistProducts}
                  onWishlistToggle={handleWishlistToggle}
                  onAddToCart={handleAddToCart}
                  onLogout={handleLogout}
                  onAddressSaved={async () => {
                    if (token) fetchUserProfileAndWishlist(token);
                  }}
                />
              )
            )}

            {/* VIEW: HERITAGE / STORY */}
            {currentTab === "heritage" && (
              <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12 animate-in fade-in duration-200">
                
                {/* Intro Hero */}
                <div className="text-center space-y-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-gold-600 bg-gold-100/50 px-3 py-1 rounded-full border border-gold-200">Our Heritage Story</span>
                  <h2 className="text-3xl sm:text-4xl font-serif font-black text-maroon-900 tracking-tight">
                    Pure Craftsmanship Since 2001
                  </h2>
                  <p className="text-stone-500 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
                    How a small traditional sweet corner on Station Road grew to become Satna's most trusted premium landmark for authentic delicacies.
                  </p>
                </div>

                <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 space-y-6 shadow-sm leading-relaxed text-xs sm:text-sm text-stone-600">
                  <div className="space-y-4">
                    <h3 className="font-serif font-black text-maroon-950 text-base border-b border-stone-150 pb-2">
                      The Humble Beginnings
                    </h3>
                    <p>
                      In the winter of 2001, Maheshwari Sweets opened its first wooden shutter near Satna's Railway Station road with one central mission: to serve authentic, unadulterated traditional sweets crafted with the absolute best ingredients available in Madhya Pradesh. 
                    </p>
                    <p>
                      Through dedication to taste, pure cow ghee selections, and traditional methods of slow-cooked milk caramels, we quickly became a regular stop for passengers, local merchants, and families celebrating auspicious milestones.
                    </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-stone-100">
                    <h3 className="font-serif font-black text-maroon-950 text-base border-b border-stone-150 pb-2">
                      Our Royal Quality Standards (FSSAI Certified)
                    </h3>
                    <p>
                      Every single piece of Kaju Katli, saffron-soaked Rasmalai, and morning Poha Jalebi is crafted in our state-of-the-art kitchen where hygiene is held absolute. We ensure:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-stone-500">
                      <li>Use of 100% pure premium cow ghee for rich aroma and long shelf life.</li>
                      <li>Strict raw materials grading: only top-tier Goan cashews, organic Kashmiri saffron, and farm-fresh unadulterated milk are utilized.</li>
                      <li>Hygienic standard kitchen workflows with FSSAI regulations.</li>
                      <li>No synthetic chemical preservatives or stabilizers are ever mixed.</li>
                    </ul>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-stone-100">
                    <h3 className="font-serif font-black text-maroon-950 text-base border-b border-stone-150 pb-2">
                      Our Present Vision
                    </h3>
                    <p>
                      Today, as Satna grows, Maheshwari Sweets embraces the future with online ordering and home deliveries, custom gift box hampers for marriages, corporate gatherings, and comprehensive custom catering estimators, while retaining the same secret traditional recipes that defined our very first batch.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* VIEW: CONTACT US */}
            {currentTab === "contact" && (
              <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
                
                {/* Contact text details */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-gold-600">Reach Out Instantly</span>
                    <h2 className="text-3xl font-serif font-black text-maroon-900 tracking-tight">Contact Our Store</h2>
                    <p className="text-stone-500 text-xs">We are always happy to help with custom sweet requests, feedback, or quick deliveries across Satna.</p>
                  </div>

                  <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 shadow-sm text-xs text-stone-700">
                    <div className="flex gap-3 items-start">
                      <MapPin size={16} className="text-gold-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold text-stone-900">Store Address:</strong>
                        <p className="text-stone-500 mt-1">Station Road, Near Railway Station, Satna, MP, 485001</p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <Phone size={16} className="text-gold-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold text-stone-900">Phone Numbers:</strong>
                        <p className="text-stone-500 mt-1">+91 7672 223456</p>
                        <p className="text-stone-500">+91 94251 XXXXX</p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <Clock size={16} className="text-gold-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold text-stone-900">Operational Hours:</strong>
                        <p className="text-stone-500 mt-1">7:00 AM - 10:30 PM (Everyday)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feedback form */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-md space-y-4">
                  <h3 className="font-serif font-black text-maroon-950 text-base border-b border-stone-150 pb-3">
                    Send An Enquiry / Message
                  </h3>
                  
                  <form onSubmit={(e) => { e.preventDefault(); alert("Enquiry submitted successfully! We will get in touch with you shortly."); }} className="space-y-4 text-xs text-stone-600">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold">Full Name *</label>
                        <input type="text" className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none" required />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold">Phone Number *</label>
                        <input type="tel" className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none" required />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold">Email Address</label>
                      <input type="email" className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none" />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold">Subject / Purpose</label>
                      <select className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none">
                        <option>Delivery Inquiry</option>
                        <option>Wedding Gifting Hampers</option>
                        <option>General Feedback</option>
                        <option>Business Franchise</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold">Message Details *</label>
                      <textarea rows={3} className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none" required />
                    </div>

                    <button type="submit" className="w-full py-3 bg-maroon-900 hover:bg-maroon-850 text-gold-100 hover:text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm">
                      Submit Message
                    </button>
                  </form>
                </div>

              </div>
            )}

          </>
        )}

      </main>

      {/* SHOPPING CART DRAWER (RIGHT SIDE SLIDE-OUT PANEL) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl border-l border-gold-200/50 animate-in slide-in-from-right duration-200">
            
            {/* Drawer Header */}
            <div className="bg-maroon-900 text-gold-100 p-4 border-b border-gold-500/30 flex justify-between items-center relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-600 via-gold-200 to-gold-600"></div>
              <h3 className="font-serif font-black text-base text-gold-400 flex items-center gap-2">
                <ShoppingCart size={18} />
                Shopping Bag ({cart.reduce((sum, item) => sum + item.quantity, 0)})
              </h3>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-full hover:bg-maroon-800 text-gold-200/70 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
              {cart.length === 0 ? (
                <div className="text-center text-stone-400 py-16 text-xs space-y-3">
                  <ShoppingCart size={40} className="mx-auto text-stone-300" />
                  <p>Your shopping bag is empty. Explore our sweet catalog to fill it!</p>
                </div>
              ) : (
                <>
                  {cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl border border-stone-150 p-3.5 flex gap-3.5 relative shadow-sm"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0 border border-stone-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0 pr-6 space-y-1">
                        <h4 className="font-bold text-xs text-stone-900 line-clamp-1 leading-tight">{item.product.name}</h4>
                        <p className="text-[10px] text-stone-400 italic font-medium">{item.selectedUnit} pack</p>
                        <p className="text-xs font-bold text-maroon-900 font-mono">₹{item.price} each</p>
                        
                        {/* Adjust Qty */}
                        <div className="flex items-center gap-2 pt-1.5">
                          <button
                            disabled={item.quantity <= 1}
                            onClick={() => handleUpdateCartQty(idx, -1)}
                            className="w-5.5 h-5.5 rounded border border-stone-200 flex items-center justify-center font-bold text-stone-500 hover:bg-stone-50 disabled:opacity-35 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-stone-800 w-5 text-center font-mono">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateCartQty(idx, 1)}
                            className="w-5.5 h-5.5 rounded border border-stone-200 flex items-center justify-center font-bold text-stone-500 hover:bg-stone-50 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      {/* Delete item */}
                      <button
                        onClick={() => handleRemoveCartItem(idx)}
                        className="absolute top-3.5 right-3 text-stone-300 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}

                  {/* Gift Wrap Toggle Option */}
                  <div className="bg-white rounded-xl border border-stone-200 p-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-stone-800 block">⭐ Luxury Gift Wrapping</span>
                      <span className="text-[10px] text-stone-400">Add gold foil custom wrap & custom greeting card (+₹30)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isGiftWrap}
                      onChange={(e) => setIsGiftWrap(e.target.checked)}
                      className="w-4 h-4 text-maroon-900 focus:ring-maroon-900 border-stone-300 rounded"
                    />
                  </div>

                  {/* Coupon Codes Panel */}
                  <div className="bg-white rounded-xl border border-stone-200 p-3 space-y-2">
                    <label className="text-[11px] font-bold text-stone-500 block uppercase tracking-wider">Coupon Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="e.g. FESTIVE10"
                        className="flex-1 bg-stone-50 border border-stone-200 focus:border-maroon-500 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-mono font-bold"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="px-3.5 py-1.5 bg-maroon-900 text-gold-200 hover:text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-[10px] text-red-600 font-bold">{couponError}</p>}
                    {couponSuccess && <p className="text-[10px] text-green-700 font-bold">{couponSuccess}</p>}
                    <p className="text-[9px] text-stone-400 leading-none">
                      *Try coupon codes <strong className="text-maroon-900">FESTIVE10</strong> (10% off) or <strong className="text-maroon-900">WELCOME15</strong> (15% off first order)
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Checkout & Summary Panel Footer */}
            {cart.length > 0 && (
              <div className="bg-white border-t border-stone-200 p-4 space-y-4">
                
                {/* Billing Summary */}
                <div className="text-xs text-stone-600 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Cart Subtotal:</span>
                    <span className="font-mono font-bold text-stone-900">₹{cartSubtotal}</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-green-700 font-semibold">
                      <span>Discount:</span>
                      <span className="font-mono">-₹{appliedDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>GST (5%):</span>
                    <span className="font-mono font-bold text-stone-900">₹{gstTax}</span>
                  </div>
                  {isGiftWrap && (
                    <div className="flex justify-between text-stone-500">
                      <span>Premium Gift Wrap:</span>
                      <span className="font-mono">₹30</span>
                    </div>
                  )}
                  {deliveryMethod === "delivery" && (
                    <div className="flex justify-between text-stone-500">
                      <span>Home Delivery:</span>
                      <span className="font-mono">
                        {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-stone-150 pt-2.5 flex justify-between text-maroon-950 font-serif font-black text-sm">
                    <span>Grand Total:</span>
                    <span className="font-mono text-base">₹{grandTotal}</span>
                  </div>
                </div>

                {/* Checkout Fields Form */}
                <form onSubmit={handleCheckoutSubmit} className="space-y-3.5 border-t border-stone-150 pt-4 text-xs text-stone-600">
                  <h4 className="font-serif font-black text-stone-900 text-xs tracking-wider uppercase">Recipient Delivery details</h4>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-0.5">
                      <input
                        type="text"
                        placeholder="Recipient Name *"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 focus:border-maroon-500 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-semibold"
                        required
                      />
                    </div>
                    <div className="space-y-0.5">
                      <input
                        type="tel"
                        placeholder="Phone Number *"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 focus:border-maroon-500 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-mono font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <input
                      type="email"
                      placeholder="Email (Optional, for invoices)"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 focus:border-maroon-500 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-stone-800"
                    />
                  </div>

                  {/* Delivery / Pickup method choice */}
                  <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-black">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("delivery")}
                      className={`py-1.5 rounded-lg border transition-all cursor-pointer ${
                        deliveryMethod === "delivery"
                          ? "bg-maroon-900 border-maroon-850 text-gold-100"
                          : "bg-white border-stone-200 text-stone-600"
                      }`}
                    >
                      🚀 Satna Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("pickup")}
                      className={`py-1.5 rounded-lg border transition-all cursor-pointer ${
                        deliveryMethod === "pickup"
                          ? "bg-maroon-900 border-maroon-850 text-gold-100"
                          : "bg-white border-stone-200 text-stone-600"
                      }`}
                    >
                      🏪 Store Pickup
                    </button>
                  </div>

                  {/* Street address input if home delivery is selected */}
                  {deliveryMethod === "delivery" && (
                    <div className="space-y-2.5 animate-in slide-in-from-top-2 duration-150">
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={selectedArea}
                          onChange={(e) => setSelectedArea(e.target.value)}
                          className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-xs text-stone-700 focus:outline-none"
                        >
                          {satnaAreas.map((area) => (
                            <option key={area} value={area}>{area}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          placeholder="Pincode"
                          className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-xs text-stone-700 font-mono focus:outline-none"
                          required
                        />
                      </div>
                      
                      <input
                        type="text"
                        placeholder="Street Address, House No, Block *"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 focus:border-maroon-500 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-stone-800"
                        required={deliveryMethod === "delivery"}
                      />

                      <input
                        type="text"
                        placeholder="Landmark (e.g. Near Bus Stand)"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 focus:border-maroon-500 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-stone-800"
                      />
                    </div>
                  )}

                  {/* Payment Method Selector */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Payment Choice</label>
                    <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-black">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("cod")}
                        className={`py-1.5 rounded-lg border transition-all cursor-pointer ${
                          paymentMethod === "cod"
                            ? "bg-maroon-900 border-maroon-850 text-gold-100 shadow-sm"
                            : "bg-white border-stone-200 text-stone-600"
                        }`}
                      >
                        💵 Cash on Delivery
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("online")}
                        className={`py-1.5 rounded-lg border transition-all cursor-pointer ${
                          paymentMethod === "online"
                            ? "bg-maroon-900 border-maroon-850 text-gold-100 shadow-sm"
                            : "bg-white border-stone-200 text-stone-600"
                        }`}
                      >
                        💳 UPI / Online Payment
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-maroon-950 font-black text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Place Sweet Order • ₹{grandTotal}
                  </button>
                </form>

              </div>
            )}
          </div>
        </div>
      )}

      {/* UPI / CREDIT CARD SIMULATED SECURE PAYMENT GATEWAY MODAL */}
      {showPaymentGateway && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleFakePaymentSubmit}
            className="bg-white rounded-3xl max-w-sm w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-xs text-stone-700 flex flex-col"
          >
            {/* Header branding representing safe payment */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 text-center border-b border-indigo-950/20">
              <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-300 block">Simulated Razorpay Secure Checkout</span>
              <h4 className="font-serif font-black text-white text-base">Maheshwari Sweets Pay Gateway</h4>
              <p className="text-[10px] text-stone-200 font-mono mt-1 font-bold">Total Payable: ₹{grandTotal}</p>
            </div>

            <div className="p-5 space-y-4">
              
              {/* Payment Loading Indicator */}
              {paymentLoading ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-indigo-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="font-bold text-indigo-900">Authenticating transaction safely...</p>
                  <p className="text-[10px] text-stone-400">Please do not refresh or close this window.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="font-bold text-stone-500">Demo Credit/Debit Card Number</label>
                    <input
                      type="text"
                      placeholder="4111 2222 3333 4444"
                      value={fakeCardNumber}
                      onChange={(e) => setFakeCardNumber(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 font-mono text-xs focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-stone-500">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={fakeCardExpiry}
                        onChange={(e) => setFakeCardExpiry(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 font-mono text-xs focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-stone-500">CVV</label>
                      <input
                        type="password"
                        placeholder="***"
                        maxLength={3}
                        value={fakeCardCVV}
                        onChange={(e) => setFakeCardCVV(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 font-mono text-xs focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50 text-indigo-800 border border-indigo-100 rounded-xl leading-relaxed text-[10px]">
                    <strong>Demo Mode:</strong> You can enter any mock card details above. No real currency is charged. This gateway represents our production Razorpay payment routing workflow.
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPaymentGateway(false)}
                      className="px-4 py-2 border border-stone-200 rounded-xl text-stone-500 hover:bg-stone-50 font-bold"
                    >
                      Cancel Pay
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-indigo-900 hover:bg-indigo-850 text-white font-black uppercase tracking-wider rounded-xl transition-all shadow-md text-center cursor-pointer"
                    >
                      Confirm Payment
                    </button>
                  </div>
                </>
              )}

            </div>
          </form>
        </div>
      )}

      {/* ROYAL INVOICE POPUP MODAL */}
      {showInvoiceModal && lastPlacedOrder && (
        <InvoiceModal
          order={lastPlacedOrder}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}

      {/* CUSTOMER AUTHENTICATION LOGIN MODAL (MOBILE + OTP FLOW) */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-xs text-stone-700 flex flex-col relative">
            
            {/* Close button */}
            <button
              onClick={() => {
                setIsLoginModalOpen(false);
                setOtpSent(false);
                setLoginPhone("");
                setLoginOtp("");
                setIsNewUser(false);
                setAuthError("");
                setReceivedOtp("");
              }}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Branding Header */}
            <div className="bg-gradient-to-r from-maroon-950 to-maroon-900 text-center p-6 text-white border-b border-stone-100">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400 block mb-1">Maheshwari Sweets satna</span>
              <h4 className="font-serif font-black text-white text-xl tracking-wide">Royal Customer Portal</h4>
              <p className="text-[11px] text-stone-300 mt-1">Experience Satna's most premium confectionery club</p>
            </div>

            <div className="p-6 space-y-4">
              {authError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl font-medium leading-relaxed text-center">
                  ⚠️ {authError}
                </div>
              )}

              {/* Step 1: Send OTP Form */}
              {!otpSent && !isNewUser && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!/^\d{10}$/.test(loginPhone)) {
                      setAuthError("Please enter a valid 10-digit Indian mobile number.");
                      return;
                    }
                    setAuthError("");
                    setAuthLoading(true);
                    try {
                      const res = await fetch("/api/auth/send-otp", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ phone: loginPhone }),
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setOtpSent(true);
                        setReceivedOtp(data.otp); // Preview OTP on-screen so the user doesn't have to check terminal/console logs!
                      } else {
                        setAuthError(data.error || "Failed to send OTP.");
                      }
                    } catch (err) {
                      setAuthError("Network error. Please try again.");
                    } finally {
                      setAuthLoading(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <p className="text-center text-stone-500 text-[11px] leading-relaxed">
                    Enter your mobile number to receive a secure, simulated 6-digit OTP code to instantly log in or register.
                  </p>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-stone-600 uppercase tracking-wider text-[9px] block">Mobile Number (India)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 font-bold text-stone-400 font-mono text-xs">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="9999999999"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-12 pr-4 py-2.5 text-stone-800 font-mono text-sm focus:border-maroon-500 focus:outline-none font-bold"
                        required
                        disabled={authLoading}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-maroon-900 hover:bg-maroon-850 text-gold-100 font-black uppercase tracking-wider rounded-xl transition-all shadow-md text-center cursor-pointer disabled:opacity-50"
                  >
                    {authLoading ? "Sending OTP..." : "Get Royal OTP Code"}
                  </button>
                </form>
              )}

              {/* Step 2: Verify OTP Form */}
              {otpSent && !isNewUser && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!/^\d{6}$/.test(loginOtp)) {
                      setAuthError("Please enter a valid 6-digit OTP code.");
                      return;
                    }
                    setAuthError("");
                    setAuthLoading(true);
                    try {
                      const res = await fetch("/api/auth/verify-otp", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ phone: loginPhone, otp: loginOtp }),
                      });
                      const data = await res.json();
                      if (res.ok) {
                        if (data.isNewUser) {
                          // Is new customer, slide to Registration view
                          setIsNewUser(true);
                        } else {
                          // Already registered, logged in directly!
                          setToken(data.accessToken);
                          setUser(data.user);
                          localStorage.setItem("maheshwari_token", data.accessToken);
                          localStorage.setItem("maheshwari_user", JSON.stringify(data.user));
                          setIsLoginModalOpen(false);
                          setOtpSent(false);
                          setLoginPhone("");
                          setLoginOtp("");
                        }
                      } else {
                        setAuthError(data.error || "Incorrect OTP code. Please try again.");
                      }
                    } catch (err) {
                      setAuthError("Verification failed. Please retry.");
                    } finally {
                      setAuthLoading(false);
                    }
                  }}
                  className="space-y-4"
                >
                  {receivedOtp && (
                    <div className="p-3 bg-gold-50 text-maroon-900 border border-gold-200 rounded-xl leading-relaxed text-[11px] font-bold text-center animate-pulse">
                      ✨ [SMS Simulator] Your secure 6-digit verification code is: <span className="font-mono text-sm underline">{receivedOtp}</span>
                    </div>
                  )}

                  <p className="text-stone-500 text-[11px] leading-relaxed text-center">
                    Enter the code sent to <span className="font-bold font-mono text-stone-700">+91 {loginPhone}</span> below to confirm your session.
                  </p>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-stone-600 uppercase tracking-wider text-[9px] block text-center">Verification Code (6-Digits)</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="******"
                      value={loginOtp}
                      onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-center text-stone-800 font-mono text-lg tracking-widest focus:border-maroon-500 focus:outline-none font-bold"
                      required
                      disabled={authLoading}
                    />
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setLoginOtp("");
                        setAuthError("");
                      }}
                      className="px-4 py-3 border border-stone-200 rounded-xl text-stone-500 hover:bg-stone-50 font-bold"
                      disabled={authLoading}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="flex-1 py-3 bg-maroon-900 hover:bg-maroon-850 text-gold-100 font-black uppercase tracking-wider rounded-xl transition-all shadow-md text-center cursor-pointer disabled:opacity-50"
                    >
                      {authLoading ? "Verifying..." : "Verify & Access"}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Registration for New Users */}
              {isNewUser && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newUserName.trim()) {
                      setAuthError("Name is required to create a new royal account.");
                      return;
                    }
                    setAuthError("");
                    setAuthLoading(true);
                    try {
                      const res = await fetch("/api/auth/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          phone: loginPhone,
                          name: newUserName,
                          email: newUserEmail || `${loginPhone}@customer.com`,
                        }),
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setToken(data.accessToken);
                        setUser(data.user);
                        localStorage.setItem("maheshwari_token", data.accessToken);
                        localStorage.setItem("maheshwari_user", JSON.stringify(data.user));
                        setIsLoginModalOpen(false);
                        setOtpSent(false);
                        setLoginPhone("");
                        setLoginOtp("");
                        setIsNewUser(false);
                        setNewUserName("");
                        setNewUserEmail("");
                      } else {
                        setAuthError(data.error || "Registration failed.");
                      }
                    } catch (err) {
                      setAuthError("Registration failed. Please try again.");
                    } finally {
                      setAuthLoading(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <p className="text-center text-stone-500 text-[11px] leading-relaxed">
                    Welcome to Maheshwari Sweets! Since this is your first visit, let us know your name so we can personalize your experience.
                  </p>

                  <div className="space-y-1">
                    <label className="font-extrabold text-stone-600 uppercase tracking-wider text-[9px] block">Your Full Name *</label>
                    <input
                      type="text"
                      placeholder="Ram Maheshwari"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-800 text-xs focus:border-maroon-500 focus:outline-none font-semibold"
                      required
                      disabled={authLoading}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-stone-600 uppercase tracking-wider text-[9px] block">Email Address (Optional)</label>
                    <input
                      type="email"
                      placeholder="ram@example.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-800 text-xs focus:border-maroon-500 focus:outline-none"
                      disabled={authLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-maroon-900 hover:bg-maroon-850 text-gold-100 font-black uppercase tracking-wider rounded-xl transition-all shadow-md text-center cursor-pointer disabled:opacity-50"
                  >
                    {authLoading ? "Creating Account..." : "Create Royal Account"}
                  </button>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

      {/* FLOATING GEMINI FAQ ASSISTANT */}
      <Chatbot />

      {/* FOOTER */}
      <Footer setCurrentTab={setCurrentTab} />

    </div>
  );
}
