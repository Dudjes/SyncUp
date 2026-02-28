import AuthHeader from "@/components/headers/AuthHeader";
import MainButton from "@/components/ui/mainButton";
import MainInput from "@/components/ui/mainInput";
import { colors } from "@/constants/colors";
import { authenticatedFetch } from "@/services/api";
import { getCurrentUser } from "@/services/authService";
import { tokenService } from "@/services/tokenService";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ProfileScreen() {
  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    email: "",
  });
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const user = await getCurrentUser();
    if (user) {
      setUserId(user.userId);
      setFormData({
        fullName: user.fullName || "",
        userName: user.userName || "",
        email: user.email || "",
      });
    }
  };

  const handleUpdate = async () => {
    try {
      if (!userId) {
        throw new Error("User not loaded");
      }

      const data = await authenticatedFetch(`/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({
          fullName: formData.fullName,
          userName: formData.userName,
          email: formData.email,
        }),
      });

      if (data?.user) {
        await tokenService.saveUser({
          userId: data.user._id,
          fullName: data.user.fullName,
          userName: data.user.userName,
          email: data.user.email,
          image: data.user.image,
          friendcode: data.user.friendcode,
          role: data.user.role,
        });
      }

      console.log("User profile updated successfully");
      Alert.alert("Success", "Password updated successfully");
      router.replace("/settings");
    } catch (error) {
      console.error("Failed to update user profile:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <AuthHeader />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Update Profile</Text>

        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Feather name="user" size={32} color={colors.surface} />
          </View>
          <Text style={styles.accentText}>Manage your account</Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputWrapper}>
            <MainInput
              label="Full Name"
              icon={<Feather name="user" size={20} color={colors.accent} />}
              example="Enter your full name"
              value={formData.fullName}
              onChangeText={(text) =>
                setFormData({ ...formData, fullName: text })
              }
              width={320}
            />
          </View>

          <View style={styles.inputWrapper}>
            <MainInput
              label="Username"
              icon={<Feather name="at-sign" size={20} color={colors.accent} />}
              example="Choose a username"
              value={formData.userName}
              onChangeText={(text) =>
                setFormData({ ...formData, userName: text })
              }
              width={320}
            />
          </View>

          <View style={styles.inputWrapper}>
            <MainInput
              label="Email"
              icon={
                <MaterialCommunityIcons
                  name="email"
                  size={20}
                  color={colors.accent}
                />
              }
              example="your.email@example.com"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              width={320}
            />
          </View>

          <View style={styles.buttonContainer}>
            <MainButton
              label="Save Changes"
              bgcolor={colors.accent}
              txtColor="white"
              borderColor={colors.accentDark}
              onPress={handleUpdate}
              width={320}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    width: "100%",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexGrow: 1,
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 24,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
    marginBottom: 16,
  },
  accentText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.accent,
  },
  formSection: {
    gap: 16,
    width: "100%",
    alignItems: "center",
  },
  inputWrapper: {
    width: "100%",
    alignItems: "center",
  },
  buttonContainer: {
    marginTop: 24,
    width: "100%",
    alignItems: "center",
  },
});
