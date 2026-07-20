import React, { useState, useEffect } from 'react';
import { Clock, Check, Utensils, AlertCircle } from 'lucide-react';

export interface KDSItem {
  id: string;
  name: string;
  quantity: number;
  modifiers?: string[];
  specialInstructions?: string;
  status: 'pending' | 'prepared';
}

export interface KDSOrder {
  id: string;
  orderNumber: number;
  tableNumber: number;
  server: string;
  createdAt: Date;
  station: 'Grill' | 'Bar' | 'Pantry';
  items: KDSItem[];
}

const initialOrders: KDSOrder[] = [
  {
    id: 'k1',
    orderNumber: 240,
    tableNumber: 102,
    server: 'Alex M.',
    createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
    station: 'Grill',
    items: [
      { id: 'ki1', name: 'Signature Wagyu Burger', quantity: 2, modifiers: ['Medium Rare', 'Applewood Bacon'], status: 'pending' },
      { id: 'ki2', name: 'Buffalo Wings', quantity: 1, modifiers: ['Spicy Garlic'], status: 'pending' }
    ]
  },
  {
    id: 'k2',
    orderNumber: 241,
    tableNumber: 201,
    server: 'Sarah K.',
    createdAt: new Date(Date.now() - 12 * 60 * 1000), // 12 min ago
    station: 'Grill',
    items: [
      { id: 'ki3', name: 'Classic Caesar Salad', quantity: 1, modifiers: ['Grilled Chicken'], status: 'prepared' },
      { id: 'ki4', name: 'Signature Wagyu Burger', quantity: 1, modifiers: ['Medium', 'Fried Egg'], status: 'pending' }
    ]
  },
  {
    id: 'k3',
    orderNumber: 242,
    tableNumber: 302,
    server: 'Mark T.',
    createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 min ago
    station: 'Bar',
    items: [
      { id: 'ki5', name: 'Draft Craft IPA Beer', quantity: 2, status: 'pending' },
      { id: 'ki6', name: 'Fountain Soda', quantity: 1, modifiers: ['Lemon Lime'], status: 'prepared' }
    ]
  },
  {
    id: 'k4',
    orderNumber: 243,
    tableNumber: 104,
    server: 'Alex M.',
    createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 min ago
    station: 'Pantry',
    items: [
      { id: 'ki7', name: 'Chocolate Lava Cake', quantity: 1, modifiers: ['Vanilla Bean Gelato'], status: 'pending' }
    ]
  }
];

export const KDSBoard: React.FC = () => {
  const [orders, setOrders] = useState<KDSOrder[]>(initialOrders);
  const [selectedStation, setSelectedStation] = useState<'All' | 'Grill' | 'Bar' | 'Pantry'>('All');
  const [historyOrders, setHistoryOrders] = useState<KDSOrder[]>([]);
  const [time, setTime] = useState<number>(Date.now());

  // Tick for timers
  useEffect(() => {
    const timer = setInterval(() => setTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getUrgencyConfig = (minutesElapsed: number) => {
    if (minutesElapsed < 10) {
      return { border: 'border-emerald-500', header: 'bg-emerald-950/80 text-emerald-400', clock: 'text-emerald-400' };
    } else if (minutesElapsed < 20) {
      return { border: 'border-amber-500', header: 'bg-amber-950/80 text-amber-400', clock: 'text-amber-400' };
    } else {
      return { border: 'border-rose-500 ring-2 ring-rose-500/50 animate-pulse', header: 'bg-rose-950/80 text-rose-400', clock: 'text-rose-400' };
    }
  };

  const getElapsedTime = (createdAt: Date) => {
    const elapsedMs = time - createdAt.getTime();
    const minutes = Math.floor(elapsedMs / 1000 / 60);
    const seconds = Math.floor((elapsedMs / 1000) % 60);
    return { minutes, seconds };
  };

  const handleBumpItem = (orderId: string, itemId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          items: order.items.map(item => {
            if (item.id === itemId) {
              return { ...item, status: item.status === 'pending' ? 'prepared' : 'pending' };
            }
            return item;
          })
        };
      }
      return order;
    }));
  };

  const handleCompleteOrder = (orderId: string) => {
    const orderToComplete = orders.find(o => o.id === orderId);
    if (orderToComplete) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setHistoryOrders(prev => [orderToComplete, ...prev]);
    }
  };

  const handleUndoBump = () => {
    if (historyOrders.length > 0) {
      const [lastCompleted, ...remainingHistory] = historyOrders;
      if (lastCompleted) {
        setOrders(prev => [lastCompleted, ...prev]);
        setHistoryOrders(remainingHistory);
      }
    }
  };

  const filteredOrders = selectedStation === 'All'
    ? orders
    : orders.filter(o => o.station === selectedStation);

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] p-6 select-none text-white">
      {/* Header Station Filter & Action bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex gap-2">
          {(['All', 'Grill', 'Bar', 'Pantry'] as const).map(station => (
            <button
              key={station}
              onClick={() => setSelectedStation(station)}
              className={`px-6 py-4 rounded-xl text-md font-extrabold uppercase transition-all duration-200 cursor-pointer min-h-[56px] ${
                selectedStation === station
                  ? 'bg-blue-600 border border-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-[#121829] border border-[#1f2942] text-slate-400 hover:text-slate-200'
              }`}
            >
              {station}
            </button>
          ))}
        </div>

        {historyOrders.length > 0 && (
          <button
            onClick={handleUndoBump}
            className="px-6 py-4 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl font-bold min-h-[56px] hover:bg-slate-850 hover:text-white transition-colors cursor-pointer"
          >
            Undo Last Bump
          </button>
        )}
      </div>

      {/* Ticket Grid Column view */}
      {filteredOrders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3 border-2 border-dashed border-[#1f2942] rounded-3xl">
          <Utensils className="w-12 h-12 text-slate-600" />
          <span className="text-xl font-extrabold">All Clear! No Active Tickets.</span>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-6 h-full items-start" style={{ minWidth: 'max-content' }}>
            {filteredOrders.map(order => {
              const { minutes, seconds } = getElapsedTime(order.createdAt);
              const urgency = getUrgencyConfig(minutes);
              const isAllItemsPrepared = order.items.every(item => item.status === 'prepared');

              return (
                <div
                  key={order.id}
                  className={`w-[340px] flex flex-col max-h-full rounded-2xl border-2 bg-[#121829] overflow-hidden shadow-xl transition-all duration-200 ${urgency.border}`}
                >
                  {/* Ticket Header card */}
                  <div className={`p-4 flex justify-between items-center ${urgency.header}`}>
                    <div>
                      <span className="text-sm font-black uppercase">Order #{order.orderNumber}</span>
                      <h4 className="text-2xl font-black tracking-tight mt-0.5">Table {order.tableNumber}</h4>
                    </div>
                    <div className="flex items-center gap-1.5 font-extrabold text-lg">
                      <Clock className="w-5 h-5" />
                      <span>
                        {minutes}:{seconds.toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  {/* Server & Station info bar */}
                  <div className="px-4 py-2 bg-[#182035] border-b border-[#253250] flex justify-between text-xs font-semibold text-slate-400 uppercase">
                    <span>Server: {order.server}</span>
                    <span className="text-blue-400 font-bold">{order.station}</span>
                  </div>

                  {/* KDS Items list */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {order.items.map(item => (
                      <div
                        key={item.id}
                        onClick={() => handleBumpItem(order.id, item.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer select-none active:scale-[0.98] ${
                          item.status === 'prepared'
                            ? 'bg-slate-950/40 border-slate-900 text-slate-500 line-through decoration-slate-700 decoration-2'
                            : 'bg-[#1c263f] border-[#253250] text-white hover:border-slate-500'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pr-2">
                            <span className="text-lg font-bold">
                              {item.quantity}x {item.name}
                            </span>
                            {item.modifiers && item.modifiers.length > 0 && (
                              <div className="text-xs text-blue-400 mt-1 font-semibold">
                                + {item.modifiers.join(', ')}
                              </div>
                            )}
                            {item.specialInstructions && (
                              <div className="text-xs text-rose-400 italic mt-1 font-semibold flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{item.specialInstructions}</span>
                              </div>
                            )}
                          </div>
                          {item.status === 'prepared' && (
                            <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Complete controls */}
                  <div className="p-4 border-t border-[#1f2942] bg-[#171e35]">
                    <button
                      onClick={() => handleCompleteOrder(order.id)}
                      className={`w-full min-h-[56px] rounded-xl font-bold text-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isAllItemsPrepared
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                          : 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-750 hover:text-white'
                      }`}
                    >
                      <Check className="w-5 h-5" />
                      Complete Ticket
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
