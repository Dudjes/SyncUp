import { colors } from "@/constants/colors";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function UpdateChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId?: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update Chat</Text>
      <Text style={styles.subtitle}>ID: {chatId ?? "unknown"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
