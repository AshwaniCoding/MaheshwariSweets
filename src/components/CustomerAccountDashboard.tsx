import React, { useState, useEffect } from "react";
import { User, MapPin, ShoppingBag, Heart, Plus, Trash2, CheckCircle, RefreshCw, LogOut } from "lucide-react";
import { Product, Order } from "../types.ts";
import ProductCard from "./ProductCard.tsx";

interface CustomerAccountDashboardProps {
  user: {
    uid: string;
    name: string | null;
    email: string;
    phone: string | null;
    savedAddresses?: string | null; // JSON list of address objects
    createdAt?: string;
  };
  token: string | null;
  wishlistProducts: Product[];
  onWishlistToggle: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number, unit: string) => void;
  onLogout: () => void;
  onAddressSaved: () => void;
}

interface AddressItem {
  street: string;
  area: string;
  pincode: string;
  landmark?: string;
}

export default function CustomerAccountDashboard({
  user,
  token,
  wishlistProducts,
  onWishlistToggle,
  onAddToCart,
  onLogout,
  onAddressSaved,
}: CustomerAccountDashboardProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "wishlist">("profile");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  // New address states
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("Civil Lines");
  const [pincode, setPincode] = useState("485001");
  const [landmark, setLandmark] = useState("");
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");

  const satnaAreas = [
    "Civil Lines", "Bharhut Nagar", "Pateri", "Station Road", "Sherganj", 
    "Sajjanpur", "Birla Colony", "Dhawari", "Kolgawan", "Kothi Road", "Prem Nagar"
  ];

  // Fetch orders from server
  const fetchOrders = async () => {
    if (!token) return;
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/orders", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to load user orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab, token]);

  // Handle address submission
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!street.trim() || !pincode.trim()) {
      setAddressError("Please enter street address and pincode.");
      return;
    }
    setAddressError("");
    setAddressLoading(true);
    try {
      const res = await fetch("/api/auth/address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          street,
          area,
          pincode,
          landmark,
        }),
      });

      if (res.ok) {
        setStreet("");
        setLandmark("");
        setIsAddingAddress(false);
        onAddressSaved();
      } else {
        const data = await res.json();
        setAddressError(data.error || "Failed to add address.");
      }
    } catch (err) {
      setAddressError("Network error. Please try again.");
    } finally {
      setAddressLoading(false);
    }
  };

  // Safe parse saved addresses
  const getParsedAddresses = (): AddressItem[] => {
    try {
      if (!user.savedAddresses) return [];
      return JSON.parse(user.savedAddresses);
    } catch {
      return [];
    }
  };

  const savedAddresses = getParsedAddresses();

  // Helper for status classes
  const getStatusBadge = (status: string) => {
    const classes: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      confirmed: "bg-blue-50 text-blue-700 border-blue-200",
      preparing: "bg-indigo-50 text-indigo-700 border-indigo-200",
      packed: "bg-teal-50 text-teal-700 border-teal-200",
      out_for_delivery: "bg-pink-50 text-pink-700 border-pink-200",
      delivered: "bg-green-50 text-green-700 border-green-200",
      completed: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return (
      <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full border shadow-sm uppercase tracking-wider ${classes[status] || "bg-stone-50 text-stone-600 border-stone-200"}`}>
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-in fade-in duration-200" id="customer-dashboard">
      
      {/* Upper Welcome Header banner */}
      <div className="bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl border border-gold-900/10">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gold-300">Royal Sweets Club Member</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-white flex items-center gap-2">
            Namaste, <span className="text-gold-100">{user.name || "Valued Customer"}</span>
          </h2>
          <p className="text-xs text-stone-200">Phone: <span className="font-mono font-bold">{user.phone || "Not Set"}</span> • Email: {user.email}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-4 py-2 border border-stone-200/20 bg-stone-100/10 hover:bg-stone-100/20 rounded-xl text-stone-200 text-xs font-bold transition-all cursor-pointer shadow-inner"
        >
          <LogOut size={13} />
          Sign Out
        </button>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex border-b border-stone-200 gap-4 sm:gap-6 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "profile"
              ? "border-maroon-900 text-maroon-900 font-black"
              : "border-transparent text-stone-400 hover:text-stone-700"
          }`}
        >
          <User size={15} />
          Profile & Addresses
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "orders"
              ? "border-maroon-900 text-maroon-900 font-black"
              : "border-transparent text-stone-400 hover:text-stone-700"
          }`}
        >
          <ShoppingBag size={15} />
          My Orders {orders.length > 0 && <span className="px-1.5 py-0.5 bg-maroon-100 text-maroon-900 text-[10px] rounded-full">{orders.length}</span>}
        </button>
        <button
          onClick={() => setActiveTab("wishlist")}
          className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "wishlist"
              ? "border-maroon-900 text-maroon-900 font-black"
              : "border-transparent text-stone-400 hover:text-stone-700"
          }`}
        >
          <Heart size={15} />
          My Wishlist {wishlistProducts.length > 0 && <span className="px-1.5 py-0.5 bg-maroon-100 text-maroon-900 text-[10px] rounded-full">{wishlistProducts.length}</span>}
        </button>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        
        {/* TAB 1: PROFILE & ADDRESSES */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Account Summary card */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-150 p-5 space-y-4 shadow-sm text-xs text-stone-600">
              <h3 className="font-serif font-black text-maroon-950 text-sm border-b pb-2">Profile Overview</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold text-stone-400 block">Full Name</span>
                  <p className="font-bold text-stone-800 text-sm mt-0.5">{user.name || "Customer"}</p>
                </div>
                <div>
                  <span className="font-semibold text-stone-400 block">Mobile Link</span>
                  <p className="font-bold text-stone-800 font-mono mt-0.5">{user.phone || "Not Set"}</p>
                </div>
                <div>
                  <span className="font-semibold text-stone-400 block">Email Address</span>
                  <p className="font-bold text-stone-800 mt-0.5">{user.email}</p>
                </div>
                {user.createdAt && (
                  <div>
                    <span className="font-semibold text-stone-400 block">Member Since</span>
                    <p className="text-stone-800 mt-0.5">{new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Address Manager card */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-150 p-5 sm:p-6 space-y-6 shadow-sm">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h3 className="font-serif font-black text-maroon-950 text-sm">Delivery Address Book</h3>
                  <p className="text-[10px] text-stone-400 mt-0.5">Manage your frequent delivery points within Satna city limits.</p>
                </div>
                {!isAddingAddress && (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-maroon-50 text-maroon-900 rounded-lg text-[11px] font-black hover:bg-maroon-100 transition-colors cursor-pointer"
                  >
                    <Plus size={12} />
                    New Address
                  </button>
                )}
              </div>

              {/* Add Address Form overlay or sliding */}
              {isAddingAddress && (
                <form onSubmit={handleAddAddress} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-150 text-xs">
                  <h4 className="font-bold text-stone-800 text-xs">Enter Delivery Landmark details</h4>
                  
                  {addressError && (
                    <p className="text-red-600 font-semibold">{addressError}</p>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-extrabold text-stone-600 uppercase tracking-wider text-[9px]">Satna Locality *</label>
                      <select
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-700 focus:outline-none focus:border-maroon-500"
                      >
                        {satnaAreas.map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-extrabold text-stone-600 uppercase tracking-wider text-[9px]">Pincode *</label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="485001"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-700 font-mono font-bold focus:outline-none focus:border-maroon-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-stone-600 uppercase tracking-wider text-[9px]">Street Address, House No, Block *</label>
                    <input
                      type="text"
                      placeholder="e.g. 14, Royal Ghee Residency, Near Civil Court"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:border-maroon-500 font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-stone-600 uppercase tracking-wider text-[9px]">Landmark (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Next to Birla Hospital"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:border-maroon-500"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingAddress(false);
                        setStreet("");
                        setLandmark("");
                        setAddressError("");
                      }}
                      className="px-3.5 py-1.5 border border-stone-200 rounded-lg text-stone-500 font-bold hover:bg-stone-100"
                      disabled={addressLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-maroon-900 text-gold-100 font-black uppercase tracking-wider rounded-lg hover:bg-maroon-800 transition-all cursor-pointer"
                      disabled={addressLoading}
                    >
                      {addressLoading ? "Saving..." : "Add Landmark Address"}
                    </button>
                  </div>
                </form>
              )}

              {/* Saved Addresses list */}
              <div className="space-y-3">
                {savedAddresses.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-stone-200 rounded-2xl text-stone-400 space-y-2">
                    <MapPin size={24} className="mx-auto text-stone-300" />
                    <p className="text-xs font-bold">No saved addresses yet</p>
                    <p className="text-[10px]">Add your frequent delivery locations for lightning-fast orders.</p>
                  </div>
                ) : (
                  savedAddresses.map((addr, idx) => (
                    <div key={idx} className="p-4 bg-white border border-stone-200 rounded-xl hover:border-maroon-900/30 transition-all flex items-start gap-3 shadow-sm group">
                      <MapPin size={16} className="text-gold-500 mt-0.5 shrink-0" />
                      <div className="text-xs text-stone-600 flex-1 space-y-0.5">
                        <span className="font-extrabold text-stone-800 text-[11px] uppercase tracking-wider bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">Address #{idx+1}</span>
                        <p className="font-bold text-stone-800 mt-1">{addr.street}</p>
                        <p className="text-[11px] text-stone-500">Area: {addr.area} • Pincode: <span className="font-mono font-semibold text-stone-700">{addr.pincode}</span></p>
                        {addr.landmark && <p className="text-[11px] text-stone-400">Landmark: {addr.landmark}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: ORDER HISTORY */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {ordersLoading ? (
              <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-stone-150">
                <RefreshCw size={24} className="animate-spin text-maroon-900 mx-auto" />
                <p className="text-stone-500 text-xs font-bold">Loading your royal sweet orders list...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-stone-200 bg-white rounded-2xl text-stone-400 space-y-3 max-w-md mx-auto">
                <ShoppingBag size={32} className="mx-auto text-stone-300" />
                <h3 className="text-stone-800 font-serif font-black text-sm">No sweets ordered yet!</h3>
                <p className="text-[11px] leading-relaxed">Your active order book is empty. Dive into our rich selection of traditional cow ghee delights and start celebrating today!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  let itemsList: any[] = [];
                  try {
                    itemsList = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
                  } catch {
                    itemsList = [];
                  }

                  let addressObj: any = null;
                  try {
                    if (order.address) {
                      addressObj = typeof order.address === "string" ? JSON.parse(order.address) : order.address;
                    }
                  } catch {}

                  return (
                    <div key={order.id} className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden text-xs text-stone-700">
                      
                      {/* Order Upper metadata */}
                      <div className="bg-stone-50 border-b border-stone-150 p-4 sm:px-6 flex flex-wrap justify-between items-center gap-3">
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-stone-400">Order Reference</span>
                          <p className="font-mono font-extrabold text-stone-900 text-sm">{order.id}</p>
                          <p className="text-[10px] text-stone-400">Placed: {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(order.orderStatus)}
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-stone-400 block">Grand Total</span>
                            <span className="text-sm font-black text-maroon-950 font-mono">₹{order.total}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                        
                        {/* Left column: Sweets ordered list */}
                        <div className="md:col-span-7 space-y-4">
                          <h4 className="font-bold text-stone-800 text-[11px] uppercase tracking-wider border-b pb-1">Items Booked</h4>
                          <div className="space-y-2.5">
                            {itemsList.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-stone-50/50 p-2.5 rounded-xl border border-stone-100">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-stone-900 text-sm">{item.product?.name || "Premium Sweets"}</span>
                                  <p className="text-[10px] text-stone-400 font-medium">Size: {item.selectedUnit || "250g"} • Qty: {item.quantity}</p>
                                </div>
                                <span className="font-mono font-extrabold text-stone-800 text-xs">₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Right column: Delivery tracking & instructions */}
                        <div className="md:col-span-5 space-y-4 md:border-l md:pl-6 border-stone-150">
                          <h4 className="font-bold text-stone-800 text-[11px] uppercase tracking-wider border-b pb-1">Delivery details</h4>
                          <div className="space-y-2 text-[11px] leading-relaxed">
                            <div>
                              <span className="font-semibold text-stone-400 block">Recipient</span>
                              <p className="font-bold text-stone-800">{order.customerName}</p>
                              <p className="font-mono font-medium text-stone-500">{order.customerPhone}</p>
                            </div>

                            <div>
                              <span className="font-semibold text-stone-400 block">Fulfillment Method</span>
                              <p className="font-bold text-maroon-900 uppercase tracking-wide">{order.deliveryMethod === "delivery" ? "🚀 Door Delivery (Satna)" : "🏪 Self Pickup at Station Road"}</p>
                            </div>

                            {order.deliveryMethod === "delivery" && addressObj && (
                              <div>
                                <span className="font-semibold text-stone-400 block">Address Point</span>
                                <p className="font-bold text-stone-700">{addressObj.street}</p>
                                <p className="text-stone-400">Area: {addressObj.area} • Pincode: {addressObj.pincode}</p>
                                {addressObj.landmark && <p className="text-stone-400 font-medium">Landmark: {addressObj.landmark}</p>}
                              </div>
                            )}

                            <div className="pt-2 border-t border-stone-100 flex justify-between items-center">
                              <div>
                                <span className="font-semibold text-stone-400 block">Payment Method</span>
                                <p className="font-bold text-stone-700 uppercase">{order.paymentMethod}</p>
                              </div>
                              <span className={`px-2 py-0.5 text-[9px] font-black rounded border ${order.paymentStatus === "paid" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                                PAY: {order.paymentStatus.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Live Tracking Timeline visualizer */}
                      <div className="bg-stone-50 border-t border-stone-150 px-4 sm:px-6 py-4">
                        <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest block mb-3">Live Order Progress Tracker</div>
                        <div className="grid grid-cols-4 text-center text-[10px] relative">
                          
                          {/* Progress Line */}
                          <div className="absolute top-1.5 left-1/8 right-1/8 h-1 bg-stone-200 -z-0">
                            <div className={`h-full bg-green-500 transition-all ${
                              order.orderStatus === "completed" || order.orderStatus === "delivered" ? "w-full" :
                              order.orderStatus === "out_for_delivery" ? "w-2/3" :
                              order.orderStatus === "preparing" || order.orderStatus === "confirmed" ? "w-1/3" : "w-0"
                            }`}></div>
                          </div>

                          <div className="space-y-1 relative z-10 flex flex-col items-center">
                            <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border font-bold ${
                              ["pending", "confirmed", "preparing", "out_for_delivery", "completed", "delivered"].includes(order.orderStatus)
                                ? "bg-green-500 border-green-600 text-white"
                                : "bg-stone-100 border-stone-300 text-stone-400"
                            }`}>✓</div>
                            <span className="font-bold text-stone-600">Received</span>
                          </div>

                          <div className="space-y-1 relative z-10 flex flex-col items-center">
                            <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border font-bold ${
                              ["preparing", "out_for_delivery", "completed", "delivered"].includes(order.orderStatus)
                                ? "bg-green-500 border-green-600 text-white"
                                : "bg-stone-100 border-stone-300 text-stone-400"
                            }`}>✓</div>
                            <span className="font-bold text-stone-600">Kitchen Preparing</span>
                          </div>

                          <div className="space-y-1 relative z-10 flex flex-col items-center">
                            <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border font-bold ${
                              ["out_for_delivery", "completed", "delivered"].includes(order.orderStatus)
                                ? "bg-green-500 border-green-600 text-white"
                                : "bg-stone-100 border-stone-300 text-stone-400"
                            }`}>✓</div>
                            <span className="font-bold text-stone-600">Dispatched</span>
                          </div>

                          <div className="space-y-1 relative z-10 flex flex-col items-center">
                            <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border font-bold ${
                              ["completed", "delivered"].includes(order.orderStatus)
                                ? "bg-green-500 border-green-600 text-white"
                                : "bg-stone-100 border-stone-300 text-stone-400"
                            }`}>✓</div>
                            <span className="font-bold text-stone-600">Delivered</span>
                          </div>

                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CUSTOMER WISHLIST */}
        {activeTab === "wishlist" && (
          <div className="space-y-6">
            {wishlistProducts.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-stone-200 bg-white rounded-2xl text-stone-400 space-y-3 max-w-md mx-auto">
                <Heart size={32} className="mx-auto text-stone-300" />
                <h3 className="text-stone-800 font-serif font-black text-sm">Your Wishlist is Empty</h3>
                <p className="text-[11px] leading-relaxed">Save your favorite sweets, dry fruit boxes, or morning snacks here by tapping the heart icon on any item card.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-200">
                {wishlistProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onAddToCart={onAddToCart}
                    isWishlisted={true}
                    onWishlistToggle={onWishlistToggle}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
