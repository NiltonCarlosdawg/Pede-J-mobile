import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";

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

const initialState: PromotionsState = {
  coupons: [],
  promotions: [],
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
    setPromotions(state, action: PayloadAction<Promotion[]>) {
      state.promotions = action.payload;
    },
  },
});

export const {
  applyCoupon,
  removeCoupon,
  useCoupon,
  addCoupon,
  addPromotion,
  setPromotions,
} = promotionsSlice.actions;

export const promotionsReducer = promotionsSlice.reducer;

export const selectCoupons = (state: { promotions: PromotionsState }) =>
  state.promotions.coupons;

export const selectActiveCoupons = createSelector(
  [selectCoupons],
  (coupons) =>
    coupons.filter(
      (c) => c.isActive && new Date(c.expiresAt) > new Date()
    )
);

export const selectPromotions = (state: { promotions: PromotionsState }) =>
  state.promotions.promotions;

export const selectActivePromotions = createSelector(
  [selectPromotions],
  (promotions) =>
    promotions.filter(
      (p) => p.isActive && new Date(p.expiresAt) > new Date()
    )
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
