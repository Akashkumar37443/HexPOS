import React, { useState } from 'react';
import { Users, Clock, DollarSign, Utensils, CheckCircle } from 'lucide-react';

export type TableStatus = 'available' | 'seated' | 'order-placed' | 'bill-requested' | 'dirty';

export interface TableState {
  id: string;
  number: number;
  guests: number;
  server: string;
  balance: number;
  elapsedTime: number;
  status: TableStatus;
  zone: string;
}

const mockTables: TableState[] = [
  { id: 't1', number: 101, guests: 2, server: 'Alex M.', balance: 45.50, elapsedTime: 35, status: 'seated', zone: 'Main Hall' },
  { id: 't2', number: 102, guests: 4, server: 'Alex M.', balance: 120.00, elapsedTime: 75, status: 'order-placed', zone: 'Main Hall' },
  { id: 't3', number: 103, guests: 0, server: '', balance: 0.00, elapsedTime: 0, status: 'available', zone: 'Main Hall' },
  { id: 't4', number: 104, guests: 2, server: 'Sarah K.', balance: 52.00, elapsedTime: 50, status: 'bill-requested', zone: 'Main Hall' },
  { id: 't5', number: 201, guests: 6, server: 'Sarah K.', balance: 280.00, elapsedTime: 90, status: 'order-placed', zone: 'Patio' },
  { id: 't6', number: 202, guests: 0, server: '', balance: 0.00, elapsedTime: 0, status: 'dirty', zone: 'Patio' },
  { id: 't7', number: 301, guests: 1, server: 'Mark T.', balance: 18.75, elapsedTime: 20, status: 'seated', zone: 'Bar' },
  { id: 't8', number: 302, guests: 2, server: 'Mark T.', balance: 64.00, elapsedTime: 15, status: 'order-placed', zone: 'Bar' }
];

interface FloorMapProps {
  onTableSelect: (table: TableState) => void;
}

export const FloorMap: React.FC<FloorMapProps> = ({ onTableSelect }) => {
  const [selectedZone, setSelectedZone] = useState<string>('Main Hall');
  const [tables, setTables] = useState<TableState[]>(mockTables);
  const [actionMenuTable, setActionMenuTable] = useState<TableState | null>(null);

  const zones = ['Main Hall', 'Patio', 'Bar'];

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'available': return 'bg-emerald-950/40 border-emerald-500 text-emerald-400 hover:bg-emerald-950/60';
      case 'seated': return 'bg-sky-950/40 border-sky-500 text-sky-400 hover:bg-sky-950/60';
      case 'order-placed': return 'bg-amber-950/40 border-amber-500 text-amber-400 hover:bg-amber-950/60';
      case 'bill-requested': return 'bg-purple-950/40 border-purple-500 text-purple-400 hover:bg-purple-950/60';
      case 'dirty': return 'bg-rose-950/40 border-rose-500 text-rose-400 hover:bg-rose-950/60';
    }
  };

  const updateTableStatus = (tableId: string, newStatus: TableStatus) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        return {
          ...t,
          status: newStatus,
          server: newStatus === 'available' || newStatus === 'dirty' ? '' : t.server || 'Alex M.',
          guests: newStatus === 'available' || newStatus === 'dirty' ? 0 : t.guests || 2,
          balance: newStatus === 'available' || newStatus === 'dirty' ? 0.00 : t.balance
        };
      }
      return t;
    }));
    setActionMenuTable(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] p-6 select-none">
      {/* Zone Switcher */}
      <div className="flex gap-3 mb-6">
        {zones.map(zone => (
          <button
            key={zone}
            onClick={() => setSelectedZone(zone)}
            className={`px-8 py-4 rounded-xl text-lg font-bold border transition-all duration-200 cursor-pointer min-h-[64px] min-w-[120px] ${
              selectedZone === zone
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                : 'bg-[#121829] border-[#1f2942] text-slate-400 hover:text-slate-200'
            }`}
          >
            {zone}
          </button>
        ))}
      </div>

      {/* Tables Layout Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1 overflow-y-auto pr-2">
        {tables.filter(t => t.zone === selectedZone).map(table => (
          <div
            key={table.id}
            onClick={() => setActionMenuTable(table)}
            className={`relative flex flex-col justify-between p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer aspect-square ${getStatusColor(table.status)}`}
          >
            {/* Table Number & Status Indicator */}
            <div className="flex justify-between items-start">
              <span className="text-3xl font-extrabold tracking-tight">T-{table.number}</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                table.status === 'available' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                table.status === 'seated' ? 'bg-sky-950 text-sky-400 border border-sky-850' :
                table.status === 'order-placed' ? 'bg-amber-950 text-amber-400 border border-amber-850' :
                table.status === 'bill-requested' ? 'bg-purple-950 text-purple-400 border border-purple-850' :
                'bg-rose-950 text-rose-400 border border-rose-850'
              }`}>
                {table.status.replace('-', ' ')}
              </span>
            </div>

            {/* Metrics */}
            <div className="space-y-2 mt-4">
              {table.guests > 0 && (
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Users className="w-4 h-4" />
                  <span>{table.guests} Guests</span>
                  <span className="text-slate-500">•</span>
                  <span>{table.server}</span>
                </div>
              )}
              {table.elapsedTime > 0 && (
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Clock className="w-4 h-4" />
                  <span>{table.elapsedTime} min elapsed</span>
                </div>
              )}
            </div>

            {/* Price Balance Footer */}
            <div className="flex justify-between items-end mt-4">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-500 uppercase">Balance</span>
                <span className="text-xl font-bold tracking-tight">${table.balance.toFixed(2)}</span>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-900/40 border border-slate-700/50">
                <Utensils className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Sheet Modal */}
      {actionMenuTable && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/75 z-50 p-4">
          <div className="bg-[#121829] border border-[#1f2942] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#1f2942] flex justify-between items-center bg-[#171e35]">
              <div>
                <h3 className="text-2xl font-extrabold text-white">Table {actionMenuTable.number} Actions</h3>
                <p className="text-sm text-slate-400 mt-1">Zone: {actionMenuTable.zone} • Status: {actionMenuTable.status}</p>
              </div>
              <button
                onClick={() => setActionMenuTable(null)}
                className="text-slate-400 hover:text-white text-3xl leading-none p-2"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 bg-[#121829]">
              <button
                onClick={() => {
                  onTableSelect(actionMenuTable);
                  setActionMenuTable(null);
                }}
                className="w-full min-h-[64px] bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-colors cursor-pointer"
              >
                <Utensils className="w-6 h-6" />
                Open Ticket / Order
              </button>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => updateTableStatus(actionMenuTable.id, 'seated')}
                  className="min-h-[56px] bg-sky-950/80 hover:bg-sky-900 border border-sky-500 text-sky-400 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  Seat Guests
                </button>
                <button
                  onClick={() => updateTableStatus(actionMenuTable.id, 'bill-requested')}
                  className="min-h-[56px] bg-purple-950/80 hover:bg-purple-900 border border-purple-500 text-purple-400 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  Request Bill
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => updateTableStatus(actionMenuTable.id, 'dirty')}
                  className="min-h-[56px] bg-rose-950/80 hover:bg-rose-900 border border-rose-500 text-rose-400 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  Mark Dirty
                </button>
                <button
                  onClick={() => updateTableStatus(actionMenuTable.id, 'available')}
                  className="min-h-[56px] bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500 text-emerald-400 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  Clear / Make Available
                </button>
              </div>

              <button
                onClick={() => setActionMenuTable(null)}
                className="w-full min-h-[56px] bg-[#1e273e] hover:bg-[#253250] text-slate-300 rounded-2xl font-bold transition-colors cursor-pointer border border-[#2d3a5a]"
              >
                Close Actions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
