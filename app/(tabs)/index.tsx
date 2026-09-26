import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '../../src/components/ui/Header';
import { loadFavoriteRestaurantIds, toggleFavoriteRestaurant } from '../../src/services/favorites';
import { useAppSelector } from '../../src/store';
import { selectCartCount, selectCartSubtotal } from '../../src/store/cartSelectors';
import { spacing, formatPrice, typography } from '../../src/theme';
import { useGetRestaurantsQuery } from '../../src/hooks/useApi';
import { useTheme } from '../../src/hooks/useTheme';
import type { Restaurant } from '../../src/types';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const cartCount = useAppSelector(selectCartCount);
  const cartSubtotal = useAppSelector(selectCartSubtotal);
  const { colors } = useTheme();

  const firstName = user?.name?.split(' ')[0] ?? '';
  const avatarUrl = user?.avatar;
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const {
    data: restaurantsData,
    isLoading: loading,
    error: restaurantsError,
  } = useGetRestaurantsQuery({ limit: 20 });

  const restaurants = useMemo<Restaurant[]>(() => {
    if (!restaurantsData) return [];
    const rows = Array.isArray(restaurantsData) ? restaurantsData : restaurantsData.data;
    return rows ?? [];
  }, [restaurantsData]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const ids = await loadFavoriteRestaurantIds();
      if (mounted) setFavoriteIds(ids);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (restaurantsError) {
      console.warn('[home] failed to load restaurants', restaurantsError);
    }
  }, [restaurantsError]);

  async function handleToggleFavorite(id: string) {
    const nextIds = await toggleFavoriteRestaurant(id);
    setFavoriteIds(nextIds);
  }

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
          paddingBottom: 16,
        },
        content: {
          paddingHorizontal: spacing.gutter,
          paddingBottom: spacing.xl,
        },
        heroCard: {
          marginTop: spacing.md,
          marginBottom: spacing.md,
          backgroundColor: colors.primary[100],
          borderRadius: 24,
          padding: spacing.lg,
        },
        heroTopRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        },
        heroTextBlock: {
          flex: 1,
          marginRight: spacing.sm,
        },
        kicker: {
          ...typography.labelLg,
          color: colors.neutral[700],
          marginBottom: 4,
        },
        heroBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: 12,
          gap: 4,
        },
        heroBadgeText: {
          ...typography.labelCaps,
          color: colors.primary[500],
        },
        heroStatsRow: {
          flexDirection: 'row',
          marginTop: spacing.lg,
          gap: spacing.md,
        },
        heroStat: {
          flex: 1,
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: spacing.sm,
          alignItems: 'center',
        },
        heroStatValue: {
          ...typography.h3,
          color: colors.primary[500],
        },
        heroStatLabel: {
          ...typography.labelCaps,
          color: colors.neutral[500],
          marginTop: 2,
        },
        searchContainer: {
          backgroundColor: colors.surfaceContainer,
          borderRadius: 16,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: spacing.lg,
        },
        searchHint: {
          flex: 1,
          ...typography.bodyMd,
          color: colors.neutral[500],
          marginLeft: spacing.sm,
        },
        section: {
          marginBottom: spacing.lg,
        },
        sectionHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.md,
        },
        sectionTitle: {
          ...typography.h3,
          color: colors.onSurface,
        },
        sectionLink: {
          ...typography.labelLg,
          color: colors.primary[500],
        },
        sectionMeta: {
          ...typography.bodySm,
          color: colors.neutral[500],
        },
        restaurantScroll: {
          paddingRight: spacing.gutter,
        },
        restaurantCardHorizontal: {
          width: 260,
          marginRight: spacing.md,
          backgroundColor: colors.surfaceContainerLowest,
          borderRadius: 24,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.surfaceVariant,
        },
        restaurantImageHorizontal: {
          width: '100%',
          height: 140,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        },
        restaurantInfoHorizontal: {
          padding: spacing.md,
        },
        restaurantNameHorizontal: {
          ...typography.labelLg,
          color: colors.onSurface,
          fontWeight: '700',
          marginBottom: 2,
        },
        restaurantCuisineHorizontal: {
          ...typography.bodySm,
          color: colors.neutral[500],
          marginBottom: spacing.xs,
        },
        restaurantMetaHorizontal: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.xs,
        },
        restaurantMetaTextHorizontal: {
          ...typography.bodySm,
          color: colors.neutral[500],
        },
        restaurantRatingRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        restaurantRatingHorizontal: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        restaurantRatingTextHorizontal: {
          ...typography.bodySm,
          fontWeight: '600',
          color: colors.onSurface,
        },
        restaurantDeliveryFeeHorizontal: {
          ...typography.labelCaps,
          color: colors.primary[500],
          fontWeight: '700',
        },
        restaurantFavoriteButton: {
          position: 'absolute',
          top: spacing.sm,
          right: spacing.sm,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        },
        heroTitle: {
          ...typography.h1,
          color: colors.onSurface,
          marginBottom: spacing.xs,
        },
        heroSubtitle: {
          ...typography.bodyMd,
          color: colors.neutral[700],
        },
        loadingContainer: {
          paddingVertical: spacing.xxl,
          alignItems: 'center',
        },
        emptyContainer: {
          paddingVertical: spacing.xxl,
          alignItems: 'center',
        },
        emptyText: {
          ...typography.bodySm,
          color: colors.neutral[500],
        },
        lastSection: {
          marginBottom: 100,
        },
      }),
    [colors],
  );

  const restaurantList = useMemo(
    () =>
      restaurants.map((r) => ({
        ...r,
        favorite: favoriteIds.includes(r.id),
      })),
    [restaurants, favoriteIds],
  );

  const headerList = useMemo(
    () => (
      <View>
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroTextBlock}>
              <Text style={styles.kicker}>Ola, {firstName}</Text>
              <Text style={styles.heroTitle}>O que vamos pedir hoje?</Text>
              <Text style={styles.heroSubtitle}>Explorar restaurantes e fazer o seu pedido.</Text>
            </View>
            <View style={styles.heroBadge}>
              <MaterialCommunityIcons name="flash" size={22} color={colors.primary[500]} />
              <Text style={styles.heroBadgeText}>20 min</Text>
            </View>
          </View>

          <View style={styles.heroStatsRow}>
            <TouchableOpacity
              style={styles.heroStat}
              onPress={() => router.push('/(tabs)/restaurantes')}
            >
              <Text style={styles.heroStatValue}>{restaurants.length}</Text>
              <Text style={styles.heroStatLabel}>Restaurantes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.heroStat}
              onPress={() => router.push('/(tabs)/restaurantes')}
            >
              <Text style={styles.heroStatValue}>{favoriteIds.length}</Text>
              <Text style={styles.heroStatLabel}>Favoritos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroStat} onPress={() => router.push('/carrinho')}>
              <Text style={styles.heroStatValue}>{cartCount}</Text>
              <Text style={styles.heroStatLabel}>Itens no carrinho</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.searchContainer}
          onPress={() => router.push('/(tabs)/restaurantes')}
          activeOpacity={0.9}
        >
          <MaterialCommunityIcons name="magnify" size={24} color={colors.neutral[500]} />
          <Text style={styles.searchHint}>Pratos, restaurantes ou tipos...</Text>
        </TouchableOpacity>

        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Restaurantes</Text>
              <Text style={styles.sectionMeta}>Os melhores perto de voce</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/restaurantes')}>
              <Text style={styles.sectionLink}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
          ) : restaurantList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum restaurante encontrado</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={restaurantList}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.restaurantScroll}
              renderItem={({ item: restaurant }) => (
                <TouchableOpacity
                  key={restaurant.id}
                  style={styles.restaurantCardHorizontal}
                  onPress={() =>
                    router.push({ pathname: '/restaurante', params: { id: restaurant.id } })
                  }
                >
                  <Image
                    source={{ uri: restaurant.image }}
                    style={styles.restaurantImageHorizontal}
                  />
                  <TouchableOpacity
                    style={styles.restaurantFavoriteButton}
                    onPress={() => handleToggleFavorite(restaurant.id)}
                  >
                    <MaterialCommunityIcons
                      name={restaurant.favorite ? 'heart' : 'heart-outline'}
                      size={18}
                      color={restaurant.favorite ? colors.error : colors.neutral[400]}
                    />
                  </TouchableOpacity>
                  <View style={styles.restaurantInfoHorizontal}>
                    <Text style={styles.restaurantNameHorizontal} numberOfLines={1}>
                      {restaurant.name}
                    </Text>
                    <Text style={styles.restaurantCuisineHorizontal}>{restaurant.cuisine}</Text>
                    <View style={styles.restaurantMetaHorizontal}>
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={14}
                        color={colors.neutral[500]}
                      />
                      <Text style={styles.restaurantMetaTextHorizontal}>
                        {restaurant.deliveryTime}
                      </Text>
                    </View>
                    <View style={styles.restaurantRatingRow}>
                      <View style={styles.restaurantRatingHorizontal}>
                        <MaterialCommunityIcons
                          name="star"
                          size={16}
                          color={colors.secondary[500]}
                        />
                        <Text style={styles.restaurantRatingTextHorizontal}>
                          {restaurant.rating > 0 ? restaurant.rating.toFixed(1) : 'Novo'}
                        </Text>
                      </View>
                      <Text style={styles.restaurantDeliveryFeeHorizontal}>
                        {restaurant.deliveryFee > 0
                          ? formatPrice(restaurant.deliveryFee)
                          : 'Gratis'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    ),
    [styles, colors, firstName, cartCount, restaurants, favoriteIds, router, loading],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        showLogo={true}
        showAvatar={true}
        showCartBadge={cartCount > 0}
        cartItems={cartCount}
        cartTotal={formatPrice(cartSubtotal)}
        avatarUrl={avatarUrl}
      />

      <FlatList
        data={[]}
        keyExtractor={() => 'header'}
        renderItem={() => null}
        ListHeaderComponent={headerList}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={3}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
}
