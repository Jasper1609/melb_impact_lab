import { useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { shared, colors, fonts } from '@/constants/onboarding-styles';
import { CATEGORIES, type PlanItem } from '@/constants/plan-data';

/* ──────────────────────────────────────────────
   People — expandable email draft + mailto:
   ────────────────────────────────────────────── */

function PersonCard({
  item,
  expanded,
  onToggle,
}: {
  item: PlanItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  const openMail = () => {
    const mailto = `mailto:${item.email}?subject=${encodeURIComponent(
      item.emailSubject || ''
    )}&body=${encodeURIComponent(item.emailBody || '')}`;
    Linking.openURL(mailto);
  };

  return (
    <View style={styles.itemCard}>
      <View style={styles.personHeader}>
        <Text style={styles.itemLabel}>{item.label}</Text>
        {item.isContact && (
          <View style={styles.contactBadge}>
            <Text style={styles.contactBadgeText}>In your contacts</Text>
          </View>
        )}
      </View>
      <Text style={styles.itemDetail}>{item.detail}</Text>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={styles.actionButtonText}>
          {expanded ? 'Hide draft' : 'Connect via email'}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.emailPreview}>
          <Text style={styles.emailField}>
            <Text style={styles.emailFieldLabel}>To: </Text>
            {item.email}
          </Text>
          <Text style={styles.emailField}>
            <Text style={styles.emailFieldLabel}>Subject: </Text>
            {item.emailSubject}
          </Text>
          <View style={styles.emailDivider} />
          <Text style={styles.emailBody}>{item.emailBody}</Text>
          <TouchableOpacity
            style={[shared.button, styles.sendButton]}
            onPress={openMail}
            activeOpacity={0.8}
          >
            <Text style={shared.buttonText}>Open in Mail</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

/* ──────────────────────────────────────────────
   Events — source badge + external link
   ────────────────────────────────────────────── */

function EventCard({ item }: { item: PlanItem }) {
  return (
    <View style={styles.itemCard}>
      <Text style={styles.itemLabel}>{item.label}</Text>
      <View style={styles.eventMeta}>
        <Text style={styles.eventDate}>{item.date}</Text>
        <Text style={styles.eventDot}>{'\u2022'}</Text>
        <Text style={styles.eventLocation}>{item.location}</Text>
      </View>
      <Text style={styles.itemDetail}>{item.detail}</Text>
      <View style={styles.sourceBadgeRow}>
        <View style={styles.sourceBadge}>
          <Text style={styles.sourceBadgeText}>via {item.source}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => item.eventUrl && Linking.openURL(item.eventUrl)}
        activeOpacity={0.7}
      >
        <Text style={styles.actionButtonText}>
          View on {item.source}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* ──────────────────────────────────────────────
   Communities — platform badge + open link
   ────────────────────────────────────────────── */

function CommunityCard({ item }: { item: PlanItem }) {
  return (
    <View style={styles.itemCard}>
      <Text style={styles.itemLabel}>{item.label}</Text>
      <Text style={styles.itemDetail}>{item.detail}</Text>
      <View style={styles.sourceBadgeRow}>
        <View style={styles.sourceBadge}>
          <Text style={styles.sourceBadgeText}>{item.platform}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => item.groupUrl && Linking.openURL(item.groupUrl)}
        activeOpacity={0.7}
      >
        <Text style={styles.actionButtonText}>Open {item.platform}</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ──────────────────────────────────────────────
   Requests — provider attribution + resource link
   ────────────────────────────────────────────── */

function RequestCard({ item }: { item: PlanItem }) {
  return (
    <View style={styles.itemCard}>
      <Text style={styles.itemLabel}>{item.label}</Text>
      <Text style={styles.itemDetail}>{item.detail}</Text>
      <View style={styles.sourceBadgeRow}>
        <View style={styles.sourceBadge}>
          <Text style={styles.sourceBadgeText}>via {item.provider}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => item.resourceUrl && Linking.openURL(item.resourceUrl)}
        activeOpacity={0.7}
      >
        <Text style={styles.actionButtonText}>View guide</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ──────────────────────────────────────────────
   Detail screen
   ────────────────────────────────────────────── */

export default function PlanDetailScreen() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const categoryIndex = CATEGORIES.findIndex((c) => c.id === id);
  const category = CATEGORIES[categoryIndex];
  const nextCategory = CATEGORIES[categoryIndex + 1];

  if (!category) return null;

  const renderItem = (item: PlanItem, i: number) => {
    switch (category.id) {
      case 'people':
        return (
          <PersonCard
            key={i}
            item={item}
            expanded={expandedIndex === i}
            onToggle={() =>
              setExpandedIndex(expandedIndex === i ? null : i)
            }
          />
        );
      case 'events':
        return <EventCard key={i} item={item} />;
      case 'communities':
        return <CommunityCard key={i} item={item} />;
      case 'requests':
        return <RequestCard key={i} item={item} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={shared.safe}>
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Text style={styles.backText}>{'\u2039'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.icon}>{category.icon}</Text>
          <Text style={styles.title}>{category.title}</Text>
          <Text style={styles.summary}>{category.summary}</Text>

          <View style={styles.itemList}>
            {category.items.map(renderItem)}
          </View>
        </ScrollView>

        {from !== 'dashboard' && (
          <View style={styles.footer}>
            {nextCategory ? (
              <TouchableOpacity
                style={shared.button}
                onPress={() =>
                  router.replace({
                    pathname: '/plan/[id]',
                    params: { id: nextCategory.id },
                  })
                }
                activeOpacity={0.8}
              >
                <Text style={shared.buttonText}>
                  Next: {nextCategory.title} {'\u2192'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={shared.button}
                onPress={() => router.replace('/dashboard')}
                activeOpacity={0.8}
              >
                <Text style={shared.buttonText}>Finish your plan</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    height: 48,
    justifyContent: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 4,
  },
  backText: {
    fontSize: 32,
    color: colors.text,
    lineHeight: 32,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  icon: {
    fontSize: 36,
    marginBottom: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '300',
    fontFamily: fonts.display,
    color: colors.text,
    letterSpacing: -0.72,
    lineHeight: 36 * 1.13,
    marginBottom: 8,
  },
  summary: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    letterSpacing: 0.1,
    marginBottom: 28,
  },
  itemList: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  itemDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  contactBadge: {
    backgroundColor: '#e8f5e9',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  contactBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#2e7d32',
    letterSpacing: 0.1,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBg,
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    letterSpacing: 0.1,
  },

  // Email preview
  emailPreview: {
    marginTop: 16,
    backgroundColor: colors.bg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emailField: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  emailFieldLabel: {
    fontWeight: '500',
    color: colors.text,
  },
  emailDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  emailBody: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  sendButton: {
    marginTop: 14,
  },

  // Event meta
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  eventDot: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  eventLocation: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Source badge
  sourceBadgeRow: {
    marginTop: 10,
    marginBottom: 2,
  },
  sourceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.selectedBg,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sourceBadgeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
});
