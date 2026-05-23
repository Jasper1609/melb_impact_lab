import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fonts } from '@/constants/onboarding-styles';
import { CATEGORIES } from '@/constants/plan-data';

const NEXT_STEPS = [
  {
    icon: '1',
    label: 'Reach out to Minh Tran',
    detail: 'Your closest neighbour from Vietnam',
    categoryId: 'people',
  },
  {
    icon: '2',
    label: 'Attend Welcome Morning Tea',
    detail: 'Sat 7 June, 10:00am — Melbourne Town Hall',
    categoryId: 'events',
  },
  {
    icon: '3',
    label: 'Join Vietnamese Families Melbourne',
    detail: '320 members on Facebook',
    categoryId: 'communities',
  },
  {
    icon: '4',
    label: 'Start school enrolment',
    detail: 'Step-by-step guide on vic.gov.au',
    categoryId: 'requests',
  },
];

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>Your plan</Text>
        <Text style={styles.subtitle}>
          Here's what Tapestry found for you and your family.
        </Text>

        {/* AI Concierge */}
        <TouchableOpacity
          style={styles.conciergeBar}
          onPress={() => router.push('/concierge')}
          activeOpacity={0.7}
        >
          <Text style={styles.conciergeSparkle}>{'\u2728'}</Text>
          <Text style={styles.conciergePlaceholder}>
            Ask Tapestry anything...
          </Text>
          <View style={styles.conciergeSend}>
            <Text style={styles.conciergeSendIcon}>{'\u2191'}</Text>
          </View>
        </TouchableOpacity>

        {/* Next Steps */}
        <Text style={styles.sectionTitle}>Next steps</Text>
        <View style={styles.stepsList}>
          {NEXT_STEPS.map((step, i) => (
            <TouchableOpacity
              key={i}
              style={styles.stepCard}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: '/plan/[id]',
                  params: { id: step.categoryId, from: 'dashboard' },
                })
              }
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
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: '/explore/[id]',
                  params: { id: cat.id },
                })
              }
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
    fontSize: 36,
    fontWeight: '300',
    fontFamily: fonts.display,
    color: colors.text,
    letterSpacing: -0.72,
    lineHeight: 36 * 1.13,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    letterSpacing: 0.1,
    marginBottom: 20,
  },
  // Concierge bar
  conciergeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: 16,
    paddingRight: 6,
    height: 48,
    marginBottom: 28,
  },
  conciergeSparkle: {
    fontSize: 16,
    marginRight: 10,
  },
  conciergePlaceholder: {
    flex: 1,
    fontSize: 15,
    color: colors.textTertiary,
    letterSpacing: 0.1,
  },
  conciergeSend: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conciergeSendIcon: {
    fontSize: 18,
    color: '#fdfcfc',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  // Next steps
  stepsList: {
    gap: 8,
    marginBottom: 32,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    // Hairline shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
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
    fontWeight: '500',
    color: '#fdfcfc',
  },
  stepContent: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  stepDetail: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    letterSpacing: 0.1,
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
    borderRadius: 16,
    padding: 16,
    // Hairline shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  categorySummary: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
});
