import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput } from "react-native";
import { Header } from "../src/components/ui/Header";
import { colors, spacing } from "../src/theme";

const ADDRESSES = [
  { id: "1", label: "Casa", address: "Rua das Flores, 123 - Apto 45", neighborhood: "Centro, Luanda", default: true },
  { id: "2", label: "Trabalho", address: "Av. 4 de Fevereiro, 1000 - Sala 50", neighborhood: "Ingombota, Luanda", default: false },
  { id: "3", label: "Outro", address: "Rua da Missassa, 500", neighborhood: "Samba, Luanda", default: false },
];

export default function AddressScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Header showBack />
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <Text style={styles.title}>Meus Endereços</Text>
        
        <View style={styles.addressesList}>
          {ADDRESSES.map((addr) => (
            <TouchableOpacity 
              key={addr.id} 
              style={[styles.addressCard, addr.default && styles.defaultAddress]}
              onPress={() => router.back()}
            >
              <View style={styles.addressIcon}>
                <MaterialCommunityIcons 
                  name={addr.label === "Casa" ? "home" : addr.label === "Trabalho" ? "briefcase" : "map-marker"} 
                  size={24} 
                  color={addr.default ? colors.primary[500] : colors.neutral[500]} 
                />
              </View>
              <View style={styles.addressInfo}>
                <View style={styles.addressRow}>
                  <Text style={styles.addressLabel}>{addr.label}</Text>
                  {addr.default && <View style={styles.defaultBadge}><Text style={styles.defaultText}>Principal</Text></View>}
                </View>
                <Text style={styles.addressText}>{addr.address}</Text>
                <Text style={styles.neighborhoodText}>{addr.neighborhood}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.neutral[300]} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.addButton}>
          <MaterialCommunityIcons name="plus" size={20} color={colors.primary[500]} />
          <Text style={styles.addButtonText}>Adicionar novo endereço</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingBottom: 80,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.onBackground,
    marginBottom: spacing.lg,
  },
  addressesList: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  addressCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  defaultAddress: {
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
  addressIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressInfo: {
    flex: 1,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
  },
  defaultBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary[500],
  },
  addressText: {
    fontSize: 14,
    color: colors.onSurface,
  },
  neighborhoodText: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary[500],
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[500],
  },
});