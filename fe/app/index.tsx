import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GradientOrb } from "@/components/NoiseGradient";
import { iridescent } from "@/constants/gradients";
import { colors, fonts } from "@/constants/onboarding-styles";

const greetings = [
  { welcome: "Welcome", cta: "Get Started" },
  { welcome: "\u6B22\u8FCE", cta: "\u5F00\u59CB" },
  {
    welcome: "\u0623\u0647\u0644\u0627\u064B \u0648\u0633\u0647\u0644\u0627\u064B",
    cta: "\u0627\u0628\u062F\u0623",
  },
  { welcome: "Ch\u00E0o m\u1EEBng", cta: "B\u1EAFt \u0111\u1EA7u" },
  {
    welcome: "\u0938\u094D\u0935\u093E\u0917\u0924",
    cta: "\u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902",
  },
  { welcome: "Bienvenido", cta: "Comenzar" },
  { welcome: "Maligayang pagdating", cta: "Magsimula" },
  { welcome: "\uD658\uC601\uD569\uB2C8\uB2E4", cta: "\uC2DC\uC791\uD558\uAE30" },
];

export default function WelcomeScreen() {
  const [index, setIndex] = useState(0);
  const [fadeAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIndex((prev) => (prev + 1) % greetings.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [fadeAnim]);

  const current = greetings[index];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.orbContainer}>
          <GradientOrb preset={iridescent} size={280} style={styles.orb} />
        </View>
        <View style={styles.content}>
          <Text style={styles.brand}>Tapestry</Text>
          <Animated.Text style={[styles.welcome, { opacity: fadeAnim }]}>
            {current.welcome}
          </Animated.Text>
          <Text style={styles.subtitle}>
            Connect with your new community.{"\n"}
            Find friends, events, and resources{"\n"}
            in your neighbourhood.
          </Text>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/onboarding/language")}
            activeOpacity={0.8}
          >
            <Animated.Text style={[styles.buttonText, { opacity: fadeAnim }]}>
              {current.cta}
            </Animated.Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 120,
    paddingBottom: 32,
  },
  orbContainer: {
    position: "absolute",
    top: -100,
    right: -140,
    opacity: 0.5,
  },
  orb: {},
  content: {
    gap: 16,
  },
  brand: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  welcome: {
    fontSize: 48,
    fontWeight: "300",
    fontFamily: fonts.display,
    color: colors.text,
    letterSpacing: -0.96,
    lineHeight: 48 * 1.08,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  buttonGroup: {
    gap: 12,
  },
  button: {
    backgroundColor: colors.buttonActive,
    borderRadius: 9999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#fdfcfc",
    letterSpacing: 0.1,
  },
  dashboardButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBg,
    borderRadius: 9999,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  dashboardButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text,
    letterSpacing: 0.1,
  },
});
