import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  clearFavoriteRestaurants,
  isFavoriteRestaurant,
  loadFavoriteRestaurantIds,
  setFavoriteRestaurant,
  toggleFavoriteRestaurant,
} from '../favorites';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(async () => undefined),
  getItem: jest.fn(async () => null),
  removeItem: jest.fn(async () => undefined),
}));

const FAVORITES_KEY = 'favoriteRestaurants';

describe('favorites service', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    await clearFavoriteRestaurants();
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('começa vazio quando não há nada salvo', async () => {
    expect(await loadFavoriteRestaurantIds()).toEqual([]);
  });

  it('setFavoriteRestaurant(true) adiciona e persiste', async () => {
    const ids = await setFavoriteRestaurant('rest-1', true);
    expect(ids).toEqual(['rest-1']);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      FAVORITES_KEY,
      JSON.stringify(['rest-1'])
    );
  });

  it('não duplica um favorito já existente', async () => {
    await setFavoriteRestaurant('rest-1', true);
    const ids = await setFavoriteRestaurant('rest-1', true);
    expect(ids).toEqual(['rest-1']);
  });

  it('setFavoriteRestaurant(false) remove', async () => {
    await setFavoriteRestaurant('rest-1', true);
    await setFavoriteRestaurant('rest-2', true);
    const ids = await setFavoriteRestaurant('rest-1', false);
    expect(ids).toEqual(['rest-2']);
  });

  it('isFavoriteRestaurant reflete o estado salvo', async () => {
    await setFavoriteRestaurant('rest-1', true);
    expect(await isFavoriteRestaurant('rest-1')).toBe(true);
    expect(await isFavoriteRestaurant('rest-2')).toBe(false);
  });

  it('toggleFavoriteRestaurant alterna adicionar e remover', async () => {
    expect(await toggleFavoriteRestaurant('rest-1')).toEqual(['rest-1']);
    expect(await toggleFavoriteRestaurant('rest-2')).toEqual(['rest-1', 'rest-2']);
    expect(await toggleFavoriteRestaurant('rest-1')).toEqual(['rest-2']);
  });

  it('lê uma lista já persistida no storage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(['rest-9', 'rest-8'])
    );
    expect(await loadFavoriteRestaurantIds()).toEqual(['rest-9', 'rest-8']);
    expect(await isFavoriteRestaurant('rest-9')).toBe(true);
  });

  it('ignora JSON inválido e usa o cache em memória', async () => {
    await setFavoriteRestaurant('rest-1', true);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('nao-e-json');
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(await loadFavoriteRestaurantIds()).toEqual(['rest-1']);
    (console.warn as jest.Mock).mockRestore();
  });

  it('ignora payload que não é array', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ nope: true })
    );
    expect(await loadFavoriteRestaurantIds()).toEqual([]);
  });

  it('clearFavoriteRestaurants remove do storage e da memória', async () => {
    await setFavoriteRestaurant('rest-1', true);
    await clearFavoriteRestaurants();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(FAVORITES_KEY);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    expect(await loadFavoriteRestaurantIds()).toEqual([]);
  });

  it('cai para cache em memória quando o storage falha ao gravar', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('full'));
    const ids = await setFavoriteRestaurant('rest-7', true);
    expect(ids).toEqual(['rest-7']);
    // memória local continua respondendo
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('down'));
    expect(await loadFavoriteRestaurantIds()).toEqual(['rest-7']);
    (console.warn as jest.Mock).mockRestore();
  });
});
