import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type MessageCardProps = {
  _id: string;
  text: string;
  userId: string;
  senderName?: string;
  senderImage?: string;
  chatId: string;
  created_at: Date;
  readby: string[];
  isOwnMessage: boolean;
};

export default function MessageCard({
  text,
  senderName,
  created_at,
  isOwnMessage,
}: MessageCardProps) {
  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      {!isOwnMessage && senderName && (
        <Text style={styles.senderName}>{senderName}</Text>
      )}
      <Text
        style={[styles.text, isOwnMessage ? styles.ownText : styles.otherText]}
      >
        {text}
      </Text>
      <Text
        style={[styles.time, isOwnMessage ? styles.ownTime : styles.otherTime]}
      >
        {formatTime(created_at)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: "30%",
    maxWidth: "75%",
    marginVertical: 4,
    marginHorizontal: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  ownMessage: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E7EB",
  },
  senderName: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 2,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownText: {
    color: "#fff",
  },
  otherText: {
    color: colors.textPrimary,
  },
  time: {
    fontSize: 10,
    marginTop: 4,
  },
  ownTime: {
    color: "#fff",
    opacity: 0.7,
    textAlign: "right",
  },
  otherTime: {
    color: colors.textSecondary,
  },
});
