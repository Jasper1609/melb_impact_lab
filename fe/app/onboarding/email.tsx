import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, shared } from "@/constants/onboarding-styles";

export default function EmailScreen() {
  const [email, setEmail] = useState("");

  return (
    <SafeAreaView style={shared.safe}>
      <KeyboardAvoidingView
        style={shared.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View>
          <View style={shared.header}>
            <TouchableOpacity style={shared.backButton} onPress={() => router.back()}>
              <Text style={shared.backText}>{"\u2190"}</Text>
            </TouchableOpacity>
          </View>
          <View style={shared.content}>
            <Text style={shared.stepLabel}>Step 4 of 7</Text>
            <Text style={shared.title}>Your email</Text>
            <Text style={shared.subtitle}>So we can keep you in the loop.</Text>

            <TextInput
              style={shared.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
          </View>
        </View>

        <TouchableOpacity
          style={[shared.button, !email.trim() && shared.buttonDisabled]}
          disabled={!email.trim()}
          onPress={() => router.push("/onboarding/address")}
          activeOpacity={0.8}
        >
          <Text style={[shared.buttonText, !email.trim() && shared.buttonTextDisabled]}>
            Continue
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
