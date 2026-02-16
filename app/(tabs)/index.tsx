import MainHeader from "@/components/headers/MainHeader";
import { colors } from "@/constants/colors";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function App() {
  const params = useLocalSearchParams<{ name?: string }>();
  const [name, setName] = useState(params.name ?? "");
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <MainHeader />
      <Text style={styles.text}>Welcome</Text>
      <TextInput
        placeholder="Enter your name"
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        value={name}
        onChangeText={(text) => setName(text)}
      ></TextInput>
      <Text style={styles.greeting}>Hello {name}</Text>

      <Button
        title={`Increase total: (${count})`}
        onPress={() => setCount(count + 1)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  greeting: {
    color: colors.textSecondary,
  },
  input: {
    color: colors.textPrimary,
  },
});
