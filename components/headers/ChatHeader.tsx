import { colors } from "@/constants/colors";
import Feather from "@expo/vector-icons/Feather";
import { Link } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function ChatHeader() {
  return (
    <View style={styles.header}>
      <Image source={require("@/assets/images/logo.png")} style={styles.logo} />
      <View>
        <Text style={styles.title}>SyncUp</Text>
        <Text style={styles.title2}>Stay connected</Text>
      </View>

      <View style={styles.iconRow}>
        {/* open filter dropdown*/}
        <Link href="/settings" push asChild>
          <Pressable>
            <Feather name="filter" size={20} color="white" />
          </Pressable>
        </Link>
        <Link href="/chats/create" push asChild>
          <Pressable>
            <Feather name="plus" size={20} color="white" />
          </Pressable>
        </Link>
        <Link href="/settings" push asChild>
          <Pressable>
            <Feather name="settings" size={20} color="white" />
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    alignSelf: "stretch",
    height: 110,
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  title2: {
    color: "gray",
    fontSize: 10,
    fontWeight: "bold",
  },
  logo: {
    width: 75,
    height: 100,
    marginRight: 10,
    marginTop: 10,
    marginLeft: -10,
  },
  button: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  buttonLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  iconRow: {
    flexDirection: "row",
    marginLeft: "auto",
    gap: 25,
  },
});
