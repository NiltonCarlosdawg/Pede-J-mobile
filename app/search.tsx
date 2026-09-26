import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '../src/components/ui/Header';
import { SearchBar } from '../src/components/ui/SearchBar';
import { spacing } from '../src/theme';
import { useTheme } from '../src/hooks/useTheme';
import { useGetRestaurantsQuery } from '../src/hooks/useApi';
import { Restaurant } from '../src/types';

interface SearchResult {
  type: 'restaurant' | 'product';
  id: string;
  name: string;
  image: string;
  subtitle: string;
  rating?: number;
  price?: number;
}

export default function SearchScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchType, setSearchType] = useState<'all' | 'restaurants' | 'products'>('all');
  const [searchStarted, setSearchStarted] = useState(false);
  const [pendingSearch, setPendingSearch] = useState<{ query: string; type: string } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restaurantsCacheRef = useRef<Restaurant[]>([]);
  const fetchingSeenRef = useRef(false);

  const {
    data: restaurantsData,
    isFetching,
    isError: searchFailed,
    refetch,
  } = useGetRestaurantsQuery({ limit: 50 }, { skip: !searchStarted });

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
          flexDirection: 'row',
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
          fontWeight: '600',
          color: colors.neutral[700],
        },
        filterButtonTextActive: {
          color: colors.white,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        emptyContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
        },
        emptyTitle: {
          fontSize: 18,
          fontWeight: '700',
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
          fontWeight: '600',
          color: colors.neutral[700],
          marginVertical: spacing.md,
        },
        resultsList: {
          gap: spacing.sm,
        },
        resultItem: {
          flexDirection: 'row',
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
          justifyContent: 'center',
          alignItems: 'center',
        },
        resultContent: {
          flex: 1,
          justifyContent: 'center',
        },
        resultName: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.neutral[900],
          marginBottom: spacing.xs,
        },
        resultMeta: {
          flexDirection: 'row',
          alignItems: 'center',
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
          fontWeight: '600',
          color: colors.primary[500],
        },
        suggestionsContainer: {
          flex: 1,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.lg,
        },
        suggestionsTitle: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.neutral[900],
          marginBottom: spacing.md,
        },
        suggestionsList: {
          gap: spacing.sm,
        },
        suggestionItem: {
          flexDirection: 'row',
          alignItems: 'center',
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
      }),
    [colors],
  );

  const filterRestaurants = useCallback((query: string, type: string): SearchResult[] => {
    const searchLower = query.toLowerCase();
    const filtered: SearchResult[] = [];

    if (type === 'all' || type === 'restaurants') {
      const restaurantResults = restaurantsCacheRef.current
        .filter(
          (r) =>
            r.name.toLowerCase().includes(searchLower) ||
            r.cuisine.toLowerCase().includes(searchLower),
        )
        .map((r) => ({
          type: 'restaurant' as const,
          id: r.id,
          name: r.name,
          image: r.image,
          subtitle: r.cuisine,
          rating: r.rating,
        }));

      filtered.push(...restaurantResults);
    }

    return filtered;
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      debounceRef.current = setTimeout(() => {
        fetchingSeenRef.current = false;
        setPendingSearch({ query, type: searchType });
        if (searchStarted) {
          refetch();
        } else {
          setSearchStarted(true);
        }
      }, 400);
    },
    [searchType, searchStarted, refetch],
  );

  useEffect(() => {
    if (!pendingSearch) return;

    if (isFetching) {
      fetchingSeenRef.current = true;
      return;
    }

    // Wait until a fetch for this pending search has actually started and settled.
    if (!fetchingSeenRef.current) return;
    if (!searchFailed && !restaurantsData) return;

    if (searchFailed) {
      console.error('Search error:', searchFailed);
      setResults([]);
    } else if (restaurantsData) {
      const rows = Array.isArray(restaurantsData) ? restaurantsData : restaurantsData.data;
      restaurantsCacheRef.current = rows ?? [];
      setResults(filterRestaurants(pendingSearch.query, pendingSearch.type));
    }
    setPendingSearch(null);
    setLoading(false);
  }, [pendingSearch, isFetching, searchFailed, restaurantsData, filterRestaurants]);

  const handleClear = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setSearchQuery('');
    setResults([]);
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => {
    if (item.type === 'restaurant') {
      return (
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/restaurante', params: { id: item.id } })}
          style={styles.resultItem}
        >
          <View style={styles.resultImage}>
            <MaterialCommunityIcons name="store" size={40} color={colors.primary[500]} />
          </View>
          <View style={styles.resultContent}>
            <Text style={styles.resultName}>{item.name}</Text>
            <View style={styles.resultMeta}>
              <MaterialCommunityIcons name="star" size={14} color={colors.warning} />
              <Text style={styles.resultRating}>
                {item.rating?.toFixed(1)} • {item.subtitle}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => {
          /* Handle product click */
        }}
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
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Header title="Pesquisar" showBack onBackPress={() => router.back()} />

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
          {['all', 'restaurants', 'products'].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => {
                setSearchType(type as any);
                if (searchQuery) handleSearch(searchQuery);
              }}
              style={[styles.filterButton, searchType === type && styles.filterButtonActive]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  searchType === type && styles.filterButtonTextActive,
                ]}
              >
                {type === 'all' ? 'Tudo' : type === 'restaurants' ? 'Restaurantes' : 'Pratos'}
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
              {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado
              {results.length !== 1 ? 's' : ''}
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
              {['Pizza', 'Burger', 'Sushi', 'Frango', 'Entrega rápida'].map((suggestion) => (
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
