import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FlatList, StyleSheet, Text, View, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RestaurantCard } from "../../src/components/ui/RestaurantCard";
import { Header } from "../../src/components/ui/Header";
import { colors, spacing } from "../../src/theme";

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
    name: "Sushi Master",
    cuisine: "Japonesa",
    rating: 4.9,
    distance: "3.2 km",
    deliveryTime: "40-50 min",
    deliveryFee: "Kz 8.000",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
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
  },
];

export default function RestaurantesScreen() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Restaurantes" />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={24} color={colors.neutral[500]} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Buscar restaurantes..."
            placeholderTextColor={colors.neutral[500]}
          />
        </View>

        {/* Results count */}
        <Text style={styles.resultsCount}>{RESTAURANTS.length} restaurantes encontrados</Text>

        {/* Restaurants List */}
        <FlatList
          data={RESTAURANTS}
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
              onPress={() => router.push('/restaurante')}
            />
          )}
          scrollEnabled={false}
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
    paddingTop: spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHighet,
    borderRadius: 12,
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
  resultsCount: {
    fontSize: 14,
    color: colors.neutral[500],
    marginBottom: spacing.md,
  },
});