import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useApp } from '../../store/AppContext';
import { Colors } from '../../constants/colors';
import EventCard from '../../components/EventCard';
import { useLanguage } from '../../store/LanguageContext';

export default function PerfilScreen() {
  const { t, language, setLanguage } = useLanguage();
  const { favorites, isFavorite, toggleFavorite, events, user, authLoading, signIn, signUp, signOut, signInWithGoogle } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const savedEvents = favorites
    .map((id) => events.find((e) => e.id === id))
    .filter(Boolean) as NonNullable<typeof events[number]>[];

  async function handleSignIn() {
    if (!email || !password) return;
    setAuthSubmitting(true);
    setAuthError(null);
    const { error } = await signIn(email, password);
    setAuthSubmitting(false);
    if (error) setAuthError(error);
  }

  async function handleSignUp() {
    if (!email || !password) return;
    setAuthSubmitting(true);
    setAuthError(null);
    const { error } = await signUp(email, password);
    setAuthSubmitting(false);
    if (error) {
      setAuthError(error);
    } else {
      setAuthError(t.signUpConfirmEmail);
    }
  }

  async function handleOAuth() {
    setOauthLoading(true);
    setAuthError(null);
    const { error } = await signInWithGoogle();
    setOauthLoading(false);
    if (error) setAuthError(error);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t.profileTitle}</Text>
        </View>

        {/* Auth section */}
        <View style={styles.section}>
          {authLoading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : user ? (
            <View style={styles.authCard}>
              <View style={styles.authRow}>
                <Text style={styles.authEmoji}>👤</Text>
                <View style={styles.authInfo}>
                  <Text style={styles.authTitle}>{t.accountConnected}</Text>
                  <Text style={styles.authEmail} numberOfLines={1}>{user.email}</Text>
                </View>
                <View style={styles.syncBadge}>
                  <Text style={styles.syncBadgeText}>{t.syncBadge}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
                <Text style={styles.signOutBtnText}>{t.signOut}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.authCard}>
              <Text style={styles.authCardTitle}>{t.signInTitle}</Text>
              <Text style={styles.authCardSub}>{t.signInSubtitle}</Text>

              {/* ── Google ── */}
              <TouchableOpacity
                style={[styles.oauthBtn, styles.oauthBtnGoogle, oauthLoading && { opacity: 0.6 }]}
                onPress={handleOAuth}
                disabled={oauthLoading || authSubmitting}
              >
                <View style={styles.googleIcon}>
                  <View style={styles.googleQ1} />
                  <View style={styles.googleQ2} />
                  <View style={styles.googleQ3} />
                  <View style={styles.googleQ4} />
                </View>
                <Text style={styles.oauthBtnGoogleText}>{t.continueWithGoogle}</Text>
              </TouchableOpacity>

              {/* ── Divider ── */}
              <View style={styles.orRow}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>{t.orDivider}</Text>
                <View style={styles.orLine} />
              </View>

              {/* ── Email / password ── */}
              <Text style={styles.emailSectionLabel}>{t.signInWithEmail}</Text>
              <TextInput
                style={styles.authInput}
                value={email}
                onChangeText={setEmail}
                placeholder={t.emailPlaceholder}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={Colors.textLight}
              />
              <TextInput
                style={styles.authInput}
                value={password}
                onChangeText={setPassword}
                placeholder={t.passwordPlaceholder}
                secureTextEntry
                placeholderTextColor={Colors.textLight}
              />
              {authError ? <Text style={styles.authError}>{authError}</Text> : null}
              <View style={styles.authBtns}>
                <TouchableOpacity
                  style={[styles.authBtn, styles.authBtnPrimary, authSubmitting && { opacity: 0.6 }]}
                  onPress={handleSignIn}
                  disabled={authSubmitting || oauthLoading}
                >
                  {authSubmitting
                    ? <ActivityIndicator color={Colors.white} size="small" />
                    : <Text style={styles.authBtnPrimaryText}>{t.signInBtn}</Text>}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.authBtn, styles.authBtnSecondary, authSubmitting && { opacity: 0.6 }]}
                  onPress={handleSignUp}
                  disabled={authSubmitting || oauthLoading}
                >
                  <Text style={styles.authBtnSecondaryText}>{t.signUpBtn}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Saved events */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t.savedEventsLabel} {savedEvents.length > 0 && `(${savedEvents.length})`}
          </Text>
          {savedEvents.length === 0 ? (
            <View style={styles.emptyFav}>
              <Text style={styles.emptyFavEmoji}>🤍</Text>
              <Text style={styles.emptyFavText}>{t.emptyFavorites}</Text>
            </View>
          ) : (
            savedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isFavorite={isFavorite(event.id)}
                onFavoriteToggle={() => toggleFavorite(event.id)}
                onPress={() => router.push(`/evento/${event.id}`)}
              />
            ))
          )}
        </View>

        {/* Info / about */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.infoLabel}</Text>
          <View style={styles.infoCard}>
            {[
              { emoji: '🗺️', text: t.infoRegion },
              { emoji: '📅', text: t.infoUpdated },
              { emoji: '📱', text: t.infoSources },
              { emoji: '📤', text: t.infoShare },
            ].map((item, i) => (
              <View key={i} style={styles.infoRow}>
                <Text style={styles.infoEmoji}>{item.emoji}</Text>
                <Text style={styles.infoText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Language settings */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.settingsLabel}</Text>
          <View style={styles.langCard}>
            <Text style={styles.langCardLabel}>🌐 {t.languageLabel}</Text>
            <View style={styles.langToggle}>
              <TouchableOpacity
                style={[styles.langBtn, language === 'es' && styles.langBtnActive]}
                onPress={() => setLanguage('es')}
              >
                <Text style={[styles.langBtnText, language === 'es' && styles.langBtnTextActive]}>
                  🇪🇸 ES
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
                onPress={() => setLanguage('en')}
              >
                <Text style={[styles.langBtnText, language === 'en' && styles.langBtnTextActive]}>
                  🇬🇧 EN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langBtn, language === 'ca' && styles.langBtnActive]}
                onPress={() => setLanguage('ca')}
              >
                <Text style={[styles.langBtnText, language === 'ca' && styles.langBtnTextActive]}>
                  🏴󠁥󠁳󠁣󠁴󠁿 CA
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.version}>{t.appVersion}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  authCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  authRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  authEmoji: { fontSize: 32 },
  authInfo: { flex: 1 },
  authTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  authEmail: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  syncBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  syncBadgeText: { fontSize: 11, fontWeight: '700', color: '#2E7D32' },
  signOutBtn: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  signOutBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  authCardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  authCardSub: { fontSize: 13, color: Colors.textSecondary },
  authInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
  },
  authError: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  authBtns: { flexDirection: 'row', gap: 10 },
  authBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authBtnPrimary: { backgroundColor: Colors.primary },
  authBtnPrimaryText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  authBtnSecondary: { backgroundColor: Colors.surfaceVariant, borderWidth: 1, borderColor: Colors.border },
  authBtnSecondaryText: { color: Colors.text, fontWeight: '700', fontSize: 14 },

  // OAuth buttons
  oauthBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 13, borderRadius: 12, gap: 10,
  },
  oauthBtnGoogle: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  oauthBtnGoogleText: { fontSize: 15, fontWeight: '600', color: Colors.text },
  // Google 4-colour quadrant icon
  googleIcon: {
    width: 20, height: 20, borderRadius: 10,
    overflow: 'hidden', flexDirection: 'row', flexWrap: 'wrap',
  },
  googleQ1: { width: 10, height: 10, backgroundColor: '#4285F4' },
  googleQ2: { width: 10, height: 10, backgroundColor: '#EA4335' },
  googleQ3: { width: 10, height: 10, backgroundColor: '#34A853' },
  googleQ4: { width: 10, height: 10, backgroundColor: '#FBBC05' },

  // Divider
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 2 },
  orLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  orText: { fontSize: 12, fontWeight: '600', color: Colors.textLight },

  emailSectionLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  emptyFav: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyFavEmoji: { fontSize: 36 },
  emptyFavText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoEmoji: { fontSize: 18, width: 24 },
  infoText: { fontSize: 13, color: Colors.textSecondary, flex: 1, lineHeight: 18 },
  version: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.textLight,
    paddingBottom: 20,
  },
  langCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  langCardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  langToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  langBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  langBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  langBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  langBtnTextActive: {
    color: Colors.white,
  },
});
