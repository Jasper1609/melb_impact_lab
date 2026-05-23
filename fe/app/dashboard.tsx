import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors } from '@/constants/onboarding-styles';
import { CATEGORIES } from '@/constants/plan-data';

const NEXT_STEPS = [
  { icon: '1', label: 'Reach out to Minh Tran', detail: 'Your closest neighbour from Vietnam', categoryId: 'people' },
  { icon: '2', label: 'Attend Welcome Morning Tea', detail: 'Sat 7 June, 10:00am — Melbourne Town Hall', categoryId: 'events' },
  { icon: '3', label: 'Join Vietnamese Families Melbourne', detail: '320 members on Facebook', categoryId: 'communities' },
  { icon: '4', label: 'Start school enrolment', detail: 'Step-by-step guide on vic.gov.au', categoryId: 'requests' },
];

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>Your plan</Text>
        <Text style={styles.subtitle}>Here's what Tapestry found for you and your family.</Text>

        {/* Next Steps */}
        <Text style={styles.sectionTitle}>Next steps</Text>
        <View style={styles.stepsList}>
          {NEXT_STEPS.map((step, i) => (
            <TouchableOpacity
              key={i}
              style={styles.stepCard}
              activeOpacity={0.7}
              onPress={() => router.push({ pathname: '/plan/[id]', params: { id: step.categoryId } })}
            >
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{step.icon}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepLabel}>{step.label}</Text>
                <Text style={styles.stepDetail}>{step.detail}</Text>
              </View>
              <Text style={styles.stepArrow}>{'\u203A'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Your categories</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              activeOpacity={0.7}
              onPress={() => router.push({ pathname: '/plan/[id]', params: { id: cat.id } })}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={styles.categoryTitle}>{cat.title}</Text>
              <Text style={styles.categorySummary}>{cat.summary}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  greeting: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  // Next steps
  stepsList: {
    gap: 10,
    marginBottom: 32,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  stepDetail: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  stepArrow: {
    fontSize: 22,
    color: colors.textTertiary,
  },
  // Category grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  categorySummary: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
