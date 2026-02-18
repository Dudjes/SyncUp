import { Link } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import MainHeader from "@/components/headers/MainHeader";
import MainButton from "@/components/ui/mainButton";
import IndexCard from "@/components/ui/indexCard";
import { colors } from "@/constants/colors";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";


export default function App() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <MainHeader />

      <View style={styles.content}>
        {/* Badge */}
        <View style={styles.badge}>
          <MaterialCommunityIcons
            name="lightning-bolt-outline"
            size={24}
            color={colors.accent}
          />
          <Text style={styles.badgeText}>Real-time messaging platform</Text>
        </View>

        {/* Heading */}
        <Text style={styles.heading}>
          Connect with your team,{"\n"}anywhere, anytime
        </Text>
        <View style={styles.headingAccent} />

        {/* Description */}
        <Text style={styles.description}>
          Experience seamless communication with syncUp. Chat in real-time,
          share files, and collaborate with your team effortlessly.
        </Text>

        {/* CTA Buttons */}
        <Link href="/register" asChild>
          <MainButton label="Get Started Free" />
        </Link>

        <Link href="/login" asChild>
          <MainButton
            label="Sign In to Your Account"
            bgcolor="white"
            txtColor="black"
          />
        </Link>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>10k+</Text>
            <Text style={styles.statLabel}>Users</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>99.9%</Text>
            <Text style={styles.statLabel}>Uptime</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Ionicons
              name="shield-checkmark"
              size={20}
              color={colors.success}
            />
            <Text style={styles.statLabel}>Secure & private</Text>
          </View>
        </View>
      </View>
      {/* Badges */}
      <View style={[styles.content, styles.contentAlt]}>
        <Text style={styles.heading}>
          Everything you need {"\n"}to stay in sync
        </Text>
        <Text style={styles.description}>
          Powerful features to help your team communicate better
        </Text>
        <IndexCard
          Title="Instant Messaging"
          Subtitle="Send and receive messages instantly with real-time delivery notifications."
          icon={<AntDesign name="message" size={24} color="white" />}
        />
        <IndexCard
          Title="Group Chats"
          Subtitle="Keep everyone in the loop with organized group conversations."
          icon={<AntDesign name="team" size={24} color="white" />}
        />
        <IndexCard
          Title="Secure and Private"
          Subtitle="Your conversations are protected with strong privacy controls."
          icon={<Ionicons name="shield-checkmark" size={24} color="white" />}
        />
        <IndexCard
          Title="Lightning Fast"
          Subtitle="Messages deliver instantly, even when your team is on the move."
          icon={
            <MaterialCommunityIcons
              name="lightning-bolt"
              size={24}
              color="white"
            />
          }
        />
        <IndexCard
          Title="Reliable Service"
          Subtitle="Built to stay online so you can stay connected."
          icon={
            <MaterialCommunityIcons
              name="check-decagram"
              size={24}
              color="white"
            />
          }
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerAccent} />
        <Text style={styles.footerTitle}>SyncUp</Text>
        <Text style={styles.footerText}>
          Secure team messaging, built for speed.
        </Text>
        <View style={styles.footerPill}>
          <Text style={styles.footerPillText}>Built with sync at the core</Text>
        </View>
        <Text style={styles.footerMeta}>
          © 2026 SyncUp. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: "center",
  },
  contentAlt: {
    backgroundColor: "#FEF2F2",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(185, 28, 28, 0.12)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  heading: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 40,
  },
  headingAccent: {
    width: '100%',
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.accent,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: colors.primaryDark,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  secondaryButton: {
    width: "100%",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  text: {
    fontSize: 24,
  },
  body: {
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 20,
    paddingRight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerAccent: {
    width: "100%",
    height: 4,
    borderRadius: 0,
    backgroundColor: colors.accent,
    marginHorizontal: -20,
    marginBottom: 12,
  },
  footerPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.accent,
    marginBottom: 10,
  },
  footerPillText: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  footerMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 24,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stat: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
});
