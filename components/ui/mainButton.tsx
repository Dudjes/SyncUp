import { colors } from "@/constants/colors";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

export default function MainButton({
  label,
  bgcolor = colors.primaryLight,
  txtColor = "white",
  borderColor = "black",
  onPress,
  width = 300,
}: {
  label: string;
  bgcolor?: string;
  txtColor?: string;
  borderColor?: string;
  onPress?: () => void;
  width?: number | string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        {
          ...styles.button,
          backgroundColor: bgcolor,
          borderColor: borderColor,
          width: typeof width === "string" ? parseInt(width) : width,
        },
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.label, { color: txtColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    margin: 5,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});
