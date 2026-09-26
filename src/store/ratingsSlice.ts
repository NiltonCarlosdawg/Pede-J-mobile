import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

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

export interface DriverRating {
  id: string;
  orderId: string;
  driverId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  tags: string[];
  timestamp: string;
}

export interface RatingsState {
  ratings: Rating[];
  driverRatings: DriverRating[];
}

const initialState: RatingsState = {
  ratings: [],
  driverRatings: [],
};

const ratingsSlice = createSlice({
  name: 'ratings',
  initialState,
  reducers: {
    addRating(state, action: PayloadAction<Omit<Rating, 'id' | 'timestamp'>>) {
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
    addDriverRating(state, action: PayloadAction<Omit<DriverRating, 'id' | 'timestamp'>>) {
      const newRating: DriverRating = {
        ...action.payload,
        id: `driver-rating-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
      state.driverRatings.push(newRating);
    },
    removeDriverRating(state, action: PayloadAction<string>) {
      state.driverRatings = state.driverRatings.filter((r) => r.id !== action.payload);
    },
  },
});

export const { addRating, removeRating, addDriverRating, removeDriverRating } =
  ratingsSlice.actions;
export const ratingsReducer = ratingsSlice.reducer;

const selectAllRatings = (state: { ratings: RatingsState }) => state.ratings.ratings;

export const selectRatingsByRestaurant = createSelector(
  [selectAllRatings, (state: { ratings: RatingsState }, restaurantId: string) => restaurantId],
  (ratings, restaurantId) => ratings.filter((r) => r.restaurantId === restaurantId),
);

export const selectAverageRating = createSelector(
  [selectAllRatings, (state: { ratings: RatingsState }, restaurantId: string) => restaurantId],
  (ratings, restaurantId) => {
    const filtered = ratings.filter((r) => r.restaurantId === restaurantId);
    if (filtered.length === 0) return 0;
    return filtered.reduce((sum, r) => sum + r.rating, 0) / filtered.length;
  },
);

export const selectRatingCount = createSelector(
  [selectAllRatings, (state: { ratings: RatingsState }, restaurantId: string) => restaurantId],
  (ratings, restaurantId) => ratings.filter((r) => r.restaurantId === restaurantId).length,
);

export const selectRatingByOrder = (state: { ratings: RatingsState }, orderId: string) =>
  state.ratings.ratings.find((r) => r.orderId === orderId);

export const selectDriverRatingByOrder = (state: { ratings: RatingsState }, orderId: string) =>
  state.ratings.driverRatings.find((r) => r.orderId === orderId);

export const selectHasDriverRating = (state: { ratings: RatingsState }, orderId: string) =>
  state.ratings.driverRatings.some((r) => r.orderId === orderId);
