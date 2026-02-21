import ChatHeader from "@/components/headers/ChatHeader";
import MessageCard from "@/components/ui/messageCard";
import { colors } from "@/constants/colors";
import { authenticatedFetch } from "@/services/api";
import { getCurrentUser } from "@/services/authService";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { io, Socket } from "socket.io-client";

interface Message {
  _id: string;
  text: string;
  userId: {
    _id: string;
    fullName: string;
    userName: string;
    image?: string;
  };
  chatId: string;
  created_at: string;
  readby: string[];
}

interface Chat {
  _id: string;
  chatName: string;
  description?: string;
  chatImage?: string;
  members: string[];
}

export default function ChatDetailScreen() {
  const { chatId } = useLocalSearchParams<{ chatId?: string }>();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
    return (
      (parts[0][0]?.toUpperCase() ?? "") +
      (parts[parts.length - 1][0]?.toUpperCase() ?? "")
    );
  };

  useEffect(() => {
    loadChat();
    loadMessages();
    loadCurrentUser();
    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [chatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const connectSocket = () => {
    if (!chatId) return;

    const socket = io(
      process.env.EXPO_PUBLIC_API_URL || "http://192.168.2.6:4000",
    );
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join-room", chatId);
    });

    socket.on("receive_message", (newMessage: any) => {
      console.log("Received message:", newMessage);
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  };

  const loadCurrentUser = async () => {
    const user = await getCurrentUser();
    if (user?.userId) {
      setCurrentUserId(user.userId);
    }
  };

  const loadChat = async () => {
    if (!chatId) return;

    try {
      const response = await authenticatedFetch(`/chats/${chatId}`);
      setChat(response.chat);
    } catch (err) {
      console.error("Load chat error:", err);
    }
  };

  const loadMessages = async () => {
    if (!chatId) return;

    try {
      setLoading(true);
      const response = await authenticatedFetch(`/messages/${chatId}`);
      setMessages(response.messages);
    } catch (err) {
      console.error("Load messages error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !chatId) return;

    setSending(true);
    try {
      await authenticatedFetch("/messages", {
        method: "POST",
        body: JSON.stringify({
          text: message.trim(),
          chatId: chatId,
        }),
      });
      setMessage("");
      loadMessages(); // Reload messages after sending
    } catch (err) {
      console.error("Send message error:", err);
      Alert.alert("Error", "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          title: chat?.chatName || "Chat",
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 18,
          },
        }}
      />
      {/* Second header about the chat */}
      {chat && (
        <View style={styles.chatInfoHeader}>
          <Link href={"/(tabs)/chats"} style={styles.backButton}>
            <AntDesign name="arrow-left" size={20} color="black" />
          </Link>
          <View style={styles.chatImageContainer}>
            {chat.chatImage && chat.chatImage.includes?.("://") ? (
              <Image
                source={{ uri: chat.chatImage }}
                style={styles.chatImage}
              />
            ) : (
              <Text style={styles.chatImageText}>
                {chat.chatImage || getInitials(chat.chatName)}
              </Text>
            )}
          </View>
          <View style={styles.chatTextContainer}>
            <Text style={styles.chatNameHeader}>{chat.chatName}</Text>
            <Text style={styles.membersText}>
              {chat.members?.length || 0}{" "}
              {(chat.members?.length || 0) > 1 ? "members" : "member"}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <AntDesign name="info-circle" size={24} color="black" />
          </TouchableOpacity>
        </View>
      )}

      {/* Messages and body*/}
      <ScrollView style={styles.messagesContainer} ref={scrollViewRef}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loader}
          />
        ) : messages.length === 0 ? (
          <Text style={styles.placeholder}>No messages yet</Text>
        ) : (
          messages.map((msg) => (
            <MessageCard
              key={msg._id}
              _id={msg._id}
              text={msg.text}
              userId={msg.userId._id}
              senderName={msg.userId.userName}
              senderImage={msg.userId.image}
              chatId={msg.chatId}
              created_at={new Date(msg.created_at)}
              readby={msg.readby}
              isOwnMessage={msg.userId._id === currentUserId}
            />
          ))
        )}
      </ScrollView>

      {/* Message input bar */}
      <View style={styles.inputContainer}>
        <Stack.Screen options={{ header: () => <ChatHeader /> }} />
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={colors.textSecondary}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={sending || !message.trim()}
        >
          <Feather name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderInfo}>
                <FontAwesome name="group" size={24} color="white" />
                <View>
                  <Text style={styles.modalHeaderTitle}>Chat Settings</Text>
                  <Text style={styles.modalHeaderSubtitle}>
                    {chat?.chatName}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{ margin: 25 }}
              >
                <AntDesign name="close" size={35} color="white" />
              </TouchableOpacity>
            </View>
            {/* body */}
            <View>
              <Text></Text>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  placeholder: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    color: colors.textSecondary,
  },
  loader: {
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: colors.textPrimary,
  },
  sendButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  chatInfoHeader: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  chatImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  chatTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  chatImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  chatImageText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  chatNameHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  membersText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    height: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    justifyContent: "flex-start",
    alignItems: "center",
    overflow: "hidden",
  },
  modalHeader: {
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: colors.backgroundDark,
    height: "12%",
    alignContent: "center",
    justifyContent: "space-between",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    flexDirection: "row",
  },
  modalHeaderInfo: {
    margin: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  modalHeaderSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
});
