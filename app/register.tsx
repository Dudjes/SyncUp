import AuthHeader from "@/components/headers/AuthHeader";
import MainButton from "@/components/ui/mainButton";
import MainInput from "@/components/ui/mainInput";
import { colors } from "@/constants/colors";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Checkbox from "expo-checkbox";
import { Link, Stack } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View, Pressable } from "react-native";

export default function LoginScreen() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Stack.Screen
          options={{
            header: () => <AuthHeader />,
          }}
        />
        <Text style={styles.title}>Sign in to your account</Text>
        <Text style={styles.subTitle}>
          Welcome back! Please enter yout details
        </Text>

        <MainInput
          label="Full Name"
          icon={
            <MaterialCommunityIcons
              name="account-outline"
              size={24}
              color="black"
            />
          }
          example="John Doe"
          value={fullName}
          onChangeText={setFullName}
        />
        <MainInput
          label="Username"
          icon={<MaterialCommunityIcons name="at" size={24} color="black" />}
          example="johndoe"
          value={username}
          onChangeText={setUsername}
        />
        <MainInput
          label="Email address"
          icon={
            <MaterialCommunityIcons
              name="email-outline"
              size={24}
              color="black"
            />
          }
          example="you@example.com"
          value={email}
          onChangeText={setEmail}
        />
        <MainInput
          label="Password"
          icon={
            <MaterialCommunityIcons
              name="lock-outline"
              size={24}
              color="black"
            />
          }
          example="Enter your password"
          isPassword={true}
          value={password}
          onChangeText={setPassword}
        />

        <View style={styles.checkboxContainer}>
          <View style={styles.rememberMeContainer}>
            <Checkbox value={acceptTerms} onValueChange={setAcceptTerms} />
            <Text
              style={styles.checkboxLabel}
              onPress={() => setAcceptTerms(!acceptTerms)}
            >
              Remember me
            </Text>
          </View>
        </View>

        <Link
          href={{ pathname: "/(tabs)", params: { email: email } }}
          dismissTo
          asChild
        >
          <MainButton label="Create Account" />
        </Link>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Already have an account? </Text>
          <Link href="/login" asChild>
            <Pressable>
              <Text style={styles.signupLink}>Sign in</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingTop: "10%",
  },
  title: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  subTitle: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 5,
    marginBottom: 20,
  },
  checkboxContainer: {
    width: "80%",
    marginVertical: 16,
    marginBottom: 30,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  signupContainer: {
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 20,
    justifyContent: "center",
  },
  signupText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  signupLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
