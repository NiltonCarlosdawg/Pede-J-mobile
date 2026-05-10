import { safeGetItem, safeRemoveItem, safeSetItem } from "../utils/storage";

const FAVORITES_KEY = "favoriteRestaurants";

let memoryFavorites = new Set<string>();

async function readFavoriteIds(): Promise<string[]> {
  try {
    const raw = await safeGetItem(FAVORITES_KEY);

    if (!raw) {
      return Array.from(memoryFavorites);
    }

    const parsed = JSON.parse(raw) as string[];

    if (!Array.isArray(parsed)) {
      return Array.from(memoryFavorites);
    }

    memoryFavorites = new Set(parsed);
    return parsed;
  } catch (error) {
    console.warn("[favorites] storage unavailable, using memory cache", error);
    return Array.from(memoryFavorites);
  }
}

async function writeFavoriteIds(ids: string[]) {
  memoryFavorites = new Set(ids);

  try {
    await safeSetItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch (error) {
    console.warn("[favorites] falling back to in-memory storage", error);
  }
}

export async function loadFavoriteRestaurantIds() {
  return readFavoriteIds();
}

export async function isFavoriteRestaurant(id: string) {
  const ids = await readFavoriteIds();
  return ids.includes(id);
}

export async function setFavoriteRestaurant(id: string, favorite: boolean) {
  const ids = await readFavoriteIds();
  const nextIds = favorite
    ? Array.from(new Set([...ids, id]))
    : ids.filter((favoriteId) => favoriteId !== id);

  await writeFavoriteIds(nextIds);
  return nextIds;
}

export async function toggleFavoriteRestaurant(id: string) {
  const ids = await readFavoriteIds();
  const nextIds = ids.includes(id)
    ? ids.filter((favoriteId) => favoriteId !== id)
    : [...ids, id];

  await writeFavoriteIds(nextIds);
  return nextIds;
}

export async function clearFavoriteRestaurants() {
  memoryFavorites = new Set();

  try {
    await safeRemoveItem(FAVORITES_KEY);
  } catch (error) {
    console.warn("[favorites] clear fallback", error);
  }
}
