import { colors } from "@/constants/colors";
import { authenticatedFetch } from "@/services/api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface User {
  _id: string;
  fullName: string;
  userName: string;
  email: string;
  role: string;
  lastSeen: Date;
  image: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [totalUsers, setTotalUsers] = useState(0);
  const [messagesTotal, setMessagesTotal] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(
    null,
  );
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    email: "",
    userName: "",
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersData, messagesData, allUsersData] = await Promise.all([
        authenticatedFetch("/users/total"),
        authenticatedFetch("/messages/today"),
        authenticatedFetch("/users/info/all"),
      ]);

      setTotalUsers(usersData.total);
      setMessagesTotal(messagesData.total);
      setUsers(allUsersData.users || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    searchQuery
      ? user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.userName.toLowerCase().includes(searchQuery.toLowerCase())
      : true,
  );

  const handleDeleteUser = async (userId: string) => {
    Alert.alert(
      "Delete User",
      "Are you sure you want to delete this user? This action cannot be undone.",
      [
        {
          text: "Cancel",
          onPress: () => setOpenDropdown(null),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await authenticatedFetch(`/users/${userId}`, {
                method: "DELETE",
              });
              setUsers(users.filter((user) => user._id !== userId));
              setOpenDropdown(null);
              Alert.alert("Success", "User deleted successfully");
            } catch (error) {
              console.error("Failed to delete user:", error);
              Alert.alert("Error", "Failed to delete user");
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  const handleEditUser = (userId: string) => {
    const user = users.find((u) => u._id === userId);
    if (user) {
      setSelectedUserForEdit(user);
      setEditFormData({
        fullName: user.fullName,
        email: user.email,
        userName: user.userName,
      });
      setEditModalOpen(true);
      setOpenDropdown(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedUserForEdit) return;

    try {
      await authenticatedFetch(`/users/${selectedUserForEdit._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      setUsers(
        users.map((user) =>
          user._id === selectedUserForEdit._id
            ? { ...user, ...editFormData }
            : user,
        ),
      );

      setEditModalOpen(false);
      setSelectedUserForEdit(null);
      Alert.alert("Success", "User updated successfully");
    } catch (error) {
      console.error("Failed to update user:", error);
      Alert.alert("Error", "Failed to update user");
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f9fafb",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "#1e293b",
          paddingTop: 50,
          paddingBottom: 20,
          paddingHorizontal: 20,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Ionicons name="shield-checkmark" size={28} color="white" />
          <Text style={{ color: "white", fontSize: 20, fontWeight: "600" }}>
            Admin Dashboard
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
      >
        {/* Stats Cards */}
        <View style={{ gap: 16, marginBottom: 24 }}>
          {/* Total Users Card */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: "#f1f5f9",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="people" size={24} color="#1e293b" />
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 28,
                      fontWeight: "700",
                      color: "#1e293b",
                    }}
                  >
                    {totalUsers.toLocaleString()}
                  </Text>
                  <Text
                    style={{ fontSize: 14, color: "#64748b", marginTop: 2 }}
                  >
                    Total Users
                  </Text>
                </View>
              </View>
              <Ionicons name="trending-up" size={20} color="#22c55e" />
            </View>
          </View>

          {/* Messages Today Card */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: "#f1f5f9",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="message-text"
                    size={24}
                    color="#1e293b"
                  />
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 28,
                      fontWeight: "700",
                      color: "#1e293b",
                    }}
                  >
                    {messagesTotal.toLocaleString()}
                  </Text>
                  <Text
                    style={{ fontSize: 14, color: "#64748b", marginTop: 2 }}
                  >
                    Messages Today
                  </Text>
                </View>
              </View>
              <Ionicons name="trending-up" size={20} color="#22c55e" />
            </View>
          </View>
        </View>

        {/* User Management Section */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 20,
            overflow: "visible",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#1e293b",
              marginBottom: 16,
            }}
          >
            User Management
          </Text>

          {/* Search Bar */}
          <View
            style={{
              backgroundColor: "#f1f5f9",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="search" size={20} color="#64748b" />
            <TextInput
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ flex: 1, fontSize: 14, color: "#1e293b" }}
              placeholderTextColor="#94a3b8"
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator
            style={{ overflow: "visible" }}
          >
            <View style={{ minWidth: 700, overflow: "visible" }}>
              {/* Table Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  height: 44,
                  paddingBottom: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#e2e8f0",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    width: 320,
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#64748b",
                    textTransform: "uppercase",
                    textAlign: "left",
                  }}
                >
                  User
                </Text>
                <Text
                  style={{
                    width: 120,
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#64748b",
                    textTransform: "uppercase",
                    textAlign: "center",
                  }}
                >
                  Role
                </Text>
                <Text
                  style={{
                    width: 160,
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#64748b",
                    textTransform: "uppercase",
                    textAlign: "center",
                  }}
                >
                  Last Seen
                </Text>
                <Text
                  style={{
                    width: 100,
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#64748b",
                    textTransform: "uppercase",
                    textAlign: "center",
                  }}
                >
                  Actions
                </Text>
              </View>

              {/* User List */}
              {filteredUsers.map((user, index) => (
                <View
                  key={user._id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    minHeight: 64,
                    paddingVertical: 8,
                    borderBottomWidth: index < filteredUsers.length - 1 ? 1 : 0,
                    borderBottomColor: "#f1f5f9",
                  }}
                >
                  {/* User Info */}
                  <View
                    style={{
                      width: 320,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: 10,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: "#334155",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 16,
                          fontWeight: "600",
                        }}
                      >
                        {user.fullName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "500",
                          color: "#1e293b",
                        }}
                        numberOfLines={1}
                      >
                        {user.fullName}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: "#64748b" }}
                        numberOfLines={1}
                      >
                        {user.email}
                      </Text>
                    </View>
                  </View>

                  {/* Role Badge */}
                  <View
                    style={{
                      width: 120,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor:
                          user.role === "admin" ? "#1e293b" : "#f1f5f9",
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        borderRadius: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "500",
                          color: user.role === "admin" ? "white" : "#64748b",
                        }}
                      >
                        {user.role}
                      </Text>
                    </View>
                  </View>

                  {/* Last Seen */}
                  <View
                    style={{
                      width: 160,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 12, color: "#64748b" }}>
                      {new Date(user.lastSeen).toLocaleDateString()}
                    </Text>
                  </View>

                  {/* Actions */}
                  <View
                    style={{
                      width: 100,
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      zIndex: openDropdown === user._id ? 100 : 1,
                    }}
                  >
                    <TouchableOpacity
                      style={{ padding: 4 }}
                      onPress={() =>
                        setOpenDropdown(
                          openDropdown === user._id ? null : user._id,
                        )
                      }
                    >
                      <Ionicons
                        name="ellipsis-horizontal"
                        size={18}
                        color="#64748b"
                      />
                    </TouchableOpacity>

                    {/* Dropdown Menu */}
                    {openDropdown === user._id && (
                      <View
                        style={{
                          position: "absolute",
                          top: 32,
                          right: 4,
                          backgroundColor: "white",
                          borderRadius: 8,
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.15,
                          shadowRadius: 4,
                          elevation: 12,
                          minWidth: 140,
                          zIndex: 1000,
                        }}
                      >
                        <TouchableOpacity
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            borderBottomWidth: 1,
                            borderBottomColor: "#e2e8f0",
                          }}
                          onPress={() => handleEditUser(user._id)}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              color: "#1e293b",
                              fontWeight: "500",
                            }}
                          >
                            Edit User
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                          }}
                          onPress={() => handleDeleteUser(user._id)}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              color: "#ef4444",
                              fontWeight: "500",
                            }}
                          >
                            Delete User
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              ))}

              {filteredUsers.length === 0 && (
                <Text
                  style={{
                    textAlign: "center",
                    color: "#94a3b8",
                    paddingVertical: 20,
                  }}
                >
                  No users found
                </Text>
              )}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Edit User Modal */}
      <Modal
        visible={editModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 24,
              width: "100%",
              maxWidth: 400,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                marginBottom: 16,
                color: "#1e293b",
              }}
            >
              Edit User
            </Text>

            {/* Full Name Input */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#64748b",
                  marginBottom: 8,
                }}
              >
                Full Name
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: "#1e293b",
                }}
                value={editFormData.fullName}
                onChangeText={(text) =>
                  setEditFormData({ ...editFormData, fullName: text })
                }
                placeholder="Enter full name"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Email Input */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#64748b",
                  marginBottom: 8,
                }}
              >
                Email
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: "#1e293b",
                }}
                value={editFormData.email}
                onChangeText={(text) =>
                  setEditFormData({ ...editFormData, email: text })
                }
                placeholder="Enter email"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
              />
            </View>

            {/* Username Input */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#64748b",
                  marginBottom: 8,
                }}
              >
                Username
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: "#1e293b",
                }}
                value={editFormData.userName}
                onChangeText={(text) =>
                  setEditFormData({ ...editFormData, userName: text })
                }
                placeholder="Enter username"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: "#f1f5f9",
                  alignItems: "center",
                }}
                onPress={() => setEditModalOpen(false)}
              >
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#64748b" }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: "#1e293b",
                  alignItems: "center",
                }}
                onPress={handleSaveEdit}
              >
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "white" }}
                >
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
