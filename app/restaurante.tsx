import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ProductCard } from '../src/components/ui';
import { spacing, formatPrice, typography } from '../src/theme';
import { shadowStyle } from '../src/utils/shadow';
import { useAppDispatch, useAppSelector } from '../src/store';
import { selectCartCount, selectCartSubtotal } from '../src/store/cartSelectors';
import { addItem } from '../src/store/cartSlice';
import { useTheme } from '../src/hooks/useTheme';
import { useGetRestaurantByIdQuery, useGetRestaurantProductsQuery } from '../src/hooks/useApi';

type MenuItem = {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  badge?: string;
  isFeatured?: boolean;
  isAvailable?: boolean;
  section: string;
};

type Section = {
  id: string;
  title: string;
  subtitle: string;
};

function parsePrice(value: number | string): number {
  if (typeof value === 'number') return value;
  const numeric = String(value).replace(/[^\d]/g, '');
  return numeric ? Number(numeric) : 0;
}

function formatDeliveryFee(fee: number): string {
  return fee === 0 ? 'Grátis' : `Kz ${fee.toLocaleString('pt-BR')}`;
}

export default function RestaurantScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const flatListRef = useRef<FlatList>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);
  const cartSubtotal = useAppSelector(selectCartSubtotal);
  const { colors } = useTheme();

  const {
    data: restaurant,
    isLoading: restaurantLoading,
    isError: restaurantFailed,
    error: restaurantError,
  } = useGetRestaurantByIdQuery(id ?? '', { skip: !id });

  const {
    data: productsPage,
    isLoading: productsLoading,
    isError: productsFailed,
    error: productsError,
  } = useGetRestaurantProductsQuery(id ?? '', { skip: !id });

  const products = useMemo(() => productsPage?.data ?? [], [productsPage]);

  const loadFailed = restaurantFailed || productsFailed;
  const error = loadFailed ? 'Não foi possível carregar os dados do restaurante.' : null;
  const loading = !id || (!loadFailed && (restaurantLoading || productsLoading));

  useEffect(() => {
    if (restaurantError) {
      console.error('Failed to fetch restaurant:', restaurantError);
    }
    if (productsError) {
      console.error('Failed to fetch restaurant:', productsError);
    }
  }, [restaurantError, productsError]);

  const menuSections = useMemo<Section[]>(() => {
    const categoryMap = new Map<string, boolean>();
    for (const p of products) {
      if (!p.isFeatured && p.category) {
        categoryMap.set(p.category, true);
      }
    }
    const sections: Section[] = [];
    if (products.some((p) => p.isFeatured)) {
      sections.push({ id: 'featured', title: 'Destaques', subtitle: 'Os itens mais pedidos' });
    }
    for (const [cat] of categoryMap) {
      sections.push({ id: cat, title: cat, subtitle: '' });
    }
    return sections;
  }, [products]);

  const menuItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return products
      .filter((p) => {
        if (!p.isAvailable) return false;
        if (!normalizedQuery) return true;
        return (
          p.name.toLowerCase().includes(normalizedQuery) ||
          p.description.toLowerCase().includes(normalizedQuery)
        );
      })
      .map((p): MenuItem => ({
        id: p.id,
        title: p.name,
        description: p.description,
        price: typeof p.price === 'number' ? formatPrice(p.price) : String(p.price),
        image: p.image,
        isFeatured: p.isFeatured,
        isAvailable: p.isAvailable,
        section: p.isFeatured ? 'featured' : p.category,
      }));
  }, [products, searchQuery]);

  function handleSearch() {
    flatListRef.current?.scrollToOffset({ offset: 320, animated: true });
  }

  function handleAddToCart(product: MenuItem) {
    dispatch(
      addItem({
        id: product.id,
        title: product.title,
        price: parsePrice(product.price),
        image: product.image,
      }),
    );
  }

  function handleProductPress(product: MenuItem) {
    router.push({
      pathname: '/produto-modal',
      params: {
        id: product.id,
        name: product.title,
        price: parsePrice(product.price).toString(),
        image: product.image,
        restaurant: restaurant?.name ?? '',
        rating: restaurant ? restaurant.rating.toFixed(1) : '0.0',
        description: product.description,
      },
    });
  }

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
          paddingBottom: 96,
        },
        loadingContainer: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        },
        errorContainer: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
          padding: 32,
        },
        errorText: {
          ...typography.bodyMd,
          color: colors.onSurfaceVariant,
          textAlign: 'center',
          marginTop: 12,
        },
        heroContainer: {
          height: 300,
          position: 'relative',
        },
        heroImage: {
          width: '100%',
          height: '100%',
        },
        topActions: {
          position: 'absolute',
          top: 50,
          left: 16,
          right: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
        },
        actionButton: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(255,255,255,0.92)',
          alignItems: 'center',
          justifyContent: 'center',
        },
        rightActions: {
          flexDirection: 'row',
          gap: 8,
        },
        badgeRow: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16,
          flexDirection: 'row',
          gap: 8,
        },
        openBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.92)',
        },
        openBadgeText: {
          ...typography.labelCaps,
          color: colors.onSurface,
        },
        deliveryChip: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.92)',
        },
        deliveryChipText: {
          ...typography.labelCaps,
          color: colors.onSurface,
        },
        infoSection: {
          backgroundColor: colors.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 16,
          marginTop: -24,
          ...shadowStyle({ offsetY: -8, blur: 20, opacity: 0.05 }),
        },
        restaurantName: {
          ...typography.h1,
          color: colors.onSurface,
        },
        restaurantCuisine: {
          ...typography.bodySm,
          color: colors.neutral[500],
          marginTop: 4,
        },
        infoRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginTop: 16,
          flexWrap: 'wrap',
        },
        ratingBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          backgroundColor: 'rgba(251,172,29,0.1)',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
        },
        ratingText: {
          ...typography.labelLg,
          color: colors.secondary[500],
        },
        infoItem: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          flexShrink: 1,
        },
        infoText: {
          ...typography.bodySm,
          color: colors.onSurfaceVariant,
        },
        searchBar: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginTop: 16,
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderRadius: 18,
          backgroundColor: colors.surfaceContainerHighet,
        },
        searchInput: {
          flex: 1,
          ...typography.bodyMd,
          color: colors.onSurface,
          paddingVertical: 0,
        },
        tabs: {
          flexDirection: 'row',
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.surfaceVariant,
          paddingHorizontal: 16,
        },
        activeTab: {
          paddingVertical: 16,
          borderBottomWidth: 3,
          borderBottomColor: colors.primary[500],
        },
        activeTabText: {
          ...typography.labelLg,
          color: colors.primary[500],
        },
        inactiveTab: {
          paddingVertical: 16,
          borderBottomWidth: 3,
          borderBottomColor: 'transparent',
        },
        inactiveTabText: {
          ...typography.labelLg,
          color: colors.neutral[500],
        },
        menuContent: {
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 32,
        },
        section: {
          marginBottom: 32,
        },
        sectionTitle: {
          ...typography.h2,
          color: colors.onSurface,
        },
        sectionSubtitle: {
          ...typography.bodySm,
          color: colors.neutral[500],
          marginTop: 4,
          marginBottom: 12,
        },
        productWrap: {
          marginBottom: 12,
        },
        emptyState: {
          alignItems: 'center',
          paddingVertical: 32,
          paddingHorizontal: 16,
          borderRadius: 24,
          backgroundColor: colors.surfaceContainerLowest,
          borderWidth: 1,
          borderColor: colors.surfaceVariant,
        },
        emptyTitle: {
          marginTop: 12,
          ...typography.labelLg,
          color: colors.onSurface,
        },
        emptyText: {
          marginTop: 4,
          ...typography.bodySm,
          lineHeight: 18,
          textAlign: 'center',
          color: colors.neutral[700],
        },
        cartBar: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.surfaceContainerLowest,
          borderTopWidth: 1,
          borderTopColor: colors.surfaceVariant,
          paddingHorizontal: 16,
          paddingVertical: 12,
        },
        cartButton: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.primary[500],
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 16,
        },
        cartCount: {
          width: 24,
          height: 24,
          borderRadius: 6,
          backgroundColor: 'rgba(255,255,255,0.2)',
          alignItems: 'center',
          justifyContent: 'center',
        },
        cartCountText: {
          ...typography.labelLg,
          color: colors.white,
        },
        cartButtonText: {
          ...typography.labelLg,
          color: colors.white,
          flex: 1,
          marginLeft: 12,
        },
        cartTotal: {
          ...typography.h3,
          color: colors.secondary[500],
        },
        ratingSummary: {
          alignItems: 'center',
          marginBottom: spacing.md,
          paddingVertical: spacing.md,
        },
        ratingBig: {
          ...typography.h1,
          color: colors.onSurface,
        },
        ratingStars: {
          flexDirection: 'row',
          gap: 4,
          marginVertical: spacing.xs,
        },
        ratingCount: {
          ...typography.bodySm,
          color: colors.neutral[500],
        },
      }),
    [colors],
  );

  const reviewsComponent = useMemo(() => {
    if (!restaurant) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Avaliações</Text>
        <View style={styles.ratingSummary}>
          <Text style={styles.ratingBig}>{restaurant.rating.toFixed(1)}</Text>
          <View style={styles.ratingStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <MaterialCommunityIcons
                key={star}
                name={star <= Math.round(restaurant.rating) ? 'star' : 'star-outline'}
                size={20}
                color={colors.secondary[500]}
              />
            ))}
          </View>
          <Text style={styles.ratingCount}>{restaurant.ratingCount} avaliações</Text>
        </View>
      </View>
    );
  }, [restaurant, styles, colors]);

  const headerComponent = useMemo(() => {
    if (!restaurant) return null;

    return (
      <View>
        <View style={styles.heroContainer}>
          <Image source={{ uri: restaurant.image }} style={styles.heroImage} />

          <View style={styles.topActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurface} />
            </TouchableOpacity>
            <View style={styles.rightActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleSearch}>
                <MaterialCommunityIcons name="magnify" size={24} color={colors.onSurface} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={async () => {
                  try {
                    await Share.share({
                      message: `Vê o menu do ${restaurant.name}: ${restaurant.image}`,
                    });
                  } catch (error) {
                    console.log(error);
                  }
                }}
              >
                <MaterialCommunityIcons name="share-variant" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.badgeRow}>
            <View style={styles.openBadge}>
              <MaterialCommunityIcons
                name={restaurant.isOpen ? 'checkbox-marked-circle' : 'clock-outline'}
                size={14}
                color={restaurant.isOpen ? colors.primary[500] : colors.neutral[500]}
              />
              <Text style={styles.openBadgeText}>
                {restaurant.isOpen ? 'Aberto agora' : 'Fechado'}
              </Text>
            </View>
            <View style={styles.deliveryChip}>
              <MaterialCommunityIcons name="moped" size={14} color={colors.primary[500]} />
              <Text style={styles.deliveryChipText}>
                {formatDeliveryFee(restaurant.deliveryFee)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>

          <View style={styles.infoRow}>
            <View style={styles.ratingBadge}>
              <MaterialCommunityIcons name="star" size={16} color={colors.secondary[500]} />
              <Text style={styles.ratingText}>
                {restaurant.rating.toFixed(1)} ({restaurant.ratingCount})
              </Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={18}
                color={colors.onSurfaceVariant}
              />
              <Text style={styles.infoText}>{restaurant.deliveryTime}</Text>
            </View>
            {restaurant.distance != null && (
              <View style={styles.infoItem}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={18}
                  color={colors.onSurfaceVariant}
                />
                <Text style={styles.infoText}>{restaurant.distance} km</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.searchBar} onPress={handleSearch}>
            <MaterialCommunityIcons name="magnify" size={20} color={colors.neutral[500]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar no menu..."
              placeholderTextColor={colors.neutral[500]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity style={styles.activeTab}>
            <Text style={styles.activeTabText}>Menu</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inactiveTab}>
            <Text style={styles.inactiveTabText}>Avaliações</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inactiveTab}>
            <Text style={styles.inactiveTabText}>Info</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [restaurant, styles, colors, searchQuery, handleSearch, router]);

  const flatMenuData = useMemo(() => {
    type FlatItem =
      | { type: 'section-header'; title: string; subtitle: string }
      | { type: 'product'; product: MenuItem };

    const items: FlatItem[] = [];

    for (const section of menuSections) {
      const sectionProducts = menuItems.filter((product) => product.section === section.id);

      if (!sectionProducts.length) continue;

      items.push({ type: 'section-header', title: section.title, subtitle: section.subtitle });
      for (const product of sectionProducts) {
        items.push({ type: 'product', product });
      }
    }

    return items;
  }, [menuItems, menuSections]);

  const renderFlatItem = useCallback(
    ({
      item,
    }: {
      item: { type: string; title?: string; subtitle?: string; product?: MenuItem };
    }) => {
      if (item.type === 'section-header') {
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            {item.subtitle ? <Text style={styles.sectionSubtitle}>{item.subtitle}</Text> : null}
          </View>
        );
      }

      const product = item.product!;
      return (
        <View style={styles.productWrap}>
          <ProductCard
            title={product.title}
            description={product.description}
            price={product.price}
            image={product.image}
            badge={product.badge}
            isFeatured={product.isFeatured}
            isAvailable={product.isAvailable}
            onAdd={() => handleAddToCart(product)}
            onPress={() => handleProductPress(product)}
          />
        </View>
      );
    },
    [styles, handleAddToCart, handleProductPress],
  );

  const flatKeyExtractor = useCallback(
    (item: { type: string; title?: string; product?: MenuItem }, index: number) =>
      item.type === 'section-header' ? `section-${item.title}` : item.product!.id,
    [],
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (error || !restaurant) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.neutral[500]} />
        <Text style={styles.errorText}>{error || 'Restaurante não encontrado.'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ ...typography.labelLg, color: colors.primary[500] }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={flatMenuData}
        renderItem={renderFlatItem}
        keyExtractor={flatKeyExtractor}
        ListHeaderComponent={headerComponent}
        ListFooterComponent={
          <View style={styles.menuContent}>
            {menuItems.length === 0 && flatMenuData.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="magnify-close"
                  size={32}
                  color={colors.neutral[500]}
                />
                <Text style={styles.emptyTitle}>Nenhum item encontrado</Text>
                <Text style={styles.emptyText}>
                  Tenta outra pesquisa para encontrar pratos no menu.
                </Text>
              </View>
            ) : null}
            {reviewsComponent}
          </View>
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={true}
      />

      <View style={styles.cartBar}>
        <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/checkout')}>
          <View style={styles.cartCount}>
            <Text style={styles.cartCountText}>{cartCount}</Text>
          </View>
          <Text style={styles.cartButtonText}>Ir para checkout</Text>
          <Text style={styles.cartTotal}>{formatPrice(cartSubtotal)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
