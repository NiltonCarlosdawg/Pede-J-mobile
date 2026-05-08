import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { useEffect } from "react";
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
import { loadFavoriteRestaurantIds, toggleFavoriteRestaurant } from "../../src/services/favorites";
import { colors, spacing, borderRadius } from "../../src/theme";

const FILTERS = ["Todos", "Perto de mim", "Grátis", "Pizza", "Burger", "Japonesa"];

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
    tag: "Perto de mim",
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
    tag: "Burger",
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
    tag: "Pizza",
  },
  {
    id: "4",
    name: "Sushi Master",
    cuisine: "Japonesa",
    rating: 4.9,
    distance: "3.2 km",
    deliveryTime: "40-50 min",
    deliveryFee: "Kz 8.000",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
    tag: "Japonesa",
  },
  {
    id: "5",
    name: "Burger Station",
    cuisine: "Hambúrgueres",
    rating: 4.7,
    distance: "0.8 km",
    deliveryTime: "20-30 min",
    deliveryFee: "Grátis",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    tag: "Burger",
  },
  {
    id: "6",
    name: "Cantina Italiana",
    cuisine: "Italiana",
    rating: 4.6,
    distance: "2.1 km",
    deliveryTime: "35-45 min",
    deliveryFee: "Kz 4.000",
    image: "https://images.unsplash.com/photo-1595295333158-4742f28fbd8b?w=400",
    tag: "Perto de mim",
  },
];

const FEATURED = {
  title: "Hoje no mapa",
  subtitle: "Restaurantes com entrega rápida, promoções e menu mais pedido.",
  chips: ["Entrega grátis", "Top avaliados", "Aberto agora"],
};

export default function RestaurantesScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

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

  const filteredRestaurants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return RESTAURANTS.filter((restaurant) => {
      const matchesQuery =
        !normalizedQuery ||
        restaurant.name.toLowerCase().includes(normalizedQuery) ||
        restaurant.cuisine.toLowerCase().includes(normalizedQuery);

      const matchesFilter =
        activeFilter === "Todos" ||
        restaurant.tag === activeFilter ||
        (activeFilter === "Grátis" && restaurant.deliveryFee === "Grátis");

      return matchesQuery && matchesFilter;
    }).map((restaurant) => ({
      ...restaurant,
      favorite: favoriteIds.includes(restaurant.id),
    }));
  }, [activeFilter, favoriteIds, query]);

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
          {FILTERS.map((filter) => {
            const active = filter === activeFilter;

            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterText,
                    active && styles.filterTextActive,
                  ]}
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
          <Text style={styles.resultsHint}>Resultados mockados para demo</Text>
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
              distance={item.distance}
              deliveryTime={item.deliveryTime}
              deliveryFee={item.deliveryFee}
              favorite={item.favorite}
              onFavoritePress={() => handleToggleFavorite(item.id)}
              onPress={() => router.push("/restaurante")}
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
              <Text style={styles.emptyTitle}>Nenhum restaurante encontrado</Text>
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

const styles = StyleSheet.create({
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
});
