import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, shared } from "@/constants/onboarding-styles";

export default function AddressScreen() {
  const [street, setStreet] = useState("");
  const [unit, setUnit] = useState("");

  return (
    <SafeAreaView style={shared.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={shared.header}>
            <TouchableOpacity style={shared.backButton} onPress={() => router.back()}>
              <Text style={shared.backText}>{"\u2190"}</Text>
            </TouchableOpacity>
          </View>
          <View style={shared.content}>
            <Text style={shared.stepLabel}>Step 5 of 7</Text>
            <Text style={shared.title}>Where do{"\n"}you live?</Text>
            <Text style={shared.subtitle}>
              Your address remains private. It's used to serve you local content and verify you to
              the neighbourhood.
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Country</Text>
              <View style={styles.countryRow}>
                <Text style={styles.countryText}>Australia</Text>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Street address</Text>
              <TextInput
                style={shared.input}
                placeholder="123 Main Street, Melbourne VIC"
                placeholderTextColor={colors.textTertiary}
                value={street}
                onChangeText={setStreet}
                autoFocus
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Apartment / Unit (optional)</Text>
              <TextInput
                style={shared.input}
                placeholder="e.g. Unit 4"
                placeholderTextColor={colors.textTertiary}
                value={unit}
                onChangeText={setUnit}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[shared.button, !street.trim() && shared.buttonDisabled]}
            disabled={!street.trim()}
            onPress={() => router.push("/onboarding/neighbourhood")}
            activeOpacity={0.8}
          >
            <Text style={[shared.buttonText, !street.trim() && shared.buttonTextDisabled]}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  fieldGroup: {
    gap: 4,
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.textSecondary,
    marginTop: 8,
    letterSpacing: 0.1,
  },
  countryRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.text,
    paddingVertical: 12,
  },
  countryText: {
    fontSize: 16,
    color: colors.text,
    letterSpacing: 0.1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
});
