import React, { useState } from 'react';
import { FloorMap, type TableState, type TableStatus } from '../../components/pos/FloorMap.js';
import { MenuOrderGrid, type MenuItem, type ModifierOption } from '../../components/pos/MenuOrderGrid.js';
import { TicketPanel, type TicketItem } from '../../components/pos/TicketPanel.js';
import { KDSBoard } from '../../components/kds/KDSBoard.js';
import { Utensils, MonitorPlay, ChevronLeft, CreditCard, LogOut } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../context/AuthContext.js';
import { useNavigate } from 'react-router-dom';

export const POSView = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'pos' | 'kds' | 'menu'>('pos');
  const [selectedTable, setSelectedTable] = useState<TableState | null>(null);
  
  // Stores active tickets by Table ID
  const [tableTickets, setTableTickets] = useState<Record<string, TicketItem[]>>({
    't1': [
      { id: 'ti1', variantId: 'v1', name: 'Classic Caesar Salad', price: 12.99, quantity: 1, seatNumber: 1, status: 'served' },
      { id: 'ti2', variantId: 'v2', name: 'Draft Craft IPA Beer', price: 7.50, quantity: 2, seatNumber: 2, status: 'fired' }
    ],
    't2': [
      { id: 'ti3', variantId: 'v3', name: 'Signature Wagyu Burger', price: 18.99, quantity: 2, seatNumber: 1, modifiers: ['Medium Rare', 'Applewood Bacon'], status: 'ordered' }
    ]
  });

  const [checkoutReceipt, setCheckoutReceipt] = useState<{
    total: number;
    paymentMethod: string;
    tableNumber: number;
  } | null>(null);

  const handleTableSelect = (table: TableState) => {
    setSelectedTable(table);
  };

  const handleAddItem = (item: MenuItem, selectedMods: ModifierOption[], specialInstructions: string) => {
    if (!selectedTable) return;

    const tableId = selectedTable.id;
    const additionalPrice = selectedMods.reduce((sum, o) => sum + o.price, 0);
    const itemPrice = item.price + additionalPrice;
    const modNames = selectedMods.map(m => m.name);

    const newItem: TicketItem = {
      id: uuidv4(),
      variantId: item.id,
      name: item.name,
      price: itemPrice,
      quantity: 1,
      seatNumber: 1,
      status: 'ordered'
    };

    if (modNames.length > 0) {
      newItem.modifiers = modNames;
    }
    if (specialInstructions) {
      newItem.specialInstructions = specialInstructions;
    }

    setTableTickets(prev => {
      const currentTicket = prev[tableId] || [];
      return {
        ...prev,
        [tableId]: [...currentTicket, newItem]
      };
    });
  };

  const handleUpdateItemStatus = (itemId: string, status: TicketItem['status'], voidReason?: string) => {
    if (!selectedTable) return;

    setTableTickets(prev => {
      const currentTicket = prev[selectedTable.id] || [];
      return {
        ...prev,
        [selectedTable.id]: currentTicket.map(item => {
          if (item.id === itemId) {
            const updatedItem = { ...item, status };
            if (voidReason) {
              updatedItem.voidReason = voidReason;
            } else {
              delete updatedItem.voidReason;
            }
            return updatedItem;
          }
          return item;
        })
      };
    });
  };

  const handleUpdateSeat = (itemId: string, seatNumber: number) => {
    if (!selectedTable) return;

    setTableTickets(prev => {
      const currentTicket = prev[selectedTable.id] || [];
      return {
        ...prev,
        [selectedTable.id]: currentTicket.map(item => {
          if (item.id === itemId) {
            return { ...item, seatNumber };
          }
          return item;
        })
      };
    });
  };

  const handleCheckout = (paymentMethod: string, serviceChargePct: number) => {
    if (!selectedTable) return;

    const tableId = selectedTable.id;
    const ticketItems = tableTickets[tableId] || [];
    const activeItems = ticketItems.filter(item => item.status !== 'voided');

    const subtotal = activeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.085;
    const serviceCharge = subtotal * (serviceChargePct / 100);
    const totalAmount = subtotal + tax + serviceCharge;

    setCheckoutReceipt({
      total: totalAmount,
      paymentMethod,
      tableNumber: selectedTable.number
    });

    setTableTickets(prev => {
      const updated = { ...prev };
      delete updated[tableId];
      return updated;
    });

    setSelectedTable(null);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0a0f1d] overflow-hidden select-none">
      <header className="h-20 bg-[#121829] border-b border-[#1f2942] flex justify-between items-center px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xl text-white shadow-md shadow-blue-500/20">
            H
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white uppercase leading-none">HexPOS</h1>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enterprise Edition</span>
          </div>
        </div>

        <div className="flex bg-[#0a0f1d] p-1.5 rounded-xl border border-[#1f2942]">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-6 py-3 rounded-lg text-sm font-extrabold uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'pos'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Utensils className="w-4 h-4" />
            POS Register
          </button>
          <button
            onClick={() => setActiveTab('kds')}
            className={`px-6 py-3 rounded-lg text-sm font-extrabold uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'kds'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MonitorPlay className="w-4 h-4" />
            KDS Board
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-6 py-3 rounded-lg text-sm font-extrabold uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'menu'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Utensils className="w-4 h-4" />
            Full Menu
          </button>
        </div>

        <div className="text-right flex items-center gap-4">
          <div>
            <p className="text-sm font-bold text-white">Register #01</p>
            <span className="text-xs text-slate-500">
              {user?.role === 'cashier' ? 'Cashier: ' : 'Server: '}{user?.name || 'Guest'}
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors cursor-pointer"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {activeTab === 'kds' ? (
          <KDSBoard />
        ) : activeTab === 'menu' ? (
          <div className="flex h-full w-full">
            <div className="w-[60%] flex flex-col h-full relative">
              <div className="h-16 border-b border-[#1f2942] bg-[#121829] flex items-center px-6 shrink-0">
                <div className="border-l-4 border-blue-500 pl-4">
                  <span className="text-slate-500 text-xs font-semibold uppercase">Direct Order</span>
                  <h2 className="text-lg font-black text-white leading-none">Walk-in / Takeout</h2>
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <MenuOrderGrid onAddItem={(item, mods, instr) => {
                  // Re-use handleAddItem but inject a dummy table if none selected
                  if (!selectedTable) {
                    setSelectedTable({ 
                      id: 'walkin', 
                      number: 0, 
                      guests: 1,
                      server: user?.name || 'Walk-in',
                      balance: 0,
                      elapsedTime: 0,
                      status: 'available', 
                      zone: 'Takeout' 
                    });
                    // Timeout ensures state update happens before handleAddItem executes
                    setTimeout(() => handleAddItem(item, mods, instr), 0);
                  } else {
                    handleAddItem(item, mods, instr);
                  }
                }} />
              </div>
            </div>

            <div className="w-[40%] h-full">
              <TicketPanel
                items={tableTickets['walkin'] || []}
                tableNumber={0}
                onUpdateItemStatus={handleUpdateItemStatus}
                onUpdateSeat={handleUpdateSeat}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        ) : !selectedTable ? (
          <FloorMap onTableSelect={handleTableSelect} />
        ) : (
          <div className="flex h-full w-full">
            <div className="w-[60%] flex flex-col h-full relative">
              <div className="h-16 border-b border-[#1f2942] bg-[#121829] flex items-center px-6 shrink-0">
                <button
                  onClick={() => setSelectedTable(null)}
                  className="flex items-center gap-2 text-slate-400 hover:text-white font-extrabold text-sm uppercase transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Floor Map
                </button>
                <div className="ml-8 border-l border-[#1f2942] pl-6">
                  <span className="text-slate-500 text-xs font-semibold uppercase">Dining Table</span>
                  <h2 className="text-lg font-black text-white leading-none">Table {selectedTable.number} ({selectedTable.zone})</h2>
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <MenuOrderGrid onAddItem={handleAddItem} />
              </div>
            </div>

            <div className="w-[40%] h-full">
              <TicketPanel
                items={tableTickets[selectedTable.id] || []}
                tableNumber={selectedTable.number}
                onUpdateItemStatus={handleUpdateItemStatus}
                onUpdateSeat={handleUpdateSeat}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        )}
      </main>

      {checkoutReceipt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/85 z-[100] p-4">
          <div className="bg-[#121829] border-2 border-emerald-500 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-950 flex items-center justify-center border-2 border-emerald-500 shadow-lg shadow-emerald-500/20">
              <CreditCard className="w-8 h-8 text-emerald-400" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">Payment Successful</h3>
              <p className="text-sm text-slate-400">Checkout completed for Table {checkoutReceipt.tableNumber}</p>
            </div>

            <div className="w-full bg-[#171e35] border border-[#1f2942] rounded-2xl p-4 space-y-2 text-sm font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-500">Tender Type</span>
                <span>{checkoutReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between border-t border-[#1f2942] pt-2 mt-2">
                <span className="text-slate-400 text-md font-bold">Total Paid</span>
                <span className="text-emerald-400 text-lg font-black">${checkoutReceipt.total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setCheckoutReceipt(null)}
              className="w-full min-h-[56px] bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              Done / Print Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
