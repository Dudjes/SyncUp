import MainButton from "@/components/ui/mainButton";
import { colors } from "@/constants/colors";
import { Link } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const [name, setName] = useState("");
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Enter your name"
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        value={name}
        onChangeText={(text) => setName(text)}
      ></TextInput>

      <Link
        href={{ pathname: "/(tabs)", params: { name: name } }}
        dismissTo
        asChild
      >
        <MainButton label="Login" />
      </Link>
      <Link href="/register" dismissTo asChild>
        <MainButton label="register" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  title: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  input: {
    color: colors.textPrimary,
  },
});
