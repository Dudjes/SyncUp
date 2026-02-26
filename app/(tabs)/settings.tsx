import AuthHeader from "@/components/headers/AuthHeader";
import { colors } from "@/constants/colors";
import { getCurrentUser, logoutUser } from "@/services/authService";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

interface User {
  role: "owner" | "member" | string;
  [key: string]: any;
}

export default function SettingsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const user = await getCurrentUser();
    console.log("current user:", user);
    if (user) setCurrentUser(user);
  };

  const handleSignOut = async () => {
    await logoutUser(); 
    router.dismissAll();
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <AuthHeader />
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
});
