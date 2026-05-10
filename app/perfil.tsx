import React, { useMemo, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    Switch,
    useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../src/components/ui/Header";
import { ConfirmDialog } from "../src/components/ui/ConfirmDialog";
import { clearSession } from "../src/store/authSlice";
import { clearCart } from "../src/store/cartSlice";
import { useAppDispatch, useAppSelector } from "../src/store";
import { clearDemoSession } from "../src/services/demoAuth";
import { spacing } from "../src/theme";
import { useTheme } from "../src/hooks/useTheme";

export default function PerfilScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;
  const { isDark, colors, toggleTheme } = useTheme();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const styles = useMemo(() => StyleSheet.create({
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
      fontSize: 22,
      fontWeight: '700',
      color: colors.onSurface,
      marginTop: spacing.md,
      textAlign: 'center',
    },
    profileEmail: {
      fontSize: 14,
      color: colors.neutral[500],
      marginTop: 4,
      textAlign: 'center',
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
      backgroundColor: colors.surfaceContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: colors.onSurface,
      marginLeft: spacing.sm,
    },
    settingValue: {
      fontSize: 13,
      color: colors.neutral[500],
    },
    accountSection: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    infoCard: {
      flex: 1,
      minWidth: 140,
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 24,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    infoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginBottom: spacing.sm,
      gap: spacing.xs,
    },
    infoIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.primary[100],
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.xs,
    },
    infoTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '700',
      color: colors.onSurface,
    },
    editText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary[500],
    },
    addText: {
      fontSize: 13,
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
      backgroundColor: colors.surfaceContainer,
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
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: colors.primary[500],
      alignItems: 'center',
      justifyContent: 'center',
    },
    orderContent: {
      flex: 1,
      marginLeft: spacing.sm,
    },
    orderTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.onSurface,
    },
    orderSubtitle: {
      fontSize: 13,
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
      backgroundColor: colors.surfaceContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    supportText: {
      flex: 1,
      fontSize: 15,
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
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoutText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.error,
      marginLeft: spacing.sm,
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

  const profileName = user?.name ?? "Alexandre João";
  const profileEmail = user?.email ?? "alexandre.joao@example.ao";
  const profileAvatar =
    user?.avatar ??
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2e?w=200";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Meu Perfil" showAvatar={false} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.profileGradient} />
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: profileAvatar }}
              style={[
                styles.profileImage,
                { width: isSmallScreen ? 80 : 100, height: isSmallScreen ? 80 : 100, borderRadius: isSmallScreen ? 40 : 50 },
              ]}
            />
            <TouchableOpacity style={[styles.editButton, isSmallScreen && { width: 28, height: 28 }]}>
              <MaterialCommunityIcons name="pencil" size={isSmallScreen ? 14 : 16} color={colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.profileName, isSmallScreen && { fontSize: 20 }]}>{profileName}</Text>
          <Text style={[styles.profileEmail, isSmallScreen && { fontSize: 12 }]}>{profileEmail}</Text>
          <View style={styles.memberBadge}>
            <MaterialCommunityIcons name="star" size={isSmallScreen ? 14 : 16} color={colors.secondary[500]} />
            <Text style={[styles.memberText, isSmallScreen && { fontSize: 11 }]}>Membro Ouro</Text>
          </View>
        </View>

        <View style={styles.settingsCard}>
          <Text style={[styles.sectionTitle, isSmallScreen && { fontSize: 11 }]}>CONFIGURAÇÕES DO APP</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={[styles.settingIcon, isSmallScreen && { width: 36, height: 36 }]}>
              <MaterialCommunityIcons name="bell-outline" size={isSmallScreen ? 20 : 24} color={colors.primary[500]} />
            </View>
            <Text style={[styles.settingText, isSmallScreen && { fontSize: 14 }]}>Notificações</Text>
            <MaterialCommunityIcons name="chevron-right" size={isSmallScreen ? 20 : 24} color={colors.neutral[500]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={[styles.settingIcon, isSmallScreen && { width: 36, height: 36 }]}>
              <MaterialCommunityIcons name="translate" size={isSmallScreen ? 20 : 24} color={colors.primary[500]} />
            </View>
            <Text style={[styles.settingText, isSmallScreen && { fontSize: 14 }]}>Idioma</Text>
            <Text style={[styles.settingValue, isSmallScreen && { fontSize: 12 }]}>Português</Text>
          </TouchableOpacity>
          
          <View style={styles.settingItem}>
            <View style={[styles.settingIcon, isSmallScreen && { width: 36, height: 36 }]}>
              <MaterialCommunityIcons name="weather-night" size={isSmallScreen ? 20 : 24} color={colors.primary[500]} />
            </View>
            <Text style={[styles.settingText, isSmallScreen && { fontSize: 14 }]}>Modo Escuro</Text>
            <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: colors.neutral[300], true: colors.primary[500] }} thumbColor={colors.white} />
          </View>
        </View>

        <View style={[styles.accountSection, isSmallScreen && { flexDirection: 'column' }]}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={[styles.infoIcon, isSmallScreen && { width: 32, height: 32 }]}>
                <MaterialCommunityIcons name="account-outline" size={isSmallScreen ? 18 : 24} color={colors.primary[500]} />
              </View>
              <Text style={[styles.infoTitle, isSmallScreen && { fontSize: 14 }]}>Informações Pessoais</Text>
              <TouchableOpacity>
                <Text style={styles.editText}>Editar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, isSmallScreen && { fontSize: 11 }]}>Nome Completo</Text>
              <Text style={[styles.infoValue, isSmallScreen && { fontSize: 13 }]}>Alexandre João</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, isSmallScreen && { fontSize: 11 }]}>Número de Telefone</Text>
              <Text style={[styles.infoValue, isSmallScreen && { fontSize: 13 }]}>+244 923 123 456</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.orderHistoryCard}
          onPress={() => router.push("/pedidos")}
        >
          <View style={[styles.orderIcon, isSmallScreen && { width: 44, height: 44 }]}>
            <MaterialCommunityIcons name="receipt" size={isSmallScreen ? 22 : 28} color={colors.white} />
          </View>
          <View style={styles.orderContent}>
            <Text style={[styles.orderTitle, isSmallScreen && { fontSize: 15 }]}>Histórico de Pedidos</Text>
            <Text style={[styles.orderSubtitle, isSmallScreen && { fontSize: 12 }]}>Ver pedidos anteriores e pedir novamente</Text>
          </View>
          <MaterialCommunityIcons name="arrow-right" size={isSmallScreen ? 20 : 24} color={colors.neutral[500]} />
        </TouchableOpacity>

        <View style={styles.supportSection}>
          <Text style={[styles.sectionTitle, isSmallScreen && { fontSize: 11 }]}>SUPORTE E LEGAL</Text>
          
          <TouchableOpacity style={styles.supportItem}>
            <View style={[styles.supportIcon, isSmallScreen && { width: 36, height: 36 }]}>
              <MaterialCommunityIcons name="help-circle-outline" size={isSmallScreen ? 18 : 24} color={colors.neutral[500]} />
            </View>
            <Text style={[styles.supportText, isSmallScreen && { fontSize: 14 }]}>Central de Ajuda</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.supportItem}>
            <View style={[styles.supportIcon, isSmallScreen && { width: 36, height: 36 }]}>
              <MaterialCommunityIcons name="file-document-outline" size={isSmallScreen ? 18 : 24} color={colors.neutral[500]} />
            </View>
            <Text style={[styles.supportText, isSmallScreen && { fontSize: 14 }]}>Termos de Serviço</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.supportItem, styles.logoutItem]} onPress={() => setShowLogoutConfirm(true)}>
            <View style={[styles.logoutIcon, isSmallScreen && { width: 36, height: 36 }]}>
              <MaterialCommunityIcons name="logout" size={isSmallScreen ? 18 : 24} color={colors.error} />
            </View>
            <Text style={[styles.logoutText, isSmallScreen && { fontSize: 14 }]}>Sair</Text>
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