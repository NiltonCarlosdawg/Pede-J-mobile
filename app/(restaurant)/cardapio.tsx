import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Platform,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "../../src/components/ui/Header";
import { Button } from "../../src/components/ui/Button";
import { ConfirmDialog } from "../../src/components/ui/ConfirmDialog";
import { spacing } from "../../src/theme";
import { useTheme } from "../../src/hooks/useTheme";
import { restaurantManageApi } from "../../src/services/api";
import type { Product } from "../../src/types";

export default function RestaurantMenuScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formAvailable, setFormAvailable] = useState(true);
  const [formFeatured, setFormFeatured] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await restaurantManageApi.getProducts({ limit: 100 });
      setProducts(res.data.data ?? res.data);
    } catch (err: any) {
      console.error("[RestaurantMenu] fetchProducts error:", err);
      setError("Erro ao carregar cardápio.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const resetForm = useCallback(() => {
    setFormName("");
    setFormDescription("");
    setFormPrice("");
    setFormCategory("");
    setFormImage("");
    setFormAvailable(true);
    setFormFeatured(false);
    setEditingProduct(null);
  }, []);

  const openAddModal = useCallback(() => {
    resetForm();
    setShowAddModal(true);
  }, [resetForm]);

  const openEditModal = useCallback((product: Product) => {
    setFormName(product.name);
    setFormDescription(product.description);
    setFormPrice(String(product.price));
    setFormCategory(product.category);
    setFormImage(product.image || "");
    setFormAvailable(product.isAvailable);
    setFormFeatured(product.isFeatured);
    setEditingProduct(product);
    setShowAddModal(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!formName.trim() || !formPrice.trim()) return;

    setSaving(true);
    try {
      const data = {
        name: formName.trim(),
        description: formDescription.trim(),
        price: parseFloat(formPrice) || 0,
        category: formCategory.trim() || "Geral",
        image: formImage.trim() || undefined,
        isAvailable: formAvailable,
        isFeatured: formFeatured,
      };

      if (editingProduct) {
        await restaurantManageApi.updateProduct(editingProduct.id, data);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, ...data, image: data.image ?? p.image } : p))
        );
      } else {
        const res = await restaurantManageApi.createProduct(data);
        setProducts((prev) => [res.data, ...prev]);
      }

      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error("[RestaurantMenu] handleSave error:", err);
    } finally {
      setSaving(false);
    }
  }, [formName, formDescription, formPrice, formCategory, formImage, formAvailable, formFeatured, editingProduct, resetForm]);

  const handleDelete = useCallback(async () => {
    if (!deleteConfirm) return;

    try {
      await restaurantManageApi.deleteProduct(deleteConfirm.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("[RestaurantMenu] handleDelete error:", err);
    }
  }, [deleteConfirm]);

  const toggleAvailability = useCallback(async (product: Product) => {
    try {
      const newAvailability = !product.isAvailable;
      await restaurantManageApi.updateProduct(product.id, { isAvailable: newAvailability });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isAvailable: newAvailability } : p))
      );
    } catch (err) {
      console.error("[RestaurantMenu] toggleAvailability error:", err);
    }
  }, []);

  const formatCurrency = useCallback((value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return `Kz ${(num || 0).toLocaleString("pt-AO")}`;
  }, []);

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, paddingHorizontal: spacing.lg },
    listContent: { paddingBottom: spacing.xxl },
    productCard: {
      flexDirection: "row",
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 16,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
      alignItems: "center",
      gap: spacing.md,
    },
    productImage: {
      width: 64,
      height: 64,
      borderRadius: 12,
      backgroundColor: colors.surfaceContainer,
    },
    productInfo: { flex: 1 },
    productName: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.onSurface,
      marginBottom: 2,
    },
    productCategory: {
      fontSize: 12,
      color: colors.neutral[500],
      marginBottom: 4,
    },
    productPrice: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.primary[500],
    },
    productActions: {
      alignItems: "flex-end",
      gap: spacing.sm,
    },
    actionRow: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    iconButton: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    unavailableBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor: colors.error + "15",
    },
    unavailableText: {
      fontSize: 10,
      fontWeight: "700",
      color: colors.error,
    },
    featuredBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor: colors.secondary[100],
    },
    featuredText: {
      fontSize: 10,
      fontWeight: "700",
      color: colors.secondary[700],
    },
    emptyContainer: {
      alignItems: "center",
      paddingVertical: spacing.xxl,
      gap: spacing.sm,
    },
    emptyText: {
      fontSize: 14,
      color: colors.neutral[500],
      textAlign: "center",
    },
    addButton: {
      position: "absolute",
      bottom: spacing.lg,
      right: spacing.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary[500],
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({
        ios: {
          shadowColor: colors.primary[500],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: { elevation: 8 },
      }),
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.surfaceContainerLowest,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: spacing.lg,
      maxHeight: "80%",
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.onSurface,
      marginBottom: spacing.lg,
      textAlign: "center",
    },
    formGroup: {
      marginBottom: spacing.md,
    },
    formLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.neutral[700],
      marginBottom: spacing.xs,
    },
    formInput: {
      backgroundColor: colors.neutral[50],
      borderWidth: 1,
      borderColor: colors.neutral[200],
      borderRadius: 12,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: 16,
      color: colors.onSurface,
    },
    formRow: {
      flexDirection: "row",
      gap: spacing.md,
    },
    formSwitchRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.sm,
    },
    modalActions: {
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.lg,
    },
    modalCancelButton: {
      flex: 1,
    },
    modalSaveButton: {
      flex: 1,
    },
  }), [colors]);

  const renderProduct = useCallback(({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.productImage} />
      ) : (
        <View style={[styles.productImage, { alignItems: "center", justifyContent: "center" }]}>
          <MaterialCommunityIcons name="food" size={24} color={colors.neutral[400]} />
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
      </View>
      <View style={styles.productActions}>
        {!item.isAvailable && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Indisponível</Text>
          </View>
        )}
        {item.isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>Destaque</Text>
          </View>
        )}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.iconButton} onPress={() => openEditModal(item)}>
            <MaterialCommunityIcons name="pencil" size={16} color={colors.primary[500]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => setDeleteConfirm(item)}>
            <MaterialCommunityIcons name="delete" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
        <Switch
          value={item.isAvailable}
          onValueChange={() => toggleAvailability(item)}
          trackColor={{ false: colors.neutral[300], true: colors.primary[100] }}
          thumbColor={item.isAvailable ? colors.primary[500] : colors.neutral[400]}
        />
      </View>
    </View>
  ), [colors, formatCurrency, openEditModal, toggleAvailability, styles]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Cardápio" showBack={false} showCart={false} />

      <View style={styles.content}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={32} color={colors.error} />
            <Text style={styles.emptyText}>{error}</Text>
            <Button title="Tentar novamente" onPress={fetchProducts} variant="secondary" />
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={48} color={colors.neutral[300]} />
            <Text style={styles.emptyText}>Nenhum item no cardápio{"\n"}Adicione seu primeiro produto</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <MaterialCommunityIcons name="plus" size={28} color={colors.white} />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAddModal(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>{editingProduct ? "Editar Produto" : "Novo Produto"}</Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nome *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ex: Burger Clássico"
                placeholderTextColor={colors.neutral[400]}
                value={formName}
                onChangeText={setFormName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Descrição</Text>
              <TextInput
                style={[styles.formInput, { minHeight: 60 }]}
                placeholder="Descrição do produto"
                placeholderTextColor={colors.neutral[400]}
                value={formDescription}
                onChangeText={setFormDescription}
                multiline
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Preço (Kz) *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="0"
                  placeholderTextColor={colors.neutral[400]}
                  value={formPrice}
                  onChangeText={setFormPrice}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Categoria</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ex: Hambúrguer"
                  placeholderTextColor={colors.neutral[400]}
                  value={formCategory}
                  onChangeText={setFormCategory}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>URL da Imagem</Text>
              <TextInput
                style={styles.formInput}
                placeholder="https://..."
                placeholderTextColor={colors.neutral[400]}
                value={formImage}
                onChangeText={setFormImage}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formSwitchRow}>
              <Text style={styles.formLabel}>Disponível</Text>
              <Switch
                value={formAvailable}
                onValueChange={setFormAvailable}
                trackColor={{ false: colors.neutral[300], true: colors.primary[100] }}
                thumbColor={formAvailable ? colors.primary[500] : colors.neutral[400]}
              />
            </View>

            <View style={styles.formSwitchRow}>
              <Text style={styles.formLabel}>Produto em Destaque</Text>
              <Switch
                value={formFeatured}
                onValueChange={setFormFeatured}
                trackColor={{ false: colors.neutral[300], true: colors.secondary[100] }}
                thumbColor={formFeatured ? colors.secondary[500] : colors.neutral[400]}
              />
            </View>

            <View style={styles.modalActions}>
              <View style={styles.modalCancelButton}>
                <Button
                  title="Cancelar"
                  onPress={() => { setShowAddModal(false); resetForm(); }}
                  variant="ghost"
                />
              </View>
              <View style={styles.modalSaveButton}>
                <Button
                  title={saving ? "Salvando..." : "Salvar"}
                  onPress={handleSave}
                  disabled={saving || !formName.trim() || !formPrice.trim()}
                  loading={saving}
                />
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        visible={!!deleteConfirm}
        title="Excluir Produto"
        message={`Tem certeza que deseja excluir "${deleteConfirm?.name}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        icon="delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </SafeAreaView>
  );
}
