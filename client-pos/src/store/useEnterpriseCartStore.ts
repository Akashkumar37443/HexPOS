import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a SHA-256 cryptographic hash of the cart state.
 * Used for anti-tampering validation at checkout.
 */
async function generateStateHash(data: object): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const dataString = JSON.stringify(data);
    const dataBuffer = encoder.encode(dataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    console.error("Hash generation failed. Fallback to insecure hash.", e);
    return "insecure-hash-fallback-" + Date.now().toString();
  }
}

export type TenantConfig = {
  id: string;
  currency: string;
  taxRules: Record<string, number>;
  platformFeePercentage: number;
};

export type ProductVariant = {
  id: string;
  sku: string;
  name: string;
  price: number;
  taxCategory: string;
};

export type CartItem = {
  lineId: string;
  variant: ProductVariant;
  quantity: number;
  appliedDiscount: number;
};

export type EnterpriseCart = {
  id: string;
  tenantId: string;
  terminalId: string;
  items: CartItem[];
  subtotal: number;
  tenantTax: number;
  platformFee: number;
  total: number;
  stateHash: string;
  lastModifiedAt: string;
};

interface EnterpriseCartState {
  activeCartId: string | null;
  carts: Record<string, EnterpriseCart>;
  tenantConfig: TenantConfig | null;

  setTenantConfig: (config: TenantConfig) => void;
  createCart: (terminalId: string) => Promise<string>;
  switchCart: (cartId: string) => void;
  addItem: (variant: ProductVariant, quantity?: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clearActiveCart: () => Promise<void>;
}

const recalculateCart = async (cart: EnterpriseCart, config: TenantConfig): Promise<EnterpriseCart> => {
  let subtotal = 0;
  let tenantTax = 0;

  for (const item of cart.items) {
    const itemTotal = (item.variant.price * item.quantity) - item.appliedDiscount;
    subtotal += itemTotal;
    
    const taxRate = config.taxRules[item.variant.taxCategory] || 0;
    tenantTax += itemTotal * taxRate;
  }

  const platformFee = subtotal * (config.platformFeePercentage / 100);
  const total = subtotal + tenantTax + platformFee;

  const cartWithoutHash = { ...cart, subtotal, tenantTax, platformFee, total, items: cart.items };
  const stateHash = await generateStateHash({
    items: cart.items,
    total,
    tenantId: config.id
  });

  return {
    ...cartWithoutHash,
    stateHash,
    lastModifiedAt: new Date().toISOString()
  };
};

export const useEnterpriseCartStore = create<EnterpriseCartState>()(
  persist(
    (set, get) => ({
      activeCartId: null,
      carts: {},
      tenantConfig: null,

      setTenantConfig: (config: TenantConfig) => set({ tenantConfig: config }),

      createCart: async (terminalId: string) => {
        const config = get().tenantConfig;
        if (!config) throw new Error("Tenant context missing");

        const id = uuidv4();
        const newCart: EnterpriseCart = {
          id,
          tenantId: config.id,
          terminalId,
          items: [],
          subtotal: 0,
          tenantTax: 0,
          platformFee: 0,
          total: 0,
          stateHash: '',
          lastModifiedAt: new Date().toISOString(),
        };

        const finalizedCart = await recalculateCart(newCart, config);

        set((state) => ({
          carts: { ...state.carts, [id]: finalizedCart },
          activeCartId: id
        }));

        return id;
      },

      switchCart: (cartId: string) => {
        if (get().carts[cartId]) {
          set({ activeCartId: cartId });
        }
      },

      addItem: async (variant: ProductVariant, quantity: number = 1) => {
        const state = get();
        const config = state.tenantConfig;
        const cartId = state.activeCartId;

        if (!config || !cartId) return;
        const cart = state.carts[cartId];
        if (!cart) return;

        const existingItemIndex = cart.items.findIndex((i: CartItem) => i.variant.id === variant.id);
        const updatedItems = [...cart.items];

        if (existingItemIndex >= 0) {
          const existing = updatedItems[existingItemIndex];
          if(existing) {
             updatedItems[existingItemIndex] = {
               ...existing,
               quantity: existing.quantity + quantity
             };
          }
        } else {
          updatedItems.push({
            lineId: uuidv4(),
            variant,
            quantity,
            appliedDiscount: 0
          });
        }

        const updatedCart = await recalculateCart({ ...cart, items: updatedItems }, config);

        set((s) => ({
          carts: {
            ...s.carts,
            [cartId]: updatedCart
          }
        }));
      },

      removeItem: async (lineId: string) => {
         const state = get();
         const config = state.tenantConfig;
         const cartId = state.activeCartId;

         if (!config || !cartId) return;
         const cart = state.carts[cartId];
         if (!cart) return;

         const updatedItems = cart.items.filter((i: CartItem) => i.lineId !== lineId);
         const updatedCart = await recalculateCart({ ...cart, items: updatedItems }, config);

         set((s) => ({
            carts: {
               ...s.carts,
               [cartId]: updatedCart
            }
         }));
      },

      clearActiveCart: async () => {
         const state = get();
         const config = state.tenantConfig;
         const cartId = state.activeCartId;

         if (!config || !cartId) return;
         const cart = state.carts[cartId];
         if (!cart) return;

         const updatedCart = await recalculateCart({ ...cart, items: [] }, config);

         set((s) => ({
            carts: {
               ...s.carts,
               [cartId]: updatedCart
            }
         }));
      }
    }),
    {
      name: 'enterprise-pos-idb',
      // In a real scenario, map this to idb-keyval for async IndexedDB persistence
      storage: createJSONStorage(() => localStorage), 
    }
  )
);
