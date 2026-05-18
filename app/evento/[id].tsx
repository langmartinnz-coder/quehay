import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Share,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getEventById, formatDateRange } from '../../data/mockData';
import { Colors } from '../../constants/colors';
import { CATEGORIES, SOURCE_LABELS, SIZE_CONFIG } from '../../constants/categories';
import { useApp } from '../../store/AppContext';

const { width } = Dimensions.get('window');

export default function EventoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isFavorite, toggleFavorite } = useApp();
  const event = getEventById(id ?? '');

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Evento no encontrado</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>← Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const cat = CATEGORIES.find((c) => c.id === event.category);
  const source = SOURCE_LABELS[event.source];
  const size = SIZE_CONFIG[event.size];
  const fav = isFavorite(event.id);

  async function handleShare() {
    if (!event) return;
    await Share.share({
      title: event.name,
      message: `${event.name}\n📍 ${event.town}\n🗓 ${formatDateRange(event.dateStart, event.dateEnd)}\n\nVia QuéHay – Agenda local`,
    });
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View style={styles.heroWrap}>
          <Image source={{ uri: event.imageUrl }} style={styles.hero} resizeMode="cover" />
          {/* Gradient overlay */}
          <View style={styles.heroOverlay} />
          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          {/* Favorite & share */}
          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.heroActionBtn} onPress={() => toggleFavorite(event.id)}>
              <Text style={styles.heroActionEmoji}>{fav ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroActionBtn} onPress={handleShare}>
              <Text style={styles.heroActionEmoji}>↑</Text>
            </TouchableOpacity>
          </View>
          {/* Category + size on image */}
          <View style={styles.heroBottom}>
            <View style={[styles.catBadge, { backgroundColor: cat?.color }]}>
              <Text style={styles.catBadgeText}>
                {cat?.emoji} {cat?.label}
              </Text>
            </View>
            <View style={[styles.sizeBadge]}>
              <Text style={styles.sizeDot}>{size.dot}</Text>
              <Text style={[styles.sizeLabel, { color: size.color }]}>
                {size.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.name}>{event.name}</Text>

          {/* Key info cards */}
          <View style={styles.infoGrid}>
            <InfoCard emoji="🗓" label="Fecha" value={formatDateRange(event.dateStart, event.dateEnd)} />
            <InfoCard emoji="🕐" label="Hora" value={event.time} />
            <InfoCard emoji="📍" label="Lugar" value={event.location} />
            <InfoCard emoji="🏘️" label="Municipio" value={`${event.town}, ${event.region === 'teruel' ? 'Teruel' : 'Catalunya'}`} />
            {!event.isFree && event.price && (
              <InfoCard emoji="🎟" label="Precio" value={event.price} highlight />
            )}
            {event.isFree && (
              <InfoCard emoji="✅" label="Precio" value="Entrada gratuita" highlight />
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre el evento</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Tags */}
          {event.tags.length > 0 && (
            <View style={styles.tagsWrap}>
              {event.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Source */}
          <View style={styles.sourceCard}>
            <Text style={styles.sourceTitle}>Fuente del evento</Text>
            <View style={styles.sourceRow}>
              <Text style={styles.sourceEmoji}>{source?.emoji}</Text>
              <Text style={[styles.sourceDetail, { color: source?.color }]}>
                {event.sourceDetail}
              </Text>
            </View>
          </View>

          {/* Host demand note */}
          {(event.size === 'grande' || event.size === 'mediano') && (
            <View style={styles.demandNote}>
              <Text style={styles.demandNoteEmoji}>📊</Text>
              <View style={styles.demandNoteContent}>
                <Text style={styles.demandNoteTitle}>Alta demanda prevista</Text>
                <Text style={styles.demandNoteText}>
                  Este evento puede incrementar la ocupación hotelera en la zona.
                  {event.size === 'grande' ? ' Considerado gran evento.' : ' Considerado evento mediano.'}
                </Text>
              </View>
            </View>
          )}

          {/* CTA */}
          <TouchableOpacity style={styles.favBtn} onPress={() => toggleFavorite(event.id)}>
            <Text style={styles.favBtnText}>
              {fav ? '❤️ Guardado en favoritos' : '🤍 Guardar en favoritos'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoCard({
  emoji,
  label,
  value,
  highlight,
}: {
  emoji: string;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={[icStyles.card, highlight && icStyles.cardHighlight]}>
      <Text style={icStyles.emoji}>{emoji}</Text>
      <Text style={icStyles.label}>{label}</Text>
      <Text style={[icStyles.value, highlight && icStyles.valueHighlight]}>{value}</Text>
    </View>
  );
}

const icStyles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    gap: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHighlight: {
    backgroundColor: '#FFF8E1',
    borderColor: Colors.secondaryLight,
  },
  emoji: { fontSize: 18 },
  label: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  value: { fontSize: 14, fontWeight: '700', color: Colors.text },
  valueHighlight: { color: Colors.secondary },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  heroWrap: { position: 'relative', height: 280 },
  hero: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { color: Colors.white, fontSize: 22, fontWeight: '700' },
  heroActions: {
    position: 'absolute',
    top: 52,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  heroActionBtn: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroActionEmoji: { color: Colors.white, fontSize: 18, fontWeight: '700' },
  heroBottom: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  catBadgeText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  sizeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  sizeDot: { fontSize: 11 },
  sizeLabel: { fontSize: 11, fontWeight: '700' },
  content: { padding: 20, gap: 16 },
  name: { fontSize: 24, fontWeight: '800', color: Colors.text, lineHeight: 30 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  description: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  sourceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sourceTitle: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sourceEmoji: { fontSize: 18 },
  sourceDetail: { fontSize: 14, fontWeight: '600', flex: 1 },
  demandNote: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondaryLight,
  },
  demandNoteEmoji: { fontSize: 22 },
  demandNoteContent: { flex: 1, gap: 4 },
  demandNoteTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  demandNoteText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  favBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  favBtnText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 18, color: Colors.textSecondary },
  backLink: { fontSize: 16, color: Colors.primary, fontWeight: '700' },
});
