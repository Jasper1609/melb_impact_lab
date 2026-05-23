import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "@/constants/onboarding-styles";

/* ── Fake contacts that "sync" ── */
const FOUND_CONTACTS = [
  { name: "Mei-Ling Chan", detail: "Mobile" },
  { name: "Sarah Chen", detail: "Mobile" },
  { name: "Priya Sharma", detail: "Mobile, Email" },
];

type Phase = "prompt" | "dialog" | "syncing" | "done";

export default function ContactsScreen() {
  const [phase, setPhase] = useState<Phase>("prompt");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const contactAnims = useRef(FOUND_CONTACTS.map(() => new Animated.Value(0))).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  /* Fade in on mount */
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  /* Sync animation */
  useEffect(() => {
    if (phase === "syncing") {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();

      const t = setTimeout(() => setPhase("done"), 1800);
      return () => clearTimeout(t);
    }
  }, [phase, spinAnim]);

  /* Stagger-reveal found contacts */
  useEffect(() => {
    if (phase === "done") {
      const anims = contactAnims.map((a, i) =>
        Animated.timing(a, {
          toValue: 1,
          duration: 300,
          delay: i * 200,
          useNativeDriver: true,
        }),
      );
      Animated.stagger(200, anims).start();

      Animated.timing(checkAnim, {
        toValue: 1,
        duration: 300,
        delay: FOUND_CONTACTS.length * 200 + 200,
        useNativeDriver: true,
      }).start();

      const nav = setTimeout(
        () => {
          router.push("/loading");
        },
        FOUND_CONTACTS.length * 200 + 1200,
      );
      return () => clearTimeout(nav);
    }
  }, [phase, contactAnims, checkAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Back button */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>{"\u2190"}</Text>
          </TouchableOpacity>
        </View>

        {/* Main content */}
        <View style={styles.center}>
          {/* Contacts icon — mimics iOS style */}
          <View style={styles.iconCircle}>
            <View style={styles.iconHead} />
            <View style={styles.iconBody} />
          </View>

          {phase === "prompt" && (
            <>
              <Text style={styles.title}>Find people{"\n"}you know</Text>
              <Text style={styles.subtitle}>
                Tapestry can check your contacts to find people in your neighbourhood who are
                already here.
              </Text>
              <Text style={styles.privacyNote}>
                Your contacts stay on your device and are never uploaded.
              </Text>
            </>
          )}

          {phase === "syncing" && (
            <>
              <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
                <View style={styles.spinnerArc} />
              </Animated.View>
              <Text style={styles.syncingText}>Checking contacts...</Text>
            </>
          )}

          {phase === "done" && (
            <>
              <Text style={styles.foundTitle}>{FOUND_CONTACTS.length} contacts found</Text>
              <View style={styles.contactsList}>
                {FOUND_CONTACTS.map((c, i) => (
                  <Animated.View
                    key={c.name}
                    style={[
                      styles.contactRow,
                      {
                        opacity: contactAnims[i],
                        transform: [
                          {
                            translateY: contactAnims[i].interpolate({
                              inputRange: [0, 1],
                              outputRange: [12, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <View style={styles.contactAvatar}>
                      <Text style={styles.contactInitial}>{c.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{c.name}</Text>
                      <Text style={styles.contactDetail}>{c.detail}</Text>
                    </View>
                    <Text style={styles.checkmark}>{"\u2713"}</Text>
                  </Animated.View>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Bottom buttons */}
        {phase === "prompt" && (
          <View style={styles.bottom}>
            <TouchableOpacity
              style={styles.allowButton}
              onPress={() => setPhase("dialog")}
              activeOpacity={0.8}
            >
              <Text style={styles.allowButtonText}>Allow Access</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/loading")} activeOpacity={0.7}>
              <Text style={styles.skipText}>Not now</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* ── Fake iOS permission dialog ── */}
      <Modal
        visible={phase === "dialog"}
        transparent
        animationType="fade"
        onRequestClose={() => setPhase("prompt")}
      >
        <View style={dialogStyles.overlay}>
          <View style={dialogStyles.card}>
            <Text style={dialogStyles.title}>
              {"\u201C"}Tapestry{"\u201D"} Would Like to Access Your Contacts
            </Text>
            <Text style={dialogStyles.message}>
              This lets Tapestry find people you know in your neighbourhood.
            </Text>
            <View style={dialogStyles.divider} />
            <TouchableOpacity
              style={dialogStyles.secondaryRow}
              onPress={() => {
                setPhase("prompt");
              }}
              activeOpacity={0.6}
            >
              <Text style={dialogStyles.secondaryText}>Don{"\u2019"}t Allow</Text>
            </TouchableOpacity>
            <View style={dialogStyles.divider} />
            <TouchableOpacity
              style={dialogStyles.primaryRow}
              onPress={() => setPhase("syncing")}
              activeOpacity={0.6}
            >
              <Text style={dialogStyles.primaryText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ── Styles ── */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerRow: {
    height: 44,
    justifyContent: "center",
  },
  backButton: {
    padding: 4,
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 28,
    color: colors.text,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  /* Contact-person icon */
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.selectedBg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
    marginBottom: 28,
  },
  iconHead: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.textTertiary,
    marginBottom: 4,
  },
  iconBody: {
    width: 36,
    height: 20,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: colors.textTertiary,
  },

  title: {
    fontSize: 36,
    fontWeight: "300",
    fontFamily: fonts.display,
    color: colors.text,
    letterSpacing: -0.72,
    lineHeight: 36 * 1.13,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    textAlign: "center",
    letterSpacing: 0.1,
    marginBottom: 8,
  },
  privacyNote: {
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: "center",
    letterSpacing: 0.1,
  },

  /* Syncing state */
  spinner: {
    width: 40,
    height: 40,
    marginBottom: 16,
  },
  spinnerArc: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    borderTopColor: colors.text,
  },
  syncingText: {
    fontSize: 16,
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },

  /* Done state — found contacts */
  foundTitle: {
    fontSize: 24,
    fontWeight: "300",
    fontFamily: fonts.display,
    color: colors.text,
    letterSpacing: -0.48,
    marginBottom: 20,
  },
  contactsList: {
    width: "100%",
    gap: 0,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.selectedBg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contactInitial: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    letterSpacing: 0.1,
  },
  contactDetail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 1,
  },
  checkmark: {
    fontSize: 16,
    color: "#34c759",
    fontWeight: "600",
  },

  /* Bottom actions */
  bottom: {
    alignItems: "center",
    gap: 16,
  },
  allowButton: {
    backgroundColor: colors.buttonActive,
    borderRadius: 9999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    width: "100%",
  },
  allowButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#fdfcfc",
    letterSpacing: 0.1,
  },
  skipText: {
    fontSize: 15,
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },
});

/* ── iOS-style permission dialog ── */

const dialogStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  card: {
    backgroundColor: "rgba(242,242,247,0.97)",
    borderRadius: 14,
    width: "100%",
    maxWidth: 300,
    overflow: "hidden",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 13,
    color: "#000",
    textAlign: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(60,60,67,0.36)",
  },
  secondaryRow: {
    paddingVertical: 11,
    alignItems: "center",
  },
  secondaryText: {
    fontSize: 17,
    color: "#007aff",
    letterSpacing: -0.2,
  },
  primaryRow: {
    paddingVertical: 11,
    alignItems: "center",
  },
  primaryText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#007aff",
    letterSpacing: -0.2,
  },
});
