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
import { getDistanceKm, formatDateRange } from '../../data/mockData';
import { Colors } from '../../constants/colors';
import { RADIUS_OPTIONS, SIZE_CONFIG } from '../../constants/categories';
import HostDemandAlert from '../../components/HostDemandAlert';
import HostEventRow from '../../components/HostEventRow';
import WeeklyDigest from '../../components/WeeklyDigest';
import { Event } from '../../types';
import { t } from '../../i18n';

export default function HostDashboard() {
  const { hostProperty, setHostProperty, events } = useApp();
  const [radius, setRadius] = useState(hostProperty?.radiusKm ?? 50);

  const nearbyEvents = useMemo(() => {
    if (!hostProperty) return [];
    return events
      .filter((event) => {
        const dist = getDistanceKm(
          hostProperty.coordinates.latitude,
          hostProperty.coordinates.longitude,
          event.coordinates.latitude,
          event.coordinates.longitude,
        );
        return dist <= radius;
      })
      .sort((a, b) => {
        const dA = getDistanceKm(hostProperty.coordinates.latitude, hostProperty.coordinates.longitude, a.coordinates.latitude, a.coordinates.longitude);
        const dB = getDistanceKm(hostProperty.coordinates.latitude, hostProperty.coordinates.longitude, b.coordinates.latitude, b.coordinates.longitude);
        return dA - dB;
      });
  }, [events, hostProperty, radius]);

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
          <Text style={styles.setupTitle}>{t.hostSetupTitle}</Text>
          <Text style={styles.setupText}>{t.hostSetupText}</Text>
          <TouchableOpacity
            style={styles.setupBtn}
            onPress={() => router.push('/host/configurar')}
          >
            <Text style={styles.setupBtnText}>{t.hostSetupBtn}</Text>
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
            <Text style={styles.editBtnText}>{t.hostEdit}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard emoji="📅" value={nearbyEvents.length.toString()} label={t.hostStatUpcoming} />
          <StatCard emoji="👥" value={`~${formatNumber(totalEstimatedVisitors)}`} label={t.hostStatVisitors} />
          <StatCard emoji="🔴" value={highDemandWeekends.length.toString()} label={t.hostStatHighDemand} />
        </View>

        {/* Radius selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.hostSearchRadius}</Text>
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
            <Text style={styles.sectionTitle}>{t.hostDemandAlerts}</Text>
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
            <Text style={styles.pricingTitle}>{t.hostPricingTitle}</Text>
            <Text style={styles.pricingText}>
              {t.hostPricingText(highDemandWeekends.length)}
            </Text>
            {highDemandWeekends.slice(0, 3).map((event) => (
              <View key={event.id} style={styles.pricingItem}>
                <Text style={styles.pricingItemDate}>
                  🗓 {formatDateRange(event.dateStart, event.dateEnd)}
                </Text>
                <View style={styles.pricingBadge}>
                  <Text style={styles.pricingBadgeText}>{t.hostPricingRecommended}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Weekly digest */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.hostWeeklyDigest}</Text>
        </View>
        <WeeklyDigest events={nearbyEvents} />

        {/* All nearby events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t.hostAllEvents(nearbyEvents.length)}
          </Text>
        </View>
        {nearbyEvents.length === 0 ? (
          <View style={styles.noEvents}>
            <Text style={styles.noEventsText}>
              {t.hostNoEvents(radius)}
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
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
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
    backgroundColor: '#FEF0E8',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  propLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  propEmoji: { fontSize: 32 },
  propName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  propLocation: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  editBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
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
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  radiusChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  radiusText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  radiusTextActive: { color: Colors.white },
  pricingCard: {
    backgroundColor: '#FEF5EF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
    gap: 8,
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  pricingTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  pricingText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  pricingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pricingItemDate: { fontSize: 13, color: Colors.text, fontWeight: '600' },
  pricingBadge: {
    backgroundColor: Colors.secondary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pricingBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  noEvents: { marginHorizontal: 16, padding: 20, backgroundColor: Colors.surface, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  noEventsText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  setupPrompt: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  setupEmoji: { fontSize: 64 },
  setupTitle: { fontSize: 24, fontWeight: '800', color: Colors.text },
  setupText: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  setupBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 32, marginTop: 8 },
  setupBtnText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
});
