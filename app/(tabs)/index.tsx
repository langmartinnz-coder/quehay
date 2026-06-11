import React from 'react';
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

const LANG_CYCLE: Record<string, 'es' | 'en' | 'ca'> = { es: 'en', en: 'ca', ca: 'es' };

export default function HomeScreen() {
  const { t, language, setLanguage } = useLanguage();
  const { filters, setFilters, isFavorite, toggleFavorite, filteredEvents, eventsLoading } = useApp();

  const events = filteredEvents;

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
        data={events}
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
            <View style={styles.resultsRow}>
              <Text style={styles.resultsText}>
                {events.length} {events.length === 1 ? t.eventSingular : t.eventPlural}
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
          </>
        }
        renderItem={({ item }) => (
          <EventCard
            event={item}
            isFavorite={isFavorite(item.id)}
            onFavoriteToggle={() => toggleFavorite(item.id)}
            onPress={() => router.push(`/evento/${item.id}`)}
          />
        )}
        ListEmptyComponent={eventsLoading ? <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} /> : <EmptyState />}
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
    paddingVertical: 8,
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
  list: {
    paddingBottom: 20,
  },
});
