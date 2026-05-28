import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Event } from '../types';
import { Colors } from '../constants/colors';
import { CATEGORIES, SOURCE_LABELS, SIZE_CONFIG } from '../constants/categories';
import { formatDateRange } from '../data/mockData';
import { useLanguage } from '../store/LanguageContext';

interface EventCardProps {
  event: Event;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onPress: () => void;
  showSize?: boolean;
}

export default function EventCard({
  event,
  isFavorite,
  onFavoriteToggle,
  onPress,
  showSize = false,
}: EventCardProps) {
  const { t } = useLanguage();
  const category = CATEGORIES.find((c) => c.id === event.category);
  const source = SOURCE_LABELS[event.source];
  const size = SIZE_CONFIG[event.size];

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: event.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Category badge */}
        <View style={[styles.categoryBadge, { backgroundColor: category?.color ?? Colors.primary }]}>
          <Text style={styles.categoryEmoji}>{category?.emoji}</Text>
          <Text style={styles.categoryLabel}>{category?.label}</Text>
        </View>
        {/* Favorite button */}
        <TouchableOpacity style={styles.favoriteBtn} onPress={onFavoriteToggle} hitSlop={8}>
          <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
        {/* Free badge */}
        {event.isFree && (
          <View style={styles.freeBadge}>
            <Text style={styles.freeText}>{t.freeBadge}</Text>
          </View>
        )}
      </View>

      {/* Body */}
      <View style={styles.body}>
        {showSize && (
          <View style={styles.sizeRow}>
            <Text style={styles.sizeDot}>{size.dot}</Text>
            <Text style={[styles.sizeLabel, { color: size.color }]}>{size.label.toUpperCase()}</Text>
          </View>
        )}

        <Text style={styles.name} numberOfLines={2}>
          {event.name}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>🗓</Text>
          <Text style={styles.metaText}>{formatDateRange(event.dateStart, event.dateEnd)}</Text>
          <Text style={styles.metaSep}>·</Text>
          <Text style={styles.metaIcon}>🕐</Text>
          <Text style={styles.metaText}>{event.time}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>📍</Text>
          <Text style={styles.metaText} numberOfLines={1}>
            {event.town}
            {event.region === 'teruel' ? `, ${t.regionTeruel}` : `, ${t.regionCatalunya}`}
          </Text>
        </View>

        {!event.isFree && event.price && (
          <View style={styles.metaRow}>
            <Text style={styles.metaIcon}>🎟</Text>
            <Text style={[styles.metaText, { color: Colors.secondary }]}>{event.price}</Text>
          </View>
        )}

        {/* Source */}
        <View style={styles.sourceRow}>
          <Text style={styles.sourceEmoji}>{source?.emoji}</Text>
          <Text style={[styles.sourceText, { color: source?.color ?? Colors.textSecondary }]}>
            {event.sourceDetail}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    backgroundColor: Colors.surfaceVariant,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  categoryEmoji: {
    fontSize: 12,
  },
  categoryLabel: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 10,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIcon: {
    fontSize: 16,
  },
  freeBadge: {
    position: 'absolute',
    top: 10,
    left: 12,
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  freeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  body: {
    padding: 14,
    gap: 6,
  },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  sizeDot: {
    fontSize: 10,
  },
  sizeLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaIcon: {
    fontSize: 13,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  metaSep: {
    color: Colors.textLight,
    fontSize: 13,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  sourceEmoji: {
    fontSize: 12,
  },
  sourceText: {
    fontSize: 11,
    flex: 1,
  },
});
