import AuthHeader from "@/components/headers/AuthHeader";
import { colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <AuthHeader />
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <View style={styles.avatarCircle}>
            <Feather name="user" size={18} color={colors.surface} />
          </View>
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>Your account</Text>
            <Text style={styles.cardSubtitle}>Manage your personal info</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "flex-start",
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: 16,
  },
  card: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accentDark,
  },
  cardTextWrap: {
    gap: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
