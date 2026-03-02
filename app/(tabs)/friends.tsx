import MainHeader from "@/components/headers/MainHeader";
import MainButton from "@/components/ui/mainButton";
import MainInput from "@/components/ui/mainInput";
import RequestCard from "@/components/ui/request";
import { colors } from "@/constants/colors";
import { authenticatedFetch } from "@/services/api";
import { AntDesign, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { io } from "socket.io-client";

interface FriendRequest {
  _id: string;
  sentBy: {
    _id: string;
    fullName: string;
    userName: string;
    image?: string;
  };
  sentAt: string;
  state: "pending" | "accepted" | "declined";
}

interface User {
  _id: string;
  fullName: string;
  userName: string;
  image: string;
  friends: Array<any>;
  friendcode: number;
  friendRequests: Array<FriendRequest>;
}

export default function App() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("friends");
  const [User, setUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [friendCode, setFriendCode] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadCurrentUser();
    }, []),
  );

  // Socket listener for real-time friend requests
  useEffect(() => {
    if (!User?._id) return;

    const socket = io(
      process.env.EXPO_PUBLIC_API_URL || "http://192.168.2.6:4000",
    );

    socket.on("connect", () => {
      console.log("Socket connected for friend requests");
    });

    socket.on(`friend-request-${User._id}`, (data) => {
      console.log("New friend request received:", data);
      loadCurrentUser(); // Refresh user data
    });

    return () => {
      socket.disconnect();
    };
  }, [User?._id]);

  const loadCurrentUser = async () => {
    try {
      const response = await authenticatedFetch("/users/me");
      if (response) {
        setUser(response);
      }
    } catch (err) {
      console.error("Load user error:", err);
    }
  };

  const handleSendRequest = async () => {
    if (!friendCode.trim()) return;
    try {
      await authenticatedFetch("/friends/requests", {
        method: "POST",
        body: JSON.stringify({ friendCode: parseInt(friendCode) }),
      });
      setFriendCode("");
      setModalVisible(false);
      loadCurrentUser();
    } catch (err) {
      console.error("Send request error:", err);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await authenticatedFetch(`/friends/requests/${requestId}/accept`, {
        method: "POST",
      });
      loadCurrentUser();
    } catch (err) {
      console.error("Accept request error:", err);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await authenticatedFetch(`/friends/requests/${requestId}`, {
        method: "DELETE",
      });
      loadCurrentUser();
    } catch (err) {
      console.error("Reject request error:", err);
    }
  };

  const unfriendAlert = (friendId: string, friendName: string) =>
    Alert.alert(
      "Unfriend",
      `Are you sure you want to unfriend ${friendName}?`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Unfriend canceled"),
          style: "cancel",
        },
        {
          text: "Unfriend",
          onPress: async () => {
            try {
              await authenticatedFetch(`/friends/${friendId}`, {
                method: "DELETE",
              });
              loadCurrentUser();
            } catch (error) {
              console.error("Unfriend error:", error);
              Alert.alert("Error", "Failed to unfriend user");
            }
          },
          style: "destructive",
        },
      ],
    );

  const openPrivateChat = async (friendId: string) => {
    try {
      const response = await authenticatedFetch("/chats");
      const chats = response.chats;

      // Find the private chat with this friend
      const privateChat = chats.find(
        (chat: any) =>
          chat.chatType === "private" &&
          chat.members?.some((member: any) => member._id === friendId),
      );

      if (privateChat) {
        router.push(`/(tabs)/chats/${privateChat._id}`);
      } else {
        Alert.alert("Chat not found", "No private chat found with this friend");
      }
    } catch (error) {
      console.error("Open chat error:", error);
      Alert.alert("Error", "Failed to open chat");
    }
  };

  const TAB_SWITCHER = [
    {
      key: "friends",
      label: "Friends",
      icon: <FontAwesome5 name="user-friends" size={24} color="black" />,
    },
    {
      key: "Requests",
      label: "Requests",
      icon: <AntDesign name="user-add" size={24} color="black" />,
    },
  ];

  return (
    <View style={styles.container}>
      <MainHeader />
      {/* info */}
      <View style={styles.tabsContainer}>
        <View style={styles.switcher}>
          {TAB_SWITCHER.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[styles.tab, isActive && styles.activeTab]}
                onPress={() => setActiveTab(tab.key)}
              >
                {tab.icon}
                <Text style={[styles.tabLabel, isActive && styles.activeLabel]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.content}>
          {activeTab === "friends" ? (
            <ScrollView
              style={styles.contentScroll}
              contentContainerStyle={styles.scrollContent}
            >
              {User?.friends?.length ? (
                User.friends.map((friend) => (
                  <View key={friend._id} style={styles.friendCard}>
                    {friend.image && friend.image.includes?.("://") ? (
                      <Image
                        source={{ uri: friend.image }}
                        style={styles.friendImage}
                      />
                    ) : (
                      <View style={styles.friendImageInitials}>
                        <Text style={styles.friendImageText}>
                          {getInitials(friend.fullName)}
                        </Text>
                      </View>
                    )}
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{friend.fullName}</Text>
                      <Text style={styles.friendUsername}>
                        @{friend.userName}
                      </Text>
                    </View>
                    <View style={styles.actionButtons}>
                      <Pressable
                        style={styles.openChatButton}
                        onPress={() => openPrivateChat(friend._id)}
                      >
                        <Text style={styles.openChatText}>Open chat</Text>
                      </Pressable>
                      <Pressable
                        style={styles.unfriendButton}
                        onPress={() =>
                          unfriendAlert(friend._id, friend.fullName)
                        }
                      >
                        <Text style={styles.unfriendButtonText}>Unfriend</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No friends yet</Text>
              )}
            </ScrollView>
          ) : (
            <ScrollView
              style={styles.contentScroll}
              contentContainerStyle={styles.scrollContent}
            >
              {User?.friends?.length ? (
                <View>
                  <Text>Wow you have friends?</Text>
                </View>
              ) : (
                <View>
                  {User?.friendRequests?.length ? (
                    User.friendRequests.map((request) => (
                      <RequestCard
                        key={request._id}
                        _id={request._id}
                        requestType="friend"
                        senderName={request.sentBy.fullName}
                        senderImage={request.sentBy.image}
                        createdAt={new Date(request.sentAt)}
                        onAccept={() => handleAcceptRequest(request._id)}
                        onReject={() => handleRejectRequest(request._id)}
                      />
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No requests</Text>
                  )}
                </View>
              )}
            </ScrollView>
          )}
          <Pressable
            style={styles.createRequest}
            onPress={() => setModalVisible(true)}
          >
            <AntDesign name="plus" size={30} color="white" />
          </Pressable>
        </View>
      </View>
      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.modalTitle}>Add Friend</Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={{ left: 80 }}
                hitSlop={10} // increases the tap area around the button
              >
                <MaterialIcons name="exit-to-app" size={40} color="black" />
              </Pressable>
            </View>

            <View style={styles.friendCodeSection}>
              <Text style={styles.sectionLabel}>Your Friend Code</Text>
              <View style={styles.friendCodeBox}>
                <Text style={styles.friendCodeText}>
                  {User?.friendcode?.toString()}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <MainInput
              label="Friend Code"
              icon={<AntDesign name="user-add" size={24} color="black" />}
              example="E.g., 123456"
              value={friendCode}
              onChangeText={setFriendCode}
              width="100%"
            />

            <MainButton
              label="Send Request"
              bgcolor={colors.accent}
              width={200}
              onPress={handleSendRequest}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  tabsContainer: {
    flex: 1,
    width: "100%",
  },
  switcher: {
    flexDirection: "row",
    backgroundColor: colors.background,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    backgroundColor: "transparent",
  },
  activeTab: {
    backgroundColor: colors.accentLight,
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  activeLabel: {
    color: colors.primary,
  },
  content: {
    flex: 1,
    width: "100%",
    position: "relative",
  },
  contentScroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    alignItems: "center",
    justifyContent: "flex-start",
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
  text: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  greeting: {
    color: colors.textSecondary,
  },
  input: {
    color: colors.textPrimary,
  },
  createRequest: {
    position: "absolute",
    bottom: 40,
    right: 40,
    width: 70,
    height: 70,
    backgroundColor: colors.accent,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 24,
    width: "90%",
    alignItems: "center",
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  friendCodeSection: {
    width: "100%",
    alignItems: "center",
    gap: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  friendCodeBox: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  friendCodeText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.accent,
    letterSpacing: 2,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: colors.border,
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  friendImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  friendImageInitials: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  friendImageText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  friendUsername: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 4,
  },
  openChatButton: {
    backgroundColor: colors.success,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 85,
  },
  openChatText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  unfriendButton: {
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.error,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 75,
  },
  unfriendButtonText: {
    color: colors.error,
    fontSize: 10,
    fontWeight: "600",
  },
});

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
  return (
    (parts[0][0]?.toUpperCase() ?? "") +
    (parts[parts.length - 1][0]?.toUpperCase() ?? "")
  );
};
