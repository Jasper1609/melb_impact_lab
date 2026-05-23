import { LinearGradient } from "expo-linear-gradient";
import { Image, type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";
import type { GradientPreset } from "@/constants/gradients";

const noiseTexture = require("@/assets/images/noise-texture.png");

type Props = {
  preset: GradientPreset;
  style?: StyleProp<ViewStyle>;
  noiseOpacity?: number;
  borderRadius?: number;
};

/**
 * Noise-textured gradient surface.
 * Layers a tiled grain texture over a multi-stop linear gradient
 * for that analog, tactile quality inspired by ElevenLabs.
 */
export function NoiseGradient({ preset, style, noiseOpacity = 0.06, borderRadius = 0 }: Props) {
  return (
    <View style={[styles.container, { borderRadius }, style]}>
      <LinearGradient
        colors={[...preset.colors]}
        start={preset.start}
        end={preset.end}
        locations={preset.locations ? [...preset.locations] : undefined}
        style={StyleSheet.absoluteFill}
      />
      <Image
        source={noiseTexture}
        resizeMode="repeat"
        style={[StyleSheet.absoluteFill, { opacity: noiseOpacity }]}
      />
    </View>
  );
}

/**
 * Circular gradient orb — for hero elements and loading states.
 */
export function GradientOrb({
  preset,
  size,
  style,
  noiseOpacity = 0.05,
}: {
  preset: GradientPreset;
  size: number;
  style?: StyleProp<ViewStyle>;
  noiseOpacity?: number;
}) {
  return (
    <NoiseGradient
      preset={preset}
      noiseOpacity={noiseOpacity}
      borderRadius={size / 2}
      style={[{ width: size, height: size }, style]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
});
