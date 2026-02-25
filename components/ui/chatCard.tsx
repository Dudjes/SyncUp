import { colors } from "@/constants/colors";
import { authenticatedFetch } from "@/services/api";
import React, { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type ChatCardProps = {
  chatId: string;
  chatImage?: string;
  chatName: string;
  lastMessage: string;
  unreadMessages?: number;
  lastMessageTime?: string;
  onPress?: () => void;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
  return (
    (parts[0][0]?.toUpperCase() ?? "") +
    (parts[parts.length - 1][0]?.toUpperCase() ?? "")
  );
};

const getUnreadMessages = async (chatId: string) => {
  try {
    const response = await authenticatedFetch(`/chats/unread/${chatId}`);
    return response.data.unreadCount;
  } catch (error) {
    console.error("Error fetching unread messages:", error);
    return 0;
  }
};

export default function ChatCard({
  chatId,
  chatImage,
  chatName = "Design Team",
  lastMessage = "Let's review the wireframes tomorrow",
  unreadMessages: initialUnreadMessages = 0,
  lastMessageTime = "2m ago",
  onPress,
}: ChatCardProps) {
  const [unreadMessages, setUnreadMessages] = useState(initialUnreadMessages);
  const initials = getInitials(chatName);
  chatImage = chatImage || initials;

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const count = await getUnreadMessages(chatId);
      setUnreadMessages(count);
    };

    fetchUnreadCount();
  }, [chatId]);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          {chatImage.includes?.("://") ? (
            <Image source={{ uri: chatImage }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{chatImage}</Text>
          )}
        </View>
        <View style={styles.statusDot} />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.chatName} numberOfLines={1}>
            {chatName}
          </Text>
          <Text style={styles.time}>{lastMessageTime}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {lastMessage}
        </Text>
      </View>

      {unreadMessages > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadMessages}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 10,
  },
  avatarWrap: {
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#fff",
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chatName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  lastMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
