import ChatHeader from "@/components/headers/ChatHeader";
import MessageCard from "@/components/ui/messageCard";
import { colors } from "@/constants/colors";
import { authenticatedFetch } from "@/services/api";
import { getCurrentUser } from "@/services/authService";
import Feather from "@expo/vector-icons/Feather";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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

export default function ChatDetailScreen() {
  const { chatId } = useLocalSearchParams<{ chatId?: string }>();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const socketRef = useRef<Socket | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
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
  }; // No need to reload - socket will receive the message

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
});
