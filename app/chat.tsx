import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "../src/components/ui/Header";
import { useAppDispatch, useAppSelector } from "../src/store";
import {
    addSystemMessage,
    markMessagesAsRead,
    selectMessagesByOrder,
    sendMessage,
    type ChatParticipant,
} from "../src/store/chatSlice";
import { selectOrders } from "../src/store/ordersSlice";
import { spacing } from "../src/theme";
import { useTheme } from "../src/hooks/useTheme";

const QUICK_MESSAGES = [
  "Estou chegando!",
  "Pode deixar na portaria",
  "Estou indisponível no momento",
  "Obrigado!",
  "Pode esperar 5 min?",
];

function formatChatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Agora";
  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId?: string }>();
  const orderId = params.orderId ?? "order-005";
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const messages = useAppSelector((state: any) => selectMessagesByOrder(state, orderId));
  const orders = useAppSelector(selectOrders);
  const order = orders.find((o: any) => o.id === orderId);
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState("");
  const [showQuickMessages, setShowQuickMessages] = useState(false);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
    messagesList: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    messageBubble: {
      maxWidth: "80%",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 18,
      marginBottom: spacing.sm,
    },
    clientBubble: {
      alignSelf: "flex-end",
      backgroundColor: colors.primary[500],
      borderBottomRightRadius: 4,
    },
    deliveryBubble: {
      alignSelf: "flex-start",
      backgroundColor: colors.surfaceContainer,
      borderBottomLeftRadius: 4,
    },
    systemBubble: {
      alignSelf: "center",
      backgroundColor: colors.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
      borderRadius: 12,
      maxWidth: "90%",
    },
    messageText: {
      fontSize: 15,
      lineHeight: 20,
    },
    clientText: {
      color: colors.white,
    },
    deliveryText: {
      color: colors.onSurface,
    },
    systemText: {
      color: colors.neutral[600],
      fontSize: 13,
      textAlign: "center",
    },
    messageTime: {
      fontSize: 11,
      marginTop: 4,
      alignSelf: "flex-end",
    },
    clientTime: {
      color: "rgba(255,255,255,0.7)",
    },
    deliveryTime: {
      color: colors.neutral[500],
    },
    senderName: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.neutral[500],
      marginBottom: 4,
    },
    inputContainer: {
      borderTopWidth: 1,
      borderTopColor: colors.surfaceVariant,
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    quickMessagesRow: {
      flexDirection: "row",
      gap: spacing.sm,
      marginBottom: spacing.sm,
      flexWrap: "wrap",
    },
    quickMessageChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.surfaceContainer,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    quickMessageText: {
      fontSize: 12,
      color: colors.primary[500],
      fontWeight: "600",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    textInput: {
      flex: 1,
      backgroundColor: colors.surfaceContainer,
      borderRadius: 24,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: 15,
      color: colors.onSurface,
      maxHeight: 80,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary[500],
      alignItems: "center",
      justifyContent: "center",
    },
    sendButtonDisabled: {
      backgroundColor: colors.neutral[300],
    },
    quickToggle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginBottom: spacing.sm,
    },
    quickToggleText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.primary[500],
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.xl,
    },
    emptyText: {
      fontSize: 14,
      color: colors.neutral[500],
      marginTop: spacing.sm,
    },
  }), [colors]);

  useEffect(() => {
    dispatch(markMessagesAsRead(orderId));
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, [dispatch, orderId, messages.length]);

  function handleSend(text: string = inputText.trim()) {
    if (!text) return;

    dispatch(
      sendMessage({
        orderId,
        sender: "client" as ChatParticipant,
        text,
      })
    );
    setInputText("");
    setShowQuickMessages(false);

    // Simulate delivery reply after 2 seconds
    setTimeout(() => {
      const replies = [
        "Entendido!",
        "Ok, combinado!",
        "Perfeito, estou a caminho!",
        "Obrigado pela informação!",
        "Já estou chegando, aguarde um momento.",
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      dispatch(
        sendMessage({
          orderId,
          sender: "delivery" as ChatParticipant,
          text: randomReply,
        })
      );
    }, 2000);
  }

  function renderMessage({ item }: { item: typeof messages[0] }) {
    const isClient = item.sender === "client";
    const isSystem = item.sender === "system";
    const isDelivery = item.sender === "delivery";

    return (
      <View
        style={[
          styles.messageBubble,
          isClient && styles.clientBubble,
          isDelivery && styles.deliveryBubble,
          isSystem && styles.systemBubble,
        ]}
      >
        {isDelivery && (
          <Text style={styles.senderName}>Entregador</Text>
        )}
        <Text
          style={[
            styles.messageText,
            isClient && styles.clientText,
            isDelivery && styles.deliveryText,
            isSystem && styles.systemText,
          ]}
        >
          {item.text}
        </Text>
        {!isSystem && (
          <Text
            style={[
              styles.messageTime,
              isClient && styles.clientTime,
              isDelivery && styles.deliveryTime,
            ]}
          >
            {formatChatTime(item.timestamp)}
          </Text>
        )}
      </View>
    );
  }

  const orderNumber = order?.id.slice(-4) ?? "0000";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title={`Chat - Pedido #${orderNumber}`}
        showBack
        showNotifications={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.content}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="message-text-outline"
                size={48}
                color={colors.neutral[300]}
              />
              <Text style={styles.emptyText}>
                Inicie uma conversa com o entregador
              </Text>
            </View>
          }
        />

        {/* Quick Messages */}
        {showQuickMessages && (
          <View style={styles.inputContainer}>
            <View style={styles.quickMessagesRow}>
              {QUICK_MESSAGES.map((msg) => (
                <TouchableOpacity
                  key={msg}
                  style={styles.quickMessageChip}
                  onPress={() => handleSend(msg)}
                >
                  <Text style={styles.quickMessageText}>{msg}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.quickToggle}
            onPress={() => setShowQuickMessages(!showQuickMessages)}
          >
            <MaterialCommunityIcons
              name={showQuickMessages ? "chevron-down" : "message-text"}
              size={16}
              color={colors.primary[500]}
            />
            <Text style={styles.quickToggleText}>
              {showQuickMessages ? "Ocultar rápidas" : "Mensagens rápidas"}
            </Text>
          </TouchableOpacity>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Digite uma mensagem..."
              placeholderTextColor={colors.neutral[500]}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              onSubmitEditing={() => handleSend()}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={() => handleSend()}
              disabled={!inputText.trim()}
            >
              <MaterialCommunityIcons
                name="send"
                size={20}
                color={colors.white}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
