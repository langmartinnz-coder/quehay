import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useApp } from '../../store/AppContext';
import { getEventsNearLocation, getDistanceKm, formatDateRange } from '../../data/mockData';
import { Colors } from '../../constants/colors';
import { RADIUS_OPTIONS, SIZE_CONFIG } from '../../constants/categories';
import HostDemandAlert from '../../components/HostDemandAlert';
import HostEventRow from '../../components/HostEventRow';
import WeeklyDigest from '../../components/WeeklyDigest';
import { Event } from '../../types';

export default function HostDashboard() {
  const { hostProperty, setHostProperty } = useApp();
  const [radius, setRadius] = useState(hostProperty?.radiusKm ?? 50);

  const nearbyEvents = useMemo(() => {
    if (!hostProperty) return [];
    return getEventsNearLocation(
      hostProperty.coordinates.latitude,
      hostProperty.coordinates.longitude,
      radius,
    );
  }, [hostProperty, radius]);

  const bigEvents = nearbyEvents.filter((e) => e.size === 'grande' || e.size === 'mediano');
  const highDemandWeekends = nearbyEvents.filter((e) => e.size === 'grande');

  const totalEstimatedVisitors = nearbyEvents.reduce((sum, e) => {
    if (e.size === 'grande') return sum + 5000;
    if (e.size === 'mediano') return sum + 1000;
    return sum + 150;
  }, 0);

  if (!hostProperty) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.setupPrompt}>
          <Text style={styles.setupEmoji}>🏠</Text>
          <Text style={styles.setupTitle}>Configura tu propiedad</Text>
          <Text style={styles.setupText}>
            Añade tu alojamiento para ver eventos cercanos y alertas de demanda.
          </Text>
          <TouchableOpacity
            style={styles.setupBtn}
            onPress={() => router.push('/host/configurar')}
          >
            <Text style={styles.setupBtnText}>Configurar ahora →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Property header */}
        <View style={styles.propertyCard}>
          <View style={styles.propLeft}>
            <Text style={styles.propEmoji}>🏠</Text>
            <View>
              <Text style={styles.propName}>{hostProperty.name}</Text>
              <Text style={styles.propLocation}>
                📍 {hostProperty.town}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push('/host/configurar')}
          >
            <Text style={styles.editBtnText}>Editar</Text>
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard emoji="📅" value={nearbyEvents.length.toString()} label="Eventos próximos" />
          <StatCard emoji="👥" value={`~${formatNumber(totalEstimatedVisitors)}`} label="Visitantes estimados" />
          <StatCard emoji="🔴" value={highDemandWeekends.length.toString()} label="Alta demanda" />
        </View>

        {/* Radius selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Radio de búsqueda</Text>
          <View style={styles.radiusRow}>
            {RADIUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.km}
                style={[styles.radiusChip, radius === opt.km && styles.radiusChipActive]}
                onPress={() => setRadius(opt.km)}
              >
                <Text
                  style={[styles.radiusText, radius === opt.km && styles.radiusTextActive]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Demand alerts */}
        {bigEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚨 Alertas de demanda</Text>
            {bigEvents.slice(0, 3).map((event) => {
              const dist = getDistanceKm(
                hostProperty.coordinates.latitude,
                hostProperty.coordinates.longitude,
                event.coordinates.latitude,
                event.coordinates.longitude,
              );
              return (
                <HostDemandAlert
                  key={event.id}
                  event={event}
                  distanceKm={dist}
                  onPress={() => router.push(`/evento/${event.id}`)}
                />
              );
            })}
          </View>
        )}

        {/* Pricing tips */}
        {highDemandWeekends.length > 0 && (
          <View style={styles.pricingCard}>
            <Text style={styles.pricingTitle}>💰 Consejo de precios</Text>
            <Text style={styles.pricingText}>
              Hay {highDemandWeekends.length} gran{highDemandWeekends.length > 1 ? 'des eventos' : ' evento'} próximamente en tu zona.
              Considera ajustar tus tarifas para los siguientes fines de semana:
            </Text>
            {highDemandWeekends.slice(0, 3).map((event) => (
              <View key={event.id} style={styles.pricingItem}>
                <Text style={styles.pricingItemDate}>
                  🗓 {formatDateRange(event.dateStart, event.dateEnd)}
                </Text>
                <View style={styles.pricingBadge}>
                  <Text style={styles.pricingBadgeText}>+20-40% recomendado</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Weekly digest */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Digest semanal</Text>
        </View>
        <WeeklyDigest events={nearbyEvents} />

        {/* All nearby events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Todos los eventos ({nearbyEvents.length})
          </Text>
        </View>
        {nearbyEvents.length === 0 ? (
          <View style={styles.noEvents}>
            <Text style={styles.noEventsText}>
              Sin eventos en un radio de {radius} km. Amplía el radio de búsqueda.
            </Text>
          </View>
        ) : (
          nearbyEvents.map((event) => {
            const dist = getDistanceKm(
              hostProperty.coordinates.latitude,
              hostProperty.coordinates.longitude,
              event.coordinates.latitude,
              event.coordinates.longitude,
            );
            return (
              <HostEventRow
                key={event.id}
                event={event}
                distanceKm={dist}
                onPress={() => router.push(`/evento/${event.id}`)}
              />
            );
          })
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ emoji, value, label }: { emoji: string; value: string; label: string }) {
  return (
    <View style={scStyles.card}>
      <Text style={scStyles.emoji}>{emoji}</Text>
      <Text style={scStyles.value}>{value}</Text>
      <Text style={scStyles.label}>{label}</Text>
    </View>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

const scStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  emoji: { fontSize: 22 },
  value: { fontSize: 22, fontWeight: '800', color: Colors.text },
  label: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center', fontWeight: '600' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  propertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3E5F5',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8E44AD',
  },
  propLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  propEmoji: { fontSize: 32 },
  propName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  propLocation: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  editBtn: {
    backgroundColor: '#8E44AD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editBtnText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  section: { paddingHorizontal: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  radiusRow: { flexDirection: 'row', gap: 8 },
  radiusChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  radiusChipActive: { backgroundColor: '#8E44AD', borderColor: '#8E44AD' },
  radiusText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  radiusTextActive: { color: Colors.white },
  pricingCard: {
    backgroundColor: '#FFFBF0',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondaryLight,
    gap: 8,
  },
  pricingTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  pricingText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  pricingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pricingItemDate: { fontSize: 13, color: Colors.text, fontWeight: '600' },
  pricingBadge: {
    backgroundColor: Colors.secondaryLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pricingBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  noEvents: { marginHorizontal: 16, padding: 20, backgroundColor: Colors.surface, borderRadius: 12, alignItems: 'center' },
  noEventsText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  setupPrompt: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  setupEmoji: { fontSize: 64 },
  setupTitle: { fontSize: 24, fontWeight: '800', color: Colors.text },
  setupText: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  setupBtn: { backgroundColor: '#8E44AD', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32, marginTop: 8 },
  setupBtnText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
});
