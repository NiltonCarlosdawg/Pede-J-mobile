import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
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

import { Header } from "../../src/components/ui/Header";
import { orderApi } from "../../src/services/api";
import { spacing } from "../../src/theme";
import { useTheme } from "../../src/hooks/useTheme";
import type { ChatMessage } from "../../src/types";

const QUICK_MESSAGES = [
  "Estou chegando!",
  "Pode aguardar 5 min?",
  "Estou na portaria",
  "Obrigado!",
  "Estou a caminho",
];

function formatChatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return "Agora";
  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function DeliveryChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId?: string }>();
  const orderId = params.orderId ?? "";
  const { colors } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [showQuickMessages, setShowQuickMessages] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!orderId) return;
    try {
      const { data } = await orderApi.getMessages(orderId, { limit: 100 });
      const list = (data.data ?? data) as ChatMessage[];
      setMessages(list);
      const last = list[list.length - 1];
      const lastReadAt = last?.createdAt ?? last?.timestamp;
      await orderApi.markMessagesRead(orderId, lastReadAt).catch(() => undefined);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!orderId) return;
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [orderId, fetchMessages]);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, [messages.length]);

  async function handleSend(text: string = inputText.trim()) {
    if (!text || !orderId) return;

    setSending(true);
    try {
      await orderApi.sendMessage(orderId, text, "texto");
      setInputText("");
      setShowQuickMessages(false);
      await fetchMessages();
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  }

  function renderMessage({ item }: { item: ChatMessage }) {
    const isDelivery = item.senderRole === "entregador";
    const isSystem = item.tipo === "sistema" || item.tipo === "system";
    const timeValue = item.createdAt ?? item.timestamp ?? "";

    return (
      <View
        style={[
          styles.messageBubble,
          isDelivery && styles.deliveryBubble,
          isSystem && styles.systemBubble,
          !isDelivery && !isSystem && styles.clientBubble,
        ]}
      >
        {!isDelivery && !isSystem && (
          <Text style={styles.senderName}>Cliente</Text>
        )}
        <Text
          style={[
            styles.messageText,
            isDelivery && styles.deliveryText,
            isSystem && styles.systemText,
            !isDelivery && !isSystem && styles.clientText,
          ]}
        >
          {item.texto}
        </Text>
        {!isSystem && timeValue ? (
          <Text
            style={[
              styles.messageTime,
              isDelivery && styles.deliveryTime,
              !isDelivery && !isSystem && styles.clientTime,
            ]}
          >
            {formatChatTime(timeValue)}
          </Text>
        ) : null}
      </View>
    );
  }

  const orderNumber = orderId ? orderId.slice(-4) : "0000";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title={`Chat - Pedido #${orderNumber}`}
        showBack
        showNotifications={false}
        showCart={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.content}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {loading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={styles.emptyText}>Carregando mensagens...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => item.id ?? String(index)}
            contentContainerStyle={styles.messagesList}
            initialNumToRender={20}
            maxToRenderPerBatch={15}
            windowSize={7}
            removeClippedSubviews={true}
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
                  Inicie uma conversa com o cliente
                </Text>
              </View>
            }
          />
        )}

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
                (!inputText.trim() || sending) && styles.sendButtonDisabled,
              ]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <MaterialCommunityIcons
                  name="send"
                  size={20}
                  color={colors.white}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 10,
  },
  deliveryBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#E84C3D",
    borderBottomRightRadius: 4,
  },
  clientBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#F2F2F2",
    borderBottomLeftRadius: 4,
  },
  systemBubble: {
    alignSelf: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    maxWidth: "90%",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  deliveryText: {
    color: "#ffffff",
  },
  clientText: {
    color: "#212121",
  },
  systemText: {
    color: "#757575",
    fontSize: 13,
    textAlign: "center",
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  deliveryTime: {
    color: "rgba(255,255,255,0.7)",
  },
  clientTime: {
    color: "#9E9E9E",
  },
  senderName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9E9E9E",
    marginBottom: 4,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  quickMessagesRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  quickMessageChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F2F2F2",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  quickMessageText: {
    fontSize: 12,
    color: "#E84C3D",
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#212121",
    maxHeight: 80,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E84C3D",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#BDBDBD",
  },
  quickToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 10,
  },
  quickToggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#E84C3D",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: "#9E9E9E",
    marginTop: 16,
  },
});
