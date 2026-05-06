import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RestaurantCard, CategoryCard } from "../../src/components/ui";
import { colors, spacing, typography } from "../../src/theme";
import { Header } from "../../src/components/ui/Header";

const CATEGORIES = [
  { id: "1", name: "PIZZA", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae5d?w=200" },
  { id: "2", name: "BURGER", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200" },
  { id: "3", name: "BRASIL", image: "https://images.unsplash.com/photo-1612821763214-19af3594e98c?w=200" },
  { id: "4", name: "JAPÃO", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200" },
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
    name: "Sushi Master",
    cuisine: "Japonesa",
    rating: 4.9,
    distance: "3.2 km",
    deliveryTime: "40-50 min",
    deliveryFee: "Kz 8.000",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
  },
];

const CART_COUNT = 2;
const CART_TOTAL = 'Kz 77.400';

export default function HomeScreen() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header 
        showLogo={true}
        showCartBadge={CART_COUNT > 0}
        cartItems={CART_COUNT}
        cartTotal={CART_TOTAL}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={24} color={colors.neutral[500]} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Pratos, restaurantes ou tipos..."
            placeholderTextColor={colors.neutral[500]}
          />
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {CATEGORIES.map((cat) => (
              <View key={cat.id} style={styles.categoryItem}>
                <CategoryCard 
                  name={cat.name} 
                  image={cat.image}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Restaurants List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurantes Próximos</Text>
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
        </View>
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
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHighet,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 16,
    color: colors.neutral[900],
  },
  section: {
    marginBottom: spacing.lg,
  },
  categoriesScroll: {
    paddingRight: spacing.gutter,
    gap: spacing.sm,
  },
  categoryItem: {
    marginRight: spacing.sm,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
});