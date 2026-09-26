import {
  setOrders,
  addOrder,
  updateOrderStatus,
  removeOrder,
  setStats,
  setLoading,
  setError,
  clearOrders,
  selectRestaurantOrders,
  selectRestaurantStats,
  selectRestaurantLoading,
  selectRestaurantError,
  selectPendingOrders,
  selectPreparingOrders,
  selectReadyOrders,
  selectActiveOrders,
  restaurantOrdersReducer,
  type RestaurantOrder,
  type RestaurantStats,
  type RestaurantOrdersState,
} from '../restaurantOrdersSlice';

const mockOrder: RestaurantOrder = {
  id: 'ord-001',
  clientName: 'Alexandre João',
  clientPhone: '+244 923 123 456',
  items: [
    { id: '1', name: 'Burger Clássico', quantity: 2, price: 2500 },
    { id: '2', name: 'Batata Frita', quantity: 1, price: 1200 },
  ],
  status: 'pending',
  total: 6200,
  deliveryFee: 500,
  deliveryAddress: 'Rua da Mutamba, 45',
  notes: 'Portão azul',
  createdAt: '2026-09-09T10:00:00.000Z',
  updatedAt: '2026-09-09T10:00:00.000Z',
};

const mockOrder2: RestaurantOrder = {
  id: 'ord-002',
  clientName: 'Maria Santos',
  items: [{ id: '3', name: 'Pizza Margherita', quantity: 1, price: 3500 }],
  status: 'confirmed',
  total: 4000,
  deliveryFee: 500,
  createdAt: '2026-09-09T09:00:00.000Z',
  updatedAt: '2026-09-09T09:30:00.000Z',
};

const mockStats: RestaurantStats = {
  todayOrders: 12,
  todayRevenue: 45000,
  weekOrders: 78,
  weekRevenue: 312000,
  monthOrders: 312,
  monthRevenue: 1248000,
  averageRating: 4.7,
  totalRatings: 89,
};

const initialState: RestaurantOrdersState = {
  orders: [],
  stats: null,
  loading: false,
  error: null,
};

describe('restaurantOrdersSlice', () => {
  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(restaurantOrdersReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setOrders', () => {
      const state = restaurantOrdersReducer(initialState, setOrders([mockOrder, mockOrder2]));
      expect(state.orders).toHaveLength(2);
      expect(state.orders[0].id).toBe('ord-001');
      expect(state.orders[1].id).toBe('ord-002');
    });

    it('should handle addOrder', () => {
      const stateWithOrder = restaurantOrdersReducer(initialState, setOrders([mockOrder]));
      const state = restaurantOrdersReducer(stateWithOrder, addOrder(mockOrder2));
      expect(state.orders).toHaveLength(2);
      expect(state.orders[0].id).toBe('ord-002');
      expect(state.orders[1].id).toBe('ord-001');
    });

    it('should handle addOrder to empty state', () => {
      const state = restaurantOrdersReducer(initialState, addOrder(mockOrder));
      expect(state.orders).toHaveLength(1);
      expect(state.orders[0].id).toBe('ord-001');
    });

    it('should handle updateOrderStatus', () => {
      const stateWithOrder = restaurantOrdersReducer(initialState, setOrders([mockOrder]));
      const state = restaurantOrdersReducer(
        stateWithOrder,
        updateOrderStatus({ orderId: 'ord-001', status: 'confirmed' }),
      );
      expect(state.orders[0].status).toBe('confirmed');
    });

    it('should handle updateOrderStatus for non-existent order', () => {
      const stateWithOrder = restaurantOrdersReducer(initialState, setOrders([mockOrder]));
      const state = restaurantOrdersReducer(
        stateWithOrder,
        updateOrderStatus({ orderId: 'ord-999', status: 'confirmed' }),
      );
      expect(state.orders[0].status).toBe('pending');
    });

    it('should handle removeOrder', () => {
      const stateWithOrders = restaurantOrdersReducer(
        initialState,
        setOrders([mockOrder, mockOrder2]),
      );
      const state = restaurantOrdersReducer(stateWithOrders, removeOrder('ord-001'));
      expect(state.orders).toHaveLength(1);
      expect(state.orders[0].id).toBe('ord-002');
    });

    it('should handle removeOrder non-existent', () => {
      const stateWithOrders = restaurantOrdersReducer(initialState, setOrders([mockOrder]));
      const state = restaurantOrdersReducer(stateWithOrders, removeOrder('ord-999'));
      expect(state.orders).toHaveLength(1);
    });

    it('should handle setStats', () => {
      const state = restaurantOrdersReducer(initialState, setStats(mockStats));
      expect(state.stats).toEqual(mockStats);
      expect(state.stats?.todayOrders).toBe(12);
      expect(state.stats?.averageRating).toBe(4.7);
    });

    it('should handle setLoading', () => {
      const state = restaurantOrdersReducer(initialState, setLoading(true));
      expect(state.loading).toBe(true);
    });

    it('should handle setError', () => {
      const state = restaurantOrdersReducer(initialState, setError('Erro ao carregar'));
      expect(state.error).toBe('Erro ao carregar');
    });

    it('should handle setError null', () => {
      const stateWithError = restaurantOrdersReducer(initialState, setError('Erro'));
      const state = restaurantOrdersReducer(stateWithError, setError(null));
      expect(state.error).toBeNull();
    });

    it('should handle clearOrders', () => {
      const stateWithData = restaurantOrdersReducer(initialState, setOrders([mockOrder]));
      stateWithData.stats = mockStats;
      const state = restaurantOrdersReducer(stateWithData, clearOrders());
      expect(state.orders).toHaveLength(0);
      expect(state.stats).toBeNull();
    });
  });

  describe('selectors', () => {
    const stateWithOrders: RestaurantOrdersState = {
      orders: [mockOrder, mockOrder2],
      stats: mockStats,
      loading: false,
      error: null,
    };

    it('should select restaurantOrders', () => {
      expect(selectRestaurantOrders({ restaurantOrders: stateWithOrders })).toHaveLength(2);
    });

    it('should select restaurantStats', () => {
      expect(selectRestaurantStats({ restaurantOrders: stateWithOrders })).toEqual(mockStats);
    });

    it('should select restaurantLoading', () => {
      expect(selectRestaurantLoading({ restaurantOrders: stateWithOrders })).toBe(false);
    });

    it('should select restaurantError', () => {
      expect(selectRestaurantError({ restaurantOrders: stateWithOrders })).toBeNull();
    });

    it('should select pendingOrders', () => {
      expect(selectPendingOrders({ restaurantOrders: stateWithOrders })).toHaveLength(1);
      expect(selectPendingOrders({ restaurantOrders: stateWithOrders })[0].id).toBe('ord-001');
    });

    it('should select preparingOrders (confirmed + preparing)', () => {
      expect(selectPreparingOrders({ restaurantOrders: stateWithOrders })).toHaveLength(1);
      expect(selectPreparingOrders({ restaurantOrders: stateWithOrders })[0].id).toBe('ord-002');
    });

    it('should select readyOrders', () => {
      const readyOrder = { ...mockOrder, status: 'ready' as const };
      const state = { restaurantOrders: { ...stateWithOrders, orders: [readyOrder] } };
      expect(selectReadyOrders(state)).toHaveLength(1);
    });

    it('should select activeOrders', () => {
      const deliveredOrder = { ...mockOrder, status: 'delivered' as const };
      const cancelledOrder = { ...mockOrder2, status: 'cancelled' as const };
      const state = {
        restaurantOrders: {
          ...stateWithOrders,
          orders: [mockOrder, mockOrder2, deliveredOrder, cancelledOrder],
        },
      };
      expect(selectActiveOrders(state)).toHaveLength(2);
    });
  });
});
