import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ProductCard } from "../src/components/ui";
import { spacing, formatPrice, typography } from "../src/theme";
import { useAppDispatch, useAppSelector } from "../src/store";
import { selectCartCount, selectCartSubtotal } from "../src/store/cartSelectors";
import { addItem } from "../src/store/cartSlice";
import { selectAverageRating, selectRatingsByRestaurant, selectRatingCount } from "../src/store/ratingsSlice";
import { useTheme } from "../src/hooks/useTheme";

const RESTAURANT = {
  name: "Burger Station",
  cuisine: "Hambúrgueres • Americana • Lanches",
  deliveryTime: "30-45 min",
  deliveryFee: "Grátis",
  heroImage:
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200",
  address: "Maianga, Luanda",
  openNow: true,
  distance: "1.8 km",
};

const MENU_SECTIONS = [
  {
    id: "featured",
    title: "Destaques da casa",
    subtitle: "Os itens mais pedidos hoje",
  },
  {
    id: "classics",
    title: "Clássicos",
    subtitle: "Receitas que já viraram hábito",
  },
  {
    id: "sides",
    title: "Acompanhamentos",
    subtitle: "Extras para completar o pedido",
  },
];

type MenuItem = {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  badge?: string;
  isFeatured?: boolean;
  isAvailable?: boolean;
  section: "featured" | "classics" | "sides";
};

const FEATURED_PRODUCTS: MenuItem[] = [
  {
    id: "1",
    title: "Double Smash Bacon",
    description:
      "Dois smash burgers de 100g, cheddar inglês, bacon crocante, cebola caramelizada e molho da casa no pão brioche.",
    price: "Kz 42.900",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    badge: "Mais Pedido",
    isFeatured: true,
    section: "featured",
  },
  {
    id: "2",
    title: "Triple Cheese Melt",
    description:
      "Pão brioche tostado, blend duplo de queijo, cebola crispy e maionese defumada.",
    price: "Kz 46.500",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    badge: "Novo",
    isFeatured: true,
    section: "featured",
  },
];

const MENU_PRODUCTS: MenuItem[] = [
  {
    id: "3",
    title: "Classic Cheeseburger",
    description:
      "Smash burger de 100g, queijo prato, alface, tomate, picles e maionese da casa.",
    price: "Kz 28.900",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    section: "classics",
  },
  {
    id: "4",
    title: "Cheddar & Onion",
    description:
      "Hambúrguer de 160g, creme de cheddar e cebola crispy artesanal no pão australiano.",
    price: "Kz 34.500",
    image:
      "https://images.unsplash.com/photo-1594212699903-ec4aec7d1b1e?w=400",
    section: "classics",
  },
  {
    id: "5",
    title: "Chicken Crispy",
    description:
      "Sobrecoxa de frango empanada, coleslaw, picles e maionese de limão siciliano.",
    price: "Esgotado",
    image:
      "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400",
    isAvailable: false,
    section: "classics",
  },
  {
    id: "6",
    title: "Batata rústica",
    description: "Batata rústica com sal, alecrim e molho cheddar.",
    price: "Kz 12.900",
    image:
      "https://images.unsplash.com/photo-1573080496219-bb08dd8aff7c?w=400",
    section: "sides",
  },
  {
    id: "7",
    title: "Onion rings",
    description: "Anéis de cebola crocantes com molho barbecue da casa.",
    price: "Kz 9.500",
    image:
      "https://images.unsplash.com/photo-1639024471283-03518883512d?w=400",
    section: "sides",
  },
  {
    id: "8",
    title: "Milkshake de baunilha",
    description: "Milkshake cremoso com cobertura de caramelo e chantilly.",
    price: "Kz 11.500",
    image:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400",
    section: "sides",
  },
];

const QUICK_TAGS = ["Mais pedidos", "Combos", "Sem lactose", "Sem glúten"];

export default function RestaurantScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);
  const cartSubtotal = useAppSelector(selectCartSubtotal);
  const avgRating = useAppSelector((state: any) => selectAverageRating(state, "rest-001"));
  const ratingCount = useAppSelector((state: any) => selectRatingCount(state, "rest-001"));
  const reviews = useAppSelector((state: any) => selectRatingsByRestaurant(state, "rest-001"));
  const { colors } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingBottom: 96,
    },
    heroContainer: {
      height: 300,
      position: "relative",
    },
    heroImage: {
      width: "100%",
      height: "100%",
    },
    topActions: {
      position: "absolute",
      top: 50,
      left: 16,
      right: 16,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.92)",
      alignItems: "center",
      justifyContent: "center",
    },
    rightActions: {
      flexDirection: "row",
      gap: 8,
    },
    badgeRow: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 16,
      flexDirection: "row",
      gap: 8,
    },
    openBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.92)",
    },
    openBadgeText: {
      ...typography.labelCaps,
      color: colors.onSurface,
    },
    deliveryChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.92)",
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
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: 0.05,
      shadowRadius: 20,
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
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginTop: 16,
      flexWrap: "wrap",
    },
    ratingBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "rgba(251,172,29,0.1)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    ratingText: {
      ...typography.labelLg,
      color: colors.secondary[500],
    },
    infoItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      flexShrink: 1,
    },
    infoText: {
      ...typography.bodySm,
      color: colors.onSurfaceVariant,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
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
    tagsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 12,
    },
    tagChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.surfaceContainer,
    },
    tagChipText: {
      ...typography.labelCaps,
      color: colors.onSurface,
    },
    tabs: {
      flexDirection: "row",
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
      borderBottomColor: "transparent",
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
      alignItems: "center",
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
      textAlign: "center",
      color: colors.neutral[700],
    },
    cartBar: {
      position: "absolute",
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.primary[500],
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 16,
    },
    cartCount: {
      width: 24,
      height: 24,
      borderRadius: 6,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
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
      alignItems: "center",
      marginBottom: spacing.md,
      paddingVertical: spacing.md,
    },
    ratingBig: {
      ...typography.h1,
      color: colors.onSurface,
    },
    ratingStars: {
      flexDirection: "row",
      gap: 4,
      marginVertical: spacing.xs,
    },
    ratingCount: {
      ...typography.bodySm,
      color: colors.neutral[500],
    },
    reviewCard: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 16,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    reviewHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    reviewAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary[100],
      alignItems: "center",
      justifyContent: "center",
    },
    reviewMeta: {
      flex: 1,
    },
    reviewName: {
      ...typography.labelLg,
      color: colors.onSurface,
    },
    reviewStars: {
      flexDirection: "row",
      gap: 2,
      marginTop: 2,
    },
    reviewDate: {
      ...typography.bodySm,
      color: colors.neutral[500],
    },
    reviewComment: {
      ...typography.bodySm,
      color: colors.onSurfaceVariant,
      lineHeight: 20,
    },
    reviewTags: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
      marginTop: spacing.sm,
    },
    reviewTagChip: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: colors.primary[100],
    },
    reviewTagText: {
      ...typography.labelCaps,
      color: colors.primary[500],
    },
  }), [colors]);

  const menuItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return [...FEATURED_PRODUCTS, ...MENU_PRODUCTS].filter((product) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        product.title.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [searchQuery]);

  function handleSearch() {
    flatListRef.current?.scrollToOffset({ offset: 320, animated: true });
  }

  function parsePrice(value: string) {
    const numeric = value.replace(/[^\d]/g, "");
    return numeric ? Number(numeric) : 0;
  }

  function handleAddToCart(product: MenuItem) {
    if (product.price === "Esgotado") {
      return;
    }

    dispatch(
      addItem({
        id: product.id,
        title: product.title,
        price: parsePrice(product.price),
        image: product.image,
      })
    );
  }

  const reviewsComponent = useMemo(() => {
    if (reviews.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Avaliações</Text>
        <View style={styles.ratingSummary}>
          <Text style={styles.ratingBig}>{avgRating.toFixed(1)}</Text>
          <View style={styles.ratingStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <MaterialCommunityIcons
                key={star}
                name={star <= Math.round(avgRating) ? "star" : "star-outline"}
                size={20}
                color={colors.secondary[500]}
              />
            ))}
          </View>
          <Text style={styles.ratingCount}>{ratingCount} avaliações</Text>
        </View>
        {reviews.slice(0, 3).map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAvatar}>
                <MaterialCommunityIcons name="account" size={18} color={colors.primary[500]} />
              </View>
              <View style={styles.reviewMeta}>
                <Text style={styles.reviewName}>{review.userName}</Text>
                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <MaterialCommunityIcons
                      key={star}
                      name={star <= review.rating ? "star" : "star-outline"}
                      size={12}
                      color={colors.secondary[500]}
                    />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewDate}>
                {new Date(review.timestamp).toLocaleDateString("pt-BR")}
              </Text>
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
            {review.tags.length > 0 && (
              <View style={styles.reviewTags}>
                {review.tags.map((tag) => (
                  <View key={tag} style={styles.reviewTagChip}>
                    <Text style={styles.reviewTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  }, [reviews, avgRating, ratingCount, styles, colors]);

  const headerComponent = useMemo(() => (
    <View>
      <View style={styles.heroContainer}>
        <Image source={{ uri: RESTAURANT.heroImage }} style={styles.heroImage} />

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
                    message: `Vê o menu do ${RESTAURANT.name}: ${RESTAURANT.heroImage}`,
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
              name={RESTAURANT.openNow ? "checkbox-marked-circle" : "clock-outline"}
              size={14}
              color={RESTAURANT.openNow ? colors.primary[500] : colors.neutral[500]}
            />
            <Text style={styles.openBadgeText}>
              {RESTAURANT.openNow ? "Aberto agora" : "Fechado"}
            </Text>
          </View>
          <View style={styles.deliveryChip}>
            <MaterialCommunityIcons name="moped" size={14} color={colors.primary[500]} />
            <Text style={styles.deliveryChipText}>{RESTAURANT.deliveryFee}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.restaurantName}>{RESTAURANT.name}</Text>
        <Text style={styles.restaurantCuisine}>{RESTAURANT.cuisine}</Text>

        <View style={styles.infoRow}>
          <View style={styles.ratingBadge}>
            <MaterialCommunityIcons name="star" size={16} color={colors.secondary[500]} />
            <Text style={styles.ratingText}>
              {avgRating.toFixed(1)} ({ratingCount})
            </Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="clock-outline" size={18} color={colors.onSurfaceVariant} />
            <Text style={styles.infoText}>{RESTAURANT.deliveryTime}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="map-marker" size={18} color={colors.onSurfaceVariant} />
            <Text style={styles.infoText}>{RESTAURANT.address}</Text>
          </View>
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

        <View style={styles.tagsRow}>
          {QUICK_TAGS.map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagChipText}>{tag}</Text>
            </View>
          ))}
        </View>
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
  ), [styles, colors, RESTAURANT, avgRating, ratingCount, searchQuery, handleSearch, router]);

  const flatMenuData = useMemo(() => {
    type FlatItem = { type: "section-header"; title: string; subtitle: string } | { type: "product"; product: MenuItem };

    const items: FlatItem[] = [];

    for (const section of MENU_SECTIONS) {
      const sectionProducts = menuItems.filter(
        (product) => product.section === section.id
      );

      if (!sectionProducts.length) continue;

      items.push({ type: "section-header", title: section.title, subtitle: section.subtitle });
      for (const product of sectionProducts) {
        items.push({ type: "product", product });
      }
    }

    return items;
  }, [menuItems]);

  const renderFlatItem = useCallback(({ item }: { item: { type: string; title?: string; subtitle?: string; product?: MenuItem } }) => {
    if (item.type === "section-header") {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{item.title}</Text>
          <Text style={styles.sectionSubtitle}>{item.subtitle}</Text>
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
        />
      </View>
    );
  }, [styles, handleAddToCart]);

  const flatKeyExtractor = useCallback((item: { type: string; title?: string; product?: MenuItem }, index: number) =>
    item.type === "section-header" ? `section-${item.title}` : item.product!.id,
  []);

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
        <TouchableOpacity style={styles.cartButton} onPress={() => router.push("/checkout")}>
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
