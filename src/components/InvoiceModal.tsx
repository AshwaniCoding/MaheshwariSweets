import React, { useRef } from "react";
import { X, Printer, Download, CheckCircle, Sparkles } from "lucide-react";
import { Order } from "../types.js";

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export default function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = invoiceRef.current?.innerHTML;
    if (printContent) {
      const originalContent = document.body.innerHTML;
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice - ${order.id}</title>
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
              <style>
                body { font-family: 'Inter', sans-serif; background: white !important; padding: 20px; }
                @media print {
                  .no-print { display: none !important; }
                }
              </style>
            </head>
            <body>
              <div class="max-w-2xl mx-auto border-2 border-stone-200 p-8 rounded-lg">
                ${printContent}
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Options */}
        <div className="bg-stone-50 border-b border-stone-150 py-3.5 px-6 flex justify-between items-center no-print">
          <div className="flex items-center gap-1.5 text-maroon-900 font-serif font-bold text-sm">
            <CheckCircle size={16} className="text-green-600" />
            Order Invoice Generated
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-maroon-900 text-gold-100 hover:bg-maroon-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer size={13} />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-700 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div ref={invoiceRef} className="p-6 sm:p-8 space-y-6 text-stone-800 bg-[#FCFAF6] relative print:bg-white print:p-0">
          
          {/* Saffron Border Strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-maroon-900 via-gold-500 to-maroon-900"></div>

          {/* Shop Header Details */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-gold-200/50 pb-5 pt-2">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-maroon-900 flex items-center justify-center text-gold-400 font-serif font-extrabold text-sm">
                  M
                </div>
                <h2 className="text-maroon-900 text-2xl font-serif font-black tracking-tight leading-none">
                  Maheshwari Sweets
                </h2>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-stone-500 font-bold mt-1.5 pl-0.5">
                Authentic Mithai & Catering Services
              </p>
              <p className="text-[11px] text-stone-600 mt-1 pl-0.5 leading-relaxed max-w-xs">
                Station Road, Near Railway Station,<br />
                Satna, Madhya Pradesh, 485001<br />
                Phone: +91 7672 223456 | GSTIN: 23AABCM8828M1Z0
              </p>
            </div>
            <div className="sm:text-right">
              <span className="inline-block bg-maroon-900/10 text-maroon-900 font-bold px-3 py-1 rounded-full text-xs border border-maroon-900/20 mb-2">
                TAX INVOICE
              </span>
              <p className="text-xs text-stone-500">Invoice Number:</p>
              <p className="text-sm font-bold text-maroon-950 font-mono tracking-wide">{order.id}</p>
              <p className="text-xs text-stone-500 mt-1">Date & Time:</p>
              <p className="text-xs font-semibold text-stone-700">
                {new Date(order.createdAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Customer & Delivery Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-stone-150 pb-5">
            <div>
              <h4 className="font-serif font-bold text-stone-500 tracking-wider uppercase mb-2">
                Billed To:
              </h4>
              <p className="text-sm font-black text-maroon-950">{order.customerName}</p>
              <p className="text-stone-600 font-medium mt-1">📞 {order.customerPhone}</p>
              {order.customerEmail && (
                <p className="text-stone-500 font-medium break-all mt-0.5">{order.customerEmail}</p>
              )}
            </div>
            <div>
              <h4 className="font-serif font-bold text-stone-500 tracking-wider uppercase mb-2">
                Delivery Details:
              </h4>
              <p className="font-bold text-stone-700">
                Method: {order.deliveryMethod === "delivery" ? "🚀 Satna Home Delivery" : "🏪 Self Store Pickup"}
              </p>
              <p className="font-bold text-stone-700 mt-0.5">
                Payment: {order.paymentMethod === "cod" ? "💵 Cash on Delivery" : "💳 Online UPI/Card (Paid)"}
              </p>
              {order.deliveryMethod === "delivery" && order.address && (
                <div className="text-stone-600 mt-1 bg-stone-50 p-2 rounded border border-stone-100">
                  <p>{order.address.street}</p>
                  <p>Satna, MP - {order.address.pincode}</p>
                  {order.address.landmark && (
                    <p className="text-[10px] text-stone-400 italic">Landmark: {order.address.landmark}</p>
                  )}
                </div>
              )}
              {order.deliveryMethod === "pickup" && (
                <p className="text-stone-500 mt-1 bg-gold-50/50 p-2 rounded border border-gold-200 text-[11px]">
                  Please pick up your order from our Station Road outlet. Freshly prepared and packed.
                </p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-xs text-stone-500 tracking-wider uppercase">
              Ordered Items
            </h4>
            <div className="border border-stone-200 rounded-lg overflow-hidden bg-white">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-150 text-stone-600 font-semibold">
                    <th className="py-2.5 px-4">Item Details</th>
                    <th className="py-2.5 px-4 text-center">Unit</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="text-stone-700 font-medium">
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">{item.product.name}</div>
                        <div className="text-[10px] text-stone-400 italic line-clamp-1">{item.product.category}</div>
                      </td>
                      <td className="py-3 px-4 text-center">{item.selectedUnit}</td>
                      <td className="py-3 px-4 text-center font-mono">{item.quantity}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-stretch gap-6 pt-2">
            <div className="text-xs text-stone-500 max-w-xs flex-1">
              <h5 className="font-bold text-stone-700 mb-1">Important Notes & Instructions:</h5>
              <ul className="list-disc list-inside space-y-1 text-[10px] text-stone-400">
                <li>Please consume fresh or store in clean refrigerator.</li>
                <li>Milk-based items have an immediate shelf life of 24-48 hours.</li>
                <li>No preservatives added to maintain authentic taste.</li>
                <li>For catering inquiries or wedding hampers, visit maheshwarisweetssatna.com or call +91 7672 223456.</li>
              </ul>
            </div>
            
            <div className="w-full sm:w-64 bg-stone-50 rounded-xl p-4 space-y-2 border border-stone-150 text-xs text-stone-700 self-end">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono font-bold">₹{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-700 font-semibold">
                  <span>Coupon Discount ({order.couponCode}):</span>
                  <span className="font-mono">-₹{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-500 text-[11px]">
                <span>GST (5%):</span>
                <span className="font-mono">₹{order.tax}</span>
              </div>
              <div className="flex justify-between text-stone-500 text-[11px]">
                <span>Delivery Charge:</span>
                <span className="font-mono">
                  {order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}
                </span>
              </div>
              <div className="border-t border-stone-200 pt-2 flex justify-between text-maroon-950 font-serif font-black text-sm">
                <span>Grand Total:</span>
                <span className="font-mono text-base">₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Shop Sign-Off & Stamp */}
          <div className="border-t border-gold-200/50 pt-5 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-400 gap-4">
            <p className="flex items-center gap-1">
              <Sparkles size={11} className="text-gold-500 animate-spin" />
              Thank you for ordering with Maheshwari Sweets Satna!
            </p>
            <div className="text-center sm:text-right">
              <p className="text-[10px] tracking-wider uppercase font-bold text-stone-500 mb-6">
                Authorized Signature
              </p>
              <div className="font-serif italic font-semibold text-maroon-800 text-sm border-b border-stone-200 pb-1">
                Maheshwari Sweets
              </div>
              <p className="text-[9px] text-stone-400 mt-1">Computer Generated Receipt</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
