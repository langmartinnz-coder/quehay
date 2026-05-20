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
import ModeSwitch from '../../components/ModeSwitch';
import EventCard from '../../components/EventCard';

export default function PerfilScreen() {
  const { mode, setMode, favorites, isFavorite, toggleFavorite, events, user, authLoading, signIn, signUp, signOut } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
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
      setAuthError('Revisa tu email para confirmar tu cuenta y luego inicia sesión.');
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mi perfil</Text>
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
                  <Text style={styles.authTitle}>Cuenta conectada</Text>
                  <Text style={styles.authEmail} numberOfLines={1}>{user.email}</Text>
                </View>
                <View style={styles.syncBadge}>
                  <Text style={styles.syncBadgeText}>✓ Sync</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
                <Text style={styles.signOutBtnText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.authCard}>
              <Text style={styles.authCardTitle}>Inicia sesión</Text>
              <Text style={styles.authCardSub}>Sincroniza tus favoritos en todos tus dispositivos</Text>
              <TextInput
                style={styles.authInput}
                value={email}
                onChangeText={setEmail}
                placeholder="tu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={Colors.textLight}
              />
              <TextInput
                style={styles.authInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Contraseña"
                secureTextEntry
                placeholderTextColor={Colors.textLight}
              />
              {authError ? <Text style={styles.authError}>{authError}</Text> : null}
              <View style={styles.authBtns}>
                <TouchableOpacity
                  style={[styles.authBtn, styles.authBtnPrimary, authSubmitting && { opacity: 0.6 }]}
                  onPress={handleSignIn}
                  disabled={authSubmitting}
                >
                  {authSubmitting
                    ? <ActivityIndicator color={Colors.white} size="small" />
                    : <Text style={styles.authBtnPrimaryText}>Entrar</Text>}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.authBtn, styles.authBtnSecondary, authSubmitting && { opacity: 0.6 }]}
                  onPress={handleSignUp}
                  disabled={authSubmitting}
                >
                  <Text style={styles.authBtnSecondaryText}>Crear cuenta</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Mode switch */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Modo de uso</Text>
          <View style={styles.modeSwitchWrap}>
            <ModeSwitch mode={mode} onChange={setMode} />
          </View>
          <Text style={styles.modeDesc}>
            {mode === 'viajero'
              ? '🧭 Modo Viajero: descubre eventos y festividades cerca de ti o en tu destino.'
              : '🏠 Modo Anfitrión: gestiona tu alojamiento y anticipa la demanda turística.'}
          </Text>
        </View>

        {/* Host panel link */}
        {mode === 'anfitrion' && (
          <TouchableOpacity
            style={styles.hostCard}
            onPress={() => router.push('/host')}
          >
            <View style={styles.hostCardLeft}>
              <Text style={styles.hostCardEmoji}>🏠</Text>
              <View>
                <Text style={styles.hostCardTitle}>Panel Anfitrión</Text>
                <Text style={styles.hostCardSub}>Gestión de eventos y demanda</Text>
              </View>
            </View>
            <Text style={styles.hostCardArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Saved events */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Eventos guardados {savedEvents.length > 0 && `(${savedEvents.length})`}
          </Text>
          {savedEvents.length === 0 ? (
            <View style={styles.emptyFav}>
              <Text style={styles.emptyFavEmoji}>🤍</Text>
              <Text style={styles.emptyFavText}>
                Guarda eventos tocando el corazón en las tarjetas
              </Text>
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
          <Text style={styles.sectionLabel}>Información</Text>
          <View style={styles.infoCard}>
            {[
              { emoji: '🗺️', text: 'Cubrimos Teruel y Catalunya' },
              { emoji: '📅', text: 'Actualizado diariamente' },
              { emoji: '📱', text: 'Eventos de WhatsApp, Facebook, Instagram, Milanuncios y Ayuntamientos' },
              { emoji: '📤', text: 'Comparte eventos de tu pueblo en la pestaña ➕' },
            ].map((item, i) => (
              <View key={i} style={styles.infoRow}>
                <Text style={styles.infoEmoji}>{item.emoji}</Text>
                <Text style={styles.infoText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.version}>QuéHay v1.0 · Hecho con ❤️ para el turismo rural</Text>
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
  },
  signOutBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  authCardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  authCardSub: { fontSize: 13, color: Colors.textSecondary },
  authInput: {
    backgroundColor: Colors.background,
    borderRadius: 10,
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
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authBtnPrimary: { backgroundColor: Colors.primary },
  authBtnPrimaryText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  authBtnSecondary: { backgroundColor: Colors.surfaceVariant },
  authBtnSecondaryText: { color: Colors.text, fontWeight: '700', fontSize: 14 },
  modeSwitchWrap: { marginBottom: 10 },
  modeDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3E5F5',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#8E44AD',
  },
  hostCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hostCardEmoji: { fontSize: 32 },
  hostCardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  hostCardSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  hostCardArrow: { fontSize: 24, color: '#8E44AD' },
  emptyFav: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  emptyFavEmoji: { fontSize: 36 },
  emptyFavText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
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
});
