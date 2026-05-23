import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="loading" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="bio" options={{ animation: 'fade' }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
