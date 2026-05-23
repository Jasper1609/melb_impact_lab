import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { shared, colors, fonts } from '@/constants/onboarding-styles';

const stats = [
  { label: 'People nearby', value: '12,340' },
  { label: 'Households', value: '4,820' },
  { label: 'Median age', value: '34' },
  { label: 'Born overseas', value: '42%' },
];

export default function NeighbourhoodScreen() {
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
          <Text style={shared.stepLabel}>Step 6 of 7</Text>
          <Text style={shared.title}>Your{'\n'}neighbourhood</Text>
          <Text style={shared.subtitle}>
            Here's a snapshot of the community around you.
          </Text>

          <View style={styles.grid}>
            {stats.map((stat) => (
              <View key={stat.label} style={styles.card}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
          </View>
        </View>

        <TouchableOpacity
          style={shared.button}
          onPress={() => router.push('/onboarding/interests')}
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 20,
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '300',
    fontFamily: fonts.display,
    color: colors.text,
    letterSpacing: -0.64,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    letterSpacing: 0.1,
  },
});
