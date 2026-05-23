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

export default function NameScreen() {
  const [name, setName] = useState('');

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
          <Text style={shared.stepLabel}>Step 2 of 7</Text>
          <Text style={shared.title}>What's your{'\n'}name?</Text>
          <Text style={shared.subtitle}>
            This is how you'll appear to your neighbours.
          </Text>

          <TextInput
            style={shared.input}
            placeholder="Your name"
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
            autoFocus
          />
          </View>
        </View>

        <TouchableOpacity
          style={[shared.button, !name.trim() && shared.buttonDisabled]}
          disabled={!name.trim()}
          onPress={() => router.push('/onboarding/phone')}
          activeOpacity={0.8}
        >
          <Text style={[shared.buttonText, !name.trim() && shared.buttonTextDisabled]}>
            Continue
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
