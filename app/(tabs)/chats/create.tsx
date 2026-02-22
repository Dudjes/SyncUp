import AuthHeader from "@/components/headers/AuthHeader";
import MainButton from "@/components/ui/mainButton";
import MainInput from "@/components/ui/mainInput";
import { colors } from "@/constants/colors";
import { authenticatedFetch } from "@/services/api";
import { getCurrentUser } from "@/services/authService";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateChatScreen() {
  const router = useRouter();
  const [chatName, setChatName] = useState("");
  const [description, setDescription] = useState("");
  const [chatNameError, setChatNameError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [groupCode, setGroupCode] = useState("");
  const [groupCodeError, setGroupCodeError] = useState("");
  const [isLoadingJoin, setIsLoadingJoin] = useState(false);

  const TAB_SWITCHER = [
    {
      key: "create",
      label: "Create chat",
      icon: <Ionicons name="create-outline" size={24} color="black" />,
    },
    {
      key: "join",
      label: "Join chat",
      icon: <FontAwesome name="group" size={24} color="black" />,
    },
  ];

  const validateForm = () => {
    const newError = chatName.trim() ? "" : "Chat name is required";
    setChatNameError(newError);
    return !newError;
  };

  const validateGroupCode = () => {
    const newError = groupCode.trim() ? "" : "Group code is required";
    setGroupCodeError(newError);
    return !newError;
  };

  const handleJoinChat = async () => {
    if (!validateGroupCode()) {
      return;
    }

    setIsLoadingJoin(true);
    try {
      // First, get the chatId by group code
      const groupCodeResponse = await authenticatedFetch(
        `/chats/groupcode/${groupCode}`,
      );
      const chatId = groupCodeResponse.chatId;

      // Then add the current user as a member
      const currentUser = await getCurrentUser();
      await authenticatedFetch(`/chats/${chatId}/members`, {
        method: "POST",
        body: JSON.stringify({
          userId: currentUser?.userId,
        }),
      });

      Alert.alert("Success", "Joined chat successfully!");
      router.back();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to join chat";
      Alert.alert("Error", message);
    } finally {
      setIsLoadingJoin(false);
    }
  };

  const handleCreateChat = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await authenticatedFetch("/chats", {
        method: "POST",
        body: JSON.stringify({
          chatName: chatName,
          description: description,
          chatImage: "",
          chatType: "group",
        }),
      });

      Alert.alert("Success", "Chat created successfully!");
      router.back();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create chat";
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
        <View style={styles.switcher}>
          {TAB_SWITCHER.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, isActive && styles.activeTab]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                {tab.icon}
                <Text style={[styles.tabLabel, isActive && styles.activeLabel]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.content}>
          {activeTab === "create" ? (
            <View style={styles.tabContent}>
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
            </View>
          ) : (
            <View style={styles.tabContent}>
              <Text style={styles.title}>Join a Chat</Text>
              <Text style={styles.subtitle}>Enter the group code to join</Text>

              <MainInput
                label="Group Code"
                icon={
                  <MaterialCommunityIcons name="key" size={24} color="black" />
                }
                example="Enter group code"
                value={groupCode}
                onChangeText={setGroupCode}
                error={groupCodeError}
              />

              <View style={styles.buttonContainer}>
                <MainButton
                  label={isLoadingJoin ? "Joining..." : "Join Chat"}
                  onPress={handleJoinChat}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: "5%",
    paddingBottom: 30,
  },
  switcher: {
    width: "90%",
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#888",
  },
  activeLabel: {
    color: "#000",
    fontWeight: "600",
  },
  content: {
    width: "100%",
    flex: 1,
    alignItems: "center",
  },
  tabContent: {
    width: "100%",
    alignItems: "center",
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
