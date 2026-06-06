import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../src/components/ui/Button";
import { useTheme } from "../src/hooks/useTheme";
import { useAppDispatch } from "../src/store";
import { addItem, clearCart } from "../src/store/cartSlice";
import { formatPrice, spacing, typography } from "../src/theme";

export default function ProductModal() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { colors } = useTheme();

    const params = useLocalSearchParams<{
        id: string;
        name: string;
        price: string;
        image: string;
        restaurant: string;
        rating: string;
        description: string;
    }>();

    const product = {
        id: params.id,
        name: params.name,
        price: Number(params.price),
        image: params.image,
        restaurant: params.restaurant,
        rating: Number(params.rating),
        description: params.description,
    };

    const ingredients = useMemo(() => {
        return product.description
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }, [product.description]);

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.surface,
        },
        scrollContent: {
            flexGrow: 1,
            paddingBottom: spacing.xxl,
        },
        imageContainer: {
            width: "100%",
            height: 260,
        },
        image: {
            width: "100%",
            height: "100%",
        },
        closeButton: {
            position: "absolute",
            top: spacing.md,
            right: spacing.md,
            zIndex: 10,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "rgba(0,0,0,0.5)",
            alignItems: "center",
            justifyContent: "center",
        },
        infoSection: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
        },
        name: {
            ...typography.h2,
            color: colors.onSurface,
            marginBottom: spacing.xs,
        },
        restaurantRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.xs,
            marginBottom: spacing.sm,
        },
        restaurantName: {
            ...typography.bodySm,
            color: colors.neutral[500],
        },
        ratingRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            marginBottom: spacing.sm,
        },
        ratingText: {
            ...typography.bodySm,
            color: colors.neutral[500],
        },
        priceText: {
            fontSize: 26,
            fontWeight: "700",
            color: colors.primary[500],
        },
        divider: {
            height: 1,
            backgroundColor: colors.neutral[200],
            marginVertical: spacing.lg,
            marginHorizontal: spacing.lg,
        },
        ingredientsSection: {
            paddingHorizontal: spacing.lg,
        },
        ingredientsTitle: {
            ...typography.labelLg,
            color: colors.onSurface,
            marginBottom: spacing.sm,
            textTransform: "uppercase",
            letterSpacing: 0.5,
        },
        ingredientItem: {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: spacing.sm,
            paddingVertical: spacing.xs,
        },
        ingredientBullet: {
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: colors.primary[500],
            marginTop: 7,
        },
        ingredientText: {
            ...typography.bodyMd,
            color: colors.neutral[700],
            flex: 1,
            lineHeight: 22,
        },
        fullDescription: {
            ...typography.bodyMd,
            color: colors.neutral[700],
            lineHeight: 22,
        },
        actions: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            gap: spacing.sm,
        },
        secondaryButton: {
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: spacing.md,
        },
        secondaryButtonText: {
            ...typography.bodyMd,
            fontWeight: "600",
            color: colors.primary[500],
        },
        chip: {
            alignSelf: "flex-start",
            backgroundColor: colors.primary[50],
            paddingHorizontal: spacing.sm,
            paddingVertical: 3,
            borderRadius: 4,
            marginBottom: spacing.sm,
        },
        chipText: {
            ...typography.labelCaps,
            color: colors.primary[500],
        },
    }), [colors]);

    function handlePedeJa() {
        dispatch(clearCart());
        dispatch(addItem({
            id: product.id,
            title: product.name,
            price: product.price,
            image: product.image,
        }));
        router.replace("/checkout");
    }

    function handleAddToCart() {
        dispatch(addItem({
            id: product.id,
            title: product.name,
            price: product.price,
            image: product.image,
        }));
        router.back();
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: product.image }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => router.back()}
                    >
                        <MaterialCommunityIcons name="close" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.name}>{product.name}</Text>

                    <View style={styles.restaurantRow}>
                        <MaterialCommunityIcons name="store-outline" size={16} color={colors.neutral[500]} />
                        <Text style={styles.restaurantName}>{product.restaurant}</Text>
                    </View>

                    <View style={styles.ratingRow}>
                        <MaterialCommunityIcons name="star" size={16} color="#fbac1d" />
                        <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
                    </View>

                    <Text style={styles.priceText}>{formatPrice(product.price)}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.ingredientsSection}>
                    <View style={styles.chip}>
                        <Text style={styles.chipText}>COMPOSIÇÃO</Text>
                    </View>

                    {ingredients.length > 1 ? (
                        ingredients.map((item, index) => (
                            <View key={index} style={styles.ingredientItem}>
                                <View style={styles.ingredientBullet} />
                                <Text style={styles.ingredientText}>{item}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.fullDescription}>{product.description}</Text>
                    )}
                </View>

                <View style={styles.actions}>
                    <Button
                        title="PEDE JÁ"
                        onPress={handlePedeJa}
                        size="large"
                    />
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={handleAddToCart}
                    >
                        <Text style={styles.secondaryButtonText}>
                            Adicionar ao carrinho e continuar
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
