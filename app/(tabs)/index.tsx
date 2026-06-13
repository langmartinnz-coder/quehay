import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useApp } from '../../store/AppContext';
import EventCard from '../../components/EventCard';
import SearchBar from '../../components/SearchBar';
import CategoryPills from '../../components/CategoryPills';
import FilterBar from '../../components/FilterBar';
import EmptyState from '../../components/EmptyState';
import { Colors } from '../../constants/colors';
import { useLanguage } from '../../store/LanguageContext';
import { useUserLocation } from '../../hooks/useUserLocation';
import { haversineKm, formatDistance } from '../../lib/distance';
import { Event } from '../../types';

const LANG_CYCLE: Record<string, 'es' | 'en' | 'ca'> = { es: 'en', en: 'ca', ca: 'es' };

type SortOrder = 'date' | 'distance';

function getEventDistance(
  event: Event,
  userLat: number,
  userLng: number,
): number {
  if (event.coordinates.latitude === 0 && event.coordinates.longitude === 0) {
    return Infinity;
  }
  return haversineKm(
    userLat,
    userLng,
    event.coordinates.latitude,
    event.coordinates.longitude,
  );
}

export default function HomeScreen() {
  const { t, language, setLanguage } = useLanguage();
  const { filters, setFilters, isFavorite, toggleFavorite, filteredEvents, eventsLoading } = useApp();
  const { location } = useUserLocation();

  const [sortOrder, setSortOrder] = useState<SortOrder>('date');
  // Auto-switch to nearest-first once location is resolved — only once
  const didAutoSort = useRef(false);
  useEffect(() => {
    if (location && !didAutoSort.current) {
      didAutoSort.current = true;
      setSortOrder('distance');
    }
  }, [location]);

  // Distance from user to each event (only when location is available)
  const distanceMap = useMemo<Map<string, number>>(() => {
    if (!location) return new Map();
    const map = new Map<string, number>();
    for (const event of filteredEvents) {
      map.set(event.id, getEventDistance(event, location.latitude, location.longitude));
    }
    return map;
  }, [filteredEvents, location]);

  // Sort filtered events by chosen order
  const sortedEvents = useMemo(() => {
    if (sortOrder === 'distance' && location) {
      return [...filteredEvents].sort(
        (a, b) => (distanceMap.get(a.id) ?? Infinity) - (distanceMap.get(b.id) ?? Infinity),
      );
    }
    // 'date' — filteredEvents is already sorted by dateStart ascending from applyFilters
    return filteredEvents;
  }, [filteredEvents, sortOrder, location, distanceMap]);

  const activeFiltersCount = [
    filters.category !== 'all',
    filters.region !== 'todas',
    filters.dateFilter !== 'todas',
  ].filter(Boolean).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>
            <Text style={styles.logoPunct}>¿</Text>QuéHay<Text style={styles.logoPunct}>?</Text>
          </Text>
          <Text style={styles.subtitle}>{t.tagline}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.langBtn}
            onPress={() => setLanguage(LANG_CYCLE[language])}
          >
            <Text style={styles.langBtnText}>{language.toUpperCase()}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => router.push('/mapa')}
          >
            <Text style={styles.mapBtnText}>🗺️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={sortedEvents}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <SearchBar
              value={filters.searchQuery}
              onChange={(q) => setFilters({ searchQuery: q })}
            />
            <CategoryPills
              selected={filters.category}
              onChange={(c) => setFilters({ category: c })}
            />
            <FilterBar filters={filters} onFilterChange={setFilters} />

            {/* Results count + clear filters */}
            <View style={styles.resultsRow}>
              <Text style={styles.resultsText}>
                {sortedEvents.length} {sortedEvents.length === 1 ? t.eventSingular : t.eventPlural}
              </Text>
              {activeFiltersCount > 0 && (
                <TouchableOpacity
                  onPress={() =>
                    setFilters({ category: 'all', region: 'todas', dateFilter: 'todas', searchQuery: '' })
                  }
                >
                  <Text style={styles.clearFilters}>
                    {t.clearFilters} ({activeFiltersCount})
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Sort chips — only shown when location is available */}
            {location && (
              <View style={styles.sortRow}>
                <TouchableOpacity
                  style={[styles.sortChip, sortOrder === 'date' && styles.sortChipActive]}
                  onPress={() => setSortOrder('date')}
                >
                  <Text style={[styles.sortChipText, sortOrder === 'date' && styles.sortChipTextActive]}>
                    🗓 {t.sortByDate}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sortChip, sortOrder === 'distance' && styles.sortChipActive]}
                  onPress={() => setSortOrder('distance')}
                >
                  <Text style={[styles.sortChipText, sortOrder === 'distance' && styles.sortChipTextActive]}>
                    📍 {t.sortByDistance}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <EventCard
            event={item}
            isFavorite={isFavorite(item.id)}
            onFavoriteToggle={() => toggleFavorite(item.id)}
            onPress={() => router.push(`/evento/${item.id}`)}
            distanceKm={distanceMap.get(item.id)}
          />
        )}
        ListEmptyComponent={
          eventsLoading
            ? <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
            : <EmptyState />
        }
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  logoPunct: {
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: -2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langBtn: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  mapBtn: {
    backgroundColor: Colors.surfaceVariant,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapBtnText: {
    fontSize: 20,
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  clearFilters: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 8,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  sortChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sortChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sortChipTextActive: {
    color: Colors.white,
  },
  list: {
    paddingBottom: 20,
  },
});
