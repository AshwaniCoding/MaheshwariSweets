import React, { useState, useEffect } from "react";
import { 
  DollarSign, ShoppingBag, PhoneCall, Star, Trash2, Edit, Check, CheckSquare, 
  RefreshCw, Layers, Users, ShieldAlert, Ban, Unlock, Ticket, Plus, Percent 
} from "lucide-react";
import { Product, Order, CateringInquiry, Review } from "../types.ts";

interface Coupon {
  id: number;
  code: string;
  type: "percentage" | "flat";
  value: number;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
}

interface CustomerUser {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
}

interface AdminPanelProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Omit<Product, "id" | "rating" | "reviewsCount">) => void;
  onDeleteProduct: (id: string) => void;
  adminToken: string | null;
}

export default function AdminPanel({
  products,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  adminToken,
}: AdminPanelProps) {
  // Navigation inside Admin Panel
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "catering" | "products" | "reviews" | "customers" | "coupons">("dashboard");

  // Server state data
  const [orders, setOrders] = useState<Order[]>([]);
  const [catering, setCatering] = useState<CateringInquiry[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // New product form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Traditional Sweets");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdPrice, setNewProdPrice] = useState(150);
  const [newProdUnit, setNewProdUnit] = useState("250g");
  const [newProdImage, setNewProdImage] = useState("");
  const [newProdIngredients, setNewProdIngredients] = useState("");
  const [newProdShelfLife, setNewProdShelfLife] = useState("10 Days");
  const [newProdIsVeg, setNewProdIsVeg] = useState(true);

  // New coupon form state
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponType, setNewCouponType] = useState<"percentage" | "flat">("percentage");
  const [newCouponValue, setNewCouponValue] = useState(10);
  const [newCouponExpiry, setNewCouponExpiry] = useState("2026-12-31");
  const [newCouponLimit, setNewCouponLimit] = useState(100);

  // Helper headers for JWT auth
  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${adminToken}`,
  });

  // Fetch admin-level information
  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const ordRes = await fetch("/api/admin/orders", { headers: getHeaders() });
      const catRes = await fetch("/api/admin/catering", { headers: getHeaders() });
      const revRes = await fetch("/api/admin/reviews", { headers: getHeaders() });
      const custRes = await fetch("/api/admin/customers", { headers: getHeaders() });
      const coupRes = await fetch("/api/coupons", { headers: getHeaders() });

      if (ordRes.ok) setOrders(await ordRes.json());
      if (catRes.ok) setCatering(await catRes.json());
      if (revRes.ok) setAllReviews(await revRes.json());
      if (custRes.ok) setCustomers(await custRes.json());
      if (coupRes.ok) setCouponsList(await coupRes.json());
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchAdminData();
    }
  }, [activeTab, adminToken]);

  // Handle Order Status updates
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus as any } : o))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Catering Status updates
  const handleUpdateCateringStatus = async (inquiryId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/catering/${inquiryId}/status`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setCatering((prev) =>
          prev.map((c) => (c.id === inquiryId ? { ...c, status: newStatus as any } : c))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Review Approvals
  const handleApproveReview = async (reviewId: string, isApproved: boolean) => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ approved: isApproved }),
      });
      if (res.ok) {
        setAllReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, approved: isApproved } : r))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Customer Block Status
  const handleToggleBlockCustomer = async (uid: string, currentBlockStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/customers/${uid}/block`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ isBlocked: !currentBlockStatus }),
      });
      if (res.ok) {
        setCustomers((prev) =>
          prev.map((c) => (c.uid === uid ? { ...c, isBlocked: !currentBlockStatus } : c))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Adding Coupon
  const handleAddCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponValue) {
      alert("Please fill in coupon details");
      return;
    }
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          code: newCouponCode,
          type: newCouponType,
          value: newCouponValue,
          expiryDate: newCouponExpiry,
          usageLimit: newCouponLimit,
        }),
      });
      if (res.ok) {
        const added = await res.json();
        setCouponsList((prev) => [added, ...prev]);
        setNewCouponCode("");
        setShowCouponForm(false);
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to create coupon");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Deleting Coupon
  const handleDeleteCoupon = async (id: number) => {
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (res.ok) {
        setCouponsList((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Adding Product
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdDesc || !newProdImage) {
      alert("Please fill in all product fields!");
      return;
    }

    onAddProduct({
      name: newProdName,
      category: newProdCategory,
      description: newProdDesc,
      pricePerUnit: newProdPrice,
      unit: newProdUnit,
      price: newProdPrice,
      image: newProdImage,
      ingredients: newProdIngredients ? newProdIngredients.split(",").map(i => i.trim()) : ["Premium ingredients"],
      shelfLife: newProdShelfLife,
      isVeg: newProdIsVeg,
      isFreshlyMadeToday: true,
      isBestSeller: false,
    });

    // Reset Form
    setNewProdName("");
    setNewProdDesc("");
    setNewProdPrice(150);
    setNewProdImage("");
    setNewProdIngredients("");
    setShowAddForm(false);
  };

  // Totals calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.orderStatus !== "completed").length;
  const activeInquiriesCount = catering.filter((c) => c.status === "pending").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Admin Panel Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-maroon-900 text-gold-100 rounded-3xl p-6 shadow-xl relative overflow-hidden border border-gold-400/30">
        <div className="absolute top-0 right-0 p-8 text-gold-600/10 font-serif text-9xl leading-none select-none pointer-events-none">
          M
        </div>
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gold-500">Backoffice Portal (RBAC Authorized)</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-tight flex items-center gap-2">
            Maheshwari Sweets Dashboard
          </h2>
          <p className="text-stone-300 text-xs">
            Manage live orders, view catering leads, edit menu catalog, moderate reviews, configure coupons, and block/unblock customers.
          </p>
        </div>
        <button
          onClick={fetchAdminData}
          className="px-4 py-2 bg-maroon-800 border border-maroon-700 rounded-xl hover:bg-maroon-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center"
        >
          <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} /> Sync Server Data
        </button>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="border-b border-stone-200 flex gap-1 sm:gap-4 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: "dashboard", label: "Overview Stats" },
          { id: "orders", label: `Orders (${orders.length})` },
          { id: "catering", label: `Catering Leads (${catering.length})` },
          { id: "products", label: `Product Catalog (${products.length})` },
          { id: "reviews", label: `Moderation (${allReviews.filter(r => !r.approved).length})` },
          { id: "customers", label: `Customers (${customers.length})` },
          { id: "coupons", label: `Coupons (${couponsList.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold tracking-wide border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === tab.id
                ? "border-maroon-600 text-maroon-900 font-extrabold bg-maroon-50/50 rounded-t-xl"
                : "border-transparent text-stone-500 hover:text-maroon-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ADMIN TABS CONTENT */}

      {/* TAB 1: OVERVIEW STATISTICS (DASHBOARD) */}
      {activeTab === "dashboard" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Metrics Panel Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                <DollarSign size={22} />
              </div>
              <div>
                <span className="text-[11px] text-stone-400 font-bold block uppercase tracking-wider">Total Sales Revenue</span>
                <span className="text-xl font-black text-stone-900 font-mono">₹{totalRevenue}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-rose-50 text-maroon-900 rounded-xl border border-rose-100">
                <ShoppingBag size={22} />
              </div>
              <div>
                <span className="text-[11px] text-stone-400 font-bold block uppercase tracking-wider">Total Orders Placed</span>
                <span className="text-xl font-black text-stone-900 font-mono">{orders.length} Orders</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100">
                <Layers size={22} />
              </div>
              <div>
                <span className="text-[11px] text-stone-400 font-bold block uppercase tracking-wider">Pending Shop Orders</span>
                <span className="text-xl font-black text-stone-900 font-mono">{pendingOrders} Pending</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                <PhoneCall size={22} />
              </div>
              <div>
                <span className="text-[11px] text-stone-400 font-bold block uppercase tracking-wider">Active Catering Leads</span>
                <span className="text-xl font-black text-stone-900 font-mono">{activeInquiriesCount} Leads</span>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Sales Chart */}
            <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-sm space-y-4">
              <div>
                <h4 className="font-serif font-black text-stone-900 text-sm">Weekly Sales Trend (₹)</h4>
                <p className="text-[11px] text-stone-400">Weekly cumulative revenues generated via checkout</p>
              </div>
              
              <div className="h-48 w-full bg-[#FAF8F5] rounded-2xl border border-stone-150 p-3 flex flex-col justify-between">
                <div className="flex-1 w-full relative">
                  <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#800020" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#800020" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="30" x2="500" y2="30" stroke="#eee" strokeWidth="1" />
                    <line x1="0" y1="75" x2="500" y2="75" stroke="#eee" strokeWidth="1" />
                    <line x1="0" y1="120" x2="500" y2="120" stroke="#eee" strokeWidth="1" />
                    
                    <path
                      d="M 0 150 L 0 130 Q 100 90 150 110 T 300 45 T 400 60 L 500 20 L 500 150 Z"
                      fill="url(#chartGrad)"
                    />
                    <path
                      d="M 0 130 Q 100 90 150 110 T 300 45 T 400 60 L 500 20"
                      fill="none"
                      stroke="#800020"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <circle cx="150" cy="110" r="5" fill="#d4af37" stroke="#800020" strokeWidth="1.5" />
                    <circle cx="300" cy="45" r="5" fill="#d4af37" stroke="#800020" strokeWidth="1.5" />
                    <circle cx="500" cy="20" r="5" fill="#d4af37" stroke="#800020" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] text-stone-400 font-mono font-bold border-t border-stone-200 pt-1.5">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun (Today)</span>
                </div>
              </div>
            </div>

            {/* Category Performance Bar Chart */}
            <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-sm space-y-4">
              <div>
                <h4 className="font-serif font-black text-stone-900 text-sm">Product Category Performance</h4>
                <p className="text-[11px] text-stone-400">Order volumes distribution by catalog departments</p>
              </div>

              <div className="h-48 w-full bg-[#FAF8F5] rounded-2xl border border-stone-150 p-4 flex justify-between items-end gap-3 font-mono text-[9px] font-bold text-stone-500">
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-full bg-stone-200 rounded-t-lg h-24 relative overflow-hidden">
                    <div className="absolute bottom-0 w-full bg-maroon-900 h-[85%] rounded-t-lg"></div>
                  </div>
                  <span className="text-center line-clamp-1">Mithai</span>
                </div>

                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-full bg-stone-200 rounded-t-lg h-24 relative overflow-hidden">
                    <div className="absolute bottom-0 w-full bg-gold-500 h-[65%] rounded-t-lg"></div>
                  </div>
                  <span className="text-center line-clamp-1">Namkeen</span>
                </div>

                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-full bg-stone-200 rounded-t-lg h-24 relative overflow-hidden">
                    <div className="absolute bottom-0 w-full bg-maroon-700 h-[45%] rounded-t-lg"></div>
                  </div>
                  <span className="text-center line-clamp-1">Breakfast</span>
                </div>

                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-full bg-stone-200 rounded-t-lg h-24 relative overflow-hidden">
                    <div className="absolute bottom-0 w-full bg-gold-400 h-[30%] rounded-t-lg"></div>
                  </div>
                  <span className="text-center line-clamp-1">Snacks</span>
                </div>

                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-full bg-stone-200 rounded-t-lg h-24 relative overflow-hidden">
                    <div className="absolute bottom-0 w-full bg-maroon-900 h-[70%] rounded-t-lg"></div>
                  </div>
                  <span className="text-center line-clamp-1">Hampers</span>
                </div>
              </div>
            </div>

          </div>

          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 flex gap-2.5 text-xs text-amber-800 leading-relaxed font-medium">
            <CheckSquare size={16} className="shrink-0 mt-0.5" />
            <div>
              <strong className="font-extrabold text-amber-950">Active Mock Progression:</strong> Back-office orders auto-progress from "Received" to "Kitchen Preparing" to "Out for Delivery" to demonstrate the customer's real-time tracking panel functionality. Sync or refresh frequently to inspect updates.
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: SHOP ORDERS MANAGER */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
          <div className="p-5 border-b border-stone-150">
            <h3 className="font-serif font-black text-stone-900 text-base">Active Orders Terminal</h3>
            <p className="text-xs text-stone-400 mt-0.5">Track and edit live sweet orders placed on the website</p>
          </div>

          {orders.length === 0 ? (
            <div className="p-10 text-center text-stone-400 text-xs">
              No orders placed yet. Add sweets to your cart and complete checkout to see them here!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-5">ID & Date</th>
                    <th className="py-3 px-5">Customer Contacts</th>
                    <th className="py-3 px-5">Purchased Sweets</th>
                    <th className="py-3 px-5">Delivery Method</th>
                    <th className="py-3 px-5">Pricing & Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150 text-stone-700">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-stone-50/50">
                      <td className="py-3.5 px-5">
                        <span className="font-bold font-mono text-maroon-950 text-sm block">{o.id}</span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(o.createdAt).toLocaleDateString()} {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-stone-950">{o.customerName}</div>
                        <div className="text-[10px] text-stone-400">📞 {o.customerPhone}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="max-w-[180px] truncate font-medium text-stone-600">
                          {o.items.map((i) => `${i.quantity}x ${i.product.name.replace("Premium ", "").replace("Special ", "")}`).join(", ")}
                        </div>
                        <div className="text-[9px] text-stone-400">({o.items.length} unique items)</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.deliveryMethod === "delivery"
                            ? "bg-sky-50 text-sky-700 border border-sky-100"
                            : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                        }`}>
                          {o.deliveryMethod === "delivery" ? "Home Delivery" : "Store Pickup"}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-mono font-bold text-stone-900 text-sm">₹{o.total}</div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase mt-1 inline-block ${
                          o.paymentStatus === "paid" ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {o.paymentStatus === "paid" ? "Paid" : "COD Pending"}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex justify-end gap-1.5 items-center">
                          <select
                             value={o.orderStatus}
                             onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                             className="bg-stone-100 border border-stone-200 rounded-lg px-2 py-1 text-[10px] font-bold text-stone-700 focus:outline-none"
                          >
                            <option value="received">Received</option>
                            <option value="preparing">Preparing</option>
                            <option value="out_for_delivery">Out For Del</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CATERING LEADS LIST */}
      {activeTab === "catering" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
          <div className="p-5 border-b border-stone-150">
            <h3 className="font-serif font-black text-stone-900 text-base">Catering Inquiries Terminal</h3>
            <p className="text-xs text-stone-400 mt-0.5">Wedding banquets and corporate leads registered from the Estimator</p>
          </div>

          {catering.length === 0 ? (
            <div className="p-10 text-center text-stone-400 text-xs">
              No catering inquiries received yet. Submit an inquiry from the Catering Estimator to review details here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-5">Lead ID & Occasion</th>
                    <th className="py-3 px-5">Inquirer Info</th>
                    <th className="py-3 px-5">Event Details</th>
                    <th className="py-3 px-5">Preferred Menu</th>
                    <th className="py-3 px-5">Estimation & Notes</th>
                    <th className="py-3 px-5 text-right">Inquiry Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150 text-stone-700">
                  {catering.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50/50">
                      <td className="py-3.5 px-5">
                        <span className="font-bold font-mono text-stone-900 block">{c.id}</span>
                        <span className="text-[10px] text-maroon-900 font-bold uppercase">{c.occasion}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-stone-950">{c.name}</div>
                        <div className="text-[10px] text-stone-400">📞 {c.phone}</div>
                        {c.email && <div className="text-[10px] text-stone-400">{c.email}</div>}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-bold font-mono">{c.guestsCount} Guests</div>
                        <div className="text-[10px] text-stone-500">Date: {new Date(c.date).toLocaleDateString("en-IN")}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="max-w-[150px] truncate text-stone-500" title={c.selectedSweets.join(", ")}>
                          🍬 {c.selectedSweets.join(", ") || "No sweets selected"}
                        </div>
                        <div className="max-w-[150px] truncate text-stone-500" title={c.selectedNamkeens.join(", ")}>
                          🥨 {c.selectedNamkeens.join(", ") || "No snacks selected"}
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-stone-900 font-mono">₹{c.estimatedPrice}</div>
                        {c.additionalRequirements && (
                          <div className="text-[9px] text-stone-400 italic max-w-[140px] truncate">{c.additionalRequirements}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <select
                          value={c.status}
                          onChange={(e) => handleUpdateCateringStatus(c.id, e.target.value)}
                          className="bg-stone-100 border border-stone-200 rounded-lg px-2 py-1 text-[10px] font-bold text-stone-700 focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PRODUCT CATALOG EDITOR */}
      {activeTab === "products" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h3 className="font-serif font-black text-stone-900 text-base">Active Sweet Catalog ({products.length} Items)</h3>
              <p className="text-xs text-stone-400 mt-0.5">Toggle availability, edit pricing, or add new items to Satna's premier menu</p>
            </div>
            
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2.5 bg-maroon-900 hover:bg-maroon-850 text-gold-100 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              {showAddForm ? "Cancel Add Form" : "＋ Add New Sweet"}
            </button>
          </div>

          {/* ADD PRODUCT EXPANDABLE FORM */}
          {showAddForm && (
            <form
              onSubmit={handleAddProductSubmit}
              className="bg-[#FAF8F5] border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-md space-y-4 animate-in slide-in-from-top-3 duration-200"
            >
              <h4 className="font-serif font-black text-maroon-950 text-sm border-b border-stone-150 pb-2">
                New Sweet Product Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-600">
                <div className="space-y-1">
                  <label className="font-bold">Sweet Title *</label>
                  <input
                    type="text"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="e.g. Saffron Kaju Pista Roll"
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none"
                    required
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="font-bold">Catalog Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none"
                  >
                    <option value="Traditional Sweets">Traditional Sweets</option>
                    <option value="Dry Fruit Sweets">Dry Fruit Sweets</option>
                    <option value="Milk Sweets">Milk Sweets</option>
                    <option value="Bengali Sweets">Bengali Sweets</option>
                    <option value="Namkeen">Namkeen</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Snacks">Snacks / Chaat</option>
                    <option value="Gift Boxes">Gift Boxes / Hampers</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold">Base Price (₹) *</label>
                    <input
                      type="number"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(Number(e.target.value))}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold">Pack Unit *</label>
                    <input
                      type="text"
                      value={newProdUnit}
                      onChange={(e) => setNewProdUnit(e.target.value)}
                      placeholder="e.g. 250g or 2 pcs"
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="font-bold">Delicious Description *</label>
                  <textarea
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    placeholder="Provide detailed delicious descriptions highlighting pure ingredients, desi ghee options, shelf-life, etc."
                    rows={2}
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none"
                    required
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold">Premium Image URL *</label>
                  <input
                    type="url"
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    placeholder="Unsplash sweet photo URL"
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold">Ingredients (comma-separated)</label>
                  <input
                    type="text"
                    value={newProdIngredients}
                    onChange={(e) => setNewProdIngredients(e.target.value)}
                    placeholder="e.g. Cashews, Saffron, Sugar"
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-500 hover:bg-stone-50 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-maroon-900 text-gold-100 hover:text-white font-bold rounded-xl text-xs shadow-sm hover:shadow-md cursor-pointer"
                >
                  Save to Catalog
                </button>
              </div>
            </form>
          )}

          {/* CATALOG TABLE */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-5">Visual</th>
                    <th className="py-3 px-5">Sweets Title</th>
                    <th className="py-3 px-5">Catalog Category</th>
                    <th className="py-3 px-5">Unit Price</th>
                    <th className="py-3 px-5">Badges Control</th>
                    <th className="py-3 px-5 text-right">Removals</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150 text-stone-700">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/30">
                      <td className="py-2.5 px-5">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-9 h-9 rounded-full object-cover border border-stone-200"
                          referrerPolicy="no-referrer"
                        />
                      </td>
                      <td className="py-2.5 px-5">
                        <span className="font-bold text-stone-900 block">{p.name}</span>
                        <span className="text-[10px] text-stone-400 italic">Shelf life: {p.shelfLife}</span>
                      </td>
                      <td className="py-2.5 px-5">
                        <span className="bg-stone-100 text-stone-600 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-5 font-mono font-bold text-maroon-950">
                        ₹{p.pricePerUnit} <span className="text-[10px] text-stone-400 font-medium">/ {p.unit}</span>
                      </td>
                      <td className="py-2.5 px-5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => onUpdateProduct({ ...p, isFreshlyMadeToday: !p.isFreshlyMadeToday })}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold border cursor-pointer transition-colors ${
                              p.isFreshlyMadeToday
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-stone-50 text-stone-400 border-stone-200"
                            }`}
                          >
                            ⭐ Fresh Badge
                          </button>
                          
                          <button
                            onClick={() => onUpdateProduct({ ...p, isBestSeller: !p.isBestSeller })}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold border cursor-pointer transition-colors ${
                              p.isBestSeller
                                ? "bg-maroon-50 text-maroon-900 border-maroon-100"
                                : "bg-stone-50 text-stone-400 border-stone-200"
                            }`}
                          >
                            🏆 Bestseller
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-5 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${p.name} from the catalog?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 rounded-full hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 5: REVIEWS MODERATION */}
      {activeTab === "reviews" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
          <div className="p-5 border-b border-stone-150">
            <h3 className="font-serif font-black text-stone-900 text-base">Reviews Moderation Desk</h3>
            <p className="text-xs text-stone-400 mt-0.5">Approve, reject, or moderate customer stories submitted via feedback forms</p>
          </div>

          {allReviews.length === 0 ? (
            <div className="p-10 text-center text-stone-400 text-xs">
              No customer reviews logged on the server database.
            </div>
          ) : (
            <div className="divide-y divide-stone-150">
              {allReviews.map((r) => (
                <div key={r.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-stone-50/30 transition-colors">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-950">{r.customerName}</span>
                      <span className="text-[10px] text-stone-400">({r.location})</span>
                      <div className="flex text-amber-500 text-xs pl-2">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} size={11} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-xs text-stone-600 leading-relaxed font-serif italic">
                      "{r.comment}"
                    </p>
                    
                    <span className="text-[9px] text-stone-400 block font-mono">
                      Received: {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex gap-2 self-start sm:self-center">
                    <button
                      onClick={() => handleApproveReview(r.id, !r.approved)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-colors flex items-center gap-1 ${
                        r.approved
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100"
                      }`}
                    >
                      {r.approved ? (
                        <>
                          <Check size={12} /> Approved (Live)
                        </>
                      ) : (
                        "Pending Approval"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: CUSTOMERS USER MANAGEMENT */}
      {activeTab === "customers" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
          <div className="p-5 border-b border-stone-150">
            <h3 className="font-serif font-black text-stone-900 text-base">Customers Backoffice Ledger</h3>
            <p className="text-xs text-stone-400 mt-0.5">Audit user registry profiles, roles, and suspension controls</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-5">UID Identifier</th>
                  <th className="py-3 px-5">Name & Profile</th>
                  <th className="py-3 px-5">Mobile Contacts</th>
                  <th className="py-3 px-5">Security Role</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Suspend Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150 text-stone-700">
                {customers.map((c) => (
                  <tr key={c.uid} className="hover:bg-stone-50/50">
                    <td className="py-3.5 px-5">
                      <span className="font-mono font-bold text-[11px] block text-stone-500">{c.uid}</span>
                      <span className="text-[10px] text-stone-400">Created: {new Date(c.createdAt || Date.now()).toLocaleDateString()}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-stone-950">{c.name || "N/A"}</div>
                      <div className="text-[10px] text-stone-400">{c.email}</div>
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold">
                      {c.phone || "Google Bound"}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.role.includes("Admin") 
                          ? "bg-maroon-50 text-maroon-900 border border-maroon-100" 
                          : "bg-stone-100 text-stone-600 border border-stone-200"
                      }`}>
                        {c.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-black ${
                        c.isBlocked ? "text-red-600" : "text-green-600"
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${c.isBlocked ? "bg-red-600" : "bg-green-600"}`}></span>
                        {c.isBlocked ? "SUSPENDED" : "ACTIVE"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {c.role !== "Super Admin" ? (
                        <button
                          onClick={() => handleToggleBlockCustomer(c.uid, c.isBlocked)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ml-auto border ${
                            c.isBlocked 
                              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
                              : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                          }`}
                        >
                          {c.isBlocked ? (
                            <>
                              <Unlock size={12} /> Activate
                            </>
                          ) : (
                            <>
                              <Ban size={12} /> Suspend
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-[10px] text-stone-400 italic font-medium">Unrestricted</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: COUPONS & PROMOTIONS MANAGEMENT */}
      {activeTab === "coupons" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h3 className="font-serif font-black text-stone-900 text-base">Active Shop Promo Codes</h3>
              <p className="text-xs text-stone-400 mt-0.5">Manage discounts, percentage-off campaigns, usage limits, and expiries</p>
            </div>
            <button
              onClick={() => setShowCouponForm(!showCouponForm)}
              className="px-4 py-2.5 bg-maroon-900 hover:bg-maroon-850 text-gold-100 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <Ticket size={14} /> {showCouponForm ? "Cancel Form" : "Create Promo Code"}
            </button>
          </div>

          {showCouponForm && (
            <form
              onSubmit={handleAddCouponSubmit}
              className="bg-[#FAF8F5] border border-stone-200 rounded-3xl p-5 shadow-md space-y-4 animate-in slide-in-from-top-3 duration-200"
            >
              <h4 className="font-serif font-black text-maroon-950 text-sm border-b border-stone-150 pb-2">
                New Promotion Campaign
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs text-stone-600">
                <div className="space-y-1">
                  <label className="font-bold">Promo Code *</label>
                  <input
                    type="text"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SATNA50"
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none uppercase font-mono font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold">Discount Class</label>
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as any)}
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none"
                  >
                    <option value="percentage">Percentage (%) Off</option>
                    <option value="flat">Flat Rupees (₹) Off</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold">Discount Benefit Value *</label>
                  <input
                    type="number"
                    value={newCouponValue}
                    onChange={(e) => setNewCouponValue(Number(e.target.value))}
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold">Campaign Expiry *</label>
                  <input
                    type="date"
                    value={newCouponExpiry}
                    onChange={(e) => setNewCouponExpiry(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none font-mono"
                    required
                  />
                </div>

                <div className="space-y-1 sm:col-span-1">
                  <label className="font-bold">Max Uses Limit</label>
                  <input
                    type="number"
                    value={newCouponLimit}
                    onChange={(e) => setNewCouponLimit(Number(e.target.value))}
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCouponForm(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-500 hover:bg-stone-50 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-maroon-900 text-gold-100 hover:text-white font-bold rounded-xl text-xs shadow-sm hover:shadow-md cursor-pointer"
                >
                  Publish Campaign
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-5">Coupon Code</th>
                    <th className="py-3 px-5">Type & Benefit</th>
                    <th className="py-3 px-5">Campaign Expiry</th>
                    <th className="py-3 px-5">Usage Ledger</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150 text-stone-700 font-mono">
                  {couponsList.map((coup) => (
                    <tr key={coup.id} className="hover:bg-stone-50/50">
                      <td className="py-3 px-5 font-bold text-maroon-950 text-sm font-sans tracking-wide">
                        🎟️ {coup.code}
                      </td>
                      <td className="py-3 px-5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          coup.type === "percentage" ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-sky-50 text-sky-800 border border-sky-200"
                        }`}>
                          {coup.type === "percentage" ? `${coup.value}% Percent Off` : `₹${coup.value} Flat Cash`}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-stone-600">
                        {coup.expiryDate}
                      </td>
                      <td className="py-3 px-5 text-stone-500">
                        <span className="font-bold text-stone-900">{coup.usageCount}</span> / {coup.usageLimit} Redeemed
                      </td>
                      <td className="py-3 px-5">
                        <span className={`font-sans text-[10px] font-bold uppercase ${
                          coup.isActive ? "text-green-600" : "text-stone-400"
                        }`}>
                          {coup.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right font-sans">
                        <button
                          onClick={() => {
                            if (confirm(`Delete coupon ${coup.code}?`)) {
                              handleDeleteCoupon(coup.id);
                            }
                          }}
                          className="p-1.5 rounded-full hover:bg-red-50 text-stone-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
