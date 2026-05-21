import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { DATE_FILTERS, REGIONS } from '../constants/categories';
import { Colors } from '../constants/colors';
import { AppFilters, DateFilter, Region } from '../types';

interface FilterBarProps {
  filters: AppFilters;
  onFilterChange: (partial: Partial<AppFilters>) => void;
}

export default function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* Date filters */}
      {DATE_FILTERS.map((df) => {
        const isActive = filters.dateFilter === df.id;
        return (
          <TouchableOpacity
            key={df.id}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onFilterChange({ dateFilter: df.id })}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {df.label}
            </Text>
          </TouchableOpacity>
        );
      })}

      <View style={styles.divider} />

      {/* Region filters */}
      {REGIONS.map((r) => {
        const isActive = filters.region === r.id;
        return (
          <TouchableOpacity
            key={r.id}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onFilterChange({ region: r.id })}
          >
            <Text style={styles.regionFlag}>{r.flag}</Text>
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {r.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    gap: 4,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  chipTextActive: {
    color: Colors.white,
  },
  regionFlag: {
    fontSize: 13,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
});
