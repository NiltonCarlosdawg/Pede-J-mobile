import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useMemo } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Header, Input, PaymentMethodCard } from "../src/components/ui";
import { spacing, typography } from "../src/theme";
import { useTheme } from "../src/hooks/useTheme";
import { useAppDispatch, useAppSelector } from "../src/store";
import {
  addPaymentMethod,
  removePaymentMethod,
  selectPaymentMethods,
  setDefaultPaymentMethod,
} from "../src/store/paymentMethodsSlice";
import type { PaymentMethod } from "../src/types";

type AddPaymentFormData = {
  type: PaymentMethod["type"];
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  pixKey?: string;
  label?: string;
};

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const methods = useAppSelector(selectPaymentMethods);
  const { colors } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentMethod["type"]>("credit_card");
  const [formData, setFormData] = useState<AddPaymentFormData>({ type: "credit_card" });

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, paddingHorizontal: spacing.gutter },
    header: { paddingVertical: spacing.md },
    headerTitle: { ...typography.h2, color: colors.onSurface },
    headerSubtitle: { ...typography.bodySm, color: colors.neutral[500], marginTop: 4 },
    card: { backgroundColor: colors.surfaceContainerLowest, borderRadius: 20, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.surfaceVariant },
    cardSelected: { borderColor: colors.primary[500] },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
    cardLabel: { ...typography.labelLg, color: colors.onSurface },
    cardNumber: { ...typography.bodySm, color: colors.neutral[500] },
    cardRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
    fab: { position: "absolute", right: spacing.gutter, bottom: spacing.lg, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary[500], alignItems: "center", justifyContent: "center", elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalContent: { backgroundColor: colors.surfaceContainerLowest, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg },
    modalHandle: { width: 40, height: 4, backgroundColor: colors.neutral[300], borderRadius: 2, alignSelf: "center", marginBottom: spacing.lg },
    modalTitle: { ...typography.h3, color: colors.onSurface, marginBottom: spacing.lg },
    typeSelector: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
    typeButton: { flex: 1, paddingVertical: spacing.sm, borderRadius: 12, backgroundColor: colors.surfaceContainer, alignItems: "center" },
    typeButtonActive: { backgroundColor: colors.primary[100] },
    typeButtonText: { ...typography.bodySm, fontWeight: "600", color: colors.neutral[500] },
    typeButtonTextActive: { color: colors.primary[500] },
    buttonRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
    cancelButton: { flex: 1, paddingVertical: spacing.md, borderRadius: 16, backgroundColor: colors.surfaceContainer, alignItems: "center" },
    cancelButtonText: { ...typography.labelLg, color: colors.neutral[700] },
    saveButton: { flex: 1, paddingVertical: spacing.md, borderRadius: 16, backgroundColor: colors.primary[500], alignItems: "center" },
    saveButtonText: { ...typography.labelLg, color: colors.white },
    formGroup: { marginBottom: spacing.md },
    formLabel: { ...typography.labelLg, color: colors.neutral[700], marginBottom: spacing.xs },
    safeArea: { flex: 1, backgroundColor: colors.background },
    cardWrapper: { marginBottom: spacing.sm },
    listContent: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.xl },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: spacing.xxl },
    emptyText: { ...typography.h3, color: colors.onSurface, marginTop: spacing.md },
    emptySubtext: { ...typography.bodySm, color: colors.neutral[500], marginTop: spacing.xs },
    footerActions: { paddingHorizontal: spacing.gutter, paddingVertical: spacing.md, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.surfaceVariant },
    modalContainer: { flex: 1, backgroundColor: colors.background },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.gutter, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.surfaceVariant },
    modalCloseButton: { ...typography.labelLg, color: colors.primary[500] },
    modalPlaceholder: { width: 60 },
    paymentTypesContainer: { marginBottom: spacing.lg },
    sectionTitle: { ...typography.h3, color: colors.onSurface, marginBottom: spacing.md },
    typesGrid: { flexDirection: "row", gap: spacing.sm },
    typeLabel: { ...typography.labelCaps, color: colors.neutral[500], marginTop: spacing.xs },
    typeLabelActive: { color: colors.primary[500] },
    formContainer: { gap: spacing.md },
    rowInputs: { flexDirection: "row", gap: spacing.sm },
    flexInput: { flex: 1 },
  }), [colors]);

  const handleSelectMethod = (id: string) => {
    dispatch(setDefaultPaymentMethod(id));
  };

  const handleAddPaymentMethod = () => {
    if (!validateForm()) return;

    const newMethod: PaymentMethod = {
      id: `pm${Date.now()}`,
      type: selectedPaymentType,
      label: formData.label || getPaymentMethodLabel(selectedPaymentType),
      isDefault: methods.length === 0,
      cardNumber: formData.cardNumber,
      cardHolder: formData.cardHolder,
      expiryDate: formData.expiryDate,
      pixKey: formData.pixKey,
    };

    dispatch(addPaymentMethod(newMethod));
    resetForm();
    setShowAddModal(false);
  };

  const handleDeleteMethod = (id: string) => {
    dispatch(removePaymentMethod(id));
  };

  const validateForm = () => {
    return true; // Simplified for demo
  };

  const resetForm = () => {
    setFormData({ type: "credit_card" });
    setSelectedPaymentType("credit_card");
  };

  const getPaymentMethodLabel = (type: PaymentMethod["type"]) => {
    switch (type) {
      case "credit_card":
        return "Cartão MCX";
      case "wallet":
        return "Carteira Digital";
      case "cash":
        return "Dinheiro";
      default:
        return "Método de Pagamento";
    }
  };

  const paymentTypes: Array<{ type: PaymentMethod["type"]; icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"] }> = [
    { type: "credit_card", icon: "credit-card" },
    { type: "wallet", icon: "cellphone" },
    { type: "cash", icon: "cash" },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <Header
          title="Métodos de Pagamento"
          showBack
          onBackPress={() => router.back()}
        />

        <FlatList
          data={methods}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <PaymentMethodCard
                method={item}
                isSelected={item.isDefault}
                onSelect={() => handleSelectMethod(item.id)}
                onDelete={() => handleDeleteMethod(item.id)}
              />
            </View>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="credit-card-off"
                size={48}
                color={colors.neutral[300]}
              />
              <Text style={styles.emptyText}>Nenhum método de pagamento</Text>
              <Text style={styles.emptySubtext}>Adicione um agora</Text>
            </View>
          }
        />

        <View style={styles.footerActions}>
          <Button
            title="Adicionar Método de Pagamento"
            onPress={() => setShowAddModal(true)}
            variant="primary"
          />
        </View>

        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
            style={styles.modalContainer}
          >
            <SafeAreaView style={styles.modalContainer} edges={["top", "bottom"]}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowAddModal(false)}>
                    <Text style={styles.modalCloseButton}>Cancelar</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Novo Método</Text>
                  <View style={styles.modalPlaceholder} />
                </View>

                <View style={styles.paymentTypesContainer}>
                  <Text style={styles.sectionTitle}>Tipo de Pagamento</Text>
                  <View style={styles.typesGrid}>
                    {paymentTypes.map((item) => (
                      <TouchableOpacity
                        key={item.type}
                        onPress={() => {
                          setSelectedPaymentType(item.type);
                          setFormData((prev) => ({ ...prev, type: item.type }));
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={[
                          styles.typeButton,
                          selectedPaymentType === item.type && styles.typeButtonActive,
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={item.icon}
                          size={32}
                          color={
                            selectedPaymentType === item.type
                              ? colors.white
                              : colors.primary[500]
                          }
                        />
                        <Text
                          style={[
                            styles.typeLabel,
                            selectedPaymentType === item.type &&
                              styles.typeLabelActive,
                          ]}
                        >
                          {getPaymentMethodLabel(item.type)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formContainer}>
                  {selectedPaymentType === "pix" ? (
                    <>
                      <Text style={styles.sectionTitle}>Chave PIX</Text>
                      <Input
                        placeholder="Digite sua chave PIX (CPF, Email, Telefone ou Aleatória)"
                        value={formData.pixKey || ""}
                        onChangeText={(value) =>
                          setFormData((prev) => ({ ...prev, pixKey: value }))
                        }
                        returnKeyType="done"
                      />
                    </>
                  ) : selectedPaymentType === "cash" ? (
                    <Text style={styles.sectionTitle}>Dinheiro em mão</Text>
                  ) : (
                    <>
                      <Text style={styles.sectionTitle}>Dados do Cartão</Text>
                      <Input
                        placeholder="Número do Cartão"
                        value={formData.cardNumber || ""}
                        onChangeText={(value) =>
                          setFormData((prev) => ({ ...prev, cardNumber: value }))
                        }
                        keyboardType="numeric"
                        returnKeyType="next"
                      />
                      <Input
                        placeholder="Nome do Titular"
                        value={formData.cardHolder || ""}
                        onChangeText={(value) =>
                          setFormData((prev) => ({ ...prev, cardHolder: value }))
                        }
                        returnKeyType="next"
                      />
                      <View style={styles.rowInputs}>
                        <View style={styles.flexInput}>
                          <Input
                            placeholder="MM/AA"
                            value={formData.expiryDate || ""}
                            onChangeText={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                expiryDate: value,
                              }))
                            }
                            keyboardType="numeric"
                            returnKeyType="done"
                          />
                        </View>
                      </View>
                    </>
                  )}

                  <Button
                    title="Guardar Método"
                    onPress={handleAddPaymentMethod}
                    size="large"
                  />
                </View>
              </View>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
