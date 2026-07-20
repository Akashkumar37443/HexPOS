import React, { useState } from 'react';
import { Search, Flame, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  maxSelections: number;
  options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  dietary?: ('Vegan' | 'GF' | 'Nut-Free')[];
  modifiers?: ModifierGroup[];
}

const mockMenu: MenuItem[] = [
  {
    id: 'm1',
    sku: 'APP-CEAS',
    name: 'Classic Caesar Salad',
    price: 12.99,
    category: 'Appetizers',
    inStock: true,
    dietary: ['GF'],
    modifiers: [
      {
        id: 'c1',
        name: 'Add Protein',
        required: false,
        maxSelections: 1,
        options: [
          { id: 'o1', name: 'Grilled Chicken', price: 4.50 },
          { id: 'o2', name: 'Seared Salmon', price: 6.00 },
          { id: 'o3', name: 'Crispy Tofu', price: 3.00 }
        ]
      }
    ]
  },
  {
    id: 'm2',
    sku: 'APP-WNG',
    name: 'Buffalo Wings',
    price: 14.99,
    category: 'Appetizers',
    inStock: true,
    modifiers: [
      {
        id: 'c2',
        name: 'Wing Sauce',
        required: true,
        maxSelections: 1,
        options: [
          { id: 'o4', name: 'Mild Buffalo', price: 0.00 },
          { id: 'o5', name: 'Spicy Garlic', price: 0.00 },
          { id: 'o6', name: 'Honey BBQ', price: 0.00 }
        ]
      }
    ]
  },
  {
    id: 'm3',
    sku: 'MAIN-BURG',
    name: 'Signature Wagyu Burger',
    price: 18.99,
    category: 'Mains',
    inStock: true,
    modifiers: [
      {
        id: 'c3',
        name: 'Cooking Temperature',
        required: true,
        maxSelections: 1,
        options: [
          { id: 'o7', name: 'Rare', price: 0.00 },
          { id: 'o8', name: 'Medium Rare', price: 0.00 },
          { id: 'o9', name: 'Medium', price: 0.00 },
          { id: 'o10', name: 'Well Done', price: 0.00 }
        ]
      },
      {
        id: 'c4',
        name: 'Add Extras',
        required: false,
        maxSelections: 3,
        options: [
          { id: 'o11', name: 'Applewood Bacon', price: 2.00 },
          { id: 'o12', name: 'Fried Egg', price: 1.50 },
          { id: 'o13', name: 'Avocado', price: 1.75 }
        ]
      }
    ]
  },
  {
    id: 'm4',
    sku: 'MAIN-STEK',
    name: 'Prime Ribeye Steak',
    price: 34.99,
    category: 'Mains',
    inStock: false
  },
  {
    id: 'm5',
    sku: 'DRK-IPA',
    name: 'Draft Craft IPA Beer',
    price: 7.50,
    category: 'Drinks',
    inStock: true
  },
  {
    id: 'm6',
    sku: 'DRK-COK',
    name: 'Fountain Soda',
    price: 3.25,
    category: 'Drinks',
    inStock: true,
    modifiers: [
      {
        id: 'c5',
        name: 'Soda Flavor',
        required: true,
        maxSelections: 1,
        options: [
          { id: 'o14', name: 'Cola', price: 0.00 },
          { id: 'o15', name: 'Diet Cola', price: 0.00 },
          { id: 'o16', name: 'Lemon Lime', price: 0.00 }
        ]
      }
    ]
  },
  {
    id: 'm7',
    sku: 'DES-LAVA',
    name: 'Chocolate Lava Cake',
    price: 9.99,
    category: 'Desserts',
    inStock: true,
    dietary: ['Nut-Free'],
    modifiers: [
      {
        id: 'c6',
        name: 'Add Ice Cream',
        required: false,
        maxSelections: 1,
        options: [
          { id: 'o17', name: 'Vanilla Bean Gelato', price: 2.50 }
        ]
      }
    ]
  }
];

interface MenuOrderGridProps {
  onAddItem: (item: MenuItem, selectedModifiers: ModifierOption[], specialInstructions: string) => void;
}

export const MenuOrderGrid: React.FC<MenuOrderGridProps> = ({ onAddItem }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Appetizers');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModifyingItem, setActiveModifyingItem] = useState<MenuItem | null>(null);
  const [selectedMods, setSelectedMods] = useState<Record<string, ModifierOption[]>>({});
  const [specialInstructions, setSpecialInstructions] = useState<string>('');

  const categories = ['Appetizers', 'Mains', 'Drinks', 'Desserts'];

  const filteredMenu = mockMenu.filter(item => {
    const matchesCategory = item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleItemClick = (item: MenuItem) => {
    if (!item.inStock) return;
    if (item.modifiers && item.modifiers.length > 0) {
      // Open modifiers modal
      setActiveModifyingItem(item);
      setSelectedMods({});
      setSpecialInstructions('');
    } else {
      // Direct add
      onAddItem(item, [], '');
    }
  };

  const handleSelectModOption = (group: ModifierGroup, option: ModifierOption) => {
    setSelectedMods(prev => {
      const currentSelections = prev[group.id] || [];
      if (group.maxSelections === 1) {
        return { ...prev, [group.id]: [option] };
      }
      
      const exists = currentSelections.find(o => o.id === option.id);
      if (exists) {
        return {
          ...prev,
          [group.id]: currentSelections.filter(o => o.id !== option.id)
        };
      } else {
        if (currentSelections.length < group.maxSelections) {
          return {
            ...prev,
            [group.id]: [...currentSelections, option]
          };
        }
      }
      return prev;
    });
  };

  const handleConfirmModifiers = () => {
    if (!activeModifyingItem) return;

    // Check if required modifier groups are satisfied
    for (const group of activeModifyingItem.modifiers || []) {
      const groupMods = selectedMods[group.id];
      if (group.required && (!groupMods || groupMods.length === 0)) {
        alert(`Please select a required option for ${group.name}`);
        return;
      }
    }

    const flatMods = Object.values(selectedMods).flat();
    onAddItem(activeModifyingItem, flatMods, specialInstructions);
    setActiveModifyingItem(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] p-6 select-none border-r border-[#1f2942]">
      {/* Search and Categories Header */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Swipable Category Tabs */}
        <div className="flex gap-2 overflow-x-auto flex-1 pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-4 rounded-xl text-md font-extrabold uppercase transition-all duration-200 cursor-pointer min-h-[56px] ${
                selectedCategory === cat
                  ? 'bg-blue-600 border border-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-[#121829] border border-[#1f2942] text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Custom Touch Search Bar */}
        <div className="relative min-w-[280px]">
          <input
            type="text"
            placeholder="Search Menu (SKU, Name)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-[#121829] border border-[#1f2942] rounded-xl text-white font-medium focus:outline-none focus:border-blue-500 text-md"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        </div>
      </div>

      {/* Menu Grid Items */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1 overflow-y-auto pr-2">
        {filteredMenu.map(item => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={`flex flex-col justify-between p-5 rounded-2xl border-2 transition-all duration-200 relative overflow-hidden ${
              item.inStock
                ? 'bg-[#121829] border-[#1f2942] hover:border-blue-500/60 cursor-pointer active:scale-[0.98]'
                : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60 cursor-not-allowed'
            }`}
          >
            {/* Stock Alert Badge */}
            {!item.inStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center font-bold text-red-500 uppercase tracking-widest text-sm">
                Out of Stock
              </div>
            )}

            {/* Title & Dietary Badges */}
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-1.5 flex-wrap">
                {item.dietary?.map(diet => (
                  <span
                    key={diet}
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      diet === 'Vegan' ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400' :
                      diet === 'GF' ? 'bg-amber-950/80 border border-amber-800 text-amber-400' :
                      'bg-sky-950/80 border border-sky-800 text-sky-400'
                    }`}
                  >
                    {diet}
                  </span>
                ))}
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight line-clamp-2">{item.name}</h4>
            </div>

            {/* Price Footer */}
            <div className="flex justify-between items-end mt-4">
              <span className="text-slate-500 text-xs font-semibold uppercase">{item.sku}</span>
              <span className="text-xl font-black text-white">${item.price.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modifiers Selection Modal */}
      {activeModifyingItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/75 z-50 p-4">
          <div className="bg-[#121829] border border-[#1f2942] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-[#1f2942] bg-[#171e35] flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-extrabold text-white">Customize: {activeModifyingItem.name}</h3>
                <p className="text-sm text-slate-400 mt-1">Base Price: ${activeModifyingItem.price.toFixed(2)}</p>
              </div>
              <button
                onClick={() => setActiveModifyingItem(null)}
                className="text-slate-400 hover:text-white text-3xl leading-none p-2"
              >
                &times;
              </button>
            </div>

            {/* Scrollable Modifiers List */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#121829]">
              {activeModifyingItem.modifiers?.map(group => (
                <div key={group.id} className="space-y-3">
                  <div className="flex justify-between items-center border-b border-[#1f2942] pb-2">
                    <h4 className="text-lg font-extrabold text-white flex items-center gap-2">
                      {group.name}
                      {group.required && (
                        <span className="text-xs bg-red-950 border border-red-800 text-red-400 px-2 py-0.5 rounded-full font-black uppercase">Required</span>
                      )}
                    </h4>
                    <span className="text-xs text-slate-500">Max selections: {group.maxSelections}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {group.options.map(opt => {
                      const isSelected = selectedMods[group.id]?.some(o => o.id === opt.id) || false;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectModOption(group, opt)}
                          className={`min-h-[56px] p-4 rounded-xl border-2 font-bold flex justify-between items-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-950/40 border-blue-500 text-blue-400'
                              : 'bg-[#1a2138] border-[#1f2942] text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-left">{opt.name}</span>
                          <span className="text-right">
                            {opt.price > 0 ? `+$${opt.price.toFixed(2)}` : 'Included'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Special Instructions Field */}
              <div className="space-y-2">
                <h4 className="text-lg font-extrabold text-white">Special Instructions</h4>
                <textarea
                  placeholder="e.g. Allergy alert, extra hot, dressing on the side..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full h-24 p-4 bg-[#1a2138] border border-[#1f2942] rounded-xl text-white focus:outline-none focus:border-blue-500 resize-none text-md"
                />
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-6 border-t border-[#1f2942] bg-[#171e35] flex gap-4">
              <button
                onClick={() => setActiveModifyingItem(null)}
                className="flex-1 min-h-[56px] bg-[#1e273e] hover:bg-[#253250] text-slate-300 rounded-xl font-bold transition-colors cursor-pointer border border-[#2d3a5a]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmModifiers}
                className="flex-1 min-h-[56px] bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors cursor-pointer"
              >
                Add to Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
