import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CategoryCard, RestaurantCard } from "../../src/components/ui";
import { Header } from "../../src/components/ui/Header";
import {
    loadFavoriteRestaurantIds,
    toggleFavoriteRestaurant,
} from "../../src/services/favorites";
import { useAppSelector } from "../../src/store";
import { selectCartCount, selectCartSubtotal } from "../../src/store/cartSlice";
import { borderRadius, formatPrice, spacing } from "../../src/theme";
import { useTheme } from "../../src/hooks/useTheme";

const CATEGORIES = [
  {
    id: "1",
    name: "PIZZA",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae5d?w=200",
  },
  {
    id: "2",
    name: "BURGER",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200",
  },
  {
    id: "3",
    name: "BRASIL",
    image: "https://images.unsplash.com/photo-1612821763214-19af3594e98c?w=200",
  },
  {
    id: "4",
    name: "JAPÃO",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200",
  },
  { id: "5", name: "MAIS" },
];

const RESTAURANTS = [
  {
    id: "1",
    name: "Sabor da Praça",
    cuisine: "Angolana",
    rating: 4.8,
    distance: "1.2 km",
    deliveryTime: "30-40 min",
    deliveryFee: "Grátis",
    image: "https://images.unsplash.com/photo-1517248135467-4c7aad601933?w=400",
    favorite: true,
  },
  {
    id: "2",
    name: "BBQ Master Prime",
    cuisine: "Carnes",
    rating: 4.5,
    distance: "2.5 km",
    deliveryTime: "45-55 min",
    deliveryFee: "Kz 5.900",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
  },
  {
    id: "3",
    name: "Pizza Hut Express",
    cuisine: "Pizzaria",
    rating: 4.3,
    distance: "1.8 km",
    deliveryTime: "25-35 min",
    deliveryFee: "Grátis",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae5d?w=400",
  },
];

const FEATURED_OFFERS = [
  {
    id: "1",
    title: "Frete grátis hoje",
    subtitle: "Em restaurantes selecionados até às 20h.",
  },
  {
    id: "2",
    title: "2x pontos",
    subtitle: "Ganhe mais em pedidos acima de Kz 25.000.",
  },
];

const RECENT_ORDERS = [
  {
    id: "1",
    title: "Smash Burger Duplo",
    status: "Entregue ontem",
    total: "Kz 23.800",
  },
  {
    id: "2",
    title: "Pizza Quatro Queijos",
    status: "Pedido repetível",
    total: "Kz 18.500",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const cartCount = useAppSelector(selectCartCount);
  const cartSubtotal = useAppSelector(selectCartSubtotal);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const { colors } = useTheme();

  const firstName = user?.name?.split(" ")[0] ?? "Alexandre";
  const avatarUrl = user?.avatar;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingBottom: 16,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.gutter,
    },
    heroCard: {
      marginTop: spacing.md,
      marginBottom: spacing.md,
      backgroundColor: colors.primary[100],
      borderRadius: 24,
      padding: spacing.lg,
    },
    heroTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    heroTextBlock: {
      flex: 1,
      marginRight: spacing.sm,
    },
    kicker: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.neutral[700],
      marginBottom: 4,
    },
    heroBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 12,
      gap: 4,
    },
    heroBadgeText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.primary[500],
    },
    heroStatsRow: {
      flexDirection: "row",
      marginTop: spacing.lg,
      gap: spacing.md,
    },
    heroStat: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: spacing.sm,
      alignItems: "center",
    },
    heroStatValue: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.primary[500],
    },
    heroStatLabel: {
      fontSize: 10,
      color: colors.neutral[500],
      marginTop: 2,
    },
    searchContainer: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: 16,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    searchHint: {
      flex: 1,
      fontSize: 16,
      color: colors.neutral[500],
      marginLeft: spacing.sm,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionLink: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary[500],
    },
    offersScroll: {
      paddingRight: spacing.gutter,
    },
    offerCardContent: {
      flex: 1,
    },
    categoryWrapper: {
      marginRight: spacing.md,
    },
    categoryCard: {
      width: 80,
      height: 80,
      borderRadius: 20,
      backgroundColor: colors.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    categoryCardActive: {
      backgroundColor: colors.primary[100],
    },
    categoryLabel: {
      marginTop: spacing.xs,
      fontSize: 12,
      fontWeight: "600",
      color: colors.onSurface,
      textAlign: "center",
    },
    restaurantCard: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 24,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    restaurantHeader: {
      flexDirection: "row",
      marginBottom: spacing.sm,
    },
    restaurantImage: {
      width: 80,
      height: 80,
      borderRadius: 16,
      marginRight: spacing.sm,
    },
    restaurantInfo: {
      flex: 1,
      justifyContent: "center",
    },
    restaurantName: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.onSurface,
    },
    restaurantCuisine: {
      fontSize: 13,
      color: colors.neutral[500],
      marginTop: 2,
    },
    restaurantRating: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 4,
    },
    restaurantRatingText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.onSurface,
    },
    restaurantMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    restaurantMetaText: {
      fontSize: 12,
      color: colors.neutral[500],
    },
    restaurantDelivery: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    restaurantDeliveryFee: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.primary[500],
    },
    favoriteButton: {
      position: "absolute",
      top: spacing.sm,
      right: spacing.sm,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.onSurface,
    },
    sectionAction: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary[500],
    },
    categoryList: {
      marginBottom: spacing.lg,
    },
    categoryItem: {
      alignItems: "center",
      marginRight: spacing.md,
    },
    categoryImage: {
      width: 72,
      height: 72,
      borderRadius: 20,
      marginBottom: spacing.xs,
    },
    categoryName: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.onSurface,
    },
    restaurantList: {
      marginBottom: spacing.lg,
    },
    restaurantItem: {
      marginBottom: spacing.md,
    },
    offerCard: {
      marginRight: spacing.sm,
      padding: spacing.md,
      borderRadius: 16,
      width: 200,
    },
    offerTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.onSurface,
    },
    offerSubtitle: {
      fontSize: 12,
      color: colors.neutral[500],
      marginTop: 2,
    },
    orderItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.neutral[100],
    },
    orderImage: {
      width: 60,
      height: 60,
      borderRadius: 12,
      marginRight: spacing.sm,
    },
    orderInfo: {
      flex: 1,
    },
    orderTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.onSurface,
    },
    orderStatus: {
      fontSize: 12,
      color: colors.neutral[500],
    },
    orderTotal: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.primary[500],
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.onSurface,
      marginBottom: spacing.xs,
    },
    heroSubtitle: {
      fontSize: 16,
      color: colors.neutral[700],
    },
    offerKicker: {
      fontSize: 10,
      fontWeight: "700",
      color: colors.primary[500],
      marginBottom: 4,
    },
    sectionMeta: {
      fontSize: 12,
      color: colors.neutral[500],
    },
    categoriesScroll: {
      paddingRight: spacing.gutter,
    },
    lastSection: {
      marginBottom: 100,
    },
    orderCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 16,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    orderIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.primary[100],
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.sm,
    },
    orderContent: {
      flex: 1,
    },
    orderMeta: {
      fontSize: 12,
      color: colors.neutral[500],
      marginTop: 2,
    },
    orderPriceBlock: {
      alignItems: "flex-end",
    },
    orderPrice: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.primary[500],
    },
    orderAction: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.primary[500],
      marginTop: 2,
    },
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      const ids = await loadFavoriteRestaurantIds();
      if (mounted) {
        setFavoriteIds(ids);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const restaurants = useMemo(
    () =>
      RESTAURANTS.map((restaurant) => ({
        ...restaurant,
        favorite: favoriteIds.includes(restaurant.id),
      })),
    [favoriteIds],
  );

  async function handleToggleFavorite(id: string) {
    const nextIds = await toggleFavoriteRestaurant(id);
    setFavoriteIds(nextIds);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        showLogo={true}
        showAvatar={true}
        showCartBadge={cartCount > 0}
        cartItems={cartCount}
        cartTotal={formatPrice(cartSubtotal)}
        avatarUrl={avatarUrl}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroTextBlock}>
              <Text style={styles.kicker}>Olá, {firstName}</Text>
              <Text style={styles.heroTitle}>O que vamos pedir hoje?</Text>
              <Text style={styles.heroSubtitle}>
                Seleção demo com restaurantes, ofertas e atalhos prontos para
                explorar.
              </Text>
            </View>
            <View style={styles.heroBadge}>
              <MaterialCommunityIcons
                name="flash"
                size={22}
                color={colors.primary[500]}
              />
              <Text style={styles.heroBadgeText}>20 min</Text>
            </View>
          </View>

          <View style={styles.heroStatsRow}>
            <TouchableOpacity
              style={styles.heroStat}
              onPress={() => router.push("/restaurantes")}
            >
              <Text style={styles.heroStatValue}>3</Text>
              <Text style={styles.heroStatLabel}>Pratos favoritos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.heroStat}
              onPress={() => router.push("/restaurantes")}
            >
              <Text style={styles.heroStatValue}>12</Text>
              <Text style={styles.heroStatLabel}>Restaurantes perto</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.heroStat}
              onPress={() => router.push("/carrinho")}
            >
              <Text style={styles.heroStatValue}>{cartCount}</Text>
              <Text style={styles.heroStatLabel}>Itens no carrinho</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.searchContainer}
          onPress={() => router.push("/restaurantes")}
          activeOpacity={0.9}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={24}
            color={colors.neutral[500]}
          />
          <Text style={styles.searchHint}>
            Pratos, restaurantes ou tipos...
          </Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ofertas do dia</Text>
            <TouchableOpacity onPress={() => router.push("/restaurantes")}>
              <Text style={styles.sectionLink}>Ver restaurantes</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.offersScroll}
          >
            {FEATURED_OFFERS.map((offer) => (
              <TouchableOpacity
                key={offer.id}
                style={styles.offerCard}
                onPress={() => router.push("/restaurantes")}
              >
                <Text style={styles.offerKicker}>Destaque</Text>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categorias em alta</Text>
            <Text style={styles.sectionMeta}>seleção local</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryItem}
                onPress={() => router.push("/restaurantes")}
              >
                <CategoryCard name={cat.name} image={cat.image} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Restaurantes próximos</Text>
            <TouchableOpacity onPress={() => router.push("/restaurantes")}>
              <Text style={styles.sectionLink}>Ver lista</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={restaurants}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RestaurantCard
                title={item.name}
                subtitle={item.cuisine}
                image={item.image}
                rating={item.rating}
                distance={item.distance}
                deliveryTime={item.deliveryTime}
                deliveryFee={item.deliveryFee}
                favorite={item.favorite}
                onFavoritePress={() => handleToggleFavorite(item.id)}
                onPress={() => router.push("/restaurante")}
              />
            )}
            scrollEnabled={false}
          />
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pedidos recentes</Text>
            <TouchableOpacity onPress={() => router.push("/pedidos")}>
              <Text style={styles.sectionLink}>Ver histórico</Text>
            </TouchableOpacity>
          </View>

          {RECENT_ORDERS.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => router.push("/pedidos")}
            >
              <View style={styles.orderIcon}>
                <MaterialCommunityIcons
                  name="receipt-text-outline"
                  size={20}
                  color={colors.primary[500]}
                />
              </View>
              <View style={styles.orderContent}>
                <Text style={styles.orderTitle}>{order.title}</Text>
                <Text style={styles.orderMeta}>{order.status}</Text>
              </View>
              <View style={styles.orderPriceBlock}>
                <Text style={styles.orderPrice}>{order.total}</Text>
                <Text style={styles.orderAction}>Repetir</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
);
}
