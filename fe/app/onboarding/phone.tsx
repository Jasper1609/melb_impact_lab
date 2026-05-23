import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { shared, colors } from '@/constants/onboarding-styles';

export default function PhoneScreen() {
  const [phone, setPhone] = useState('+61 400 000 000');

  return (
    <SafeAreaView style={shared.safe}>
      <KeyboardAvoidingView
        style={shared.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View>
          <View style={shared.header}>
            <TouchableOpacity style={shared.backButton} onPress={() => router.back()}>
              <Text style={shared.backText}>{'\u2190'}</Text>
            </TouchableOpacity>
          </View>
          <View style={shared.content}>
          <Text style={shared.stepLabel}>Step 3 of 7</Text>
          <Text style={shared.title}>Your phone{'\n'}number</Text>
          <Text style={shared.subtitle}>
            We'll send you a verification code.
          </Text>

          <TextInput
            style={shared.input}
            placeholder="+61 400 000 000"
            placeholderTextColor={colors.textTertiary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoFocus
          />
          </View>
        </View>

        <TouchableOpacity
          style={[shared.button, !phone.trim() && shared.buttonDisabled]}
          disabled={!phone.trim()}
          onPress={() => router.push('/onboarding/email')}
          activeOpacity={0.8}
        >
          <Text style={[shared.buttonText, !phone.trim() && shared.buttonTextDisabled]}>
            Continue
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
