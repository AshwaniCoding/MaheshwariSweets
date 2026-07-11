import React from "react";
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart, Award } from "lucide-react";

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export default function Footer({ setCurrentTab }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-stone-300 border-t-4 border-gold-500 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Brand & Mission Statement */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center border border-gold-400">
              <span className="text-maroon-950 font-serif text-xl font-bold">M</span>
            </div>
            <h3 className="text-gold-400 font-serif text-lg font-bold tracking-wider">
              Maheshwari Sweets
            </h3>
          </div>
          <p className="text-sm text-stone-400 leading-relaxed font-serif italic">
            "Bringing happiness through every sweet since 2001."
          </p>
          <p className="text-xs text-stone-400 leading-relaxed">
            Satna's premier destination for authentic royal Indian mithai, mouthwatering namkeens, warm breakfasts, and high-quality wedding catering.
          </p>
          <div className="flex gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-gold-400">
              <ShieldCheck size={14} /> 100% Veg
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gold-400">
              <Award size={14} /> Pure Desi Ghee
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-serif font-semibold text-sm tracking-widest uppercase border-b border-stone-800 pb-3 mb-4">
            Our Offerings
          </h4>
          <ul className="space-y-2 text-sm text-stone-400">
            <li>
              <button onClick={() => setCurrentTab("home")} className="hover:text-gold-400 transition-colors cursor-pointer text-left">
                Traditional Ghee Mithai
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentTab("home")} className="hover:text-gold-400 transition-colors cursor-pointer text-left">
                Kaju Katli & Dry Fruit Sweets
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentTab("home")} className="hover:text-gold-400 transition-colors cursor-pointer text-left">
                Poha Jalebi & Breakfast
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentTab("box-builder")} className="hover:text-gold-400 transition-colors cursor-pointer text-left font-semibold text-gold-500/90 flex items-center gap-1">
                ⭐ Custom Gift Box Builder
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentTab("catering")} className="hover:text-gold-400 transition-colors cursor-pointer text-left">
                Wedding & Event Catering
              </button>
            </li>
          </ul>
        </div>

        {/* Location & Contact Information */}
        <div>
          <h4 className="text-white font-serif font-semibold text-sm tracking-widest uppercase border-b border-stone-800 pb-3 mb-4">
            Contact Us
          </h4>
          <ul className="space-y-3.5 text-sm text-stone-400">
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="text-gold-500 shrink-0 mt-0.5" />
              <span>
                <strong>Outlet Address:</strong><br />
                Station Road, Near Railway Station,<br />
                Satna, Madhya Pradesh, 485001
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={16} className="text-gold-500 shrink-0" />
              <span>+91 7672 223456, +91 94251 XXXXX</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={16} className="text-gold-500 shrink-0" />
              <span className="break-all">info@maheshwarisweetssatna.com</span>
            </li>
          </ul>
        </div>

        {/* Operational Hours & Google Maps Redirection */}
        <div>
          <h4 className="text-white font-serif font-semibold text-sm tracking-widest uppercase border-b border-stone-800 pb-3 mb-4">
            Operational Hours
          </h4>
          <ul className="space-y-3 text-sm text-stone-400 mb-4">
            <li className="flex items-center gap-2">
              <Clock size={16} className="text-gold-500" />
              <span>Everyday: 7:00 AM - 10:30 PM</span>
            </li>
            <li className="text-xs text-stone-500">
              *Poha Jalebi & Fresh Breakfast starts from 7:00 AM daily.
            </li>
          </ul>
          
          {/* Custom Static Map / Direction Card */}
          <a
            href="https://maps.google.com/?q=Maheshwari+Sweets+Station+Road+Satna"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3.5 rounded bg-stone-800 border border-stone-700 text-center hover:border-gold-500 transition-colors group cursor-pointer"
          >
            <p className="text-xs font-semibold text-gold-400 mb-1 flex items-center justify-center gap-1 group-hover:underline">
              📍 View Outlet on Google Maps
            </p>
            <p className="text-[10px] text-stone-500">
              Click to get quick directions & navigate
            </p>
          </a>
        </div>

      </div>

      {/* Local SEO & Brand Keywords footer strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-stone-800/80 text-center">
        <p className="text-[10px] text-stone-500 tracking-wider mb-3 leading-relaxed">
          Popular Searches in Satna: Maheshwari Sweets Satna • Best Sweet Shop Satna • Traditional Mithai Shop Satna • Pure Desi Ghee Sweets • Namkeen Satna • Wedding Caterers in Satna MP • Samosa & Kachori Breakfast Satna • Premium Dry Fruit Gifting boxes
        </p>
        <p className="text-xs text-stone-500 flex items-center justify-center gap-1">
          Made with <Heart size={12} className="text-red-600 animate-pulse" /> for Satna. 
          © {currentYear} Maheshwari Sweets. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
