import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../src/components/ui/Button";
import { Header } from "../src/components/ui/Header";
import { useAppDispatch, useAppSelector } from "../src/store";
import { selectOrders } from "../src/store/ordersSlice";
import { addDriverRating } from "../src/store/ratingsSlice";
import { spacing } from "../src/theme";
import { useTheme } from "../src/hooks/useTheme";

const RATING_LABELS = ["Péssimo", "Ruim", "Bom", "Muito bom", "Excelente"];
const QUICK_TAGS = ["Pontual", "Simpático", "Cuidadoso", "Rápido", "Bem vestido", "Educado"];

export default function DriverRatingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId?: string; immediate?: string }>();
  const orderId = params.orderId ?? "order-005";
  const isImmediate = params.immediate === "true";
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const order = orders.find((o: any) => o.id === orderId);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

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
    successContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
    },
    successIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary[100],
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
    },
    successTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.onSurface,
      marginBottom: spacing.sm,
    },
    successText: {
      fontSize: 15,
      color: colors.neutral[500],
      textAlign: "center",
      marginBottom: spacing.lg,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.onSurface,
      marginBottom: spacing.md,
    },
    ratingContainer: {
      flexDirection: "row",
      justifyContent: "center",
      gap: spacing.md,
      marginBottom: spacing.sm,
    },
    starButton: {
      padding: spacing.xs,
    },
    ratingLabel: {
      textAlign: "center",
      fontSize: 16,
      fontWeight: "700",
      color: colors.primary[500],
      marginTop: spacing.sm,
    },
    commentInput: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: 16,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      fontSize: 15,
      color: colors.onSurface,
      minHeight: 100,
      textAlignVertical: "top",
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    tagChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.surfaceContainer,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    tagChipSelected: {
      backgroundColor: colors.primary[500],
      borderColor: colors.primary[500],
    },
    tagText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.onSurface,
    },
    tagTextSelected: {
      color: colors.white,
    },
    submitButton: {
      marginTop: spacing.md,
      marginBottom: spacing.xl,
    },
    orderInfo: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 16,
      padding: spacing.md,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    orderText: {
      fontSize: 14,
      color: colors.neutral[500],
      marginBottom: 4,
    },
    orderValue: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.onSurface,
    },
    driverInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    driverAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary[100],
      alignItems: "center",
      justifyContent: "center",
    },
    driverName: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.onSurface,
    },
    driverVehicle: {
      fontSize: 13,
      color: colors.neutral[500],
      marginTop: 2,
    },
  }), [colors]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleSubmit() {
    if (rating === 0) return;

    dispatch(
      addDriverRating({
        orderId,
        driverId: order?.driver?.id ?? "unknown",
        userId: "user-001",
        userName: "Você",
        rating,
        comment,
        tags: selectedTags,
      })
    );

    setSubmitted(true);
  }

  function handleSuccessNext() {
    if (isImmediate) {
      router.replace({ pathname: "/avaliacao", params: { orderId, immediate: "true" } });
    } else {
      router.replace("/pedidos");
    }
  }

  if (submitted) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="Avaliação do Entregador" showBack onBackPress={() => router.back()} />
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <MaterialCommunityIcons name="check" size={40} color={colors.primary[500]} />
          </View>
          <Text style={styles.successTitle}>Obrigado!</Text>
          <Text style={styles.successText}>
            Sua avaliação ajuda a manter a qualidade dos nossos entregadores.
          </Text>
          <Button title={isImmediate ? "Avaliar pedido" : "Voltar aos pedidos"} onPress={handleSuccessNext} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Avaliar Entregador" showBack onBackPress={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Driver Info */}
        <View style={styles.orderInfo}>
          <View style={styles.driverInfo}>
            <View style={styles.driverAvatar}>
              <MaterialCommunityIcons name="account" size={28} color={colors.primary[500]} />
            </View>
            <View>
              <Text style={styles.driverName}>{order?.driver?.name ?? "Entregador"}</Text>
              <Text style={styles.driverVehicle}>{order?.driver?.vehicle ?? ""}</Text>
            </View>
          </View>
          <Text style={styles.orderText}>Pedido #{orderId.slice(-4)}</Text>
        </View>

        {/* Rating Stars */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Como foi o entregador?</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                style={styles.starButton}
                onPress={() => setRating(star)}
              >
                <MaterialCommunityIcons
                  name={star <= rating ? "star" : "star-outline"}
                  size={40}
                  color={star <= rating ? colors.secondary[500] : colors.neutral[300]}
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingLabel}>{RATING_LABELS[rating - 1]}</Text>
          )}
        </View>

        {/* Comment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deixe um comentário (opcional)</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Conte mais sobre a entrega..."
            placeholderTextColor={colors.neutral[500]}
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={500}
          />
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O que você destacaria?</Text>
          <View style={styles.tagsContainer}>
            {QUICK_TAGS.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagChip,
                  selectedTags.includes(tag) && styles.tagChipSelected,
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedTags.includes(tag) && styles.tagTextSelected,
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit */}
        <View style={styles.submitButton}>
          <Button
            title="Enviar avaliação"
            onPress={handleSubmit}
            disabled={rating === 0}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
