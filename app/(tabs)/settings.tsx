import AuthHeader from "@/components/headers/AuthHeader";
import MainButton from "@/components/ui/mainButton";
import MainInput from "@/components/ui/mainInput";
import { colors } from "@/constants/colors";
import { authenticatedFetch } from "@/services/api";
import { getCurrentUser, logoutUser } from "@/services/authService";
import {
  AntDesign,
  Entypo,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface User {
  role: "owner" | "member" | string;
  [key: string]: any;
}

export default function SettingsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const user = await getCurrentUser();
    if (user) setCurrentUser(user);
  };

  const handleSignOut = async () => {
    await logoutUser();
    router.dismissAll();
    router.replace("/login");
  };

  const updatePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const userId = currentUser?.userId;
    try {
      const response = await authenticatedFetch(`/users/${userId}/password`, {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      Alert.alert("Success", "Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setModalVisible(false);
    } catch (err) {
      console.error("Change password error:", err);
      Alert.alert("Error", "Failed to change password");
    }
  };

  return (
    <View style={styles.container}>
      <AuthHeader homeRoute="/" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>Profile</Text>
          </View>
          <Link href="/profile" asChild>
            <Pressable
              style={({ pressed }) => [pressed && styles.cardBodyPressed]}
            >
              <View style={styles.cardBody}>
                <View style={styles.cardLeft}>
                  <View style={styles.iconCircle}>
                    <Feather name="user" size={25} color={colors.surface} />
                  </View>
                  <View style={styles.cardTextWrap}>
                    <Text style={styles.cardTitle}>Edit profile</Text>
                    <Text style={styles.cardSubtitle}>
                      Update your personal info
                    </Text>
                  </View>
                </View>
                <Feather
                  name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
            </Pressable>
          </Link>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>Security</Text>
          </View>
          <Pressable
            style={styles.cardBody}
            onPress={() => setModalVisible(true)}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconCircle}>
                <Feather name="lock" size={25} color="white" />
              </View>
              <View style={styles.cardTextWrap}>
                <Text style={styles.cardTitle}>Change password</Text>
                <Text style={styles.cardSubtitle}>Update your password</Text>
              </View>
            </View>
          </Pressable>
        </View>

        {currentUser?.role === "owner" && (
          <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>Administration</Text>
            </View>
            <Link href="/" asChild>
              <Pressable
                style={({ pressed }) => [pressed && styles.cardBodyPressed]}
              >
                <View style={styles.cardBody}>
                  <View style={styles.cardLeft}>
                    <View style={styles.iconCircle}>
                      <MaterialCommunityIcons
                        name="shield-account-variant"
                        size={35}
                        color={colors.accentDark}
                      />
                    </View>
                    <View style={styles.cardTextWrap}>
                      <Text style={styles.cardTitle}>Admin Dashboard</Text>
                      <Text style={styles.cardSubtitle}>
                        View statistics & manage users
                      </Text>
                    </View>
                  </View>
                  <Feather
                    name="chevron-right"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
              </Pressable>
            </Link>
          </View>
        )}

        <Pressable style={styles.signoutContainer} onPress={handleSignOut}>
          <Ionicons name="exit-outline" size={24} color={colors.error} />
          <Text style={styles.signoutText}>Sign out</Text>
        </Pressable>
        <Modal
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ fontSize: 20, fontWeight: 500, bottom: 20 }}>
                  Change your password
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons
                    name="exit-outline"
                    size={30}
                    color={colors.error}
                    style={{ bottom: 60, left: 15 }}
                  />
                </TouchableOpacity>
              </View>
              <MainInput
                label="Current password"
                example="password123"
                icon={<AntDesign name="lock" size={24} color={colors.accent} />}
                isPassword={true}
                onChangeText={setCurrentPassword}
                value={currentPassword}
              />
              <MainInput
                label="New password"
                example="password123"
                icon={<Entypo name="new" size={24} color={colors.accent} />}
                isPassword={true}
                onChangeText={setNewPassword}
                value={newPassword}
              />
              <MainButton
                label="Update password"
                bgcolor={colors.accentDark}
                width={250}
                onPress={updatePassword}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 30,
  },
  cardContainer: {
    width: "90%",
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 16,
  },
  cardHeader: {
    paddingHorizontal: 12,
    paddingVertical: 20,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cardHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  cardBodyPressed: {
    opacity: 0.7,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accentLight,
  },
  cardTextWrap: {
    gap: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  signoutContainer: {
    marginTop: 24,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 12,
    width: "90%",
    paddingVertical: 16,
    backgroundColor: colors.surface,
  },
  signoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    width: "80%",
    height: "60%",
    minHeight: 400,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
});
