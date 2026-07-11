import React, { useState } from "react";
import { Sparkles, Calendar, Users, Phone, Mail, FileText, CheckCircle2, DollarSign, Send } from "lucide-react";

interface CateringEstimatorProps {
  onInquirySubmitted?: () => void;
}

interface CateringPackage {
  id: "silver" | "gold" | "royal_diamond";
  name: string;
  pricePerGuest: number;
  description: string;
  features: string[];
}

export default function CateringEstimator({ onInquirySubmitted }: CateringEstimatorProps) {
  // Packages details
  const packages: CateringPackage[] = [
    {
      id: "silver",
      name: "Traditional Silver Package",
      pricePerGuest: 180,
      description: "Perfect for family events and simple traditional celebrations.",
      features: [
        "Curated selection of 2 Traditional Sweets (Laddoos, Pedas)",
        "2 Crispy Namkeens (Sev, Mixture)",
        "Standard Breakfast options (Poha, Samosa)",
        "Elegant basic buffet setup",
      ],
    },
    {
      id: "gold",
      name: "Shahi Gold Package",
      pricePerGuest: 320,
      description: "Our highly popular wedding and large scale corporate gifting tier.",
      features: [
        "Curated selection of 2 Premium Dry Fruit sweets (Kaju Katli, Bites)",
        "2 Rich Milk Sweets (Rasmalai, Milk Cake)",
        "3 Gourmet Namkeens & Snacks (Kachori, Dhokla, Ratlami Sev)",
        "Interactive live hot Samosa & Chaat Counter",
        "Royal premium buffet setup",
      ],
    },
    {
      id: "royal_diamond",
      name: "Imperial Maharaja Diamond Package",
      pricePerGuest: 520,
      description: "The absolute premium pinnacle of luxury sweet banquets.",
      features: [
        "Unlimited premium sweets (Kaju Pista Roll, Kesaria Rasgulla)",
        "Luxury sugar-free organic dry-fruit options",
        "Live Sweet Counter: Warm Jalebis with Rabri made live in front of guests",
        "4 Gourmet Namkeens & Chaats (Raj Kachori, Aloo Tikki, Sev)",
        "Exquisite royal presentation with decorated stalls & silver-accent setups",
        "Personalized traditional sweet hampers for VIP guests",
      ],
    },
  ];

  // Sweet lists to customize package
  const sweetChoices = [
    "Kaju Katli", "Saffron Rasgulla", "Milk Cake", "Motichoor Laddoo",
    "Rasmalai", "Mawa Bati", "Kaju Pista Roll", "Sugar-Free Bites"
  ];

  // Namkeen choices
  const namkeenChoices = [
    "Ratlami Sev", "Cornflakes Mixture", "Shahi Samosa", "Pyaz Kachori",
    "Dhokla", "Aloo Tikki Chaat", "Bread Pakoda"
  ];

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [guestsCount, setGuestsCount] = useState<number>(100);
  const [occasion, setOccasion] = useState("Wedding");
  const [selectedPkg, setSelectedPkg] = useState<CateringPackage>(packages[1]); // Gold is default
  const [selectedSweets, setSelectedSweets] = useState<string[]>([]);
  const [selectedNamkeens, setSelectedNamkeens] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState<any>(null);

  // Estimation calculation
  const calculatedPrice = selectedPkg.pricePerGuest * guestsCount;

  // Toggle choices
  const handleSweetToggle = (sweetName: string) => {
    setSelectedSweets((prev) =>
      prev.includes(sweetName)
        ? prev.filter((item) => item !== sweetName)
        : [...prev, sweetName]
    );
  };

  const handleNamkeenToggle = (namkeenName: string) => {
    setSelectedNamkeens((prev) =>
      prev.includes(namkeenName)
        ? prev.filter((item) => item !== namkeenName)
        : [...prev, namkeenName]
    );
  };

  // Submit Inquiry
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !date) {
      alert("Please fill in your Name, Phone Number, and Event Date!");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name,
        email,
        phone,
        date,
        guestsCount,
        occasion,
        packageType: selectedPkg.id,
        selectedSweets,
        selectedNamkeens,
        additionalRequirements: notes,
        estimatedPrice: calculatedPrice,
      };

      const response = await fetch("/api/catering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Catering inquiry submission failed");

      const data = await response.json();
      setSubmittedInquiry(data);
      if (onInquirySubmitted) onInquirySubmitted();
    } catch (err) {
      console.error(err);
      alert("Failed to submit inquiry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Open WhatsApp with prefilled message
  const handleWhatsAppShare = () => {
    if (!submittedInquiry) return;
    const message = `*Maheshwari Sweets Satna - Catering Inquiry*\n` +
      `-----------------------------------------\n` +
      `*Inquiry ID:* ${submittedInquiry.id}\n` +
      `*Customer Name:* ${submittedInquiry.name}\n` +
      `*Contact Phone:* ${submittedInquiry.phone}\n` +
      `*Occasion:* ${submittedInquiry.occasion}\n` +
      `*Event Date:* ${new Date(submittedInquiry.date).toLocaleDateString("en-IN")}\n` +
      `*Guest Count:* ${submittedInquiry.guestsCount} guests\n` +
      `*Selected Package:* ${selectedPkg.name}\n` +
      `*Sweets List:* ${submittedInquiry.selectedSweets.join(", ") || "Standard Package Menu"}\n` +
      `*Namkeen List:* ${submittedInquiry.selectedNamkeens.join(", ") || "Standard Package Menu"}\n` +
      `*Estimated Cost:* ₹${submittedInquiry.estimatedPrice}\n` +
      `-----------------------------------------\n` +
      `Please contact me to confirm the arrangements!`;
    
    const whatsappUrl = `https://api.whatsapp.com/send?phone=917672223456&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-600 bg-gold-100/50 px-3 py-1 rounded-full border border-gold-200">
          Corporate & Family Events
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif font-black text-maroon-900 tracking-tight">
          Royal Catering Estimator
        </h2>
        <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
          Plan the perfect dessert menu for your wedding, corporate gather, or celebration in Satna. Select a tailored catering package, customize sweet selections, and receive an instant estimation!
        </p>
      </div>

      {submittedInquiry ? (
        /* SUCCESS INQUIRY CARD */
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 sm:p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-maroon-900 via-gold-500 to-maroon-900"></div>
          
          <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 mx-auto flex items-center justify-center border border-green-200 shadow-sm">
            <CheckCircle2 size={32} />
          </div>

          <div className="space-y-2">
            <h3 className="font-serif font-black text-maroon-950 text-2xl">
              Catering Inquiry Registered!
            </h3>
            <p className="text-stone-500 text-sm">
              Inquiry ID: <strong className="text-maroon-900 font-mono">{submittedInquiry.id}</strong>
            </p>
            <p className="text-stone-600 text-xs max-w-md mx-auto leading-relaxed">
              Pranam, <strong>{submittedInquiry.name}</strong>! Your requirements have been successfully registered on our server. Our events representative will contact you on <strong>{submittedInquiry.phone}</strong> within 12 hours.
            </p>
          </div>

          {/* Quick Details Invoice Summary */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 text-left text-xs text-stone-700 max-w-md mx-auto space-y-3">
            <h4 className="font-serif font-bold text-maroon-900 text-sm border-b border-stone-150 pb-2">
              Inquiry Summary
            </h4>
            <div className="grid grid-cols-2 gap-y-1.5">
              <span className="font-medium text-stone-400">Occasion:</span>
              <span className="text-right font-bold text-stone-800">{submittedInquiry.occasion}</span>

              <span className="font-medium text-stone-400">Guests Count:</span>
              <span className="text-right font-bold text-stone-800 font-mono">{submittedInquiry.guestsCount} Guests</span>

              <span className="font-medium text-stone-400">Event Date:</span>
              <span className="text-right font-bold text-stone-800">
                {new Date(submittedInquiry.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>

              <span className="font-medium text-stone-400">Selected Package:</span>
              <span className="text-right font-bold text-stone-800 uppercase text-[10px]">{submittedInquiry.packageType}</span>

              <div className="col-span-2 border-t border-stone-150 pt-2 flex justify-between text-maroon-950 font-serif font-black text-sm">
                <span>Estimated Cost:</span>
                <span className="font-mono">₹{submittedInquiry.estimatedPrice}</span>
              </div>
            </div>
          </div>

          {/* WhatsApp / Call Options */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-4">
            <button
              onClick={() => setSubmittedInquiry(null)}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 text-xs font-bold cursor-pointer transition-colors"
            >
              Calculate Another
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Share with Shop on WhatsApp
            </button>
          </div>

        </div>
      ) : (
        /* MAIN ESTIMATOR BOARD */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* CURATED PACKAGES SELECTOR (LEFT) */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="font-serif font-black text-maroon-900 text-xl flex items-center gap-2">
              <span className="w-2.5 h-6 rounded-full bg-gold-500 block"></span>
              Step 1: Choose Curated Menu Level
            </h3>

            <div className="space-y-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPkg(pkg)}
                  className={`border-2 rounded-2xl p-5 cursor-pointer transition-all ${
                    selectedPkg.id === pkg.id
                      ? "border-maroon-600 bg-white ring-2 ring-maroon-600/10 shadow-lg"
                      : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                    <div>
                      <h4 className="font-serif font-black text-base text-maroon-950">{pkg.name}</h4>
                      <p className="text-xs text-stone-500 mt-0.5">{pkg.description}</p>
                    </div>
                    <div className="bg-maroon-50 border border-maroon-100 rounded-lg py-1 px-3.5 text-center self-start sm:self-center">
                      <span className="font-mono font-black text-maroon-900 text-lg">₹{pkg.pricePerGuest}</span>
                      <span className="text-[10px] text-stone-400 block font-bold">/ guest</span>
                    </div>
                  </div>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-stone-600 pl-4 list-disc">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="leading-tight">{feat}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* CUSTOMIZATION OPTIONS */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-5">
              <h3 className="font-serif font-bold text-maroon-900 text-base flex items-center gap-1.5 border-b border-stone-100 pb-2.5">
                <Sparkles size={16} className="text-gold-500" />
                Customize Sweet & Namkeen Preferences
              </h3>
              
              <div className="space-y-4">
                {/* Sweets Preferences */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-stone-500 uppercase tracking-wider">Preferred Sweets (Select all desired):</h4>
                  <div className="flex flex-wrap gap-2">
                    {sweetChoices.map((sweet) => {
                      const isSelected = selectedSweets.includes(sweet);
                      return (
                        <button
                          key={sweet}
                          type="button"
                          onClick={() => handleSweetToggle(sweet)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border cursor-pointer ${
                            isSelected
                              ? "bg-maroon-900 border-maroon-800 text-gold-100"
                              : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                          }`}
                        >
                          {sweet}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Namkeen Preferences */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-stone-500 uppercase tracking-wider">Preferred Snacks & Namkeen:</h4>
                  <div className="flex flex-wrap gap-2">
                    {namkeenChoices.map((namkeen) => {
                      const isSelected = selectedNamkeens.includes(namkeen);
                      return (
                        <button
                          key={namkeen}
                          type="button"
                          onClick={() => handleNamkeenToggle(namkeen)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border cursor-pointer ${
                            isSelected
                              ? "bg-maroon-900 border-maroon-800 text-gold-100"
                              : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                          }`}
                        >
                          {namkeen}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ESTIMATOR ESTIMATION FORM PANEL (RIGHT) */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            
            <h3 className="font-serif font-black text-maroon-900 text-xl flex items-center gap-2">
              <span className="w-2.5 h-6 rounded-full bg-gold-500 block"></span>
              Step 2: Enter Party Size & Details
            </h3>

            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xl space-y-5"
            >
              
              {/* Ocassion & Guests input */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 flex items-center gap-1">
                    <Users size={12} /> Guests Count
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(Math.max(50, Number(e.target.value)))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 font-bold font-mono focus:border-maroon-500 focus:outline-none"
                    required
                  />
                  <span className="text-[9px] text-stone-400 block">*Min 50 guests</span>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 flex items-center gap-1">
                    Occasion Type
                  </label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 font-bold focus:border-maroon-500 focus:outline-none"
                  >
                    <option value="Wedding">Wedding Event</option>
                    <option value="Birthday">Birthday Party</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Corporate Gifting">Corporate Event</option>
                    <option value="Festival Assortment">Festival Gathering</option>
                    <option value="Other">Other Family Party</option>
                  </select>
                </div>
              </div>

              {/* Event Date */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-500 flex items-center gap-1">
                  <Calendar size={12} /> Expected Event Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-800 font-semibold focus:border-maroon-500 focus:outline-none"
                  required
                />
              </div>

              {/* Contact Information */}
              <div className="space-y-3 border-t border-stone-100 pt-3.5">
                <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-1">Inquirer Contacts</h4>
                
                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder="Your Full Name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-800 focus:border-maroon-500 focus:outline-none font-semibold"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-800 focus:border-maroon-500 focus:outline-none font-mono font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-800 focus:border-maroon-500 focus:outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Requirements */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-500 flex items-center gap-1">
                  <FileText size={12} /> Special Instruction / Notes
                </label>
                <textarea
                  placeholder="e.g. Please arrange live hot counters, less sweet preferences, customized gift packaging boxes, etc..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-800 focus:border-maroon-500 focus:outline-none"
                />
              </div>

              {/* Instant Estimation Price Panel */}
              <div className="bg-[#FAF6EE] rounded-2xl border border-gold-200 p-4.5 flex items-center justify-between shadow-inner">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest block font-bold">Estimated Cost</span>
                  <span className="font-serif font-black text-maroon-950 text-xl">
                    ₹{calculatedPrice}
                  </span>
                  <span className="text-[9px] text-stone-400 block mt-0.5">*Includes taxes, setups & logistics</span>
                </div>
                <div className="text-right text-[10px] text-stone-500 space-y-0.5">
                  <p>Rate: ₹{selectedPkg.pricePerGuest} / head</p>
                  <p>Size: {guestsCount} guests</p>
                </div>
              </div>

              {/* Submission CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-maroon-900 hover:bg-maroon-850 text-gold-100 hover:text-white font-extrabold text-xs tracking-wider uppercase transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send size={14} />
                {isLoading ? "Submitting Inquiry..." : "Submit Catering Inquiry"}
              </button>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}
