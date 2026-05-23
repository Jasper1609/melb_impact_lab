import { StyleSheet } from 'react-native';

export const colors = {
  bg: '#FAFAFA',
  text: '#1A1A1A',
  textSecondary: '#666',
  textTertiary: '#999',
  border: '#E0E0E0',
  buttonActive: '#1A1A1A',
  buttonDisabled: '#F0F0F0',
  buttonTextDisabled: '#BCBCBC',
  accent: '#1A1A1A',
  cardBg: '#FFFFFF',
  selectedBorder: '#1A1A1A',
  selectedBg: '#F5F5F5',
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
    fontSize: 13,
    fontWeight: '500',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  input: {
    fontSize: 17,
    color: colors.text,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
    paddingVertical: 12,
  },
  button: {
    backgroundColor: colors.buttonActive,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center' as const,
  },
  buttonDisabled: {
    backgroundColor: colors.buttonDisabled,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
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
