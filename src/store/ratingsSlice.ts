import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Rating {
  id: string;
  orderId: string;
  restaurantId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  tags: string[];
  timestamp: string;
}

export interface RatingsState {
  ratings: Rating[];
}

const MOCK_RATINGS: Rating[] = [
  {
    id: "rating-001",
    orderId: "order-001",
    restaurantId: "rest-001",
    userId: "user-001",
    userName: "Maria Silva",
    rating: 5,
    comment: "Excelente! Chegou quentinho e antes do tempo. O entregador foi super simpático.",
    tags: ["Rápido", "Quente", "Bem embalado"],
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "rating-002",
    orderId: "order-002",
    restaurantId: "rest-001",
    userId: "user-002",
    userName: "João Pedro",
    rating: 4,
    comment: "Muito bom! Só demorou um pouco mais que o previsto.",
    tags: ["Saboroso"],
    timestamp: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "rating-003",
    orderId: "order-001",
    restaurantId: "rest-002",
    userId: "user-003",
    userName: "Ana Costa",
    rating: 5,
    comment: "Perfeito! Melhor burger da cidade. Recomendo muito!",
    tags: ["Delicioso", "Porção generosa"],
    timestamp: new Date(Date.now() - 259200000).toISOString(),
  },
];

const initialState: RatingsState = {
  ratings: MOCK_RATINGS,
};

const ratingsSlice = createSlice({
  name: "ratings",
  initialState,
  reducers: {
    addRating(state, action: PayloadAction<Omit<Rating, "id" | "timestamp">>) {
      const newRating: Rating = {
        ...action.payload,
        id: `rating-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
      state.ratings.push(newRating);
    },
    removeRating(state, action: PayloadAction<string>) {
      state.ratings = state.ratings.filter((r) => r.id !== action.payload);
    },
  },
});

export const { addRating, removeRating } = ratingsSlice.actions;
export const ratingsReducer = ratingsSlice.reducer;

const selectAllRatings = (state: { ratings: RatingsState }) => state.ratings.ratings;

export const selectRatingsByRestaurant = createSelector(
  [selectAllRatings, (state: { ratings: RatingsState }, restaurantId: string) => restaurantId],
  (ratings, restaurantId) => ratings.filter((r) => r.restaurantId === restaurantId)
);

export const selectAverageRating = createSelector(
  [selectAllRatings, (state: { ratings: RatingsState }, restaurantId: string) => restaurantId],
  (ratings, restaurantId) => {
    const filtered = ratings.filter((r) => r.restaurantId === restaurantId);
    if (filtered.length === 0) return 0;
    return filtered.reduce((sum, r) => sum + r.rating, 0) / filtered.length;
  }
);

export const selectRatingCount = createSelector(
  [selectAllRatings, (state: { ratings: RatingsState }, restaurantId: string) => restaurantId],
  (ratings, restaurantId) => ratings.filter((r) => r.restaurantId === restaurantId).length
);

export const selectRatingByOrder = (state: { ratings: RatingsState }, orderId: string) =>
  state.ratings.ratings.find((r) => r.orderId === orderId);
