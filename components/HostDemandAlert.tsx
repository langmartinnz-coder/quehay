import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { Event } from '../types';
import { formatDateRange } from '../data/mockData';
import { t } from '../i18n';

interface HostDemandAlertProps {
  event: Event;
  distanceKm: number;
  onPress: () => void;
}

export default function HostDemandAlert({ event, distanceKm, onPress }: HostDemandAlertProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>📢</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.tag}>{t.demandAlertTag}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {event.name}
        </Text>
        <Text style={styles.meta}>
          {formatDateRange(event.dateStart, event.dateEnd)} · {Math.round(distanceKm)} km
        </Text>
        <Text style={styles.tip}>{t.demandAlertTip}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondaryLight,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  tag: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.8,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  meta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tip: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 2,
  },
  arrow: {
    fontSize: 22,
    color: Colors.textLight,
  },
});
