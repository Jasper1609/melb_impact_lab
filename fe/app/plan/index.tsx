import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { shared, colors, fonts } from '@/constants/onboarding-styles';
import { CATEGORIES, type PlanCategory } from '@/constants/plan-data';
import { NoiseGradient } from '@/components/NoiseGradient';
import { categoryGradients, warmGlow } from '@/constants/gradients';

type CardState = 'empty' | 'working' | 'complete';

const STAGGER_MS = 1200;
const WORK_DURATION_MS = 1800;

function PlanCard({
  category,
  index,
  onComplete,
}: {
  category: PlanCategory;
  index: number;
  onComplete: () => void;
}) {
  const [state, setState] = useState<CardState>('empty');
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const revealAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startDelay = index * STAGGER_MS;

    const workTimer = setTimeout(() => {
      setState('working');
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, startDelay);

    const completeTimer = setTimeout(() => {
      setState('complete');
      pulseAnim.stopAnimation();
      Animated.timing(revealAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
      onComplete();
    }, startDelay + WORK_DURATION_MS);

    return () => {
      clearTimeout(workTimer);
      clearTimeout(completeTimer);
    };
  }, [index, pulseAnim, revealAnim, onComplete]);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({ pathname: '/plan/[id]', params: { id: category.id } })
      }
      activeOpacity={state === 'complete' ? 0.7 : 1}
      disabled={state !== 'complete'}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{category.icon}</Text>
        <Text style={styles.cardTitle}>{category.title}</Text>
        {state === 'complete' && (
          <View style={styles.doneBadge}>
            <Text style={styles.doneBadgeText}>{'\u2713'}</Text>
          </View>
        )}
      </View>

      {state === 'empty' && (
        <View style={styles.emptyBody}>
          <View style={styles.emptyLine} />
          <View style={[styles.emptyLine, { width: '60%' }]} />
        </View>
      )}

      {state === 'working' && (
        <View style={styles.workingBody}>
          <Animated.View style={[styles.workingBar, { opacity: pulseAnim }]}>
            <NoiseGradient
              preset={categoryGradients[category.id] ?? warmGlow}
              borderRadius={2}
              noiseOpacity={0.04}
              style={{ flex: 1 }}
            />
          </Animated.View>
          <Text style={styles.workingLabel}>{category.scanLabel}</Text>
        </View>
      )}

      {state === 'complete' && (
        <Animated.View style={[styles.completeBody, { opacity: revealAnim }]}>
          <Text style={styles.summaryText}>{category.summary}</Text>
          <View style={styles.exploreRow}>
            <Text style={styles.exploreText}>Explore</Text>
            <Text style={styles.exploreArrow}>{'\u203A'}</Text>
          </View>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
}

export default function PlanScreen() {
  const [completedCount, setCompletedCount] = useState(0);
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const allDone = completedCount === CATEGORIES.length;

  useEffect(() => {
    if (allDone) {
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [allDone, buttonAnim]);

  const handleCardComplete = useCallback(() => {
    setCompletedCount((c) => c + 1);
  }, []);

  return (
    <SafeAreaView style={shared.safe}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Step 3</Text>
          </View>

          <Text style={styles.title}>Building your{'\n'}plan</Text>
          <Text style={styles.subtitle}>
            We're scanning your neighbourhood to find the best matches for you
            and your family.
          </Text>

          <View style={styles.cardList}>
            {CATEGORIES.map((cat, i) => (
              <PlanCard
                key={cat.id}
                category={cat}
                index={i}
                onComplete={handleCardComplete}
              />
            ))}
          </View>
        </ScrollView>

        {allDone && (
          <Animated.View
            style={[
              styles.footer,
              {
                opacity: buttonAnim,
                transform: [
                  {
                    translateY: buttonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={shared.button}
              onPress={() =>
                router.push({
                  pathname: '/plan/[id]',
                  params: { id: CATEGORIES[0].id },
                })
              }
              activeOpacity={0.8}
            >
              <Text style={shared.buttonText}>Start step by step</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
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
    marginBottom: 28,
  },
  cardList: {
    gap: 12,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
    letterSpacing: 0.1,
  },
  doneBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBadgeText: {
    color: '#fdfcfc',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyBody: {
    gap: 8,
  },
  emptyLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.selectedBg,
    width: '80%',
  },
  workingBody: {
    gap: 10,
  },
  workingBar: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  workingLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    letterSpacing: 0.1,
  },
  completeBody: {},
  summaryText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  exploreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exploreText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  exploreArrow: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: -1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
});
