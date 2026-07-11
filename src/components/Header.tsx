import React, { useState } from "react";
import { ShoppingBag, Sparkles, Heart, Menu, X, ShieldAlert, PhoneCall, User, LogOut } from "lucide-react";

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  cartCount: number;
  onCartClick: () => void;
  user: any;
  onLoginClick: () => void;
  onLogout: () => void;
  adminUser: any;
  onAdminLoginClick: () => void;
  onAdminLogout: () => void;
}

export default function Header({
  currentTab,
  setCurrentTab,
  cartCount,
  onCartClick,
  user,
  onLoginClick,
  onLogout,
  adminUser,
  onAdminLoginClick,
  onAdminLogout,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home & Menu" },
    { id: "box-builder", label: "Gift Box Builder", icon: Sparkles },
    { id: "catering", label: "Catering Estimator", icon: PhoneCall },
    { id: "heritage", label: "Our Story" },
    { id: "contact", label: "Contact Us" },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  const isAdminViewActive = currentTab.startsWith("admin");

  return (
    <header className="sticky top-0 z-50 glass-header shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-gold-500/10 transition-all duration-300">
      {/* Top Welcome Bar */}
      <div className="bg-maroon-700 text-gold-100 py-2 px-4 sm:px-6 lg:px-8 border-b border-gold-500/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[11px] font-semibold tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-saffron animate-pulse"></span>
            <span className="hidden sm:inline">✨ Pure Desi Ghee Sweets & Premium Gifting Solutions ✨</span>
            <span className="sm:hidden">✨ Premium Sweets of Satna ✨</span>
          </div>
          
          <div className="flex items-center gap-5">
            <span className="hidden md:inline text-gold-200/80">📍 Station Road, Satna, MP</span>
            <span className="hidden md:inline text-gold-200/80">📞 +91 7672 223456</span>
            
            {adminUser ? (
              <div className="flex items-center gap-2 bg-maroon-800/80 px-2 py-0.5 rounded-lg border border-gold-500/30">
                <span className="text-gold-300 font-bold text-[10px]">Staff: {adminUser.name}</span>
                <button
                  onClick={() => handleNavClick("admin-dashboard")}
                  className="flex items-center gap-1 bg-gold-500 hover:bg-gold-600 text-maroon-950 font-black text-[9px] uppercase px-1.5 py-0.5 rounded transition-all duration-200 cursor-pointer shadow-sm"
                >
                  <ShieldAlert size={10} />
                  Panel
                </button>
                <button
                  onClick={onAdminLogout}
                  className="text-gold-200 hover:text-white p-0.5 transition-colors"
                  title="Admin Logout"
                >
                  <LogOut size={11} />
                </button>
              </div>
            ) : (
              <button
                onClick={onAdminLoginClick}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-maroon-500 hover:border-gold-500/50 bg-maroon-900 text-gold-200 hover:text-white font-bold transition-all duration-300 text-[10px] cursor-pointer shadow-inner"
              >
                <ShieldAlert size={10} className="text-gold-400" />
                Staff Portal
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
        {/* Brand Identity / Logo */}
        <div 
          onClick={() => handleNavClick("home")} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-maroon-800 to-maroon-600 flex items-center justify-center border-2 border-gold-500/90 shadow-md group-hover:scale-105 duration-300 transition-all gold-glow-hover">
            <span className="text-gold-100 font-serif text-xl font-black tracking-tighter select-none">M</span>
          </div>
          <div>
            <h1 className="text-maroon-700 font-serif text-xl sm:text-2xl font-black tracking-tight flex items-center gap-1 leading-none group-hover:text-maroon-500 transition-colors">
              Maheshwari
              <span className="text-gold-500 font-normal italic font-serif">Sweets</span>
            </h1>
            <p className="text-[9px] text-stone-400 tracking-widest uppercase font-sans mt-0.5 font-bold">
              Satna's Pride Since 2001
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 py-2 transition-all duration-300 cursor-pointer relative ${
                  isActive
                    ? "text-maroon-500 font-black"
                    : "text-stone-600 hover:text-maroon-500"
                }`}
              >
                {Icon && <Icon size={12} className={isActive ? "text-saffron" : "text-stone-400 group-hover:text-maroon-500"} />}
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-maroon-500 to-gold-500 rounded-full"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Wishlist Button (Authenticated) */}
          {user && (
            <button
              onClick={() => handleNavClick("account")}
              className="p-2 rounded-full text-rosepink hover:bg-rose-50 transition-all duration-300 cursor-pointer scale-100 active:scale-95"
              title="My Wishlist & Account"
            >
              <Heart size={18} fill={currentTab === "account" ? "currentColor" : "none"} />
            </button>
          )}

          <button
            onClick={onCartClick}
            className="relative p-2 rounded-full bg-cream hover:bg-gold-50 border border-gold-500/20 text-maroon-700 transition-all duration-300 cursor-pointer scale-100 active:scale-95 group"
            aria-label="Shopping Cart"
          >
            <ShoppingBag size={18} className="group-hover:scale-105 transition-transform duration-300" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-maroon-500 text-gold-100 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {/* Customer login action */}
          {user ? (
            <div className="hidden sm:flex items-center gap-2.5 border-l border-stone-200/80 pl-3">
              <button
                onClick={() => handleNavClick("account")}
                className="flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-maroon-500 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-maroon-50 to-cream border border-gold-500/30 flex items-center justify-center text-maroon-900 shadow-sm">
                  <User size={13} />
                </div>
                <div className="text-left leading-none">
                  <span className="block text-[9px] text-stone-400 font-medium">Namaste!</span>
                  <span>{user.name.split(" ")[0]}</span>
                </div>
              </button>
              <button
                onClick={onLogout}
                className="p-1.5 text-stone-400 hover:text-maroon-500 transition-colors cursor-pointer"
                title="Logout Account"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-maroon-700 to-maroon-500 hover:from-maroon-600 hover:to-maroon-400 text-gold-100 hover:text-white font-bold text-[10px] uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-md shadow-maroon-950/10 hover:shadow-lg hover:scale-102"
            >
              <User size={12} /> Log In
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-stone-700 hover:text-maroon-500 hover:bg-stone-50 rounded-lg transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gold-500/10 bg-cream/95 backdrop-blur-md py-3 px-4 shadow-lg space-y-1.5 animate-in slide-in-from-top duration-300">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2.5 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-maroon-500/10 text-maroon-700 border-l-4 border-maroon-500 font-extrabold"
                    : "text-stone-700 hover:bg-white/50"
                }`}
              >
                {Icon && <Icon size={14} className="text-gold-500" />}
                {item.label}
              </button>
            );
          })}
          
          <div className="border-t border-gold-500/10 pt-2.5 flex flex-col gap-1.5">
            {user ? (
              <>
                <button
                  onClick={() => handleNavClick("account")}
                  className="w-full text-left px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 text-stone-700 hover:bg-white/50 cursor-pointer"
                >
                  <User size={14} className="text-stone-400" /> Namaste, {user.name}!
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 text-rosepink hover:bg-rose-50/50 cursor-pointer"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onLoginClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-maroon-700 to-maroon-500 text-gold-100 font-bold text-xs uppercase tracking-wider rounded-xl text-center cursor-pointer shadow-sm"
              >
                Log In
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

