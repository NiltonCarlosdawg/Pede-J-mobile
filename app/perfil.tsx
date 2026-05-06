import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../src/components/ui/Header";
import { colors, spacing } from "../src/theme";

export default function PerfilScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Meu Perfil" />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileGradient} />
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2e?w=200" }} 
              style={styles.profileImage} 
            />
            <TouchableOpacity style={styles.editButton}>
              <MaterialCommunityIcons name="pencil" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>Alexandre João</Text>
          <Text style={styles.profileEmail}>alexandre.joao@example.ao</Text>
          <View style={styles.memberBadge}>
            <MaterialCommunityIcons name="star" size={16} color={colors.secondary[500]} />
            <Text style={styles.memberText}>Gold Member</Text>
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>APP SETTINGS</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <MaterialCommunityIcons name="bell-outline" size={24} color={colors.primary[500]} />
            </View>
            <Text style={styles.settingText}>Notifications</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.neutral[500]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <MaterialCommunityIcons name="translate" size={24} color={colors.primary[500]} />
            </View>
            <Text style={styles.settingText}>Language</Text>
            <Text style={styles.settingValue}>Português</Text>
          </TouchableOpacity>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <MaterialCommunityIcons name="weather-night" size={24} color={colors.primary[500]} />
            </View>
            <Text style={styles.settingText}>Dark Mode</Text>
            <Switch value={false} trackColor={{ false: colors.neutral[300], true: colors.primary[500] }} thumbColor={colors.white} />
          </View>
        </View>

        {/* Account Details */}
        <View style={styles.accountSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={styles.infoIcon}>
                <MaterialCommunityIcons name="account-outline" size={24} color={colors.primary[500]} />
              </View>
              <Text style={styles.infoTitle}>Personal Info</Text>
              <TouchableOpacity>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>Alexandre João</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>+244 923 123 456</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={styles.infoIcon}>
                <MaterialCommunityIcons name="credit-card-outline" size={24} color={colors.secondary[500]} />
              </View>
              <Text style={styles.infoTitle}>Payment Methods</Text>
              <TouchableOpacity>
                <Text style={styles.addText}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardRow}>
              <View style={styles.cardIcon}>
                <Text style={styles.cardText}>VISA</Text>
              </View>
              <View>
                <Text style={styles.cardNumber}>•••• 4242</Text>
                <Text style={styles.cardExpiry}>Expires 12/25</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Order History */}
        <TouchableOpacity style={styles.orderHistoryCard}>
          <View style={styles.orderIcon}>
            <MaterialCommunityIcons name="receipt" size={28} color={colors.white} />
          </View>
          <View style={styles.orderContent}>
            <Text style={styles.orderTitle}>Order History</Text>
            <Text style={styles.orderSubtitle}>View past orders and reorder favorites</Text>
          </View>
          <MaterialCommunityIcons name="arrow-right" size={24} color={colors.neutral[500]} />
        </TouchableOpacity>

        {/* Support & Legal */}
        <View style={styles.supportSection}>
          <Text style={styles.sectionTitle}>SUPPORT & LEGAL</Text>
          
          <TouchableOpacity style={styles.supportItem}>
            <View style={styles.supportIcon}>
              <MaterialCommunityIcons name="help-circle-outline" size={24} color={colors.neutral[500]} />
            </View>
            <Text style={styles.supportText}>Help Center</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.supportItem}>
            <View style={styles.supportIcon}>
              <MaterialCommunityIcons name="file-document-outline" size={24} color={colors.neutral[500]} />
            </View>
            <Text style={styles.supportText}>Terms of Service</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.supportItem, styles.logoutItem]}>
            <View style={styles.logoutIcon}>
              <MaterialCommunityIcons name="logout" size={24} color={colors.error} />
            </View>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
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
  profileCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  profileGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: colors.primary[100],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    opacity: 0.5,
  },
  profileImageContainer: {
    position: 'relative',
    marginTop: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: colors.surfaceContainerLowest,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.onSurface,
    marginTop: spacing.md,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.neutral[500],
    marginTop: 4,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: spacing.md,
  },
  memberText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary[500],
  },
  settingsCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[500],
    letterSpacing: 0.05,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    marginLeft: spacing.sm,
  },
  settingValue: {
    fontSize: 14,
    color: colors.neutral[500],
  },
  accountSection: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  infoTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  editText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[500],
  },
  addText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[500],
  },
  infoRow: {
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[500],
  },
  infoValue: {
    fontSize: 14,
    color: colors.onSurface,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
  },
  cardIcon: {
    width: 40,
    height: 28,
    backgroundColor: '#1A1F71',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    fontSize: 10,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: colors.white,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
  },
  cardExpiry: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  orderHistoryCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  orderIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  orderSubtitle: {
    fontSize: 14,
    color: colors.neutral[500],
  },
  supportSection: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    padding: spacing.md,
    marginBottom: 100,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  supportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    marginLeft: spacing.sm,
  },
  logoutItem: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.error,
    opacity: 0.8,
  },
  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    marginLeft: spacing.sm,
  },
});