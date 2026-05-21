import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { Event } from '../types';
import { formatDateRange } from '../data/mockData';
import { CATEGORIES, SIZE_CONFIG } from '../constants/categories';
import { t } from '../i18n';

interface WeeklyDigestProps {
  events: Event[];
}

export default function WeeklyDigest({ events }: WeeklyDigestProps) {
  const [expanded, setExpanded] = useState(true);

  const upcoming = events
    .filter((e) => {
      const d = new Date(e.dateStart + 'T00:00:00');
      const today = new Date('2026-05-18');
      const nextWeek = new Date('2026-05-25');
      return d >= today && d <= nextWeek;
    })
    .slice(0, 5);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded((e) => !e)}>
        <Text style={styles.title}>{t.weeklyDigestTitle}</Text>
        <Text style={styles.count}>{t.weeklyDigestCount(upcoming.length)}</Text>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.list}>
          {upcoming.length === 0 ? (
            <Text style={styles.empty}>{t.weeklyDigestEmpty}</Text>
          ) : (
            upcoming.map((event) => {
              const cat = CATEGORIES.find((c) => c.id === event.category);
              const size = SIZE_CONFIG[event.size];
              return (
                <View key={event.id} style={styles.item}>
                  <Text style={styles.itemEmoji}>{cat?.emoji}</Text>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {event.name}
                    </Text>
                    <Text style={styles.itemMeta}>
                      {formatDateRange(event.dateStart, event.dateEnd)} · {event.town}
                    </Text>
                  </View>
                  <Text style={styles.itemDot}>{size.dot}</Text>
                </View>
              );
            })
          )}
          <View style={styles.digestNote}>
            <Text style={styles.noteText}>{t.weeklyDigestNote}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FEF0E8',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  count: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  list: {
    padding: 12,
    gap: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    gap: 10,
  },
  itemEmoji: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  itemMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  itemDot: {
    fontSize: 14,
  },
  empty: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 12,
  },
  digestNote: {
    marginTop: 8,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 8,
    padding: 10,
  },
  noteText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
