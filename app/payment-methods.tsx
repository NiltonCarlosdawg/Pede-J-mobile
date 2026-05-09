import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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

import { Button } from "../../src/components/ui/Button";
import { Header } from "../../src/components/ui/Header";
import { Input } from "../../src/components/ui/Input";
import { PaymentMethodCard } from "../../src/components/ui/PaymentMethodCard";
import { colors, spacing } from "../../src/theme";
import type { PaymentMethod } from "../../src/types";

// Mock data
const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "pm1",
    type: "credit_card",
    label: "Visa Pessoal",
    isDefault: true,
    cardNumber: "4242",
    cardHolder: "JOÃO SILVA",
    expiryDate: "12/25",
    brand: "Visa",
  },
  {
    id: "pm2",
    type: "pix",
    label: "Chave CPF",
    isDefault: false,
    pixKey: "123.456.789-00",
  },
  {
    id: "pm3",
    type: "debit_card",
    label: "Débito BFA",
    isDefault: false,
    cardNumber: "5678",
    cardHolder: "JOÃO SILVA",
    expiryDate: "08/24",
    brand: "Mastercard",
  },
];

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
  const [methods, setMethods] = useState<PaymentMethod[]>(INITIAL_PAYMENT_METHODS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentMethod["type"]>("credit_card");
  const [formData, setFormData] = useState<AddPaymentFormData>({ type: "credit_card" });

  const handleSelectMethod = (id: string) => {
    setMethods((prev) =>
      prev.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
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

    setMethods((prev) => [...prev, newMethod]);
    resetForm();
    setShowAddModal(false);
  };

  const handleDeleteMethod = (id: string) => {
    const defaultMethod = methods.find((m) => m.isDefault);
    const updatedMethods = methods.filter((m) => m.id !== id);

    if (defaultMethod?.id === id && updatedMethods.length > 0) {
      updatedMethods[0].isDefault = true;
    }

    setMethods(updatedMethods);
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
        return "Cartão de Crédito";
      case "debit_card":
        return "Cartão de Débito";
      case "pix":
        return "Pix";
      case "wallet":
        return "Carteira";
      case "cash":
        return "Dinheiro";
      default:
        return "Método de Pagamento";
    }
  };

  const paymentTypes: Array<{ type: PaymentMethod["type"]; icon: string }> = [
    { type: "credit_card", icon: "credit-card" },
    { type: "debit_card", icon: "credit-card" },
    { type: "pix", icon: "qrcode" },
    { type: "wallet", icon: "wallet" },
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
          <SafeAreaView style={styles.modalContainer} edges={["top", "bottom"]}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.modalContent}
            >
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
                    />
                    <Input
                      placeholder="Nome do Titular"
                      value={formData.cardHolder || ""}
                      onChangeText={(value) =>
                        setFormData((prev) => ({ ...prev, cardHolder: value }))
                      }
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
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  cardWrapper: {
    marginBottom: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral[900],
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.neutral[500],
    marginTop: spacing.sm,
  },
  footerActions: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  modalCloseButton: {
    fontSize: 16,
    color: colors.primary[500],
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  modalPlaceholder: {
    width: 80,
  },
  paymentTypesContainer: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  typesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  typeButton: {
    flex: 1,
    minWidth: "45%",
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: colors.neutral[50],
    borderWidth: 2,
    borderColor: colors.neutral[200],
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  typeButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.neutral[700],
    textAlign: "center",
  },
  typeLabelActive: {
    color: colors.white,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  rowInputs: {
    flexDirection: "row",
    gap: spacing.md,
  },
  flexInput: {
    flex: 1,
  },
});
