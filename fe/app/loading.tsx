import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fonts } from '@/constants/onboarding-styles';
import { GradientOrb } from '@/components/NoiseGradient';
import { softDawn } from '@/constants/gradients';

const steps = [
  'Analysing your interests...',
  'Finding your neighbourhood...',
  'Building your plan...',
];

export default function LoadingScreen() {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [stepIndex, setStepIndex] = useState(0);

  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    const stepTimer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 1200);

    const navTimer = setTimeout(() => {
      router.replace('/bio');
    }, 3800);

    return () => {
      clearInterval(stepTimer);
      clearTimeout(navTimer);
    };
  }, [spinAnim, pulseAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.orbWrapper,
            {
              opacity: pulseAnim,
              transform: [
                { scale: pulseAnim.interpolate({
                    inputRange: [0.6, 1],
                    outputRange: [0.92, 1.05],
                  }),
                },
              ],
            },
          ]}
        >
          <GradientOrb preset={softDawn} size={120} />
        </Animated.View>

        <Text style={styles.title}>Creating your next steps</Text>
        <Text style={styles.step}>{steps[stepIndex]}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },
  orbWrapper: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    fontFamily: fonts.display,
    color: colors.text,
    letterSpacing: -0.64,
    lineHeight: 32 * 1.17,
  },
  step: {
    fontSize: 16,
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },
});
