import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fonts, shared } from '@/constants/onboarding-styles';

const DEMO_MESSAGES = [
  {
    role: 'user' as const,
    content: 'How do I enrol my kids in school nearby?',
    delay: 800,
  },
  {
    role: 'assistant' as const,
    content:
      'Great question! Based on your location, here are your options:\n\n' +
      'Westfield Primary School is closest and currently accepting enrolments for Term 3. ' +
      'They have an open morning on Tue 10 June.\n\n' +
      "You'll need:\n" +
      '• Proof of address (utility bill or lease)\n' +
      "• Your child's birth certificate\n" +
      '• Immunisation records\n\n' +
      'Would you like me to draft an email to the school?',
    delay: 2800,
  },
  {
    role: 'user' as const,
    content: 'Yes, can you draft the email?',
    delay: 5200,
  },
  {
    role: 'assistant' as const,
    content:
      "Here's a draft for you:\n\n" +
      'Subject: Enrolment enquiry — new to the area\n\n' +
      'Hi,\n\n' +
      "We've recently moved to the area and would like to enquire about enrolling our children " +
      "at Westfield Primary. We'd love to attend the open morning on 10 June if possible.\n\n" +
      'Could you let us know what documents we need to bring?\n\n' +
      'Thank you!\n\n' +
      'Shall I send this, or would you like to edit it first?',
    delay: 7500,
  },
];

function TypingIndicator({ visible }: { visible: boolean }) {
  const pulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (visible) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0.3,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]),
      );
      anim.start();
      return () => anim.stop();
    } else {
      pulse.setValue(0.3);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={[styles.bubble, styles.assistantBubble]}>
      <Text style={styles.senderLabel}>Tapestry</Text>
      <Animated.Text style={[styles.typingDots, { opacity: pulse }]}>
        • • •
      </Animated.Text>
    </View>
  );
}

export default function ConciergeScreen() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const fadeAnims = useRef(DEMO_MESSAGES.map(() => new Animated.Value(0))).current;
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    DEMO_MESSAGES.forEach((msg, i) => {
      // Show typing indicator before assistant messages
      if (msg.role === 'assistant') {
        timeouts.push(
          setTimeout(() => {
            setTyping(true);
            setTimeout(
              () => scrollRef.current?.scrollToEnd({ animated: true }),
              50,
            );
          }, msg.delay - 1400),
        );
      }

      timeouts.push(
        setTimeout(() => {
          setTyping(false);
          setVisibleCount(i + 1);
          Animated.timing(fadeAnims[i], {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }).start();
          setTimeout(
            () => scrollRef.current?.scrollToEnd({ animated: true }),
            50,
          );
        }, msg.delay),
      );
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <SafeAreaView style={shared.safe}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.backBtn}
          >
            <Text style={styles.backIcon}>{'\u2039'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tapestry</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
        >
          {DEMO_MESSAGES.slice(0, visibleCount).map((msg, i) => (
            <Animated.View
              key={i}
              style={[
                styles.bubble,
                msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
                { opacity: fadeAnims[i] },
              ]}
            >
              {msg.role === 'assistant' && (
                <Text style={styles.senderLabel}>Tapestry</Text>
              )}
              <Text
                style={
                  msg.role === 'user' ? styles.userText : styles.assistantText
                }
              >
                {msg.content}
              </Text>
            </Animated.View>
          ))}
          <TypingIndicator visible={typing} />
        </ScrollView>

        {/* Input bar */}
        <View style={styles.inputBar}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Ask Tapestry anything..."
              placeholderTextColor={colors.textTertiary}
              editable={false}
            />
            <View style={styles.sendBtn}>
              <Text style={styles.sendArrow}>{'\u2191'}</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: 4, width: 36 },
  backIcon: { fontSize: 32, color: colors.text, lineHeight: 32 },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.1,
  },
  messages: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.text,
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.selectedBg,
    borderBottomLeftRadius: 6,
  },
  senderLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#fdfcfc',
    letterSpacing: 0.1,
  },
  assistantText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    letterSpacing: 0.1,
  },
  typingDots: {
    fontSize: 18,
    color: colors.textSecondary,
    letterSpacing: 2,
  },
  inputBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: 16,
    paddingRight: 6,
    height: 44,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    letterSpacing: 0.1,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendArrow: {
    fontSize: 18,
    color: '#fdfcfc',
    fontWeight: '600',
  },
});
