import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Share,
  Linking,
  Dimensions,
  ActivityIndicator,
  Modal,
  StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDateRange } from '../../data/mockData';
import { Colors } from '../../constants/colors';
import { CATEGORIES, SOURCE_LABELS, SIZE_CONFIG, getRegionLabel } from '../../constants/categories';
import { useApp } from '../../store/AppContext';
import { useLanguage } from '../../store/LanguageContext';
import { translateEvent, TranslatedEventFields, getCachedTranslation } from '../../lib/translateEvent';

const { width, height: screenHeight } = Dimensions.get('window');

// ── Affiliate IDs ─────────────────────────────────────────────────────────────
// Update BOOKING_AID once CJ Affiliate approval is confirmed.
const BOOKING_AID = 'BOOKING_AID';
const TRAVELPAYOUTS_ID = '740715';


export default function EventoDetailScreen() {
  const { t, language } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isFavorite, toggleFavorite, events, eventsLoading } = useApp();
  const insets = useSafeAreaInsets();
  const event = events.find((e) => e.id === (id ?? ''));

  const [viewerOpen, setViewerOpen] = useState(false);
  const [translation, setTranslation] = useState<TranslatedEventFields | null>(
    () => getCachedTranslation(id ?? ''),
  );
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (language !== 'en' || !event) return;
    const cached = getCachedTranslation(event.id);
    if (cached) {
      setTranslation(cached);
      return;
    }
    let cancelled = false;
    setIsTranslating(true);
    translateEvent(event)
      .then((r) => { if (!cancelled) setTranslation(r); })
      .catch((e) => console.error('[evento] Auto-translation failed:', e))
      .finally(() => { if (!cancelled) setIsTranslating(false); });
    return () => { cancelled = true; };
  }, [event?.id, language]);

  if (eventsLoading && !event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>{t.eventNotFound}</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>{t.backLink}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const cat = CATEGORIES.find((c) => c.id === event.category);
  const source = SOURCE_LABELS[event.source];
  const size = SIZE_CONFIG[event.size];
  const fav = isFavorite(event.id);

  const displayName     = (language === 'en' && translation?.name)        || event.name;
  const displayLocation = (language === 'en' && translation?.location)    || event.location;
  const displayDesc     = (language === 'en' && translation?.description) || event.description;

  async function handleShare() {
    if (!event) return;
    const url = `https://quehayagendalocal.com/evento/?id=${event.id}`;
    const regionLabel = getRegionLabel(event.region);
    await Share.share({
      message: `🎉 ${displayName}\n📅 ${formatDateRange(event.dateStart, event.dateEnd)}\n📍 ${event.town}, ${regionLabel}\n\n${t.shareCta}\n${url}`,
    });
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View style={styles.heroWrap}>
          <TouchableOpacity activeOpacity={0.92} onPress={() => setViewerOpen(true)}>
            <Image source={{ uri: event.imageUrl }} style={styles.hero} resizeMode="cover" />
          </TouchableOpacity>
          <View style={styles.heroOverlay} pointerEvents="none" />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.heroActionBtn} onPress={() => toggleFavorite(event.id)}>
              <Text style={styles.heroActionEmoji}>{fav ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroActionBtn} onPress={handleShare}>
              <Feather name="share-2" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.heroBottom}>
            <View style={[styles.catBadge, { backgroundColor: cat?.color }]}>
              <Text style={styles.catBadgeText}>
                {cat?.emoji} {cat?.label}
              </Text>
            </View>
            <View style={styles.sizeBadge}>
              <Text style={styles.sizeDot}>{size.dot}</Text>
              <Text style={[styles.sizeLabel, { color: size.color }]}>
                {size.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.name}>{displayName}</Text>

          {/* Translation status */}
          {language === 'en' && isTranslating && (
            <View style={styles.translatingRow}>
              <ActivityIndicator size="small" color={Colors.textLight} />
              <Text style={styles.translatingText}>{t.translating}</Text>
            </View>
          )}
          {language === 'en' && !!translation && !isTranslating && (
            <View style={styles.translatedBadge}>
              <Text style={styles.translatedBadgeText}>{t.translatedBadge}</Text>
            </View>
          )}

          {/* Key info cards */}
          <View style={styles.infoGrid}>
            <InfoCard emoji="🗓" label={t.infoDate} value={formatDateRange(event.dateStart, event.dateEnd)} />
            <InfoCard emoji="🕐" label={t.infoTime} value={event.time} />
            <InfoCard emoji="📍" label={t.infoPlace} value={displayLocation} />
            <InfoCard emoji="🏘️" label={t.infoTown} value={`${event.town}, ${getRegionLabel(event.region)}`} />
            {!event.isFree && event.price && (
              <InfoCard emoji="🎟" label={t.infoPrice} value={event.price} highlight />
            )}
            {event.isFree && (
              <InfoCard emoji="✅" label={t.infoPrice} value={t.infoFree} highlight />
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.sectionAbout}</Text>
            <Text style={styles.description}>{displayDesc}</Text>
          </View>

          {/* Plan your visit */}
          <View style={styles.planSection}>
            <Text style={styles.sectionTitle}>{t.planVisitTitle}</Text>
            <View style={styles.planBtns}>
              <TouchableOpacity
                style={styles.planBtn}
                onPress={() => Linking.openURL(
                  `https://www.economybookings.com/search?city=${encodeURIComponent(event.town)}&lang=es`
                )}
              >
                <Text style={styles.planBtnText}>{t.planWhereStay}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.planBtn}
                onPress={() => Linking.openURL(
                  `https://www.kkday.com/es-es/resultlist.php?cate=&q=${encodeURIComponent(event.town)}`
                )}
              >
                <Text style={styles.planBtnText}>{t.planTours}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.planBtn}
                onPress={() => Linking.openURL(
                  `https://www.klook.com/search/result/?query=${encodeURIComponent(event.town)}&aid=${TRAVELPAYOUTS_ID}`
                )}
              >
                <Text style={styles.planBtnText}>{t.planActivities}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.affiliateDisclosure}>{t.affiliateDisclosure}</Text>
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
            <Text style={styles.sourceTitle}>{t.sectionSource}</Text>
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
                <Text style={styles.demandNoteTitle}>{t.demandTitle}</Text>
                <Text style={styles.demandNoteText}>
                  {event.size === 'grande' ? t.demandTextBig : t.demandTextMedium}
                </Text>
              </View>
            </View>
          )}

          {/* CTA */}
          <TouchableOpacity style={[styles.favBtn, { marginBottom: insets.bottom + 8 }]} onPress={() => toggleFavorite(event.id)}>
            <Text style={styles.favBtnText}>
              {fav ? t.savedFavorite : t.saveFavorite}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Full-screen image viewer */}
      <Modal
        visible={viewerOpen}
        transparent={false}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setViewerOpen(false)}
      >
        <StatusBar hidden />
        <View style={styles.viewer}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.viewerContent}
            minimumZoomScale={1}
            maximumZoomScale={4}
            centerContent
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            <Image
              source={{ uri: event.imageUrl }}
              style={{ width, height: screenHeight }}
              resizeMode="contain"
            />
          </ScrollView>
          <TouchableOpacity style={styles.viewerClose} onPress={() => setViewerOpen(false)}>
            <Text style={styles.viewerCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 1,
  },
  cardHighlight: {
    backgroundColor: '#FEF5EF',
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
  translatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -8,
  },
  translatingText: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  translatedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#C7D2F8',
    marginTop: -8,
  },
  translatedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4F6FD4',
  },
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
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  sourceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 1,
  },
  sourceTitle: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sourceEmoji: { fontSize: 18 },
  sourceDetail: { fontSize: 14, fontWeight: '600', flex: 1 },
  demandNote: {
    flexDirection: 'row',
    backgroundColor: '#FEF5EF',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
  },
  demandNoteEmoji: { fontSize: 22 },
  demandNoteContent: { flex: 1, gap: 4 },
  demandNoteTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  demandNoteText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  favBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  favBtnText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 18, color: Colors.textSecondary },
  backLink: { fontSize: 16, color: Colors.primary, fontWeight: '700' },

  /* ── Plan your visit ─────────────────────────────────── */
  planSection: { gap: 10 },
  planBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  planBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#FEF0E8',
    borderWidth: 1,
    borderColor: Colors.secondaryLight,
  },
  planBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  affiliateDisclosure: {
    fontSize: 10,
    color: Colors.textLight,
    marginTop: 2,
  },

  /* ── Full-screen image viewer ────────────────────────── */
  viewer: { flex: 1, backgroundColor: '#000' },
  viewerContent: { width, height: screenHeight, alignItems: 'center', justifyContent: 'center' },
  viewerClose: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerCloseText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
