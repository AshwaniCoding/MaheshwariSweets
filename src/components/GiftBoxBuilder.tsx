import React, { useState } from "react";
import { Sparkles, Trash2, ShoppingCart, HelpCircle, Gift, Check } from "lucide-react";
import { Product } from "../types.ts";

interface GiftBoxBuilderProps {
  onAddBoxToCart: (boxDetails: {
    name: string;
    description: string;
    price: number;
    image: string;
    quantity: number;
  }) => void;
}

interface BoxSize {
  id: string;
  name: string;
  capacityGrams: number;
  slots: number;
  price: number;
}

interface PackagingType {
  id: string;
  name: string;
  price: number;
  description: string;
  color: string;
}

interface BuilderSweet {
  id: string;
  name: string;
  weightPerPc: number;
  pricePerPc: number;
  image: string;
}

export default function GiftBoxBuilder({ onAddBoxToCart }: GiftBoxBuilderProps) {
  const boxSizes: BoxSize[] = [
    { id: "sm", name: "Imperial Small Box", capacityGrams: 250, slots: 4, price: 50 },
    { id: "md", name: "Royal Medium Box", capacityGrams: 500, slots: 8, price: 90 },
    { id: "lg", name: "Maharaja Large Box", capacityGrams: 1000, slots: 16, price: 150 },
  ];

  const packagingTypes: PackagingType[] = [
    { id: "gold", name: "Royal Gold Velvet", price: 0, description: "Classic gold-foiled premium card wrapper with traditional designs.", color: "bg-amber-100 border-amber-400 text-amber-900" },
    { id: "maroon", name: "Festive Maroon Silk", price: 60, description: "Luxurious handcrafted fabric-bound rigid box with elegant golden tassels.", color: "bg-rose-50 border-maroon-300 text-maroon-900" },
    { id: "emerald", name: "Emperor Emerald Brocade", price: 95, description: "Exclusive textured brocade royal box featuring majestic peacock motifs.", color: "bg-teal-50 border-emerald-400 text-emerald-950" },
  ];

  const packableSweets: BuilderSweet[] = [
    { id: "kk", name: "Premium Kaju Katli", weightPerPc: 25, pricePerPc: 25, image: "https://images.unsplash.com/photo-1605197585662-7935b0b2e84f?auto=format&fit=crop&q=80&w=150" },
    { id: "db", name: "Dry Fruit Bites", weightPerPc: 25, pricePerPc: 35, image: "https://images.unsplash.com/photo-1505575967455-40e256f7377c?auto=format&fit=crop&q=80&w=150" },
    { id: "mc", name: "Desi Ghee Milk Cake", weightPerPc: 30, pricePerPc: 22, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=150" },
    { id: "ml", name: "Motichoor Laddoo", weightPerPc: 40, pricePerPc: 26, image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&q=80&w=150" },
    { id: "kpr", name: "Kaju Pista Roll", weightPerPc: 25, pricePerPc: 32, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=150" },
    { id: "rg", name: "Sponge Rasgulla (Dry)", weightPerPc: 30, pricePerPc: 20, image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&q=80&w=150" }
  ];

  // Selected State variables
  const [selectedSize, setSelectedSize] = useState<BoxSize>(boxSizes[1]); // defaults to medium (500g)
  const [selectedPkg, setSelectedPkg] = useState<PackagingType>(packagingTypes[0]); // defaults to gold velvet
  const [packedItems, setPackedItems] = useState<BuilderSweet[]>([]);
  const [successMsg, setSuccessMsg] = useState(false);

  // Capacity calculations
  const totalWeight = packedItems.reduce((sum, item) => sum + item.weightPerPc, 0);
  const totalSweetsPrice = packedItems.reduce((sum, item) => sum + item.pricePerPc, 0);
  const boxTotalPrice = selectedSize.price + selectedPkg.price + totalSweetsPrice;

  // Handles adding item to slots
  const handleAddItem = (sweet: BuilderSweet) => {
    if (packedItems.length >= selectedSize.slots) {
      alert(`Your ${selectedSize.name} is fully packed! To add more sweets, please upgrade to a larger box size.`);
      return;
    }
    setPackedItems((prev) => [...prev, sweet]);
  };

  // Handles removing item from slots
  const handleRemoveItem = (index: number) => {
    setPackedItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Handles clearing box
  const handleClearBox = () => {
    setPackedItems([]);
  };

  // Handles changing box size (caps items if capacity reduces)
  const handleSizeChange = (newSize: BoxSize) => {
    setSelectedSize(newSize);
    if (packedItems.length > newSize.slots) {
      setPackedItems((prev) => prev.slice(0, newSize.slots));
    }
  };

  // Handles adding box to main shopping cart
  const handleAddToCart = () => {
    if (packedItems.length === 0) {
      alert("Please add at least one sweet to pack your box before adding to cart!");
      return;
    }

    // Generate unique summarized item names list
    const summaryMap: { [key: string]: number } = {};
    packedItems.forEach((item) => {
      summaryMap[item.name] = (summaryMap[item.name] || 0) + 1;
    });
    const sweetSummary = Object.entries(summaryMap)
      .map(([name, count]) => `${count}x ${name}`)
      .join(", ");

    const boxDetails = {
      name: `Custom Sweet Box (${selectedSize.name})`,
      description: `Premium box in ${selectedPkg.name} wrapper. Packed with: ${sweetSummary}. (Approx: ${totalWeight}g)`,
      price: boxTotalPrice,
      image: "https://images.unsplash.com/photo-1505575967455-40e256f7377c?auto=format&fit=crop&q=80&w=300",
      quantity: 1,
    };

    onAddBoxToCart(boxDetails);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
    handleClearBox();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Page Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-600 bg-gold-100/50 px-3 py-1 rounded-full border border-gold-200">
          Exclusive Royal Experience
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif font-black text-maroon-900 tracking-tight">
          Custom Gifting Box Builder
        </h2>
        <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
          Design your perfect customized sweet box. Hand-select your premium box size, choose royal fabric wrapping, and fill each slot with Satna's finest sweets!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Step 1 & 2: Controls Panel (Left) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Step 1: Select Box Size */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-maroon-900 text-lg flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-maroon-100 text-maroon-900 text-xs font-bold flex items-center justify-center">1</span>
              Select Box Dimension
            </h3>
            <div className="space-y-3">
              {boxSizes.map((size) => (
                <div
                  key={size.id}
                  onClick={() => handleSizeChange(size)}
                  className={`border rounded-xl p-3.5 flex justify-between items-center cursor-pointer transition-all ${
                    selectedSize.id === size.id
                      ? "border-maroon-500 bg-maroon-50/50 ring-1 ring-maroon-500"
                      : "border-stone-200 hover:border-stone-300 bg-white"
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">{size.name}</h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Holds up to {size.slots} sweets (approx. {size.capacityGrams}g)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold font-mono text-sm text-maroon-900">₹{size.price}</span>
                    <p className="text-[10px] text-stone-400">box base</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Select Packaging Luxury */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-maroon-900 text-lg flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-maroon-100 text-maroon-900 text-xs font-bold flex items-center justify-center">2</span>
              Choose Royal Wrapping
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {packagingTypes.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPkg(pkg)}
                  className={`border-2 rounded-xl p-3.5 cursor-pointer transition-all ${
                    selectedPkg.id === pkg.id
                      ? "border-gold-500 bg-gold-50/20 ring-1 ring-gold-500"
                      : "border-stone-200 hover:border-stone-300 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2 items-center">
                      <span className={`w-3 h-3 rounded-full border border-stone-300 block ${pkg.color.split(" ")[0]}`}></span>
                      <h4 className="font-bold text-sm text-stone-900">{pkg.name}</h4>
                    </div>
                    <span className="font-bold font-mono text-xs text-maroon-900">
                      {pkg.price === 0 ? "FREE" : `+₹${pkg.price}`}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 pl-5 leading-normal">{pkg.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: Available Sweets Grid */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-maroon-900 text-lg flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-maroon-100 text-maroon-900 text-xs font-bold flex items-center justify-center">3</span>
              Pack Sweets into Box
            </h3>
            <p className="text-[11px] text-stone-400 leading-tight">
              Click any premium sweet below to add it to your box. Each piece adds to your weight.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {packableSweets.map((sweet) => (
                <div
                  key={sweet.id}
                  onClick={() => handleAddItem(sweet)}
                  className="border border-stone-150 rounded-xl p-2.5 flex items-center gap-2.5 hover:border-maroon-500 hover:bg-stone-50 cursor-pointer transition-all active:scale-95 shadow-sm"
                >
                  <img
                    src={sweet.image}
                    alt={sweet.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-stone-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-[11px] text-stone-800 line-clamp-1 leading-tight">{sweet.name}</h4>
                    <p className="text-[10px] text-stone-400 font-mono mt-0.5">₹{sweet.pricePerPc} ({sweet.weightPerPc}g)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Visualizer and Checkout Panel (Right) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          
          {/* Main Visual Box Area */}
          <div className="bg-[#FAF6EE] rounded-3xl border-2 border-dashed border-gold-300 p-6 sm:p-8 flex flex-col justify-between items-center flex-1 shadow-inner relative overflow-hidden">
            
            {/* Visual corner decorations */}
            <div className="absolute top-2 left-2 text-gold-500 font-serif text-lg">✦</div>
            <div className="absolute top-2 right-2 text-gold-500 font-serif text-lg">✦</div>
            <div className="absolute bottom-2 left-2 text-gold-500 font-serif text-lg">✦</div>
            <div className="absolute bottom-2 right-2 text-gold-500 font-serif text-lg">✦</div>

            {/* Box Header inside visualizer */}
            <div className="text-center space-y-1 mb-6">
              <span className="text-[11px] uppercase tracking-widest text-stone-400 font-bold">Live Visual Presentation</span>
              <h4 className="font-serif font-black text-maroon-900 text-lg">
                Your Luxury Gifting Box
              </h4>
              <p className="text-stone-500 text-xs">
                Theme: <strong className="text-maroon-700">{selectedPkg.name}</strong> • Holds {selectedSize.slots} sweets
              </p>
            </div>

            {/* Simulated Sweet Box Grid Container */}
            <div className="bg-white rounded-2xl p-5 border border-gold-200 shadow-lg max-w-md w-full relative">
              
              {/* Wrapping Border styling representing chosen package */}
              <div className={`absolute inset-0 border-4 rounded-2xl pointer-events-none opacity-80 ${
                selectedPkg.id === "maroon" ? "border-maroon-900" : selectedPkg.id === "emerald" ? "border-emerald-800" : "border-gold-500"
              }`}></div>
              
              <div className={`grid gap-4.5 p-2 ${
                selectedSize.id === "sm" ? "grid-cols-2" : selectedSize.id === "md" ? "grid-cols-4" : "grid-cols-4"
              }`}>
                {Array.from({ length: selectedSize.slots }).map((_, index) => {
                  const item = packedItems[index];
                  return (
                    <div
                      key={index}
                      className="aspect-square rounded-xl relative flex flex-col justify-center items-center group transition-all"
                    >
                      {item ? (
                        /* Packed Sweet Item visual slot */
                        <div className="relative w-full h-full rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-center items-center p-1 cursor-pointer hover:border-red-500 hover:bg-red-50 transition-colors">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-sm border border-stone-200"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-[9px] text-stone-700 font-bold font-serif line-clamp-1 mt-1 text-center max-w-[90%]">
                            {item.name.replace("Premium ", "").replace("Special ", "")}
                          </span>
                          
                          {/* Remove overlay indicator */}
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveItem(index);
                            }}
                            className="absolute inset-0 bg-red-900/80 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity text-xs font-bold"
                          >
                            <Trash2 size={14} />
                          </div>
                        </div>
                      ) : (
                        /* Empty Slot representation */
                        <div className="w-full h-full rounded-xl border-2 border-dashed border-stone-200 flex items-center justify-center text-stone-300 bg-stone-50/50">
                          <span className="text-xl font-bold">+</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Box Stats Summary (Weight Bar) */}
            <div className="w-full max-w-md mt-6 space-y-2">
              <div className="flex justify-between text-xs font-bold text-stone-600">
                <span>Box Capacity:</span>
                <span>{packedItems.length} / {selectedSize.slots} Pieces Packed</span>
              </div>
              <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-maroon-900 rounded-full transition-all duration-300"
                  style={{ width: `${(packedItems.length / selectedSize.slots) * 100}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-stone-400 text-center">
                Total weight approx: {totalWeight}g
              </p>
            </div>

          </div>

          {/* Pricing Details card & Action buttons */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
            <h4 className="font-serif font-black text-stone-800 text-sm tracking-wider uppercase border-b border-stone-100 pb-2.5">
              Price Breakdown
            </h4>
            
            <div className="grid grid-cols-2 gap-y-2 text-xs text-stone-600">
              <span>{selectedSize.name} Base:</span>
              <span className="text-right font-mono font-bold text-stone-900">₹{selectedSize.price}</span>
              
              <span>Wrap Upgrade ({selectedPkg.name}):</span>
              <span className="text-right font-mono font-bold text-stone-900">₹{selectedPkg.price}</span>
              
              <span>Sweets Content ({packedItems.length} items):</span>
              <span className="text-right font-mono font-bold text-stone-900">₹{totalSweetsPrice}</span>
              
              <div className="col-span-2 border-t border-stone-100 pt-2.5 flex justify-between text-sm text-maroon-950 font-serif font-black">
                <span>Total Box Price:</span>
                <span className="text-base font-mono">₹{boxTotalPrice}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                disabled={packedItems.length === 0}
                onClick={handleClearBox}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50 hover:text-stone-800 text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
              >
                Reset Box
              </button>
              
              <button
                onClick={handleAddToCart}
                disabled={packedItems.length === 0}
                className="flex-1 py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-maroon-950 font-extrabold text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Gift size={15} />
                Add Customized Box to Cart • ₹{boxTotalPrice}
              </button>
            </div>

            {successMsg && (
              <div className="p-3 bg-green-50 rounded-xl text-green-700 text-xs font-bold border border-green-200 flex items-center gap-2 animate-bounce">
                <Check size={14} />
                Congratulations! Your beautiful customized box has been added to the shopping cart.
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
