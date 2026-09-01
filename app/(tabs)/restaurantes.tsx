import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "../../src/components/ui/Header";
import { RestaurantCard } from "../../src/components/ui/RestaurantCard";
import {
    loadFavoriteRestaurantIds,
    toggleFavoriteRestaurant,
} from "../../src/services/favorites";
import { restaurantApi } from "../../src/services/api";
import { borderRadius, formatPrice, spacing } from "../../src/theme";
import { useTheme } from "../../src/hooks/useTheme";
import { Restaurant } from "../../src/types";

const FEATURED = {
  title: "Hoje no mapa",
  subtitle: "Restaurantes com entrega rápida, promoções e menu mais pedido.",
  chips: ["Entrega grátis", "Top avaliados", "Aberto agora"],
};

export default function RestaurantesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const response = await restaurantApi.list();
        if (mounted) {
          setRestaurants(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch restaurants:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

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

  async function handleToggleFavorite(id: string) {
    const nextIds = await toggleFavoriteRestaurant(id);
    setFavoriteIds(nextIds);
  }

  const filters = useMemo(() => {
    const cuisineSet = new Set<string>();
    for (const r of restaurants) {
      if (r.cuisine) cuisineSet.add(r.cuisine);
    }
    return ["Todos", "Perto de mim", "Grátis", ...Array.from(cuisineSet)];
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return restaurants.filter((restaurant) => {
      const matchesQuery =
        !normalizedQuery ||
        restaurant.name.toLowerCase().includes(normalizedQuery) ||
        restaurant.cuisine.toLowerCase().includes(normalizedQuery);

      const matchesFilter =
        activeFilter === "Todos" ||
        restaurant.cuisine === activeFilter ||
        (activeFilter === "Perto de mim" && restaurant.distance != null && restaurant.distance <= 2) ||
        (activeFilter === "Grátis" && restaurant.deliveryFee === 0);

      return matchesQuery && matchesFilter;
    }).map((restaurant) => ({
      ...restaurant,
      favorite: favoriteIds.includes(restaurant.id),
    }));
  }, [activeFilter, favoriteIds, query, restaurants]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingBottom: 16,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.gutter,
      paddingTop: spacing.md,
    },
    featuredCard: {
      backgroundColor: colors.primary[100],
      borderRadius: 28,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.secondary[100],
      marginBottom: spacing.md,
    },
    featuredKicker: {
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: colors.primary[600],
    },
    featuredTitle: {
      marginTop: spacing.xs,
      fontSize: 26,
      fontWeight: "800",
      color: colors.onSurface,
    },
    featuredSubtitle: {
      marginTop: spacing.xs,
      fontSize: 14,
      lineHeight: 20,
      color: colors.neutral[700],
    },
    featuredChips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    featuredChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.surfaceContainerLowest,
    },
    featuredChipText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.onSurface,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surfaceContainerHighet,
      borderRadius: 18,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginBottom: spacing.md,
    },
    searchInput: {
      flex: 1,
      marginLeft: spacing.sm,
      fontSize: 16,
      color: colors.neutral[900],
    },
    filtersScroll: {
      paddingBottom: spacing.sm,
      gap: spacing.sm,
    },
    filterChip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: colors.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
      marginRight: spacing.sm,
    },
    filterChipActive: {
      backgroundColor: colors.primary[500],
      borderColor: colors.primary[500],
    },
    filterText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.onSurface,
    },
    filterTextActive: {
      color: colors.white,
    },
    resultsHeader: {
      marginTop: spacing.xs,
      marginBottom: spacing.md,
    },
    resultsCount: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.onSurface,
    },
    resultsHint: {
      marginTop: 4,
      fontSize: 13,
      color: colors.neutral[500],
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.xl,
      backgroundColor: colors.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    emptyTitle: {
      marginTop: spacing.sm,
      fontSize: 16,
      fontWeight: "700",
      color: colors.onSurface,
    },
    emptyText: {
      marginTop: 4,
      fontSize: 13,
      lineHeight: 18,
      textAlign: "center",
      color: colors.neutral[700],
    },
  }), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Restaurantes" />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.featuredCard}>
          <Text style={styles.featuredKicker}>Explorar</Text>
          <Text style={styles.featuredTitle}>{FEATURED.title}</Text>
          <Text style={styles.featuredSubtitle}>{FEATURED.subtitle}</Text>

          <View style={styles.featuredChips}>
            {FEATURED.chips.map((chip) => (
              <View key={chip} style={styles.featuredChip}>
                <Text style={styles.featuredChipText}>{chip}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={24}
            color={colors.neutral[500]}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar restaurantes ou pratos..."
            placeholderTextColor={colors.neutral[500]}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {filters.map((filter) => {
            const active = filter === activeFilter;

            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[styles.filterText, active && styles.filterTextActive]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredRestaurants.length} restaurantes encontrados
          </Text>
        </View>

        <FlatList
          data={filteredRestaurants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RestaurantCard
              title={item.name}
              subtitle={item.cuisine}
              image={item.image}
              rating={item.rating}
              distance={item.distance != null ? `${item.distance} km` : undefined}
              deliveryTime={item.deliveryTime}
              deliveryFee={item.deliveryFee === 0 ? "Grátis" : formatPrice(item.deliveryFee)}
              favorite={item.favorite}
              onFavoritePress={() => handleToggleFavorite(item.id)}
              onPress={() => router.push({ pathname: "/restaurante", params: { id: item.id } })}
            />
          )}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="store-search-outline"
                size={32}
                color={colors.neutral[500]}
              />
              <Text style={styles.emptyTitle}>
                Nenhum restaurante encontrado
              </Text>
              <Text style={styles.emptyText}>
                Tenta outra palavra ou limpa os filtros para ver mais opções.
              </Text>
            </View>
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}
