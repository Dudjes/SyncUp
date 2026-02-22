import ChatHeader from "@/components/headers/ChatHeader";
import MainButton from "@/components/ui/mainButton";
import MainInput from "@/components/ui/mainInput";
import MessageCard from "@/components/ui/messageCard";
import { colors } from "@/constants/colors";
import { authenticatedFetch } from "@/services/api";
import { getCurrentUser } from "@/services/authService";
import {
  AntDesign,
  Entypo,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { Link, router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
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

interface Chat {
  _id: string;
  chatName: string;
  description?: string;
  chatImage?: string;
  members: Member[];
  owner?: string;
  ownerId?: string;
  created_at: Date;
  groupCode?: number;
}

interface Member {
  _id: string;
  fullName: string;
  userName?: string;
  image?: string;
  role: string;
  lastSeen: Date;
}

export default function ChatDetailScreen() {
  const { chatId } = useLocalSearchParams<{ chatId?: string }>();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [chatName, setChatName] = useState("");
  const [chatDescription, setChatDescription] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const TAB_SWITCHER = [
    {
      key: "info",
      label: "Info",
      icon: <AntDesign name="info-circle" size={16} color={colors.accent} />,
    },
    {
      key: "settings",
      label: "Settings",
      icon: <Feather name="settings" size={16} color="#000" />,
    },
  ];

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
    return (
      (parts[0][0]?.toUpperCase() ?? "") +
      (parts[parts.length - 1][0]?.toUpperCase() ?? "")
    );
  };

  useEffect(() => {
    loadChat();
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

  //Initialize chat fields
  useEffect(() => {
    if (chat) {
      setChatName(chat.chatName);
      setChatDescription(chat.description ?? "");
    }
  }, [chat]);

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
  };

  const loadChat = async () => {
    if (!chatId) return;

    try {
      const response = await authenticatedFetch(`/chats/${chatId}`);
      setChat(response.chat);
    } catch (err) {
      console.error("Load chat error:", err);
    }
  };

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

  const showAlert = () =>
    Alert.alert(
      "Chat deletion",
      `Are you sure you want to delete ${chat?.chatName}`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Account deletion canceled"),
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await authenticatedFetch(`/chats/${chatId}`, {
                method: "DELETE",
                body: JSON.stringify({ chatId: chat?._id }),
              });
              router.dismissAll();
              router.push("/chats");
            } catch (error) {
              console.error("Delete chat error:", error);
              Alert.alert("Error", "Failed to delete chat");
            }
          },
          style: "destructive",
        },
      ],
    );

  const showLeaveAlert = () =>
    Alert.alert(
      "Leave chat",
      `Are you sure you want to leave ${chat?.chatName}?`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Leave canceled"),
          style: "cancel",
        },
        {
          text: "Leave",
          onPress: async () => {
            try {
              await authenticatedFetch(`/chats/${chatId}/members`, {
                method: "DELETE",
                body: JSON.stringify({ userId: currentUserId }),
              });
              router.dismissAll();
              router.push("/chats");
            } catch (error) {
              console.error("Leave chat error:", error);
              Alert.alert("Error", "Failed to leave chat");
            }
          },
          style: "destructive",
        },
      ],
    );

  const ownerId = normalizeId(chat?.ownerId) || normalizeId(chat?.owner);
  const isOwner = !!currentUserId && ownerId === currentUserId;
  const memberInitials = "";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      enabled
    >
      <Stack.Screen
        options={{
          headerShown: true,
          title: chat?.chatName || "Chat",
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 18,
          },
        }}
      />
      {/* Second header about the chat */}
      {chat && (
        <View style={styles.chatInfoHeader}>
          <Link href={"/(tabs)/chats"} style={styles.backButton}>
            <AntDesign name="arrow-left" size={20} color="black" />
          </Link>
          <View style={styles.chatImageContainer}>
            {chat.chatImage && chat.chatImage.includes?.("://") ? (
              <Image
                source={{ uri: chat.chatImage }}
                style={styles.chatImage}
              />
            ) : (
              <Text style={styles.chatImageText}>
                {chat.chatImage || getInitials(chat.chatName)}
              </Text>
            )}
          </View>
          <View style={styles.chatTextContainer}>
            <Text style={styles.chatNameHeader}>{chat.chatName}</Text>
            <Text style={styles.membersText}>
              {chat.members?.length || 0}{" "}
              {(chat.members?.length || 0) > 1 ? "members" : "member"}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <AntDesign name="info-circle" size={24} color={colors.accent} />
          </TouchableOpacity>
        </View>
      )}

      {/* Messages and body*/}
      <ScrollView
        style={styles.messagesContainer}
        ref={scrollViewRef}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.messagesContent}
      >
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

      {/* Message input bar */}
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

      {/* Modal */}
      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderInfo}>
                <FontAwesome name="group" size={24} color="white" />
                <View>
                  <Text style={styles.modalHeaderTitle}>Chat Settings</Text>
                  <Text style={styles.modalHeaderSubtitle}>
                    {chat?.chatName}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{ margin: 25 }}
              >
                <AntDesign name="close" size={35} color="white" />
              </TouchableOpacity>
            </View>
            {/* info */}
            <View style={styles.tabsContainer}>
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
                      <Text
                        style={[
                          styles.tabLabel,
                          isActive && styles.activeLabel,
                        ]}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.content}>
                {activeTab === "info" ? (
                  <ScrollView
                    style={styles.settingsScroll}
                    contentContainerStyle={styles.settingsContent}
                  >
                    <View style={{ width: "100%" }}>
                      <View
                        style={{
                          flexDirection: "row",
                          marginLeft: 10,
                          marginBottom: 20,
                        }}
                      >
                        <AntDesign
                          name="info-circle"
                          size={24}
                          color={colors.accent}
                        />
                        <Text style={{ marginLeft: 10 }}>Description</Text>
                      </View>
                      <View style={{ marginLeft: 20 }}>
                        <Text style={styles.input}>
                          {chat?.description || "No description"}
                        </Text>
                      </View>
                      <Text style={{ marginTop: 20, marginLeft: 10 }}>
                        <FontAwesome
                          name="calendar-o"
                          size={20}
                          color="black"
                        />{" "}
                        Created on{" "}
                        {chat?.created_at
                          ? new Date(chat.created_at).toLocaleDateString()
                          : "N/A"}
                      </Text>
                      <View style={{ marginTop: 20, marginLeft: 10 }}>
                        <Text style={{ fontWeight: 600, fontSize: 20 }}>
                          <Feather name="users" size={20} color="black" />{" "}
                          Members:
                        </Text>
                        {chat?.members.map((member) => (
                          <View
                            key={member._id}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginBottom: 12,
                            }}
                          >
                            {member.image && member.image.includes?.("://") ? (
                              <Image
                                source={{ uri: member.image }}
                                style={styles.avatarImage}
                              />
                            ) : (
                              <View style={styles.avatarInitials}>
                                <Text style={styles.avatarText}>
                                  {getInitials(member.fullName)}
                                </Text>
                              </View>
                            )}
                            <View style={{ marginLeft: 12, flex: 1 }}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <Text style={{ fontWeight: "600" }}>
                                  {member.fullName}
                                </Text>
                                {member._id === ownerId && (
                                  <View
                                    style={{
                                      backgroundColor: "black",
                                      borderRadius: 20,
                                      flexDirection: "row",
                                      padding: 5,
                                    }}
                                  >
                                    <MaterialCommunityIcons
                                      name="crown"
                                      size={12}
                                      color="white"
                                    />
                                    <Text
                                      style={{
                                        color: "white",
                                        fontSize: 10,
                                        marginLeft: 4,
                                      }}
                                    >
                                      Owner
                                    </Text>
                                  </View>
                                )}
                              </View>
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: colors.textSecondary,
                                }}
                              >
                                @{member.userName}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  </ScrollView>
                ) : (
                  <ScrollView
                    style={styles.settingsScroll}
                    contentContainerStyle={styles.settingsContent}
                    keyboardShouldPersistTaps="handled"
                  >
                    <Text style={{ fontSize: 20, margin: 5 }}>
                      Chat Configuration
                    </Text>
                    <View style={{ width: "100%", alignItems: "center" }}>
                      <MainInput
                        label="Chat name"
                        value={chatName ?? ""}
                        icon={<Entypo name="chat" size={24} color="black" />}
                        onChangeText={isOwner ? setChatName : undefined}
                        editable={isOwner}
                      ></MainInput>
                      <MainInput
                        label="Chat description"
                        value={chatDescription ?? ""}
                        icon={<Entypo name="chat" size={24} color="black" />}
                        onChangeText={isOwner ? setChatDescription : undefined}
                        editable={isOwner}
                        height={100}
                      ></MainInput>
                    </View>
                    {!isOwner && (
                      <View style={styles.leaveSection}>
                        <View style={styles.leaveHeader}>
                          <Feather
                            name="log-out"
                            size={20}
                            color={colors.error}
                          />
                          <Text style={styles.leaveSectionTitle}>
                            Danger Zone
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={showLeaveAlert}
                          style={styles.leaveButton}
                        >
                          <MaterialCommunityIcons
                            name="door-open"
                            size={18}
                            color={colors.error}
                            style={{ marginRight: 8 }}
                          />
                          <Text style={styles.leaveButtonText}>Leave chat</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {isOwner && (
                      <View>
                        <View style={styles.groupCodeContainer}>
                          <Text
                            style={{
                              fontSize: 18,
                              fontWeight: "600",
                              marginBottom: 8,
                            }}
                          >
                            <MaterialCommunityIcons
                              name="key"
                              size={18}
                              color={colors.accent}
                            />{" "}
                            Group Code
                          </Text>
                          <Text style={styles.groupCodeText}>
                            {chat?.groupCode || "N/A"}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 20, margin: 5 }}>Actions</Text>
                        <View style={{ marginLeft: 0 }}>
                          <MainButton
                            label="Update chat"
                            width={240}
                            onPress={async () => {
                              try {
                                console.log("Updating chat:", {
                                  chatId,
                                  chatName,
                                  chatDescription,
                                });
                                await authenticatedFetch(`/chats/${chatId}`, {
                                  method: "PATCH",
                                  body: JSON.stringify({
                                    chatName: chatName,
                                    description: chatDescription,
                                  }),
                                });
                                Alert.alert(
                                  "Success",
                                  "Chat updated successfully",
                                );
                                setModalVisible(false);
                                loadChat();
                              } catch (err: any) {
                                console.error("Update chat error:", err);
                                Alert.alert(
                                  "Error",
                                  err.message || "Failed to update chat",
                                );
                              }
                            }}
                          ></MainButton>
                          <TouchableOpacity
                            onPress={showAlert}
                            style={styles.deleteButton}
                          >
                            <Text style={styles.deleteButtonText}>
                              Delete chat
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </ScrollView>
                )}
              </View>
            </View>
            {/* Members */}
            <View>
              <Text></Text>
            </View>
          </View>
        </View>
      </Modal>
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
  messagesContent: {
    flexGrow: 1,
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
    borderBlockColor: colors.accentLight,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: colors.textPrimary,
    minWidth: 250,
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
  chatInfoHeader: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  chatImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  chatTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  chatImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  chatImageText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  chatNameHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  membersText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    height: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    justifyContent: "flex-start",
    alignItems: "center",
    overflow: "hidden",
  },
  modalHeader: {
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: colors.primary,
    height: "12%",
    alignContent: "center",
    justifyContent: "space-between",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    flexDirection: "row",
  },
  modalHeaderInfo: {
    margin: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  modalHeaderSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
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
  tabsContainer: {
    width: "100%",
    flex: 1,
    flexDirection: "column",
  },
  content: {
    width: "100%",
    flex: 1,
    overflow: "hidden",
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
    // Shadow for the "floating pill" effect
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
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarInitials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  deleteButton: {
    width: 240,
    height: 50,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginLeft: 5,
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: "600",
  },
  groupCodeContainer: {
    backgroundColor: colors.background,
    width: 180,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  groupCodeText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.primary,
    letterSpacing: 2,
  },
  settingsScroll: {
    width: "100%",
    flex: 1,
  },
  settingsContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  leaveSection: {
    width: "90%",
    marginTop: 24,
  },
  leaveHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  leaveSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.error,
  },
  leaveButton: {
    width: "100%",
    height: 50,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  leaveButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: "600",
  },
});

type IdLike = string | { _id?: string } | undefined;

const normalizeId = (v: IdLike) => (typeof v === "string" ? v : (v?._id ?? ""));
