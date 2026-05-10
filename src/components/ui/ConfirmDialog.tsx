import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { Button } from "./Button";
import { colors, spacing } from "../../theme";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  icon?: string;
  iconColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  icon = "alert-circle-outline",
  iconColor = colors.error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={icon as any}
              size={32}
              color={iconColor}
            />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttons}>
            <View style={styles.cancelButton}>
              <Button
                title={cancelText}
                onPress={onCancel}
                variant="ghost"
              />
            </View>
            <View style={styles.confirmButton}>
              <Button
                title={confirmText}
                onPress={onConfirm}
                variant="primary"
              />
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    padding: spacing.lg,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: colors.error + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.onSurface,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: colors.neutral[500],
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  buttons: {
    flexDirection: "row",
    gap: spacing.sm,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
    borderWidth: 0,
  },
});
