import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { CATEGORIES, REGIONS } from '../../constants/categories';
import { Event, Region } from '../../types';
import { useApp } from '../../store/AppContext';
import { useLanguage } from '../../store/LanguageContext';
import { useUserLocation } from '../../hooks/useUserLocation';

type MapViewport = { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };

const REGION_VIEWPORTS: Record<string, MapViewport> = {
  'todas':         { latitude: 40.2, longitude: -2.5, latitudeDelta: 8.5,  longitudeDelta: 8.5 },
  'aragon':        { latitude: 41.5, longitude: -0.5, latitudeDelta: 2.5,  longitudeDelta: 2.5 },
  'cataluña':      { latitude: 41.7, longitude:  1.8, latitudeDelta: 2.8,  longitudeDelta: 2.8 },
  'madrid':        { latitude: 40.5, longitude: -3.7, latitudeDelta: 1.5,  longitudeDelta: 1.5 },
  'andalucia':     { latitude: 37.5, longitude: -4.5, latitudeDelta: 3.5,  longitudeDelta: 3.5 },
  'valencia':      { latitude: 39.5, longitude: -0.4, latitudeDelta: 2.5,  longitudeDelta: 2.5 },
  'pais-vasco':    { latitude: 43.1, longitude: -2.4, latitudeDelta: 1.2,  longitudeDelta: 1.2 },
  'galicia':       { latitude: 42.7, longitude: -8.0, latitudeDelta: 2.0,  longitudeDelta: 2.0 },
  'castilla-leon': { latitude: 41.7, longitude: -4.7, latitudeDelta: 3.5,  longitudeDelta: 3.5 },
  'murcia':        { latitude: 37.9, longitude: -1.5, latitudeDelta: 1.5,  longitudeDelta: 1.5 },
  'extremadura':   { latitude: 39.2, longitude: -6.2, latitudeDelta: 2.5,  longitudeDelta: 2.5 },
  'canarias':      { latitude: 28.2, longitude:-15.5, latitudeDelta: 3.0,  longitudeDelta: 3.0 },
  'baleares':      { latitude: 39.6, longitude:  2.9, latitudeDelta: 2.0,  longitudeDelta: 2.0 },
};

export default function MapaScreen() {
  const { t } = useLanguage();
  const { events } = useApp();
  const mapRef = useRef<MapView>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeRegion, setActiveRegion] = useState<Region>('todas');
  const { location } = useUserLocation();
  const hasCenteredOnUser = useRef(false);

  // Auto-center on the user's location once it resolves (only on first mount)
  useEffect(() => {
    if (location && !hasCenteredOnUser.current) {
      hasCenteredOnUser.current = true;
      mapRef.current?.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        },
        800,
      );
    }
  }, [location]);

  const visibleEvents = useMemo(() => {
    const withCoords = events.filter(
      (e) => e.coordinates.latitude !== 0 || e.coordinates.longitude !== 0,
    );
    const regionFiltered = withCoords.filter(
      (e) => activeRegion === 'todas' || e.region === activeRegion,
    );
    if (events.length > 0 && withCoords.length === 0) {
      console.warn('[mapa] All verified events have lat=0,lng=0 — set coordinates in the admin panel to show them on the map');
    }
    return regionFiltered;
  }, [events, activeRegion]);

  function goToRegion(region: Region) {
    setActiveRegion(region);
    const target = REGION_VIEWPORTS[region] ?? REGION_VIEWPORTS['todas'];
    mapRef.current?.animateToRegion(target, 800);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Map fills entire container */}
      <MapView ref={mapRef} style={styles.map} initialRegion={REGION_VIEWPORTS['todas']}>
        {visibleEvents.map((event) => {
          const cat = CATEGORIES.find((c) => c.id === event.category);
          return (
            <Marker
              key={event.id}
              coordinate={event.coordinates}
              onPress={() => {
                console.log('[mapa] marker pressed:', event.id, event.name);
                setSelectedEvent(event);
              }}
            >
              <View style={[styles.marker, { backgroundColor: cat?.color ?? Colors.primary }]}>
                <Text style={styles.markerEmoji}>{cat?.emoji}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Floating top overlay: title + compact region chips */}
      <View style={styles.topOverlay}>
        <View style={styles.topBar}>
          <Text style={styles.title}>
            <Text style={styles.titlePunct}>¿</Text>QuéHay<Text style={styles.titlePunct}>?</Text>
          </Text>
          <Text style={styles.subtitle}>{t.eventsCount(visibleEvents.length)}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.regionBarInner}
        >
          {REGIONS.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={[styles.regionChip, activeRegion === r.id && styles.regionChipActive]}
              onPress={() => goToRegion(r.id as Region)}
            >
              <Text style={styles.regionFlag}>{r.flag}</Text>
              <Text style={[styles.regionText, activeRegion === r.id && styles.regionTextActive]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Selected event bottom card */}
      {selectedEvent && (
        <View style={styles.bottomCard}>
          <TouchableOpacity
            style={styles.bottomCardClose}
            onPress={() => setSelectedEvent(null)}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.bottomCardContent}>
            {(() => {
              const cat = CATEGORIES.find((c) => c.id === selectedEvent.category);
              return (
                <>
                  <View
                    style={[
                      styles.bottomCatBadge,
                      { backgroundColor: cat?.color ?? Colors.primary },
                    ]}
                  >
                    <Text style={styles.bottomCatText}>
                      {cat?.emoji} {cat?.label}
                    </Text>
                  </View>
                  <Text style={styles.bottomEventName}>{selectedEvent.name}</Text>
                  <Text style={styles.bottomEventMeta}>
                    📍 {selectedEvent.town} · 🗓 {selectedEvent.dateStart}
                  </Text>
                  <TouchableOpacity
                    style={styles.viewBtn}
                    onPress={() => {
                      setSelectedEvent(null);
                      router.push(`/evento/${selectedEvent.id}`);
                    }}
                  >
                    <Text style={styles.viewBtnText}>{t.viewDetails}</Text>
                  </TouchableOpacity>
                </>
              );
            })()}
          </View>
        </View>
      )}

      {/* Locate-me button — only shown when location is available */}
      {location && (
        <TouchableOpacity
          style={styles.locateBtn}
          onPress={() =>
            mapRef.current?.animateToRegion(
              {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
              },
              600,
            )
          }
        >
          <Text style={styles.locateBtnText}>🎯</Text>
        </TouchableOpacity>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.legendInner}>
          {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
            <View key={cat.id} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
              <Text style={styles.legendLabel}>{cat.label}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },

  /* ── Top overlay ─────────────────────────────────────── */
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(250,247,242,0.96)',
    paddingBottom: 8,
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 6,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  titlePunct: {
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  regionBarInner: {
    paddingHorizontal: 12,
    gap: 6,
    flexDirection: 'row',
  },
  regionFlag: {
    fontSize: 11,
  },
  regionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  regionChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  regionText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  regionTextActive: {
    color: Colors.white,
  },

  /* ── Markers & callouts ──────────────────────────────── */
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  markerEmoji: {
    fontSize: 16,
  },
  /* ── Bottom card ─────────────────────────────────────── */
  bottomCard: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomCardClose: {
    position: 'absolute',
    top: 12,
    right: 14,
    zIndex: 1,
  },
  closeText: {
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: '700',
  },
  bottomCardContent: {
    gap: 6,
  },
  bottomCatBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  bottomCatText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  bottomEventName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  bottomEventMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  viewBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  viewBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },

  /* ── Locate button ───────────────────────────────────── */
  locateBtn: {
    position: 'absolute',
    bottom: 196,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locateBtnText: {
    fontSize: 20,
  },

  /* ── Legend ──────────────────────────────────────────── */
  legend: {
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
  },
  legendInner: {
    paddingHorizontal: 16,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
  },
});
