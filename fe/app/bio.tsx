import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { shared, colors, fonts } from '@/constants/onboarding-styles';

const DUMMY_TRANSCRIPT =
  "I just moved to Melbourne from Vietnam with my wife and two kids. We're looking for a good primary school nearby, and I'd love to find a local community group where we can meet other families. I also need help setting up a bank account and understanding public transport.";

export default function BioScreen() {
  const [bio, setBio] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);

  const handleVoicePress = () => {
    if (isRecording) {
      setIsRecording(false);
      setHasRecorded(true);
      setBio(DUMMY_TRANSCRIPT);
    } else {
      setIsRecording(true);
      setHasRecorded(false);
    }
  };

  return (
    <SafeAreaView style={shared.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Step 1</Text>
          </View>

          <Text style={styles.title}>Tell us about{'\n'}yourself</Text>
          <Text style={styles.subtitle}>
            This helps us connect you with the right people and resources. Are you moving alone, with a partner, or with family?
          </Text>

          <TextInput
            style={styles.textArea}
            placeholder="I just moved to Melbourne with my family. We're looking for..."
            placeholderTextColor={colors.textTertiary}
            value={bio}
            onChangeText={setBio}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[
              styles.voiceButton,
              isRecording && styles.voiceButtonActive,
              hasRecorded && !isRecording && styles.voiceButtonDone,
            ]}
            onPress={handleVoicePress}
            activeOpacity={0.7}
          >
            <View style={[
              styles.micCircle,
              isRecording && styles.micCircleActive,
              hasRecorded && !isRecording && styles.micCircleDone,
            ]}>
              <Text style={styles.micIcon}>
                {isRecording ? '\u23F9' : hasRecorded ? '\u2713' : '\uD83C\uDF99\uFE0F'}
              </Text>
            </View>
            <View style={styles.voiceTextWrap}>
              <Text style={styles.voiceLabel}>
                {isRecording ? 'Recording...' : hasRecorded ? 'Transcribed' : 'Tell us in your own words'}
              </Text>
              <Text style={styles.voiceDesc}>
                {isRecording ? 'Tap to stop' : hasRecorded ? 'Tap to re-record' : 'Tap to record a voice message'}
              </Text>
            </View>
          </TouchableOpacity>

          {isRecording && (
            <View style={styles.waveform}>
              {Array.from({ length: 20 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveBar,
                    { height: 8 + Math.random() * 24 },
                  ]}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[shared.button, !bio.trim() && shared.buttonDisabled]}
            disabled={!bio.trim()}
            onPress={() => router.push('/profiles')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                shared.buttonText,
                !bio.trim() && shared.buttonTextDisabled,
              ]}
            >
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
    paddingTop: 16,
    paddingBottom: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.text,
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fdfcfc',
    letterSpacing: 0.1,
  },
  title: {
    fontSize: 36,
    fontWeight: '300',
    fontFamily: fonts.display,
    color: colors.text,
    letterSpacing: -0.72,
    lineHeight: 36 * 1.13,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    letterSpacing: 0.1,
    marginBottom: 24,
  },
  textArea: {
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    lineHeight: 24,
    letterSpacing: 0.1,
    // Hairline shadow instead of border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  voiceButtonActive: {
    borderWidth: 1,
    borderColor: '#E53935',
    backgroundColor: '#FFF5F5',
  },
  voiceButtonDone: {
    borderWidth: 1,
    borderColor: colors.selectedBorder,
    backgroundColor: colors.selectedBg,
  },
  micCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.selectedBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micCircleActive: {
    backgroundColor: '#FFCDD2',
  },
  micCircleDone: {
    backgroundColor: colors.text,
  },
  micIcon: {
    fontSize: 22,
  },
  voiceTextWrap: {
    flex: 1,
    gap: 2,
  },
  voiceLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    letterSpacing: 0.1,
  },
  voiceDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    marginTop: 16,
    height: 40,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: '#E53935',
    opacity: 0.6,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
});
