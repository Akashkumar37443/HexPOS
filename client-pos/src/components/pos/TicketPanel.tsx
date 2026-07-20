import React, { useState } from 'react';
import { CreditCard, Trash2, Edit3, ShieldAlert, Award } from 'lucide-react';

export interface TicketItem {
  id: string;
  variantId: string;
  name: string;
  price: number;
  quantity: number;
  seatNumber: number;
  specialInstructions?: string;
  modifiers?: string[];
  status: 'ordered' | 'fired' | 'served' | 'voided';
  voidReason?: string;
}

interface TicketPanelProps {
  items: TicketItem[];
  tableNumber?: number;
  onUpdateItemStatus: (id: string, status: TicketItem['status'], voidReason?: string) => void;
  onUpdateSeat: (id: string, seat: number) => void;
  onCheckout: (paymentMethod: string, serviceChargePct: number) => void;
}

export const TicketPanel: React.FC<TicketPanelProps> = ({
  items,
  tableNumber,
  onUpdateItemStatus,
  onUpdateSeat,
  onCheckout
}) => {
  const [activeSeatFilter, setActiveSeatFilter] = useState<number | 'all'>('all');
  const [serviceCharge, setServiceCharge] = useState<number>(18); // Default 18%
  const [showVoidModalItemId, setShowVoidModalItemId] = useState<string | null>(null);
  const [selectedVoidReason, setSelectedVoidReason] = useState<string>('Customer Changed Mind');

  const voidReasons = ['Customer Changed Mind', 'Kitchen Error', 'Server Entry Error', 'Quality Issue'];

  // Active items (not voided)
  const activeItems = items.filter(item => item.status !== 'voided');

  // Filtered items based on seat selection
  const filteredItems = activeSeatFilter === 'all' 
    ? activeItems 
    : activeItems.filter(item => item.seatNumber === activeSeatFilter);

  // Totals calculations
  const subtotal = activeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = 0.085; // 8.5% State & Local Tax
  const tax = subtotal * taxRate;
  const serviceChargeAmount = subtotal * (serviceCharge / 100);
  const total = subtotal + tax + serviceChargeAmount;

  // Distinct seat list
  const seats = Array.from(new Set(activeItems.map(item => item.seatNumber))).sort((a, b) => a - b);

  const handleVoidClick = (itemId: string) => {
    setShowVoidModalItemId(itemId);
  };

  const handleConfirmVoid = () => {
    if (showVoidModalItemId) {
      onUpdateItemStatus(showVoidModalItemId, 'voided', selectedVoidReason);
      setShowVoidModalItemId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121829] select-none text-white border-l border-[#1f2942]">
      {/* Panel Header */}
      <div className="p-6 border-b border-[#1f2942] bg-[#171e35] flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black">Active Ticket</h3>
          {tableNumber && <p className="text-sm text-slate-400">Table #{tableNumber}</p>}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveSeatFilter('all')}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold uppercase transition-all cursor-pointer ${
              activeSeatFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-[#253250] text-slate-400'
            }`}
          >
            All Seats
          </button>
          {seats.map(seat => (
            <button
              key={seat}
              onClick={() => setActiveSeatFilter(seat)}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold uppercase transition-all cursor-pointer ${
                activeSeatFilter === seat ? 'bg-blue-600 text-white' : 'bg-[#253250] text-slate-400'
              }`}
            >
              Seat {seat}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket Line Items List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {filteredItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
            <span className="text-lg font-bold">Ticket is empty</span>
            <p className="text-sm">Select items from the menu to add them</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div key={item.id} className="p-4 rounded-xl bg-[#1a2138] border border-[#253250] flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded font-black uppercase">
                      Seat {item.seatNumber}
                    </span>
                    <span className={`text-[10px] border px-2 py-0.5 rounded font-black uppercase ${
                      item.status === 'fired' ? 'bg-amber-950/80 border-amber-800 text-amber-400' :
                      item.status === 'served' ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400' :
                      'bg-slate-900 border-slate-800 text-slate-500'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <h4 className="text-md font-bold mt-1 text-white line-clamp-1">{item.name}</h4>
                  {item.modifiers && item.modifiers.length > 0 && (
                    <p className="text-xs text-blue-400 mt-1 font-semibold">
                      + {item.modifiers.join(', ')}
                    </p>
                  )}
                  {item.specialInstructions && (
                    <p className="text-xs text-rose-400 italic mt-1 font-semibold">
                      * NOTE: {item.specialInstructions}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-md font-black text-white">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.quantity} x ${item.price.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Action row per line item */}
              <div className="flex gap-2 border-t border-[#253250]/50 pt-2 mt-1">
                {item.status === 'ordered' && (
                  <button
                    onClick={() => onUpdateItemStatus(item.id, 'fired')}
                    className="flex-1 h-9 bg-amber-950/80 hover:bg-amber-900 border border-amber-800/50 text-amber-400 rounded-lg text-xs font-extrabold uppercase transition-colors cursor-pointer"
                  >
                    Fire
                  </button>
                )}
                {item.status === 'fired' && (
                  <button
                    onClick={() => onUpdateItemStatus(item.id, 'served')}
                    className="flex-1 h-9 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/50 text-emerald-400 rounded-lg text-xs font-extrabold uppercase transition-colors cursor-pointer"
                  >
                    Serve
                  </button>
                )}
                <button
                  onClick={() => onUpdateSeat(item.id, item.seatNumber === 1 ? 2 : 1)}
                  className="px-3 h-9 bg-[#253250] hover:bg-[#2d3d62] text-slate-300 rounded-lg text-xs font-extrabold transition-colors cursor-pointer"
                >
                  Move Seat
                </button>
                <button
                  onClick={() => handleVoidClick(item.id)}
                  className="px-3 h-9 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/50 text-rose-400 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bill & Totals Section */}
      <div className="p-6 border-t border-[#1f2942] bg-[#171e35] space-y-4">
        {/* Service Charge Slider / Quick Buttons */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-400">
            <span>Service Charge / Gratuity</span>
            <span className="text-white font-bold">{serviceCharge}%</span>
          </div>
          <div className="flex gap-2">
            {[0, 18, 20, 22].map(pct => (
              <button
                key={pct}
                onClick={() => setServiceCharge(pct)}
                className={`flex-1 h-10 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  serviceCharge === pct
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-[#253250] text-slate-400 hover:text-slate-200'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Details */}
        <div className="space-y-1.5 text-sm font-semibold border-b border-[#253250] pb-4">
          <div className="flex justify-between">
            <span className="text-slate-400">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Tax (8.5%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Service Charge</span>
            <span>${serviceChargeAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Big Balance Due */}
        <div className="flex justify-between items-baseline pt-2">
          <span className="text-lg font-black uppercase text-slate-400">Total Balance</span>
          <span className="text-3xl font-black text-white">${total.toFixed(2)}</span>
        </div>

        {/* Checkout Button */}
        <button
          disabled={activeItems.length === 0}
          onClick={() => onCheckout('Card', serviceCharge)}
          className={`w-full min-h-[64px] rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all cursor-pointer ${
            activeItems.length === 0
              ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-650/20'
          }`}
        >
          <CreditCard className="w-6 h-6" />
          Process Payment
        </button>
      </div>

      {/* Void Confirmation Modal */}
      {showVoidModalItemId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/75 z-[60] p-4">
          <div className="bg-[#121829] border border-[#1f2942] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#1f2942] bg-[#171e35] flex justify-between items-center">
              <h3 className="text-2xl font-extrabold text-white">Select Void Reason</h3>
              <button
                onClick={() => setShowVoidModalItemId(null)}
                className="text-slate-400 hover:text-white text-3xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                {voidReasons.map(reason => (
                  <button
                    key={reason}
                    onClick={() => setSelectedVoidReason(reason)}
                    className={`w-full min-h-[56px] px-4 rounded-xl border-2 font-bold flex justify-between items-center transition-all cursor-pointer ${
                      selectedVoidReason === reason
                        ? 'bg-rose-950/40 border-rose-500 text-rose-400'
                        : 'bg-[#1a2138] border-[#253250] text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{reason}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setShowVoidModalItemId(null)}
                  className="flex-1 min-h-[56px] bg-[#1e273e] hover:bg-[#253250] text-slate-300 rounded-xl font-bold transition-colors cursor-pointer border border-[#2d3a5a]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmVoid}
                  className="flex-1 min-h-[56px] bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Confirm Void
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
