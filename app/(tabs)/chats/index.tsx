import ChatHeader from "@/components/headers/ChatHeader";
import ChatCard from "@/components/ui/chatCard";
import { colors } from "@/constants/colors";
import { authenticatedFetch } from "@/services/api";
import Feather from "@expo/vector-icons/Feather";
import { useRouter, Stack, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface Chat {
  _id: string;
  chatName: string;
  chatImage?: string;
  chatType: "private" | "group";
  members: Array<{ _id: string; userName?: string; fullName?: string; image?: string }>;
  lastMessage?: { text: string };
  created_at: string;
}

export default function ChatsScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  //run when first opened
  useEffect(() => {
    loadChats();
  }, []);

  //run everytime screen is openened
  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, []),
  );

  const loadChats = async () => {
    try {
      setLoading(true);
      // Get current user profile
      const userResponse = await authenticatedFetch("/users/me");
      setCurrentUserId(userResponse._id);
      
      const response = await authenticatedFetch("/chats");
      setChats(response.chats);
    } catch (err) {
      console.error("Load chats error:", err);
      setError(err instanceof Error ? err.message : "Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (chat: Chat): string => {
    if (chat.chatType === "private" && chat.members.length === 2) {
      // For private chats, show the other person's name
      const otherMember = chat.members.find(
        (member) => member._id !== currentUserId
      );
      return (
        otherMember?.userName ||
        otherMember?.fullName ||
        "Chat"
      );
    }
    return chat.chatName;
  };

  const getDisplayImage = (chat: Chat): string | undefined => {
    if (chat.chatType === "private" && chat.members.length === 2) {
      const otherMember = chat.members.find(
        (member) => member._id !== currentUserId
      );
      return otherMember?.image;
    }
    return chat.chatImage;
  };

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery.trim()) return true;
    
    const displayName = getDisplayName(chat).toLowerCase();
    const searchTerm = searchQuery.toLowerCase();
    
    return displayName.includes(searchTerm);
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ header: () => <ChatHeader /> }} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ header: () => <ChatHeader /> }} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ header: () => <ChatHeader /> }} />

      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search chats..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {chats.length === 0 ? (
        <Text style={styles.emptyText}>
          No chats yet. Create one to get started!
        </Text>
      ) : filteredChats.length === 0 ? (
        <Text style={styles.emptyText}>
          No chats match your search
        </Text>
      ) : (
        filteredChats.map((chat) => (
          <ChatCard
            key={chat._id}
            chatId={chat._id}
            chatImage={getDisplayImage(chat)}
            chatName={getDisplayName(chat)}
            lastMessage={chat.lastMessage?.text || "No messages yet"}
            unreadMessages={0}
            lastMessageTime={new Date(chat.created_at).toLocaleDateString()}
            onPress={() => router.push(`/(tabs)/chats/${chat._id}`)}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  searchWrapper: {
    width: "100%",
    backgroundColor: "#fff",
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 15,
  },
  searchContainer: {
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: "#ff4444",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 20,
    textAlign: "center",
  },
});
