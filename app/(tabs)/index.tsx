import MainHeader from "@/components/headers/MainHeader";
import { colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";
import { authenticatedFetch } from "@/services/api";
import { AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import { Link, router, useRouter } from "expo-router";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function App() {
  const params = useLocalSearchParams<{ name?: string }>();
  const [totalUnread, setTotalUnread] = useState(0);
  const [activeChats, setActiveChats] = useState(0);
  const [teamMembers, setTeamMembers] = useState(0);
  const [recentActivity, setRecentActivity] = useState<
    {
      id: string;
      title: string;
      subtitle: string;
      time: string;
      unread: number;
    }[]
  >([]);

  const getTotalUnreadMessages = async () => {
    try {
      const response = await authenticatedFetch("/chats/unread");
      return response.unreadCount ?? 0;
    } catch (error) {
      console.error("Error fetching unread messages:", error);
      return 0;
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadHomeData = async () => {
        try {
          // Fetch chats, friends, and unread count together for a single refresh.
          const [chatsResponse, friendsResponse, unread] = await Promise.all([
            authenticatedFetch("/chats"),
            authenticatedFetch("/friends"),
            getTotalUnreadMessages(),
          ]);

          if (!isActive) return;

          const chats = chatsResponse.chats ?? [];
          const friends = friendsResponse.friends ?? [];

          setActiveChats(chats.length);
          setTeamMembers(friends.length);
          setTotalUnread(unread);

          // Build a recent activity list from chats. (3 chats)
          const activity = chats
            .filter((chat: any) => chat.lastMessage || chat.created_at)
            .sort((a: any, b: any) => {
              const aTime = a.lastMessage?.sentAt || a.created_at;
              const bTime = b.lastMessage?.sentAt || b.created_at;
              return new Date(bTime).getTime() - new Date(aTime).getTime();
            })
            .slice(0, 3)
            .map((chat: any) => ({
              id: chat._id,
              title: chat.chatName || "Untitled",
              subtitle: chat.lastMessage?.text || "No messages yet",
              time: formatRelativeTime(
                chat.lastMessage?.sentAt || chat.created_at,
              ),
              unread: 0,
            }));

          setRecentActivity(activity);
        } catch (err) {
          console.log("Failed to load home data:", err);
        }
      };

      loadHomeData();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const stats = useMemo(
    () => [
      {
        label: "Active Chats",
        value: activeChats,
        icon: <AntDesign name="message" size={18} color={colors.accent} />,
      },
      {
        label: "Unread",
        value: totalUnread,
        icon: <Feather name="bell" size={18} color={colors.warning} />,
      },
    ],
    [activeChats, teamMembers, totalUnread],
  );

  const getInitials = (value: string) => {
    const parts = value.trim().split(/\s+/);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
    return (
      (parts[0][0]?.toUpperCase() ?? "") +
      (parts[parts.length - 1][0]?.toUpperCase() ?? "")
    );
  };

  const formatRelativeTime = (value: string | Date) => {
    const time = new Date(value).getTime();
    const diffSeconds = Math.floor((Date.now() - time) / 1000);
    if (diffSeconds < 60) return "Just now";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <View style={styles.container}>
      <MainHeader />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeTextWrap}>
            <Text style={styles.welcomeTitle}>
              Welcome back{}!
            </Text>
            <Text style={styles.welcomeSubtitle}>
              {totalUnread > 0
                ? `You have ${totalUnread} new messages`
                : "You have no new messages"}
            </Text>
          </View>
          <View style={styles.welcomeIconWrap}>
            <AntDesign name="arrow-up" size={22} color={colors.accent} />
            <View style={styles.welcomeBadge}>
              <FontAwesome name="wechat" size={22} color={colors.textLight} />
            </View>
          </View>
          <View style={styles.welcomeGlow} />
        </View>

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <View style={styles.statIcon}>{stat.icon}</View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.actionsRow}>
          <Link href="/(tabs)/chats" asChild>
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
              <View style={[styles.actionIcon, styles.actionIconPrimary]}>
                <FontAwesome name="comment" size={18} color={colors.textLight} />
              </View>
              <View>
                <Text style={styles.actionTitle}>View All Chats</Text>
                <Text style={styles.actionSubtitle}>Browse messages</Text>
              </View>
            </TouchableOpacity>
          </Link>
          <Link href="/(tabs)/chats/create" asChild>
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
              <View style={[styles.actionIcon, styles.actionIconDark]}>
                <AntDesign name="plus" size={18} color={colors.textLight} />
              </View>
              <View>
                <Text style={styles.actionTitle}>New Chat</Text>
                <Text style={styles.actionSubtitle}>Start conversation</Text>
              </View>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/chats")}>
            <Text style={styles.sectionLink}>View all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.activityList}>
          {recentActivity.map((item) => (
            <Link key={item.id} href={`/(tabs)/chats/${item.id}`} asChild>
              <TouchableOpacity style={styles.activityCard} activeOpacity={0.7}>
                <View style={styles.activityAvatar}>
                  <Text style={styles.activityInitials}>
                    {getInitials(item.title)}
                  </Text>
                  {item.unread > 0 && (
                    <View style={styles.activityBadge}>
                      <Text style={styles.activityBadgeText}>{item.unread}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.activityBody}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
                </View>
                <View style={styles.activityTimeWrap}>
                  <Feather name="clock" size={12} color={colors.textSecondary} />
                  <Text style={styles.activityTime}>{item.time}</Text>
                </View>
              </TouchableOpacity>
            </Link>
          ))}
          {recentActivity.length === 0 && (
            <View style={styles.activityEmpty}>
              <Text style={styles.activityEmptyText}>
                No recent activity yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 32,
    gap: 18,
  },
  welcomeCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 18,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  welcomeTextWrap: {
    flex: 1,
    gap: 6,
  },
  welcomeTitle: {
    color: colors.textLight,
    fontSize: 20,
    fontFamily: Fonts.rounded,
    fontWeight: "700",
  },
  welcomeSubtitle: {
    color: colors.accentLight,
    fontSize: 13,
    fontFamily: Fonts.rounded,
  },
  welcomeIconWrap: {
    alignItems: "flex-end",
    gap: 12,
  },
  welcomeBadge: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeGlow: {
    position: "absolute",
    right: -30,
    top: -40,
    width: 140,
    height: 140,
    backgroundColor: colors.accentDark,
    borderRadius: 70,
    opacity: 0.2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    fontFamily: Fonts.rounded,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: Fonts.rounded,
  },
  sectionHeader: {
    paddingTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    fontFamily: Fonts.rounded,
  },
  sectionLink: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "600",
    fontFamily: Fonts.rounded,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconPrimary: {
    backgroundColor: colors.accent,
  },
  actionIconDark: {
    backgroundColor: colors.primary,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
    fontFamily: Fonts.rounded,
  },
  actionSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: Fonts.rounded,
  },
  activityList: {
    gap: 12,
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  activityInitials: {
    color: colors.textLight,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
  },
  activityBadge: {
    position: "absolute",
    right: -4,
    top: -4,
    backgroundColor: colors.accent,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  activityBadgeText: {
    color: colors.textLight,
    fontSize: 10,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
  },
  activityBody: {
    flex: 1,
    gap: 2,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
    fontFamily: Fonts.rounded,
  },
  activitySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: Fonts.rounded,
  },
  activityTimeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  activityTime: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: Fonts.rounded,
  },
  activityEmpty: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityEmptyText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: Fonts.rounded,
  },
});
