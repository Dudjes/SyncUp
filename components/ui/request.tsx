import { colors } from "@/constants/colors";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type RequestType = "friend" | "group" | "groupInvite";

type RequestCardProps = {
  _id: string;
  requestType: RequestType;
  senderName: string;
  senderImage?: string;
  message?: string;
  createdAt: Date;
  onAccept: () => void;
  onReject: () => void;
  isLoading?: boolean;
  width?: string | number;
};

export default function RequestCard({
  _id,
  requestType,
  senderName,
  senderImage,
  message,
  createdAt,
  onAccept,
  onReject,
  isLoading = false,
  width = "80%",
}: RequestCardProps) {
  const getRequestLabel = () => {
    switch (requestType) {
      case "friend":
        return `${senderName} sent you a friend request`;
      case "group":
        return `${senderName} invited you to a group`;
      case "groupInvite":
        return `${senderName} invited you to join`;
      default:
        return "New request";
    }
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <View style={[styles.container, { width } as any]}>
      <View style={styles.content}>
        {senderImage && (
          <Image source={{ uri: senderImage }} style={styles.avatar} />
        )}
        <View style={styles.textContainer}>
          <Text style={styles.label}>{getRequestLabel()}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
          <Text style={styles.timestamp}>{formatTime(createdAt)}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={onAccept}
          disabled={isLoading}
        >
          <Text style={styles.acceptText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={onReject}
          disabled={isLoading}
        >
          <Text style={styles.rejectText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  content: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
    width: "100%",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: colors.background,
  },
  textContainer: {
    flex: 1,
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    width: "100%",
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
    marginRight: 16,
  },
  acceptButton: {
    backgroundColor: colors.success,
  },
  acceptText: {
    color: colors.textLight,
    fontWeight: "600",
    fontSize: 13,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  rejectText: {
    color: colors.textLight,
    fontWeight: "600",
    fontSize: 13,
  },
});
