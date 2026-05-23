import { useLocalSearchParams, router } from 'expo-router';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, shared } from '@/constants/onboarding-styles';
import { CATEGORIES, type PlanItem } from '@/constants/plan-data';

const SEARCH_HINTS: Record<string, string> = {
  people: 'Search for people nearby...',
  events: 'Search for events...',
  communities: 'Find communities...',
  requests: 'What do you need help with?',
};

const DISCOVER_LABELS: Record<string, string> = {
  people: 'Find more people',
  events: 'Discover more events',
  communities: 'Explore more communities',
  requests: 'Get help with something else',
};

function ExploreItemCard({
  item,
  categoryId,
}: {
  item: PlanItem;
  categoryId: string;
}) {
  const handleAction = () => {
    switch (categoryId) {
      case 'people': {
        const mailto = `mailto:${item.email}?subject=${encodeURIComponent(
          item.emailSubject || '',
        )}&body=${encodeURIComponent(item.emailBody || '')}`;
        Linking.openURL(mailto);
        break;
      }
      case 'events':
        item.eventUrl && Linking.openURL(item.eventUrl);
        break;
      case 'communities':
        item.groupUrl && Linking.openURL(item.groupUrl);
        break;
      case 'requests':
        item.resourceUrl && Linking.openURL(item.resourceUrl);
        break;
    }
  };

  const actionLabel = (() => {
    switch (categoryId) {
      case 'people':
        return 'Connect';
      case 'events':
        return 'View';
      case 'communities':
        return 'Open';
      case 'requests':
        return 'View guide';
      default:
        return 'View';
    }
  })();

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.labelRow}>
            <Text style={styles.itemLabel}>{item.label}</Text>
            {item.isContact && (
              <View style={styles.contactBadge}>
                <Text style={styles.contactBadgeText}>Contact</Text>
              </View>
            )}
          </View>
          <Text style={styles.itemDetail} numberOfLines={2}>
            {item.detail}
          </Text>
          {item.date && (
            <Text style={styles.itemMeta}>
              {item.date} — {item.location}
            </Text>
          )}
          {item.platform && (
            <Text style={styles.itemMeta}>{item.platform}</Text>
          )}
          {item.provider && (
            <Text style={styles.itemMeta}>via {item.provider}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.actionPill}
          onPress={handleAction}
          activeOpacity={0.7}
        >
          <Text style={styles.actionPillText}>{actionLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ExploreDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const category = CATEGORIES.find((c) => c.id === id);

  if (!category) return null;

  return (
    <SafeAreaView style={shared.safe}>
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.backBtn}
          >
            <Text style={styles.backIcon}>{'\u2039'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.icon}>{category.icon}</Text>
          <Text style={styles.title}>{category.title}</Text>
          <Text style={styles.subtitle}>{category.summary}</Text>

          {/* Search bar */}
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>{'🔍'}</Text>
            <TextInput
              style={styles.searchInput}
              placeholder={SEARCH_HINTS[category.id] || 'Search...'}
              placeholderTextColor={colors.textTertiary}
              editable={false}
            />
          </View>

          {/* Existing items */}
          <Text style={styles.sectionLabel}>Found for you</Text>
          <View style={styles.itemList}>
            {category.items.map((item, i) => (
              <ExploreItemCard key={i} item={item} categoryId={category.id} />
            ))}
          </View>

          {/* Discover more */}
          <TouchableOpacity style={styles.discoverBtn} activeOpacity={0.7}>
            <Text style={styles.discoverPlus}>+</Text>
            <Text style={styles.discoverText}>
              {DISCOVER_LABELS[category.id] || 'Discover more'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
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
  backBtn: { alignSelf: 'flex-start', padding: 4 },
  backIcon: { fontSize: 32, color: colors.text, lineHeight: 32 },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  icon: { fontSize: 36, marginBottom: 12 },
  title: {
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
  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 24,
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    letterSpacing: 0.1,
  },
  // Section
  sectionLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  // Items
  itemList: { gap: 10, marginBottom: 24 },
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
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    letterSpacing: 0.1,
  },
  contactBadge: {
    backgroundColor: '#e8f5e9',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  contactBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#2e7d32',
  },
  itemDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  itemMeta: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 4,
    letterSpacing: 0.1,
  },
  actionPill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 2,
  },
  actionPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    letterSpacing: 0.1,
  },
  // Discover more
  discoverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 18,
  },
  discoverPlus: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: '300',
  },
  discoverText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});
