import { Stack } from "expo-router";

export default function ChatsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Chats",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: "New Chat",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="[chatId]/index"
        options={{
          title: "Chat",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: "Settings",
        }}
      />
    </Stack>
  );
}
