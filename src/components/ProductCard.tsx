import React from "react";
import { Star, ShieldAlert, Sparkles, Check, Heart } from "lucide-react";
import { Product } from "../types.ts";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number, unit: string) => void;
  onViewDetails?: (product: Product) => void;
  isWishlisted?: boolean;
  onWishlistToggle?: (product: Product) => void;
  key?: React.Key;
}

export default function ProductCard({
  product,
  onAddToCart,
  onViewDetails,
  isWishlisted = false,
  onWishlistToggle,
}: ProductCardProps) {
  const [quantity, setQuantity] = React.useState<number>(1);
  const [selectedUnit, setSelectedUnit] = React.useState<string>(product.unit);
  const [isAdded, setIsAdded] = React.useState<boolean>(false);

  // Dynamic pricing calculation helper based on unit sizes
  const getCalculatedPrice = () => {
    if (selectedUnit === product.unit) {
      return product.price;
    }
    // Simple proportional scaling for weights if available
    const baseMatch = product.unit.match(/(\d+)\s*(g|kg)/i);
    const selectedMatch = selectedUnit.match(/(\d+)\s*(g|kg)/i);
    
    if (baseMatch && selectedMatch) {
      const baseVal = parseFloat(baseMatch[1]) * (baseMatch[2].toLowerCase() === "kg" ? 1000 : 1);
      const selVal = parseFloat(selectedMatch[1]) * (selectedMatch[2].toLowerCase() === "kg" ? 1000 : 1);
      return Math.round((product.price / baseVal) * selVal);
    }
    return product.price;
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedUnit);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const currentPrice = getCalculatedPrice();

  // Generate weights selections
  const getWeightOptions = () => {
    if (product.unit.includes("g") || product.unit.includes("kg")) {
      return ["250g", "500g", "1kg"];
    }
    if (product.unit.includes("pc")) {
      return ["2 pcs", "5 pcs", "10 pcs"];
    }
    return [product.unit];
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-150 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative group">
      
      {/* Absolute Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {/* Vegetarian Badge */}
        {product.isVeg && (
          <span className="flex items-center gap-1.5 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full border border-green-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-600 block"></span>
            100% Veg
          </span>
        )}
        
        {/* Freshly Made Today Badge */}
        {product.isFreshlyMadeToday && (
          <span className="flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-200 shadow-sm">
            <Sparkles size={11} className="text-amber-500" />
            Fresh Today
          </span>
        )}
      </div>

      {product.isBestSeller && (
        <span className="absolute top-3 right-3 z-10 bg-maroon-800 text-gold-200 text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full border border-gold-400/50 shadow-md">
          Bestseller
        </span>
      )}

      {/* Product Image Area */}
      <div 
        onClick={() => onViewDetails?.(product)}
        className="w-full h-48 bg-stone-100 relative overflow-hidden cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        
        {/* Heart Wishlist Overlay Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onWishlistToggle?.(product);
          }}
          className="absolute bottom-3 right-3 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-rose-600 shadow-md transition-all scale-100 active:scale-90 hover:scale-110 cursor-pointer"
          title="Save to Wishlist"
        >
          <Heart size={15} className="transition-transform duration-200" fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Content & Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Rating and Reviews */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="flex text-amber-500">
            <Star size={13} fill="currentColor" />
          </div>
          <span className="text-xs font-bold text-stone-700">{product.rating}</span>
          <span className="text-xs text-stone-400">({product.reviewsCount} reviews)</span>
        </div>

        {/* Title */}
        <h3 
          onClick={() => onViewDetails?.(product)}
          className="font-serif font-bold text-lg text-maroon-900 group-hover:text-maroon-700 transition-colors cursor-pointer line-clamp-1 mb-1"
        >
          {product.name}
        </h3>

        {/* Short description */}
        <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>

        {/* Ingredients & Shelf life highlights */}
        <div className="bg-stone-50 rounded-lg p-2.5 space-y-1 text-[11px] text-stone-600 mb-4 border border-stone-100">
          <div>
            <span className="font-semibold text-stone-700">Shelf Life:</span> {product.shelfLife}
          </div>
          {product.ingredients && product.ingredients.length > 0 && (
            <div className="line-clamp-1">
              <span className="font-semibold text-stone-700">Ingredients:</span> {product.ingredients.slice(0, 3).join(", ")}
            </div>
          )}
        </div>

        {/* Action Controls Panel */}
        <div className="space-y-3">
          {/* Unit selection options */}
          {getWeightOptions().length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-stone-500">Size:</span>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {getWeightOptions().map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSelectedUnit(opt);
                      setQuantity(1);
                    }}
                    className={`px-2 py-1 text-[11px] font-bold rounded border transition-colors cursor-pointer ${
                      selectedUnit === opt
                        ? "bg-maroon-900 border-maroon-800 text-gold-100"
                        : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pricing & Cart Controls */}
          <div className="flex items-center justify-between pt-1.5 border-t border-stone-100">
            <div>
              <span className="text-xl font-black text-maroon-950 font-mono">
                ₹{currentPrice}
              </span>
              <span className="text-xs text-stone-400 font-medium ml-1">
                / {selectedUnit}
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
              <button
                disabled={quantity <= 1}
                onClick={() => setQuantity(quantity - 1)}
                className="px-2 py-1 text-stone-500 font-bold hover:text-maroon-900 disabled:opacity-40 cursor-pointer"
              >
                -
              </button>
              <span className="px-2 text-xs font-bold text-stone-800 w-6 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-2 py-1 text-stone-500 font-bold hover:text-maroon-900 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md ${
              isAdded
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-maroon-900 hover:bg-maroon-800 text-gold-100 hover:text-white"
            }`}
          >
            {isAdded ? (
              <>
                <Check size={14} />
                Added to Cart
              </>
            ) : (
              <>
                Add to Cart • ₹{currentPrice * quantity}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
