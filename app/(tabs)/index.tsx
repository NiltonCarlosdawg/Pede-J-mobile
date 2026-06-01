import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CategoryCard } from "../../src/components/ui";
import { Header } from "../../src/components/ui/Header";
import {
    loadFavoriteRestaurantIds,
    toggleFavoriteRestaurant,
} from "../../src/services/favorites";
import { useAppSelector } from "../../src/store";
import { selectCartCount, selectCartSubtotal } from "../../src/store/cartSelectors";
import { selectActivePromotions } from "../../src/store/promotionsSlice";
import { borderRadius, formatPrice, spacing, typography } from "../../src/theme";
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
  {
    id: "4",
    name: "Sushi Palace",
    cuisine: "Japonesa",
    rating: 4.7,
    distance: "3.1 km",
    deliveryTime: "40-50 min",
    deliveryFee: "Kz 3.500",
    image: "https://images.unsplash.com/photo-1579027989246-ea81f0b65b19?w=400",
  },
  {
    id: "5",
    name: "Tropical Grill",
    cuisine: "Brasileira",
    rating: 4.6,
    distance: "1.5 km",
    deliveryTime: "35-45 min",
    deliveryFee: "Grátis",
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400",
  },
  {
    id: "6",
    name: "La Pasta Bella",
    cuisine: "Italiana",
    rating: 4.4,
    distance: "2.2 km",
    deliveryTime: "30-40 min",
    deliveryFee: "Kz 2.900",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400",
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

const LOW_RATED_RESTAURANTS = [
  {
    id: "l1",
    name: "Cantinho da Dona",
    cuisine: "Caseira",
    rating: 2.5,
    distance: "1.8 km",
    deliveryTime: "50-70 min",
    deliveryFee: "Grátis",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400",
  },
  {
    id: "l2",
    name: "Tradicional Grill",
    cuisine: "Angolana",
    rating: 2.8,
    distance: "3.2 km",
    deliveryTime: "45-60 min",
    deliveryFee: "Kz 2.500",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
  },
  {
    id: "l3",
    name: "Express Food",
    cuisine: "Fast Food",
    rating: 1.8,
    distance: "0.9 km",
    deliveryTime: "20-30 min",
    deliveryFee: "Kz 1.500",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
  },
  {
    id: "l4",
    name: "Bom e Barato",
    cuisine: "Brasileira",
    rating: 2.1,
    distance: "2.0 km",
    deliveryTime: "35-50 min",
    deliveryFee: "Grátis",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
  },
  {
    id: "l5",
    name: "Recanto Mineiro",
    cuisine: "Caseira",
    rating: 2.3,
    distance: "4.1 km",
    deliveryTime: "55-70 min",
    deliveryFee: "Kz 3.900",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400",
  },
  {
    id: "l6",
    name: "Rápido Lanches",
    cuisine: "Lanches",
    rating: 1.5,
    distance: "1.5 km",
    deliveryTime: "15-25 min",
    deliveryFee: "Grátis",
    image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400",
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

const PRODUCT_SECTIONS = [
  {
    id: "burgers",
    title: "Hambúrgueres Artesanais",
    subtitle: "Os mais pedidos da semana",
    products: [
      {
        id: "b1",
        name: "Smash Burger",
        price: 8500,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
        restaurant: "Burger King",
        rating: 4.8,
      },
      {
        id: "b2",
        name: "Double Bacon",
        price: 10200,
        image: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=400",
        restaurant: "BBQ Master",
        rating: 4.7,
      },
      {
        id: "b3",
        name: "Cheese Classic",
        price: 7500,
        image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400",
        restaurant: "Sabor da Praça",
        rating: 4.5,
      },
      {
        id: "b4",
        name: "Chicken Crispy",
        price: 6800,
        image: "https://images.unsplash.com/photo-1606755962775-e2e0c2cd49c9?w=400",
        restaurant: "Fast Grill",
        rating: 4.6,
      },
      {
        id: "b5",
        name: "Veggie Supreme",
        price: 7800,
        image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400",
        restaurant: "Green Eat",
        rating: 4.4,
      },
    ],
  },
  {
    id: "pizzas",
    title: "Pizzas Quentes",
    subtitle: "Saindo agora do forno",
    products: [
      {
        id: "p1",
        name: "Pepperoni",
        price: 12500,
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400",
        restaurant: "Pizza Hut",
        rating: 4.9,
      },
      {
        id: "p2",
        name: "Quatro Queijos",
        price: 11800,
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
        restaurant: "Italiano",
        rating: 4.7,
      },
      {
        id: "p3",
        name: "Marguerita",
        price: 9500,
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400",
        restaurant: "Sabor da Praça",
        rating: 4.6,
      },
      {
        id: "p4",
        name: "Calabresa",
        price: 11200,
        image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400",
        restaurant: "Pizza Hut",
        rating: 4.8,
      },
      {
        id: "p5",
        name: "Frango c/ Catupiry",
        price: 10800,
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae5d?w=400",
        restaurant: "BBQ Master",
        rating: 4.5,
      },
    ],
  },
  {
    id: "combos",
    title: "Combos & Bebidas",
    subtitle: "Complete seu pedido",
    products: [
      {
        id: "c1",
        name: "Combo Família",
        price: 18500,
        image: "https://images.unsplash.com/photo-1594212699903-ec8a3bae50d5?w=400",
        restaurant: "Pizza Hut",
        rating: 4.9,
      },
      {
        id: "c2",
        name: "Coca-Cola 2L",
        price: 2500,
        image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400",
        restaurant: "Sabor da Praça",
        rating: 4.7,
      },
      {
        id: "c3",
        name: "Batata Frita GG",
        price: 4500,
        image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400",
        restaurant: "Fast Grill",
        rating: 4.6,
      },
      {
        id: "c4",
        name: "Suco Natural",
        price: 1800,
        image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400",
        restaurant: "Green Eat",
        rating: 4.8,
      },
      {
        id: "c5",
        name: "Combo Burguer + Fritas",
        price: 11500,
        image: "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=400",
        restaurant: "Burger King",
        rating: 4.7,
      },
    ],
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const cartCount = useAppSelector(selectCartCount);
  const cartSubtotal = useAppSelector(selectCartSubtotal);
  const activePromotions = useAppSelector(selectActivePromotions);
  const { colors } = useTheme();

  const firstName = user?.name?.split(" ")[0] ?? "Alexandre";
  const avatarUrl = user?.avatar;
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const styles = StyleSheet.create({
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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
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
      flexDirection: "row",
      alignItems: "center",
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
      flexDirection: "row",
      alignItems: "center",
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
    sectionLink: {
      ...typography.labelLg,
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
      ...typography.labelCaps,
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
      ...typography.labelLg,
      color: colors.onSurface,
    },
    restaurantCuisine: {
      ...typography.bodySm,
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
      ...typography.bodySm,
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
      ...typography.bodySm,
      color: colors.neutral[500],
    },
    restaurantDelivery: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    restaurantDeliveryFee: {
      ...typography.labelCaps,
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
      ...typography.h3,
      color: colors.onSurface,
    },
    sectionAction: {
      ...typography.labelLg,
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
      ...typography.labelCaps,
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
      ...typography.labelLg,
      color: colors.onSurface,
    },
    offerSubtitle: {
      ...typography.bodySm,
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
      ...typography.labelLg,
      color: colors.onSurface,
    },
    orderStatus: {
      ...typography.bodySm,
      color: colors.neutral[500],
    },
    orderTotal: {
      ...typography.labelLg,
      color: colors.primary[500],
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
    offerKicker: {
      ...typography.labelCaps,
      color: colors.primary[500],
      marginBottom: 4,
    },
    sectionMeta: {
      ...typography.bodySm,
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
    productScroll: {
      paddingRight: spacing.gutter,
    },
    productCard: {
      width: 160,
      marginRight: spacing.md,
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 20,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    productImage: {
      width: "100%",
      height: 120,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    productInfo: {
      padding: spacing.sm,
    },
    productName: {
      ...typography.labelLg,
      color: colors.onSurface,
      fontWeight: "700",
      marginBottom: 2,
    },
    productMeta: {
      ...typography.bodySm,
      color: colors.neutral[500],
      marginBottom: spacing.xs,
    },
    productPriceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    productPrice: {
      ...typography.labelLg,
      color: colors.primary[500],
      fontWeight: "800",
    },
    productRating: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },
    productRatingText: {
      ...typography.bodySm,
      color: colors.neutral[500],
      fontWeight: "600",
    },
    restaurantScroll: {
      paddingRight: spacing.gutter,
    },
    restaurantCardHorizontal: {
      width: 260,
      marginRight: spacing.md,
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 24,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    restaurantImageHorizontal: {
      width: "100%",
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
      fontWeight: "700",
      marginBottom: 2,
    },
    restaurantCuisineHorizontal: {
      ...typography.bodySm,
      color: colors.neutral[500],
      marginBottom: spacing.xs,
    },
    restaurantMetaHorizontal: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    restaurantMetaTextHorizontal: {
      ...typography.bodySm,
      color: colors.neutral[500],
    },
    restaurantRatingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    restaurantRatingHorizontal: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    restaurantRatingTextHorizontal: {
      ...typography.bodySm,
      fontWeight: "600",
      color: colors.onSurface,
    },
    restaurantDeliveryFeeHorizontal: {
      ...typography.labelCaps,
      color: colors.primary[500],
      fontWeight: "700",
    },
    restaurantFavoriteButton: {
      position: "absolute",
      top: spacing.sm,
      right: spacing.sm,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
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

  const lowRatedRestaurants = useMemo(
    () =>
      LOW_RATED_RESTAURANTS.map((restaurant) => ({
        ...restaurant,
        favorite: favoriteIds.includes(restaurant.id),
      })),
    [favoriteIds],
  );

  async function handleToggleFavorite(id: string) {
    const nextIds = await toggleFavoriteRestaurant(id);
    setFavoriteIds(nextIds);
  }

  const headerList = useMemo(() => (
    <View>
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

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FEATURED_OFFERS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.offersScroll}
          renderItem={({ item: offer }) => (
            <TouchableOpacity
              key={offer.id}
              style={styles.offerCard}
              onPress={() => router.push("/restaurantes")}
            >
              <Text style={styles.offerKicker}>Destaque</Text>
              <Text style={styles.offerTitle}>{offer.title}</Text>
              <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {activePromotions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Promoções ativas</Text>
            <TouchableOpacity onPress={() => router.push("/promocoes")}>
              <Text style={styles.sectionLink}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={activePromotions.slice(0, 3)}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.offersScroll}
            renderItem={({ item: promo }) => (
              <TouchableOpacity
                style={[styles.offerCard, { backgroundColor: colors.primary[100], borderColor: colors.primary[500], borderWidth: 1 }]}
                onPress={() => router.push("/restaurantes")}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 }}>
                  <MaterialCommunityIcons name="tag" size={14} color={colors.primary[500]} />
                  <Text style={[styles.offerKicker, { color: colors.primary[500] }]}>{promo.badge}</Text>
                </View>
                <Text style={styles.offerTitle}>{promo.title}</Text>
                <Text style={styles.offerSubtitle}>{promo.description}</Text>
                <View style={{ marginTop: 8, backgroundColor: colors.primary[500], paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: "flex-start" }}>
                  <Text style={{ fontSize: 11, fontWeight: "800", color: colors.white }}>{promo.discount}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categorias em alta</Text>
          <Text style={styles.sectionMeta}>seleção local</Text>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoriesScroll}
          renderItem={({ item: cat }) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryItem}
              onPress={() => router.push("/restaurantes")}
            >
              <CategoryCard name={cat.name} image={cat.image} />
            </TouchableOpacity>
          )}
        />
      </View>

      {PRODUCT_SECTIONS.map((section) => (
        <View key={section.id} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionMeta}>{section.subtitle}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/restaurantes")}>
              <Text style={styles.sectionLink}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={section.products}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.productScroll}
            renderItem={({ item: product }) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => router.push("/restaurante")}
              >
                <Image
                  source={{ uri: product.image }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={styles.productMeta} numberOfLines={1}>
                    {product.restaurant}
                  </Text>
                  <View style={styles.productPriceRow}>
                    <Text style={styles.productPrice}>
                      {formatPrice(product.price)}
                    </Text>
                    <View style={styles.productRating}>
                      <MaterialCommunityIcons
                        name="star"
                        size={14}
                        color={colors.secondary[500]}
                      />
                      <Text style={styles.productRatingText}>
                        {product.rating}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      ))}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Restaurantes próximos</Text>
            <Text style={styles.sectionMeta}>Os melhores perto de você</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/restaurantes")}>
            <Text style={styles.sectionLink}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={restaurants}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.restaurantScroll}
          renderItem={({ item: restaurant }) => (
            <TouchableOpacity
              key={restaurant.id}
              style={styles.restaurantCardHorizontal}
              onPress={() => router.push("/restaurante")}
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
                  name={restaurant.favorite ? "heart" : "heart-outline"}
                  size={18}
                  color={restaurant.favorite ? colors.error : colors.neutral[400]}
                />
              </TouchableOpacity>
              <View style={styles.restaurantInfoHorizontal}>
                <Text style={styles.restaurantNameHorizontal} numberOfLines={1}>
                  {restaurant.name}
                </Text>
                <Text style={styles.restaurantCuisineHorizontal}>
                  {restaurant.cuisine}
                </Text>
                <View style={styles.restaurantMetaHorizontal}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={14}
                    color={colors.neutral[500]}
                  />
                  <Text style={styles.restaurantMetaTextHorizontal}>
                    {restaurant.distance}
                  </Text>
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
                      {restaurant.rating}
                    </Text>
                  </View>
                  <Text style={styles.restaurantDeliveryFeeHorizontal}>
                    {restaurant.deliveryFee}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.section}>
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

      <View style={[styles.section, styles.lastSection]}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Descubra novos sabores</Text>
            <Text style={styles.sectionMeta}>Para todos os gostos</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/restaurantes")}>
            <Text style={styles.sectionLink}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={lowRatedRestaurants}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.restaurantScroll}
          renderItem={({ item: restaurant }) => (
            <TouchableOpacity
              key={restaurant.id}
              style={styles.restaurantCardHorizontal}
              onPress={() => router.push("/restaurante")}
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
                  name={restaurant.favorite ? "heart" : "heart-outline"}
                  size={18}
                  color={restaurant.favorite ? colors.error : colors.neutral[400]}
                />
              </TouchableOpacity>
              <View style={styles.restaurantInfoHorizontal}>
                <Text style={styles.restaurantNameHorizontal} numberOfLines={1}>
                  {restaurant.name}
                </Text>
                <Text style={styles.restaurantCuisineHorizontal}>
                  {restaurant.cuisine}
                </Text>
                <View style={styles.restaurantMetaHorizontal}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={14}
                    color={colors.neutral[500]}
                  />
                  <Text style={styles.restaurantMetaTextHorizontal}>
                    {restaurant.distance}
                  </Text>
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
                      {restaurant.rating}
                    </Text>
                  </View>
                  <Text style={styles.restaurantDeliveryFeeHorizontal}>
                    {restaurant.deliveryFee}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  ), [styles, colors, firstName, cartCount, activePromotions, router, lowRatedRestaurants]);

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

      <FlatList
        data={[]}
        keyExtractor={() => "header"}
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
