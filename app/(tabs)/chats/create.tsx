import AuthHeader from "@/components/headers/AuthHeader";
import MainButton from "@/components/ui/mainButton";
import MainInput from "@/components/ui/mainInput";
import { colors } from "@/constants/colors";
import { authenticatedFetch } from "@/services/api";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Stack } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function CreateChatScreen() {
  const [chatName, setChatName] = useState("");
  const [description, setDescription] = useState("");
  const [chatNameError, setChatNameError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newError = chatName.trim() ? "" : "Chat name is required";
    setChatNameError(newError);
    return !newError;
  };

  const handleCreateChat = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await authenticatedFetch('/chats', {
        method: 'POST',
        body: JSON.stringify({
          chatName: chatName,
          description: description,
          chatImage: '',
          chatType: 'group',
        })
      });
      
      Alert.alert("Success", "Chat created successfully!");
      setChatName("");
      setDescription("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create chat";
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Stack.Screen
          options={{ header: () => <AuthHeader homeRoute="/chats/" /> }}
        />
        <Text style={styles.title}>Create New Chat</Text>
        <Text style={styles.subtitle}>Start a new conversation</Text>

        <MainInput
          label="Chat Name"
          icon={
            <MaterialCommunityIcons
              name="chat-plus-outline"
              size={24}
              color="black"
            />
          }
          example="Group name or friend name"
          value={chatName}
          onChangeText={setChatName}
          error={chatNameError}
        />

        <MainInput
          label="Description (Optional)"
          icon={
            <MaterialCommunityIcons
              name="information-outline"
              size={24}
              color="black"
            />
          }
          example="What's this chat about?"
          value={description}
          onChangeText={setDescription}
        />

        <View style={styles.buttonContainer}>
          <MainButton
            label={isLoading ? "Creating..." : "Create Chat"}
            onPress={handleCreateChat}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingTop: "5%",
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    color: colors.textPrimary,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  buttonContainer: {
    marginTop: 16,
    width: "80%",
  },
});
