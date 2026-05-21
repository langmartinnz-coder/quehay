import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../constants/colors';
import { Event } from '../types';
import { CATEGORIES, SIZE_CONFIG } from '../constants/categories';
import { formatDateRange } from '../data/mockData';
import { t } from '../i18n';

interface HostEventRowProps {
  event: Event;
  distanceKm: number;
  onPress: () => void;
}

export default function HostEventRow({ event, distanceKm, onPress }: HostEventRowProps) {
  const category = CATEGORIES.find((c) => c.id === event.category);
  const size = SIZE_CONFIG[event.size];
  const isPricingAlert = event.size === 'grande' || event.size === 'mediano';

  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Image source={{ uri: event.imageUrl }} style={styles.thumb} resizeMode="cover" />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.sizeDot}>{size.dot}</Text>
          <Text style={[styles.sizeLabel, { color: size.color }]}>
            {size.label.toUpperCase()}
          </Text>
          {isPricingAlert && (
            <View style={styles.pricingBadge}>
              <Text style={styles.pricingText}>{t.pricingHighAlert}</Text>
            </View>
          )}
        </View>
        <Text style={styles.name} numberOfLines={2}>
          {event.name}
        </Text>
        <Text style={styles.meta}>
          {formatDateRange(event.dateStart, event.dateEnd)} · {Math.round(distanceKm)} km
        </Text>
        <View style={styles.categoryRow}>
          <Text style={styles.catEmoji}>{category?.emoji}</Text>
          <Text style={[styles.catLabel, { color: category?.color }]}>{category?.label}</Text>
        </View>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    gap: 12,
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  thumb: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: Colors.surfaceVariant,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sizeDot: {
    fontSize: 10,
  },
  sizeLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  pricingBadge: {
    backgroundColor: '#FEF0E8',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pricingText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 18,
  },
  meta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  catEmoji: {
    fontSize: 11,
  },
  catLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 20,
    color: Colors.textLight,
  },
});
