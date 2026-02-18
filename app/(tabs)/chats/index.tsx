import ChatHeader from "@/components/headers/ChatHeader";
import { colors } from "@/constants/colors";
import { Stack } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ChatsScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{header: () => <ChatHeader/>}}
      />
      <Text style={styles.title}>Chats</Text>
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
});
