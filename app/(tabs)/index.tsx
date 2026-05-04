import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RestaurantCard } from '../../src/components/ui';
import { colors, spacing } from '../../src/theme';

const CATEGORIES = [
  { id: '1', name: 'Todas', icon: '🍽️' },
  { id: '2', name: 'Pizza', icon: '🍕' },
  { id: '3', name: 'Hambúrguer', icon: '🍔' },
  { id: '4', name: 'Angolana', icon: '🐟' },
  { id: '5', name: 'Asiática', icon: '🍜' },
];

const RESTAURANTS = [
  { id: '1', name: 'Restaurante Tropical', cuisine: 'Angolana • Café', rating: 4.5, deliveryTime: '30-40 min', deliveryFee: 'Grátis' },
  { id: '2', name: 'Pizza Hut Luanda', cuisine: 'Pizzaria', rating: 4.3, deliveryTime: '25-35 min', deliveryFee: '1.500 Kz' },
  { id: '3', name: 'McDonalds Benfica', cuisine: 'Fast Food', rating: 4.1, deliveryTime: '15-25 min', deliveryFee: '500 Kz' },
  { id: '4', name: 'Sushi Maker', cuisine: 'Japonesa', rating: 4.8, deliveryTime: '40-50 min', deliveryFee: '2.000 Kz' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, José!</Text>
            <Text style={styles.address}>Rua do Kinaxixi, Luanda</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <MaterialCommunityIcons name="account-circle" size={40} color={colors.primary[500]} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={24} color={colors.neutral[500]} />
          <Text style={styles.searchPlaceholder}>Buscar restaurantes ou pratos...</Text>
        </TouchableOpacity>

        <View style={styles.categories}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryItem}>
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurantes Próximos</Text>
          <FlatList
            data={RESTAURANTS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RestaurantCard
                title={item.name}
                subtitle={item.cuisine}
                rating={item.rating}
                deliveryTime={item.deliveryTime}
                deliveryFee={item.deliveryFee}
                onPress={() => {}}
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
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  greeting: { fontSize: 24, fontWeight: '700', color: colors.neutral[900] },
  address: { fontSize: 14, color: colors.neutral[700], marginTop: spacing.xs },
  profileButton: { padding: spacing.xs },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, marginHorizontal: spacing.md, padding: spacing.md, borderRadius: 9999, borderWidth: 1, borderColor: colors.neutral[200] },
  searchPlaceholder: { marginLeft: spacing.sm, fontSize: 16, color: colors.neutral[500] },
  categories: { paddingVertical: spacing.md },
  categoryItem: { alignItems: 'center', marginHorizontal: spacing.sm, padding: spacing.sm, borderRadius: 9999, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.neutral[200] },
  categoryIcon: { fontSize: 24, marginBottom: spacing.xs },
  categoryName: { fontSize: 12, fontWeight: '600', color: colors.neutral[700] },
  section: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.neutral[900], marginBottom: spacing.md },
});