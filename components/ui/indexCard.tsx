import { colors } from "@/constants/colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function indexCard({
  Title = "this is the title lol",
  Subtitle = "this is a subtitle lol",
  icon = <AntDesign name="question-circle" size={24} color="white" />,
}: {
  Title: string;
  Subtitle: string;
  icon?: React.ReactNode;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isToggled, setIsToggled] = useState(false);
  const isActive = isHovered || isToggled;

  return (
    <Pressable
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      onPress={() => setIsToggled((prev) => !prev)}
      style={[styles.cardBody, isActive && styles.cardBodyHover]}
    >
      <View style={[styles.iconWrapper, isActive && styles.iconWrapperHover]}>
        {icon}
      </View>
      <Text style={styles.title}>{Title}</Text>
      <Text style={styles.subtitle}>{Subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardBody: {
    width: 320,
    height: 150,
    padding: 20,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "lightgray",
    alignItems: "flex-start",
    justifyContent: "space-evenly",
    margin: 10
  },
  cardBodyHover: {
    borderColor: colors.accentLight,
  },
  title: {
    fontSize: 20,
    fontWeight: 500,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapperHover: {
    backgroundColor: colors.accentLight,
  },
});
