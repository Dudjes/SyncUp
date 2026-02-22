import { colors } from "@/constants/colors";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function mainInput({
  label = "label lol",
  icon = <AntDesign name="question-circle" size={24} color="white" />,
  example = "This is an example",
  isPassword = false,
  value,
  onChangeText,
  error,
  width = "80%",
  height,
  editable = true,
}: {
  label: string;
  icon?: React.ReactNode;
  example?: string;
  isPassword?: boolean;
  value: string;
  onChangeText?: (text: string) => void;
  error?: string;
  width?: number | `${number}%`;
  height?: number | `${number}%`;
  editable?: boolean;
}) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={[styles.container, { width: width }]}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          error && styles.inputError,
          { height: height },
        ]}
      >
        <View style={styles.iconContainer}>{icon}</View>
        <TextInput
          placeholder={example}
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { height: height ? "100%" : undefined }]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !isPasswordVisible}
          multiline={height ? true : false}
          textAlignVertical={height ? "top" : "center"}
          editable={editable}
        />
        {isPassword && (
          <Pressable
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={isPasswordVisible ? "eye" : "eye-off"}
              size={24}
              color={colors.textSecondary}
            />
          </Pressable>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 12,
  },
  label: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 8,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  iconContainer: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
  },
  eyeIcon: {
    padding: 4,
    marginLeft: 8,
  },
  inputError: {
    borderColor: colors.error ?? colors.error,
  },
  errorText: {
    color: colors.error ?? colors.error,
    fontSize: 12,
    marginTop: 6,
  },
});
