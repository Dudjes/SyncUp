import ChatHeader from "@/components/headers/ChatHeader";
import ChatCard from "@/components/ui/chatCard";
import { colors } from "@/constants/colors";
import Feather from "@expo/vector-icons/Feather";
import { Stack } from "expo-router";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function ChatsScreen() {
  const chats = [
    {
      chatName: "Design Team",
      lastMessage: "Let's review the wireframes tomorrow",
      unreadMessages: 3,
      lastMessageTime: "2m ago",
    },
    {
      chatName: "Project Alpha",
      lastMessage: "Pushed the latest build to staging",
      unreadMessages: 0,
      lastMessageTime: "10m ago",
    },
    {
      chatName: "Sarah Wilson",
      lastMessage: "Are we still on for 5?",
      unreadMessages: 1,
      lastMessageTime: "1h ago",
    },
    {
      chatName: "Marketing Squad",
      lastMessage: "Draft copy is ready for review",
      unreadMessages: 5,
      lastMessageTime: "Yesterday",
    },
  ];

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
          />
        </View>
      </View>

      {chats.map((chat, index) => (
        <ChatCard key={index} {...chat} />
      ))}
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
});
