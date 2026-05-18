import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { CATEGORIES } from '../constants/categories';
import { Colors } from '../constants/colors';
import { EventCategory } from '../types';

interface CategoryPillsProps {
  selected: EventCategory | 'all';
  onChange: (category: EventCategory | 'all') => void;
}

export default function CategoryPills({ selected, onChange }: CategoryPillsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((cat) => {
        const isActive = selected === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.pill,
              isActive
                ? { backgroundColor: cat.color, borderColor: cat.color }
                : { backgroundColor: Colors.surface, borderColor: Colors.border },
            ]}
            onPress={() => onChange(cat.id)}
          >
            <Text style={styles.emoji}>{cat.emoji}</Text>
            <Text
              style={[
                styles.label,
                { color: isActive ? Colors.white : Colors.textSecondary },
              ]}
            >
              {cat.label}
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
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 5,
  },
  emoji: {
    fontSize: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
