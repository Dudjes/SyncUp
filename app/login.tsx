import AuthHeader from "@/components/headers/AuthHeader";
import MainButton from "@/components/ui/mainButton";
import MainInput from "@/components/ui/mainInput";
import { colors } from "@/constants/colors";
import { Link, Stack } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Checkbox from 'expo-checkbox';

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          header: () => <AuthHeader />,
        }}
      />
      <Text style={styles.title}>Sign in to your account</Text>
      <Text style={styles.subTitle}>Welcome back! Please enter yout details</Text>
      
      <MainInput 
        label="Email address"
        icon={<MaterialCommunityIcons name="email-outline" size={24} color="black" />}
        example="you@example.com"
      />
      <MainInput 
        label="Password"
        icon={<MaterialCommunityIcons name="email-outline" size={24} color="black" />}
        example="Enter your password"
        isPassword={true}
      />

      <View style={styles.checkboxContainer}>
        <View style={styles.rememberMeContainer}>
          <Checkbox value={rememberMe} onValueChange={setRememberMe} />
          <Text style={styles.checkboxLabel} onPress={() => setRememberMe(!rememberMe)}>Remember me</Text>
        </View>
        <Text style={styles.forgotPassword} onPress={() => {}}>Forgot password?</Text>
      </View>

      <Link
        href={{ pathname: "/(tabs)", params: { email: email } }}
        dismissTo asChild>
        <MainButton label="Login" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    marginTop: "10%"
  },
  title: {
    fontSize: 30,
    color: colors.textPrimary,
    marginTop: 20,
    fontWeight: "600"
  },
  subTitle: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 5,
    marginBottom: 20
  },
  accent: {
    color: colors.accent,
    fontWeight: "600"
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginVertical: 16,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  forgotPassword: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: "500"
  },
  input: {
    color: colors.textLight,
  },
});
