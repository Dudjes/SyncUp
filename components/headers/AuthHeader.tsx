import { colors } from "@/constants/colors";
import { Link } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Entypo from "@expo/vector-icons/Entypo";

interface AuthHeaderProps {
  homeRoute?: "/" | "/login" | "/register" | "/chats/";
}

export default function AuthHeader({ homeRoute = "/" }: AuthHeaderProps) {
  return (
    <View style={styles.header}>
      <Link href={homeRoute} dismissTo asChild>
        <Pressable style={styles.textarea}>
          <Entypo name="arrow-with-circle-left" size={35} color="white" />
          <Text style={styles.text}> Home </Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    height: 120,
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 30,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  textarea: {
    alignItems: "center",
    flexDirection: "row",
  },
  text: {
    fontSize: 20,
    color: "white",
    margin: 5,
  },
});
