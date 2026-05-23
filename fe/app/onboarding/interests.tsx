import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { shared, colors } from '@/constants/onboarding-styles';

const options = [
  { id: 'friends', label: 'Find a friend', desc: 'Meet people near you' },
  { id: 'events', label: 'Events', desc: 'Local happenings and government events' },
  { id: 'groups', label: 'Community Groups', desc: 'Messages, local events, and businesses' },
  { id: 'settling-in', label: 'Settling In', desc: 'Phone numbers, daycares, and family moving plans' },
];

export default function InterestsScreen() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <SafeAreaView style={shared.safe}>
      <View style={shared.container}>
        <View>
          <View style={shared.header}>
            <TouchableOpacity style={shared.backButton} onPress={() => router.back()}>
              <Text style={shared.backText}>{'\u2190'}</Text>
            </TouchableOpacity>
          </View>
          <View style={shared.content}>
          <Text style={shared.stepLabel}>Step 7 of 7</Text>
          <Text style={shared.title}>What are you{'\n'}looking for?</Text>
          <Text style={shared.subtitle}>
            Pick as many as you like. You can change this later.
          </Text>

          <View style={styles.options}>
            {options.map((opt) => {
              const active = selected.includes(opt.id);
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.option, active && styles.optionSelected]}
                  onPress={() => toggle(opt.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionLabel, active && styles.optionLabelSelected]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.optionDesc}>{opt.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          </View>
        </View>

        <TouchableOpacity
          style={[shared.button, selected.length === 0 && shared.buttonDisabled]}
          disabled={selected.length === 0}
          onPress={() => router.push('/loading')}
          activeOpacity={0.8}
        >
          <Text style={[shared.buttonText, selected.length === 0 && shared.buttonTextDisabled]}>
            Finish
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: 12,
    marginTop: 4,
  },
  option: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  optionSelected: {
    borderColor: colors.selectedBorder,
    backgroundColor: colors.selectedBg,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  optionLabelSelected: {
    color: colors.text,
  },
  optionDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
