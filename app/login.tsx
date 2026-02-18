import AuthHeader from "@/components/headers/AuthHeader";
import MainButton from "@/components/ui/mainButton";
import MainInput from "@/components/ui/mainInput";
import { colors } from "@/constants/colors";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Checkbox from "expo-checkbox";
import { Link, Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();

  const router = useRouter();

  const handleLogin = () => {
    const nextEmailError = !email
      ? "Email is required"
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? "Enter valid email"
        : undefined;

    const nextPasswordError = !password ? "Password is required" : undefined;

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (!nextEmailError && !nextPasswordError) {
      router.push({ pathname: "/(tabs)", params: { email } });
    }
  };

  return (
    <View style={styles.container}>
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
        error={emailError}
      />
      <MainInput
        label="Password"
        icon={
          <MaterialCommunityIcons name="lock-outline" size={24} color="black" />
        }
        example="Enter your password"
        isPassword={true}
        value={password}
        onChangeText={setPassword}
        error={passwordError}
      />

      <View style={styles.checkboxContainer}>
        <View style={styles.rememberMeContainer}>
          <Checkbox value={rememberMe} onValueChange={setRememberMe} />
          <Text
            style={styles.checkboxLabel}
            onPress={() => setRememberMe(!rememberMe)}
          >
            Remember me
          </Text>
        </View>
        <Text style={styles.forgotPassword} onPress={() => {}}>
          Forgot password?
        </Text>
      </View>

      <MainButton label="Login" onPress={handleLogin} />

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Already have an account? </Text>
        <Link href="/register" asChild>
          <Pressable>
            <Text style={styles.signupLink}>Sign in</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    marginTop: "10%",
  },
  title: {
    fontSize: 30,
    color: colors.textPrimary,
    marginTop: 20,
    fontWeight: "600",
  },
  subTitle: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 5,
    marginBottom: 20,
  },
  accent: {
    color: colors.accent,
    fontWeight: "600",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "80%",
    marginVertical: 16,
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
  forgotPassword: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: "500",
  },
  input: {
    color: colors.textLight,
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
