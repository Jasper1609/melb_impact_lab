import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, shared } from "@/constants/onboarding-styles";

const languages = [
  { id: "en", flag: "\u{1F1E6}\u{1F1FA}", label: "English" },
  { id: "zh", flag: "\u{1F1E8}\u{1F1F3}", label: "\u4E2D\u6587" },
  { id: "ar", flag: "\u{1F1F8}\u{1F1E6}", label: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629" },
  { id: "vi", flag: "\u{1F1FB}\u{1F1F3}", label: "Ti\u1EBFng Vi\u1EC7t" },
  { id: "hi", flag: "\u{1F1EE}\u{1F1F3}", label: "\u0939\u093F\u0928\u094D\u0926\u0940" },
  { id: "es", flag: "\u{1F1EA}\u{1F1F8}", label: "Espa\u00F1ol" },
  { id: "tl", flag: "\u{1F1F5}\u{1F1ED}", label: "Tagalog" },
  { id: "ko", flag: "\u{1F1F0}\u{1F1F7}", label: "\uD55C\uAD6D\uC5B4" },
];

export default function LanguageScreen() {
  const [selected, setSelected] = useState("en");

  return (
    <SafeAreaView style={shared.safe}>
      <View style={shared.container}>
        <View>
          <View style={shared.header}>
            <TouchableOpacity style={shared.backButton} onPress={() => router.back()}>
              <Text style={shared.backText}>{"\u2190"}</Text>
            </TouchableOpacity>
          </View>
          <View style={shared.content}>
            <Text style={shared.stepLabel}>Step 1 of 7</Text>
            <Text style={shared.title}>Choose your{"\n"}language</Text>
            <Text style={shared.subtitle}>You can change this anytime in settings.</Text>

            <View style={styles.grid}>
              {languages.map((lang) => {
                const active = selected === lang.id;
                return (
                  <TouchableOpacity
                    key={lang.id}
                    style={[styles.card, active && styles.cardSelected]}
                    onPress={() => setSelected(lang.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.flag}>{lang.flag}</Text>
                    <Text style={[styles.label, active && styles.labelSelected]}>{lang.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={shared.button}
          onPress={() => router.push("/onboarding/name")}
          activeOpacity={0.8}
        >
          <Text style={shared.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 16,
    width: "47%",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  cardSelected: {
    borderWidth: 1,
    borderColor: colors.selectedBorder,
    backgroundColor: colors.selectedBg,
    shadowOpacity: 0,
    elevation: 0,
  },
  flag: {
    fontSize: 32,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text,
    letterSpacing: 0.1,
  },
  labelSelected: {
    color: colors.text,
  },
});
