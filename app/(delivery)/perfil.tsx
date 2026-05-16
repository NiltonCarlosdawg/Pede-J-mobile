import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState, useEffect } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "../../src/components/ui/Header";
import { ConfirmDialog } from "../../src/components/ui/ConfirmDialog";
import { useAppDispatch, useAppSelector } from "../../src/store";
import { clearSession } from "../../src/store/authSlice";
import { clearCart } from "../../src/store/cartSlice";
import { clearDemoSession } from "../../src/services/demoAuth";
import { requestLocationPermissions } from "../../src/services/location";
import { spacing } from "../../src/theme";
import { useTheme } from "../../src/hooks/useTheme";

const VEHICLE_INFO = {
  type: "Moto",
  brand: "Honda",
  model: "CG 160",
  year: "2022",
  plate: "LD-23-45-XA",
  color: "Vermelha",
};

const DOCUMENTS = [
  { id: "license", label: "Carta de Condução", status: "valid", expiry: "12/2026" },
  { id: "insurance", label: "Seguro", status: "valid", expiry: "06/2025" },
  { id: "criminal", label: "Registo Criminal", status: "valid", expiry: "N/A" },
];

const STATS = [
  { label: "Entregas", value: "1.247" },
  { label: "Avaliação", value: "4.8" },
  { label: "Taxa de aceitação", value: "94%" },
];

export default function DeliveryProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { colors } = useTheme();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);

  useEffect(() => {
    const checkLocation = async () => {
      const granted = await requestLocationPermissions();
      setLocationEnabled(granted);
    };
    checkLocation();
  }, []);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
    },
    profileCard: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 24,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
      alignItems: "center",
    },
    avatarContainer: {
      position: "relative",
      marginBottom: spacing.md,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 3,
      borderColor: colors.primary[500],
    },
    statusBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.primary[500],
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.white,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.white,
    },
    statusText: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.white,
    },
    name: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.onSurface,
      marginBottom: 4,
    },
    email: {
      fontSize: 14,
      color: colors.neutral[500],
      marginBottom: spacing.lg,
    },
    statsRow: {
      flexDirection: "row",
      width: "100%",
      justifyContent: "space-around",
    },
    statItem: {
      alignItems: "center",
    },
    statValue: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.primary[500],
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 12,
      color: colors.neutral[500],
    },
    card: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 24,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.onSurface,
    },
    editLink: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary[500],
    },
    vehicleInfo: {
      flexDirection: "row",
      gap: spacing.md,
      alignItems: "center",
    },
    vehicleIcon: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: colors.primary[100],
      alignItems: "center",
      justifyContent: "center",
    },
    vehicleDetails: {
      flex: 1,
    },
    vehicleTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.onSurface,
      marginBottom: 2,
    },
    vehicleMeta: {
      fontSize: 13,
      color: colors.neutral[500],
      marginBottom: spacing.sm,
    },
    plateBadge: {
      backgroundColor: colors.primary[500],
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 8,
      alignSelf: "flex-start",
    },
    plateText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.white,
      letterSpacing: 1,
    },
    documentsList: {
      gap: spacing.sm,
    },
    documentItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.surfaceVariant,
    },
    documentIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.primary[100],
      alignItems: "center",
      justifyContent: "center",
    },
    documentContent: {
      flex: 1,
    },
    documentLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.onSurface,
      marginBottom: 2,
    },
    documentMeta: {
      fontSize: 12,
      color: colors.neutral[500],
    },
    documentStatus: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: colors.error + "15",
    },
    documentStatusValid: {
      backgroundColor: colors.primary[100],
    },
    documentStatusText: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.error,
    },
    documentStatusTextValid: {
      color: colors.primary[500],
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.surfaceVariant,
    },
    menuText: {
      flex: 1,
      fontSize: 15,
      color: colors.onSurface,
      marginLeft: spacing.md,
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
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoutText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.error,
      marginLeft: spacing.md,
    },
  }), [colors]);

  async function handleLogout() {
    setIsLoggingOut(true);
    setShowLogoutConfirm(false);

    // Simula delay de logout
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      await clearDemoSession();
      dispatch(clearCart());
      dispatch(clearSession());

      // Força navegação para login após logout
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("[logout] error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Meu Perfil" showBack showCart={false} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: user?.avatar ?? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
              }}
              style={styles.avatar}
            />
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>

          <Text style={styles.name}>{user?.name ?? "Carlos N'zau"}</Text>
          <Text style={styles.email}>{user?.email ?? "entregador@pedeja.com"}</Text>

          <View style={styles.statsRow}>
            {STATS.map((stat) => (
              <View key={stat.label} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Vehicle Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Meu Veículo</Text>
            <TouchableOpacity>
              <Text style={styles.editLink}>Editar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.vehicleInfo}>
            <View style={styles.vehicleIcon}>
              <MaterialCommunityIcons name="motorbike" size={28} color={colors.primary[500]} />
            </View>
            <View style={styles.vehicleDetails}>
              <Text style={styles.vehicleTitle}>
                {VEHICLE_INFO.brand} {VEHICLE_INFO.model}
              </Text>
              <Text style={styles.vehicleMeta}>
                {VEHICLE_INFO.year} · {VEHICLE_INFO.color}
              </Text>
              <View style={styles.plateBadge}>
                <Text style={styles.plateText}>{VEHICLE_INFO.plate}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Documents */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Documentos</Text>
          <View style={styles.documentsList}>
            {DOCUMENTS.map((doc) => (
              <View key={doc.id} style={styles.documentItem}>
                <View style={styles.documentIcon}>
                  <MaterialCommunityIcons
                    name="file-document-outline"
                    size={20}
                    color={doc.status === "valid" ? colors.primary[500] : colors.error}
                  />
                </View>
                <View style={styles.documentContent}>
                  <Text style={styles.documentLabel}>{doc.label}</Text>
                  <Text style={styles.documentMeta}>
                    Válido até {doc.expiry}
                  </Text>
                </View>
                <View
                  style={[
                    styles.documentStatus,
                    doc.status === "valid" && styles.documentStatusValid,
                  ]}
                >
                  <Text
                    style={[
                      styles.documentStatusText,
                      doc.status === "valid" && styles.documentStatusTextValid,
                    ]}
                  >
                    {doc.status === "valid" ? "Válido" : "Expirado"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Configurações</Text>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.neutral[500]} />
            <Text style={styles.menuText}>Notificações</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.neutral[300]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="map-marker-radius" size={22} color={colors.neutral[500]} />
            <Text style={styles.menuText}>Zona de atuação</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.neutral[300]} />
          </TouchableOpacity>
          <View style={styles.menuItem}>
            <MaterialCommunityIcons name="crosshairs-gps" size={22} color={colors.neutral[500]} />
            <Text style={styles.menuText}>Compartilhar localização</Text>
            <Switch
              value={locationEnabled}
              onValueChange={async (value) => {
                if (value) {
                  const granted = await requestLocationPermissions();
                  setLocationEnabled(granted);
                } else {
                  setLocationEnabled(false);
                }
              }}
              trackColor={{ false: colors.neutral[300], true: colors.primary[500] }}
              thumbColor={colors.white}
            />
          </View>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="wallet-outline" size={22} color={colors.neutral[500]} />
            <Text style={styles.menuText}>Método de pagamento</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.neutral[300]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="help-circle-outline" size={22} color={colors.neutral[500]} />
            <Text style={styles.menuText}>Ajuda e Suporte</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.neutral[300]} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={() => setShowLogoutConfirm(true)}>
            <View style={styles.logoutIcon}>
              <MaterialCommunityIcons name="logout" size={22} color={colors.error} />
            </View>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={showLogoutConfirm}
        title="Sair da conta"
        message="Tem certeza que deseja sair? Você precisará fazer login novamente para acessar o aplicativo."
        confirmText="Sair"
        cancelText="Cancelar"
        icon="logout-variant"
        iconColor={colors.error}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </SafeAreaView>
  );
}
