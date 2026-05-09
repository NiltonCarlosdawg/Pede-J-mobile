import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "../../src/components/ui/Header";
import { SearchBar } from "../../src/components/ui/SearchBar";
import { colors, spacing } from "../../src/theme";

// Mock data for demonstration
const MOCK_RESTAURANTS = [
  {
    id: "1",
    name: "Sabor da Praça",
    cuisine: "Angolana",
    rating: 4.8,
    ratingCount: 324,
    distance: 1.2,
    deliveryTime: "30-40 min",
    deliveryFee: 0,
    image: "https://images.unsplash.com/photo-1517248135467-4c7aad601933?w=400",
    isOpen: true,
  },
  {
    id: "2",
    name: "BBQ Master Prime",
    cuisine: "Carnes",
    rating: 4.5,
    ratingCount: 256,
    distance: 2.5,
    deliveryTime: "45-55 min",
    deliveryFee: 5.9,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
    isOpen: true,
  },
  {
    id: "3",
    name: "Pizza Hut Express",
    cuisine: "Pizzaria",
    rating: 4.3,
    ratingCount: 512,
    distance: 1.8,
    deliveryTime: "25-35 min",
    deliveryFee: 0,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae5d?w=400",
    isOpen: true,
  },
];

const MOCK_PRODUCTS = [
  {
    id: "p1",
    name: "Smash Burger Duplo",
    description: "Dois hamburgueres prensados com queijo derretido",
    price: 23.8,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200",
    category: "Burgers",
    isAvailable: true,
  },
  {
    id: "p2",
    name: "Pizza Quatro Queijos",
    description: "Mozzarella, Parmesão, Gorgonzola e Azul",
    price: 18.5,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae5d?w=200",
    category: "Pizzas",
    isAvailable: true,
  },
  {
    id: "p3",
    name: "Sushi Mix",
    description: "Combinação de 24 peças variadas",
    price: 42.0,
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200",
    category: "Japonesa",
    isAvailable: true,
  },
];

interface SearchResult {
  type: "restaurant" | "product";
  id: string;
  name: string;
  image: string;
  subtitle: string;
  rating?: number;
  price?: number;
}

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchType, setSearchType] = useState<"all" | "restaurants" | "products">("all");

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    // Simulate search delay
    const timer = setTimeout(() => {
      const searchLower = query.toLowerCase();
      const filteredResults: SearchResult[] = [];

      if (searchType === "all" || searchType === "restaurants") {
        const restaurantResults = MOCK_RESTAURANTS.filter(
          (r) =>
            r.name.toLowerCase().includes(searchLower) ||
            r.cuisine.toLowerCase().includes(searchLower)
        ).map((r) => ({
          type: "restaurant" as const,
          id: r.id,
          name: r.name,
          image: r.image,
          subtitle: r.cuisine,
          rating: r.rating,
        }));

        filteredResults.push(...restaurantResults);
      }

      if (searchType === "all" || searchType === "products") {
        const productResults = MOCK_PRODUCTS.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower)
        ).map((p) => ({
          type: "product" as const,
          id: p.id,
          name: p.name,
          image: p.image,
          subtitle: p.category,
          price: p.price,
        }));

        filteredResults.push(...productResults);
      }

      setResults(filteredResults);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchType]);

  const handleClear = () => {
    setSearchQuery("");
    setResults([]);
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => {
    if (item.type === "restaurant") {
      return (
        <TouchableOpacity
          onPress={() => router.push(`/restaurante?id=${item.id}`)}
          style={styles.resultItem}
        >
          <View style={styles.resultImage}>
            {/* Image would go here in real implementation */}
            <MaterialCommunityIcons name="store" size={40} color={colors.primary[500]} />
          </View>
          <View style={styles.resultContent}>
            <Text style={styles.resultName}>{item.name}</Text>
            <View style={styles.resultMeta}>
              <MaterialCommunityIcons name="star" size={14} color={colors.warning} />
              <Text style={styles.resultRating}>{item.rating?.toFixed(1)} • {item.subtitle}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => { /* Handle product click */ }}
        style={styles.resultItem}
      >
        <View style={styles.resultImage}>
          <MaterialCommunityIcons name="food" size={40} color={colors.primary[500]} />
        </View>
        <View style={styles.resultContent}>
          <Text style={styles.resultName}>{item.name}</Text>
          <View style={styles.resultMeta}>
            <Text style={styles.resultCategory}>{item.subtitle}</Text>
            <Text style={styles.resultPrice}>Kz {item.price?.toFixed(2)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <Header
          title="Pesquisar"
          showBack
          onBackPress={() => router.back()}
        />

        <View style={styles.searchSection}>
          <SearchBar
            placeholder="Restaurantes ou pratos..."
            value={searchQuery}
            onChangeText={handleSearch}
            onClear={handleClear}
            loading={loading}
          />
        </View>

        <View style={styles.filterContainer}>
          {["all", "restaurants", "products"].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => {
                setSearchType(type as any);
                if (searchQuery) handleSearch(searchQuery);
              }}
              style={[
                styles.filterButton,
                searchType === type && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  searchType === type && styles.filterButtonTextActive,
                ]}
              >
                {type === "all" ? "Tudo" : type === "restaurants" ? "Restaurantes" : "Pratos"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
          </View>
        )}

        {!loading && results.length === 0 && searchQuery && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="magnify" size={64} color={colors.neutral[300]} />
            <Text style={styles.emptyTitle}>Nenhum resultado encontrado</Text>
            <Text style={styles.emptySubtitle}>Tente outra pesquisa</Text>
          </View>
        )}

        {!loading && searchQuery && results.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              {results.length} resultado{results.length !== 1 ? "s" : ""} encontrado{results.length !== 1 ? "s" : ""}
            </Text>
            <FlatList
              data={results}
              renderItem={renderSearchResult}
              keyExtractor={(item) => `${item.type}-${item.id}`}
              scrollEnabled={false}
              contentContainerStyle={styles.resultsList}
            />
          </View>
        )}

        {!loading && !searchQuery && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Pesquisas populares</Text>
            <View style={styles.suggestionsList}>
              {["Pizza", "Burger", "Sushi", "Frango", "Entrega rápida"].map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  onPress={() => handleSearch(suggestion)}
                  style={styles.suggestionItem}
                >
                  <MaterialCommunityIcons name="magnify" size={16} color={colors.neutral[500]} />
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
  },
  filterButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral[700],
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral[900],
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.neutral[500],
    marginTop: spacing.sm,
  },
  resultsSection: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral[700],
    marginVertical: spacing.md,
  },
  resultsList: {
    gap: spacing.sm,
  },
  resultItem: {
    flexDirection: "row",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    gap: spacing.md,
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
  },
  resultContent: {
    flex: 1,
    justifyContent: "center",
  },
  resultName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  resultRating: {
    fontSize: 13,
    color: colors.neutral[600],
  },
  resultCategory: {
    fontSize: 13,
    color: colors.neutral[600],
    marginRight: spacing.sm,
  },
  resultPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary[500],
  },
  suggestionsContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  suggestionsList: {
    gap: spacing.sm,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    gap: spacing.sm,
  },
  suggestionText: {
    fontSize: 15,
    color: colors.neutral[700],
  },
});
