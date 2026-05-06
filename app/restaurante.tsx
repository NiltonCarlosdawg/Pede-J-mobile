import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    Share,
} from "react-native";
import { useState, useRef } from "react";
import { ProductCard } from "src/components/ui";
import { colors, spacing } from "src/theme";

const RESTAURANT = {
  name: "Burger Station",
  cuisine: "Hambúrgueres • Americana • Lanches",
  rating: 4.9,
  ratingCount: "500+",
  deliveryTime: "30-45 min",
  deliveryFee: "Grátis",
  heroImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
};

const FEATURED_PRODUCTS = [
  {
    id: "1",
    title: "Double Smash Bacon",
    description: "Dois smash burgers de 100g, duplo cheddar inglês derretido, fatias de bacon crocante artesanal, cebola caramelizada e nosso molho secreto no pão brioche tostado na manteiga.",
    price: "Kz 42.900",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    badge: "Mais Pedido",
    isFeatured: true,
  },
];

const CLASSIC_PRODUCTS = [
  {
    id: "2",
    title: "Classic Cheeseburger",
    description: "Smash burger de 100g, queijo prato, alface americana, tomate, picles e maionese da casa no pão de hambúrguer tradicional.",
    price: "Kz 28.900",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200",
  },
  {
    id: "3",
    title: "Cheddar & Onion",
    description: "Hambúrguer de 160g, muito creme de cheddar derretido e cebola crispy artesanal no pão australiano.",
    price: "Kz 34.500",
    image: "https://images.unsplash.com/photo-1594212699903-ec4aec7d1b1e?w=200",
  },
  {
    id: "4",
    title: "Chicken Crispy",
    description: "Sobrecoxa de frango empanada hiper crocante, salada coleslaw, picles e maionese de limão siciliano.",
    price: "Esgotado",
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=200",
    isAvailable: false,
  },
];

export default function RestaurantScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };
  
  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: RESTAURANT.heroImage }} 
            style={styles.heroImage} 
          />
          
          {/* Top Actions */}
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurface} />
            </TouchableOpacity>
            <View style={styles.rightActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleSearch}
              >
                <MaterialCommunityIcons name="magnify" size={24} color={colors.onSurface} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={async () => {
                  try {
                    await Share.share({
                      message: `Olha este produto do ${RESTAURANT.name}: ${RESTAURANT.heroImage}`,
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
          
          {/* Gradient Overlay */}
          <View style={styles.gradient} />
        </View>

        {/* Restaurant Info */}
        <View style={styles.infoSection}>
          <Text style={styles.restaurantName}>{RESTAURANT.name}</Text>
          <Text style={styles.restaurantCuisine}>{RESTAURANT.cuisine}</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.ratingBadge}>
              <MaterialCommunityIcons name="star" size={16} color={colors.secondary[500]} />
              <Text style={styles.ratingText}>{RESTAURANT.rating} ({RESTAURANT.ratingCount})</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="clock-outline" size={18} color={colors.onSurfaceVariant} />
              <Text style={styles.infoText}>{RESTAURANT.deliveryTime}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="moped" size={18} color={colors.onSurfaceVariant} />
              <Text style={styles.infoText}>{RESTAURANT.deliveryFee}</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
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

        {/* Menu Content */}
        <View style={styles.menuContent}>
          {/* Destaques */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Destaques</Text>
            {FEATURED_PRODUCTS.map((product) => (
              <ProductCard
                key={product.id}
                title={product.title}
                description={product.description}
                price={product.price}
                image={product.image}
                badge={product.badge}
                isFeatured={true}
                onAdd={() => {}}
              />
            ))}
          </View>

          {/* Clássicos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Clássicos</Text>
            {CLASSIC_PRODUCTS.map((product) => (
              <ProductCard
                key={product.id}
                title={product.title}
                description={product.description}
                price={product.price}
                image={product.image}
                isAvailable={product.isAvailable}
                onAdd={() => {}}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Cart Bar */}
      <View style={styles.cartBar}>
        <View style={styles.cartButton}>
          <View style={styles.cartCount}>
            <Text style={styles.cartCountText}>2</Text>
          </View>
          <Text style={styles.cartButtonText}>Ver sacola</Text>
          <Text style={styles.cartTotal}>Kz 77.400</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingBottom: 80,
  },
  heroContainer: {
    height: 280,
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  infoSection: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    marginTop: -24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.onSurface,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: colors.neutral[500],
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary[500],
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary[500],
  },
  inactiveTab: {
    paddingVertical: 16,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  inactiveTabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[500],
  },
  menuContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 16,
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
    borderRadius: 12,
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
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  cartButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    flex: 1,
    marginLeft: 12,
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary[500],
  },
});