import { colors } from "@/constants/colors";
import { Link } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function MainHeader() {
  return (
    <View style={styles.header}> 
      <Image source={require("@/assets/images/logo.png")} style={styles.logo} />
      <View>
        <Text style={styles.title}>SyncUp</Text>
        <Text style={styles.title2}>Chat, Connect, Collaborate</Text>
      </View>
      <Link href="/login" push asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonLabel}>Login</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    alignSelf: "stretch",
    height: 120,
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 30,
    paddingHorizontal: 20,
    marginBottom: 30,
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
    marginRight: -50,
    marginLeft: -10
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
});
