import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiresAt: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  image?: string;
  badge?: string;
  discount: string;
  expiresAt: string;
  isActive: boolean;
  restaurantIds?: string[];
}

export interface PromotionsState {
  coupons: Coupon[];
  promotions: Promotion[];
  appliedCoupon: Coupon | null;
}

const MOCK_COUPONS: Coupon[] = [
  {
    id: "coupon-001",
    code: "PEDEJA20",
    description: "20% de desconto no seu próximo pedido",
    discountType: "percentage",
    discountValue: 20,
    minOrderValue: 5000,
    maxDiscount: 5000,
    expiresAt: new Date(Date.now() + 604800000).toISOString(),
    isActive: true,
    usageLimit: 1,
    usageCount: 0,
  },
  {
    id: "coupon-002",
    code: "ENTREGA0",
    description: "Entrega grátis",
    discountType: "fixed",
    discountValue: 800,
    minOrderValue: 3000,
    expiresAt: new Date(Date.now() + 259200000).toISOString(),
    isActive: true,
    usageLimit: 3,
    usageCount: 1,
  },
  {
    id: "coupon-003",
    code: "PRIMEIRA50",
    description: "50% off na primeira compra",
    discountType: "percentage",
    discountValue: 50,
    maxDiscount: 10000,
    expiresAt: new Date(Date.now() + 1209600000).toISOString(),
    isActive: true,
    usageLimit: 1,
    usageCount: 0,
  },
];

const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: "promo-001",
    title: "Super Combo Família",
    description: "2 burgers + 2 batatas + 2 refrigerantes por apenas Kz 89.900",
    badge: "PROMO",
    discount: "-30%",
    expiresAt: new Date(Date.now() + 172800000).toISOString(),
    isActive: true,
  },
  {
    id: "promo-002",
    title: "Quarta é dia de Pizza",
    description: "Toda quarta-feira: pizza grande por Kz 45.000",
    badge: "DIÁRIO",
    discount: "Kz 30.000 OFF",
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    isActive: true,
  },
  {
    id: "promo-003",
    title: "Entrega Grátis",
    description: "Em pedidos acima de Kz 15.000",
    badge: "FRETE",
    discount: "Kz 0",
    expiresAt: new Date(Date.now() + 432000000).toISOString(),
    isActive: true,
  },
];

const initialState: PromotionsState = {
  coupons: MOCK_COUPONS,
  promotions: MOCK_PROMOTIONS,
  appliedCoupon: null,
};

const promotionsSlice = createSlice({
  name: "promotions",
  initialState,
  reducers: {
    applyCoupon(state, action: PayloadAction<string>) {
      const coupon = state.coupons.find(
        (c) => c.code.toUpperCase() === action.payload.toUpperCase() && c.isActive
      );
      if (coupon) {
        state.appliedCoupon = coupon;
      }
    },
    removeCoupon(state) {
      state.appliedCoupon = null;
    },
    useCoupon(state, action: PayloadAction<string>) {
      const coupon = state.coupons.find((c) => c.id === action.payload);
      if (coupon) {
        coupon.usageCount += 1;
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
          coupon.isActive = false;
        }
      }
    },
    addCoupon(state, action: PayloadAction<Coupon>) {
      state.coupons.push(action.payload);
    },
    addPromotion(state, action: PayloadAction<Promotion>) {
      state.promotions.push(action.payload);
    },
  },
});

export const { applyCoupon, removeCoupon, useCoupon, addCoupon, addPromotion } =
  promotionsSlice.actions;

export const promotionsReducer = promotionsSlice.reducer;

export const selectCoupons = (state: { promotions: PromotionsState }) =>
  state.promotions.coupons;

export const selectActiveCoupons = (state: { promotions: PromotionsState }) =>
  state.promotions.coupons.filter(
    (c) => c.isActive && new Date(c.expiresAt) > new Date()
  );

export const selectPromotions = (state: { promotions: PromotionsState }) =>
  state.promotions.promotions;

export const selectActivePromotions = (state: { promotions: PromotionsState }) =>
  state.promotions.promotions.filter(
    (p) => p.isActive && new Date(p.expiresAt) > new Date()
  );

export const selectAppliedCoupon = (state: { promotions: PromotionsState }) =>
  state.promotions.appliedCoupon;

export function calculateDiscount(
  subtotal: number,
  coupon: Coupon | null
): number {
  if (!coupon) return 0;

  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    return 0;
  }

  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = (subtotal * coupon.discountValue) / 100;
  } else {
    discount = coupon.discountValue;
  }

  if (coupon.maxDiscount && discount > coupon.maxDiscount) {
    discount = coupon.maxDiscount;
  }

  return Math.round(discount);
}
