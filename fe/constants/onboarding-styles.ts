import { Platform, StyleSheet } from 'react-native';

export const colors = {
  bg: '#fdfcfc',           // Eggshell
  powder: '#f5f3f1',       // Powder surface
  text: '#000000',         // Obsidian
  textSecondary: '#777169', // Gravel
  textTertiary: '#a59f97', // Slate
  border: '#e5e5e5',       // Chalk
  fog: '#b1b0b0',          // Fog — disabled states
  buttonActive: '#000000', // Obsidian
  buttonDisabled: '#f5f3f1', // Powder
  buttonTextDisabled: '#b1b0b0', // Fog
  accent: '#000000',
  cardBg: '#ffffff',       // Card White
  selectedBorder: '#000000',
  selectedBg: '#f5f3f1',   // Powder
};

const displayFont = Platform.select({
  ios: 'ui-serif',
  web: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
  default: 'serif',
});

export const fonts = {
  display: displayFont,
  body: Platform.select({
    ios: 'system-ui',
    web: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    default: 'normal',
  }),
};

export const shared = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    height: 44,
    justifyContent: 'center' as const,
  },
  content: {
    gap: 12,
    marginTop: 16,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  title: {
    fontSize: 36,
    fontWeight: '300',
    fontFamily: displayFont,
    color: colors.text,
    letterSpacing: -0.72,
    lineHeight: 36 * 1.13,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
    letterSpacing: 0.1,
  },
  input: {
    fontSize: 16,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.text,
    paddingVertical: 12,
    paddingHorizontal: 0,
    letterSpacing: 0.1,
  },
  button: {
    backgroundColor: colors.buttonActive,
    borderRadius: 9999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center' as const,
  },
  buttonDisabled: {
    backgroundColor: colors.buttonDisabled,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fdfcfc',
    letterSpacing: 0.1,
  },
  buttonTextDisabled: {
    color: colors.buttonTextDisabled,
  },
  backButton: {
    padding: 4,
    alignSelf: 'flex-start' as const,
  },
  backText: {
    fontSize: 28,
    color: colors.text,
  },
});
