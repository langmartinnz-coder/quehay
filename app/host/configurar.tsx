import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useApp } from '../../store/AppContext';
import { Colors } from '../../constants/colors';
import { RADIUS_OPTIONS } from '../../constants/categories';
import { HostProperty } from '../../types';
import { t } from '../../i18n';

const SAMPLE_PROPERTIES = [
  {
    name: 'Casa Rural El Olmo',
    town: 'Mora de Rubielos',
    coordinates: { latitude: 40.252, longitude: -0.7476 },
  },
  {
    name: 'Hostal Albarracín',
    town: 'Albarracín',
    coordinates: { latitude: 40.4076, longitude: -1.448 },
  },
  {
    name: 'Hotel Rural Matarraña',
    town: 'Beceite',
    coordinates: { latitude: 40.8077, longitude: 0.1768 },
  },
  {
    name: 'Apartamentos Gràcia',
    town: 'Barcelona',
    coordinates: { latitude: 41.3982, longitude: 2.154 },
  },
  {
    name: 'Cal Pagès Rural',
    town: 'Vic',
    coordinates: { latitude: 41.9302, longitude: 2.2546 },
  },
];

export default function ConfigurarScreen() {
  const { hostProperty, setHostProperty } = useApp();
  const [name, setName] = useState(hostProperty?.name ?? '');
  const [town, setTown] = useState(hostProperty?.town ?? '');
  const [radiusKm, setRadiusKm] = useState(hostProperty?.radiusKm ?? 50);
  const [selectedCoords, setSelectedCoords] = useState(
    hostProperty?.coordinates ?? { latitude: 40.252, longitude: -0.7476 },
  );

  function applyTemplate(template: typeof SAMPLE_PROPERTIES[0]) {
    setName(template.name);
    setTown(template.town);
    setSelectedCoords(template.coordinates);
  }

  function handleSave() {
    if (!name.trim() || !town.trim()) {
      Alert.alert(t.configAlertMissingTitle, t.configAlertMissingMsg);
      return;
    }
    const property: HostProperty = {
      name: name.trim(),
      town: town.trim(),
      coordinates: selectedCoords,
      radiusKm,
    };
    setHostProperty(property);
    Alert.alert(t.configAlertSavedTitle, t.configAlertSavedMsg, [
      { text: t.configAlertViewPanel, onPress: () => router.replace('/host') },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🏠</Text>
          <Text style={styles.heroTitle}>{t.configHeroTitle}</Text>
          <Text style={styles.heroSubtitle}>{t.configHeroSubtitle}</Text>
        </View>

        {/* Quick templates */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.configExamplesLabel}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templates}>
            {SAMPLE_PROPERTIES.map((p) => (
              <TouchableOpacity
                key={p.name}
                style={[styles.templateChip, name === p.name && styles.templateChipActive]}
                onPress={() => applyTemplate(p)}
              >
                <Text style={styles.templateName}>{p.name}</Text>
                <Text style={styles.templateTown}>📍 {p.town}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{t.configNameLabel}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t.configNamePlaceholder}
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{t.configTownLabel}</Text>
            <TextInput
              style={styles.input}
              value={town}
              onChangeText={setTown}
              placeholder={t.configTownPlaceholder}
              placeholderTextColor={Colors.textLight}
            />
          </View>

          {/* Coordinates display */}
          <View style={styles.coordsCard}>
            <Text style={styles.coordsTitle}>{t.configCoordsTitle}</Text>
            <Text style={styles.coordsText}>
              Lat: {selectedCoords.latitude.toFixed(4)} · Lng: {selectedCoords.longitude.toFixed(4)}
            </Text>
            <Text style={styles.coordsNote}>{t.configCoordsNote}</Text>
          </View>

          {/* Radius selector */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{t.configRadiusLabel}</Text>
            <Text style={styles.fieldSubLabel}>{t.configRadiusSub}</Text>
            <View style={styles.radiusRow}>
              {RADIUS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.km}
                  style={[styles.radiusChip, radiusKm === opt.km && styles.radiusChipActive]}
                  onPress={() => setRadiusKm(opt.km)}
                >
                  <Text
                    style={[styles.radiusText, radiusKm === opt.km && styles.radiusTextActive]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Features summary */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>{t.configFeaturesTitle}</Text>
          {t.configFeatures.map((f, i) => (
            <Text key={i} style={styles.featureItem}>{f}</Text>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{t.configSaveBtn}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 40 },
  hero: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 24, gap: 8 },
  heroEmoji: { fontSize: 52 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: Colors.text },
  heroSubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  section: { marginBottom: 16 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  templates: { paddingHorizontal: 16, gap: 10 },
  templateChip: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minWidth: 160,
    gap: 4,
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  templateChipActive: { borderColor: Colors.primary, backgroundColor: '#FEF0E8' },
  templateName: { fontSize: 13, fontWeight: '700', color: Colors.text },
  templateTown: { fontSize: 11, color: Colors.textSecondary },
  form: { paddingHorizontal: 16, gap: 4 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  fieldSubLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
  },
  coordsCard: {
    backgroundColor: '#FEF0E8',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  coordsTitle: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  coordsText: { fontSize: 13, color: Colors.text, fontFamily: 'monospace' },
  coordsNote: { fontSize: 11, color: Colors.textSecondary, marginTop: 4 },
  radiusRow: { flexDirection: 'row', gap: 8 },
  radiusChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  radiusChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  radiusText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  radiusTextActive: { color: Colors.white },
  featuresCard: {
    backgroundColor: '#FEF0E8',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featuresTitle: { fontSize: 14, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  featureItem: { fontSize: 13, color: Colors.text, lineHeight: 20 },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  saveBtnText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
});
