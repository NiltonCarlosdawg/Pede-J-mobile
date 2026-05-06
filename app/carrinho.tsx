import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../src/components/ui/Header";
import { colors, spacing } from "../src/theme";

const CART_ITEMS = [
  {
    id: "1",
    name: "Smash Burger Duplo com Bacon",
    price: "Kz 38.900",
    quantity: 2,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200",
  },
  {
    id: "2",
    name: "Batata Frita Grande Rústica",
    price: "Kz 15.500",
    quantity: 1,
    image: "https://images.unsplash.com/photo-1573080496219-bb08dd8aff7c?w=200",
  },
];

export default function CarrinhoScreen() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Meu Carrinho" />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Delivery Address */}
        <View style={styles.addressCard}>
          <View style={styles.addressIcon}>
            <MaterialCommunityIcons name="map-marker" size={20} color={colors.primary[500]} />
          </View>
          <View style={styles.addressContent}>
            <Text style={styles.addressLabel}>ENTREGAR EM</Text>
            <Text style={styles.address}>Rua das Flores, 123 - Apto 45</Text>
            <Text style={styles.addressNeighborhood}>Centro, Luanda</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/endereco')}>
            <Text style={styles.changeButton}>Trocar</Text>
          </TouchableOpacity>
        </View>

        {/* Cart Items */}
        <View style={styles.itemsSection}>
          {CART_ITEMS.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemContent}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.itemFooter}>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                  <View style={styles.quantityControl}>
                    <TouchableOpacity style={styles.quantityButton}>
                      <MaterialCommunityIcons name="minus" size={18} color={colors.primary[500]} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.quantityButton}>
                      <MaterialCommunityIcons name="plus" size={18} color={colors.primary[500]} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
          
          <TouchableOpacity style={styles.addMoreButton}>
            <MaterialCommunityIcons name="plus-circle" size={20} color={colors.primary[500]} />
            <Text style={styles.addMoreText}>Adicionar mais itens</Text>
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumo do Pedido</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>Kz 93.300</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxa de Entrega</Text>
            <Text style={[styles.summaryValue, styles.freeDelivery]}>Grátis</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>Kz 93.300</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.checkoutContainer}>
        <TouchableOpacity style={styles.checkoutButton}>
          <Text style={styles.checkoutText}>Finalizar Pedido</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 100,
  },
  addressCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[500],
    letterSpacing: 0.05,
  },
  address: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onBackground,
    marginTop: 2,
  },
  addressNeighborhood: {
    fontSize: 14,
    color: colors.neutral[500],
  },
  changeButton: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[500],
    textDecorationLine: 'underline',
  },
  itemsSection: {
    marginBottom: spacing.lg,
  },
  itemCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    padding: spacing.sm,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary[500],
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  quantityButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onBackground,
    minWidth: 24,
    textAlign: 'center',
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.sm,
  },
  addMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[500],
  },
  summaryCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.onBackground,
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.neutral[500],
  },
  summaryValue: {
    fontSize: 14,
    color: colors.neutral[700],
  },
  freeDelivery: {
    color: colors.secondary[500],
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceVariant,
    marginVertical: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onBackground,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.secondary[500],
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.gutter,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  checkoutButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.md,
    borderRadius: 24,
    alignItems: 'center',
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});