import AuthHeader from "@/components/headers/AuthHeader";
import MainButton from "@/components/ui/mainButton";
import MainInput from "@/components/ui/mainInput";
import { colors } from "@/constants/colors";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Checkbox from "expo-checkbox";
import { Link, Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [errors, setErrors] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    terms: "",
  });

  const validateForm = () => {
    const newErrors = {
      fullName: "",
      username: "",
      email: "",
      password: "",
      terms: "",
    };

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!email.includes("@")) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password || password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!acceptTerms) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const isFormValid = () => {
    return (
      fullName.trim() !== "" &&
      username.trim() !== "" &&
      email.trim() !== "" &&
      password !== "" &&
      acceptTerms
    );
  };

  const handleRegister = () => {
    if (validateForm()) {
      router.push({
        pathname: "/(tabs)",
        params: { email: email },
      });
    } else {
      const firstError = Object.values(errors).find((e) => e !== "");
      if (firstError) {
        Alert.alert("Validation Error", firstError);
      }
    }
  };

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
        {errors.fullName ? (
          <Text style={styles.errorText}>{errors.fullName}</Text>
        ) : null}
        <MainInput
          label="Username"
          icon={<MaterialCommunityIcons name="at" size={24} color="black" />}
          example="johndoe"
          value={username}
          onChangeText={setUsername}
        />
        {errors.username ? (
          <Text style={styles.errorText}>{errors.username}</Text>
        ) : null}
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
        {errors.email ? (
          <Text style={styles.errorText}>{errors.email}</Text>
        ) : null}
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
        {errors.password ? (
          <Text style={styles.errorText}>{errors.password}</Text>
        ) : null}

        <View style={styles.checkboxContainer}>
          <View style={styles.rememberMeContainer}>
            <Checkbox value={acceptTerms} onValueChange={setAcceptTerms} />
            <Text
              style={styles.checkboxLabel}
              onPress={() => setAcceptTerms(!acceptTerms)}
            >
              I accept the terms and conditions
            </Text>
          </View>
          {errors.terms ? (
            <Text style={styles.errorText}>{errors.terms}</Text>
          ) : null}
        </View>

        <MainButton label="Create Account" onPress={handleRegister} />

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
  errorText: {
    fontSize: 12,
    color: "#ff4444",
    marginBottom: 8,
    width: "80%",
  },
});
