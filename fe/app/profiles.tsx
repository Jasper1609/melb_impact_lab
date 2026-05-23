import { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { shared, colors } from '@/constants/onboarding-styles';

interface Profile {
  id: string;
  name: string;
  relation: string;
  detail: string;
  initials: string;
  photo: string | null;
}

const EXTRACTED_PROFILES: Profile[] = [
  {
    id: '1',
    name: 'You',
    relation: 'Primary',
    detail: 'Recently moved from Vietnam, looking for community',
    initials: 'ME',
    photo: null,
  },
  {
    id: '2',
    name: 'Wife',
    relation: 'Partner',
    detail: 'Moving together, family support',
    initials: 'W',
    photo: null,
  },
  {
    id: '3',
    name: 'Child 1',
    relation: 'Child',
    detail: 'Needs primary school enrolment',
    initials: 'C1',
    photo: null,
  },
  {
    id: '4',
    name: 'Child 2',
    relation: 'Child',
    detail: 'Needs primary school enrolment',
    initials: 'C2',
    photo: null,
  },
];

export default function ProfilesScreen() {
  const [profiles, setProfiles] = useState<Profile[]>(EXTRACTED_PROFILES);

  const handleAddPhoto = (id: string) => {
    // Placeholder — would open image picker
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, photo: 'placeholder' } : p
      )
    );
  };

  return (
    <SafeAreaView style={shared.safe}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={shared.header}>
            <TouchableOpacity style={shared.backButton} onPress={() => router.back()}>
              <Text style={shared.backText}>{'\u2190'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>Step 2</Text>
          </View>

          <Text style={styles.title}>Your household</Text>
          <Text style={styles.subtitle}>
            We found {profiles.length} people from your description. Add a photo
            to each profile to help your community recognise you.
          </Text>

          <View style={styles.profileList}>
            {profiles.map((profile) => (
              <View key={profile.id} style={styles.profileCard}>
                <TouchableOpacity
                  style={styles.avatarWrap}
                  onPress={() => handleAddPhoto(profile.id)}
                  activeOpacity={0.7}
                >
                  {profile.photo ? (
                    <View style={[styles.avatar, styles.avatarDone]}>
                      <Text style={styles.avatarCheck}>{'\u2713'}</Text>
                    </View>
                  ) : (
                    <View style={styles.avatar}>
                      <Text style={styles.avatarInitials}>{profile.initials}</Text>
                    </View>
                  )}
                  <View style={styles.cameraButton}>
                    <Text style={styles.cameraIcon}>{profile.photo ? '\u270E' : '\uD83D\uDCF7'}</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.profileInfo}>
                  <View style={styles.profileHeader}>
                    <Text style={styles.profileName}>{profile.name}</Text>
                    <View style={styles.relationBadge}>
                      <Text style={styles.relationText}>{profile.relation}</Text>
                    </View>
                  </View>
                  <Text style={styles.profileDetail}>{profile.detail}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={shared.button}
            onPress={() => router.push('/plan')}
            activeOpacity={0.8}
          >
            <Text style={shared.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.text,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 28,
  },
  profileList: {
    gap: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.selectedBg,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarDone: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  avatarCheck: {
    fontSize: 24,
    color: '#fff',
  },
  cameraButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.cardBg,
  },
  cameraIcon: {
    fontSize: 12,
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  relationBadge: {
    backgroundColor: colors.selectedBg,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  relationText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  profileDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
});
