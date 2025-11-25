import { create } from "zustand";

export type CartItem = {
  productId: string;
  productTitle: string;
  variationId: string;
  variationName: string;
  priceCents: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
};

type CartActions = {
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variationId: string) => void;
  updateQuantity: (
    productId: string,
    variationId: string,
    quantity: number
  ) => void;
  clear: () => void;
};

const initialState: CartState = { items: [] };

export const useCartStore = create<CartState & CartActions>((set) => ({
  ...initialState,
  addItem: (item, quantity = 1) =>
    set((state) => {
      const existing = state.items.find(
        (line) =>
          line.productId === item.productId &&
          line.variationId === item.variationId
      );

      if (existing) {
        return {
          items: state.items.map((line) =>
            line === existing
              ? { ...line, quantity: Math.min(99, line.quantity + quantity) }
              : line
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            ...item,
            quantity: Math.min(99, quantity),
          },
        ],
      };
    }),
  removeItem: (productId, variationId) =>
    set((state) => ({
      items: state.items.filter(
        (line) =>
          !(line.productId === productId && line.variationId === variationId)
      ),
    })),
  updateQuantity: (productId, variationId, quantity) =>
    set((state) => ({
      items: state.items.map((line) =>
        line.productId === productId && line.variationId === variationId
          ? { ...line, quantity: Math.max(1, Math.min(99, quantity)) }
          : line
      ),
    })),
  clear: () => set(initialState),
}));

export const selectCartCount = (state: CartState) =>
  state.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartTotal = (state: CartState) =>
  state.items.reduce(
    (total, item) => total + item.priceCents * item.quantity,
    0
  );
