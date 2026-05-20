import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/colors';
import { CATEGORIES, REGIONS } from '../../constants/categories';
import { EventCategory } from '../../types';
import { useApp } from '../../store/AppContext';
import { submitEvent } from '../../lib/api';

interface FormState {
  name: string;
  date: string;
  time: string;
  town: string;
  region: string;
  category: EventCategory | '';
  description: string;
  source: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  date: '',
  time: '',
  town: '',
  region: '',
  category: '',
  description: '',
  source: '',
};

// Simulates AI extraction from a poster image
function simulateExtraction(): Promise<Partial<FormState>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: 'Fiestas de la Virgen del Carmen',
        date: '2026-07-16',
        time: '20:00',
        town: 'Mora de Rubielos',
        region: 'teruel',
        category: 'festival',
        description: 'Celebración de las fiestas patronales en honor a la Virgen del Carmen con procesión marítima, conciertos y fuegos artificiales.',
      });
    }, 2000);
  });
}

export default function EnviarScreen() {
  const { user } = useApp();
  const [image, setImage] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extracted, setExtracted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function pickImage(useCamera: boolean) {
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      setExtracted(false);
      setForm(EMPTY_FORM);
    }
  }

  async function extractFromPoster() {
    setIsExtracting(true);
    const data = await simulateExtraction();
    setForm((prev) => ({ ...prev, ...data }));
    setIsExtracting(false);
    setExtracted(true);
  }

  async function handleSubmit() {
    if (!form.name || !form.date || !form.town || !form.region || !form.category) {
      Alert.alert('Faltan datos', 'Completa nombre, fecha, municipio, región y categoría.');
      return;
    }
    setSubmitting(true);
    try {
      await submitEvent({
        name: form.name,
        dateStart: form.date,
        time: form.time,
        town: form.town,
        region: form.region,
        category: form.category,
        description: form.description,
      }, user?.id);
      setSubmitted(true);
    } catch {
      Alert.alert('Error', 'No se pudo enviar el evento. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.successWrap}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.successTitle}>¡Evento enviado!</Text>
          <Text style={styles.successSubtitle}>
            Tu evento ha sido enviado para revisión. Aparecerá en la app en 24-48 horas.
          </Text>
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={() => {
              setSubmitted(false);
              setImage(null);
              setForm(EMPTY_FORM);
              setExtracted(false);
            }}
          >
            <Text style={styles.submitBtnText}>Enviar otro evento</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Comparte un evento</Text>
          <Text style={styles.subtitle}>
            Sube el póster y extraemos los datos automáticamente
          </Text>
        </View>

        {/* Image upload */}
        <View style={styles.uploadSection}>
          {image ? (
            <View style={styles.previewWrap}>
              <Image source={{ uri: image }} style={styles.previewImg} resizeMode="cover" />
              <TouchableOpacity style={styles.changeImgBtn} onPress={() => setImage(null)}>
                <Text style={styles.changeImgText}>Cambiar imagen</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadBox}>
              <Text style={styles.uploadEmoji}>🖼️</Text>
              <Text style={styles.uploadTitle}>Sube el póster del evento</Text>
              <Text style={styles.uploadSubtitle}>
                Foto de cartel, imagen de WhatsApp o redes sociales
              </Text>
              <View style={styles.uploadBtns}>
                <TouchableOpacity
                  style={[styles.uploadBtn, { backgroundColor: Colors.primary }]}
                  onPress={() => pickImage(false)}
                >
                  <Text style={styles.uploadBtnText}>📂 Galería</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.uploadBtn, { backgroundColor: Colors.accent }]}
                  onPress={() => pickImage(true)}
                >
                  <Text style={styles.uploadBtnText}>📷 Cámara</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Extract button */}
        {image && !extracted && (
          <TouchableOpacity
            style={[styles.extractBtn, isExtracting && { opacity: 0.7 }]}
            onPress={extractFromPoster}
            disabled={isExtracting}
          >
            {isExtracting ? (
              <>
                <ActivityIndicator color={Colors.white} size="small" />
                <Text style={styles.extractBtnText}>Analizando póster con IA...</Text>
              </>
            ) : (
              <>
                <Text style={styles.extractBtnText}>🤖 Analizar póster automáticamente</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {extracted && (
          <View style={styles.extractedNote}>
            <Text style={styles.extractedNoteText}>
              ✨ Datos extraídos del póster. Revisa y corrige si es necesario.
            </Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          <FormField
            label="Nombre del evento *"
            value={form.name}
            onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
            placeholder="Ej: Fiestas del Ángel"
            highlighted={extracted && !!form.name}
          />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <FormField
                label="Fecha inicio *"
                value={form.date}
                onChangeText={(v) => setForm((p) => ({ ...p, date: v }))}
                placeholder="2026-07-10"
                highlighted={extracted && !!form.date}
              />
            </View>
            <View style={{ flex: 1 }}>
              <FormField
                label="Hora"
                value={form.time}
                onChangeText={(v) => setForm((p) => ({ ...p, time: v }))}
                placeholder="20:00"
                highlighted={extracted && !!form.time}
              />
            </View>
          </View>
          <FormField
            label="Municipio *"
            value={form.town}
            onChangeText={(v) => setForm((p) => ({ ...p, town: v }))}
            placeholder="Ej: Mora de Rubielos"
            highlighted={extracted && !!form.town}
          />

          {/* Region picker */}
          <Text style={styles.fieldLabel}>Región *</Text>
          <View style={styles.pickerRow}>
            {REGIONS.filter((r) => r.id !== 'todas').map((r) => (
              <TouchableOpacity
                key={r.id}
                style={[styles.pickerChip, form.region === r.id && styles.pickerChipActive]}
                onPress={() => setForm((p) => ({ ...p, region: r.id }))}
              >
                <Text style={styles.pickerChipEmoji}>{r.flag}</Text>
                <Text
                  style={[
                    styles.pickerChipText,
                    form.region === r.id && styles.pickerChipTextActive,
                  ]}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category picker */}
          <Text style={styles.fieldLabel}>Categoría *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catPicker}
          >
            {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catChip,
                  form.category === cat.id && { backgroundColor: cat.color, borderColor: cat.color },
                ]}
                onPress={() => setForm((p) => ({ ...p, category: cat.id as EventCategory }))}
              >
                <Text style={styles.catChipEmoji}>{cat.emoji}</Text>
                <Text
                  style={[
                    styles.catChipText,
                    form.category === cat.id && { color: Colors.white },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FormField
            label="Descripción"
            value={form.description}
            onChangeText={(v) => setForm((p) => ({ ...p, description: v }))}
            placeholder="Describe brevemente el evento..."
            multiline
            highlighted={extracted && !!form.description}
          />

          {/* Source info */}
          <View style={styles.sourceInfo}>
            <Text style={styles.sourceInfoTitle}>📱 Fuente del evento</Text>
            <Text style={styles.sourceInfoText}>
              Tu evento se publicará como "Compartido por la comunidad". Si eres el Ayuntamiento u organización oficial, contacta con nosotros para verificar tu cuenta.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.submitBtnText}>Enviar evento →</Text>}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Al enviar confirmas que tienes permiso para compartir este evento y que los datos son correctos.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  highlighted,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  highlighted?: boolean;
}) {
  return (
    <View style={ffStyles.wrap}>
      <Text style={ffStyles.label}>{label}</Text>
      <TextInput
        style={[
          ffStyles.input,
          multiline && ffStyles.inputMulti,
          highlighted && ffStyles.inputHighlighted,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textLight}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );
}

const ffStyles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 5 },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  inputHighlighted: { borderColor: Colors.success, backgroundColor: '#F0FFF4' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 40 },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  uploadSection: { marginHorizontal: 16, marginBottom: 12 },
  uploadBox: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    padding: 28,
    alignItems: 'center',
    gap: 8,
  },
  uploadEmoji: { fontSize: 40 },
  uploadTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  uploadSubtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
  uploadBtns: { flexDirection: 'row', gap: 10, marginTop: 8 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, gap: 6 },
  uploadBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  previewWrap: { borderRadius: 16, overflow: 'hidden' },
  previewImg: { width: '100%', height: 200, borderRadius: 16 },
  changeImgBtn: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  changeImgText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  extractBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    backgroundColor: '#5B2C8D',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginBottom: 12,
  },
  extractBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  extractedNote: { marginHorizontal: 16, backgroundColor: '#F0FFF4', borderRadius: 10, padding: 12, marginBottom: 8 },
  extractedNoteText: { fontSize: 13, color: Colors.success, fontWeight: '600', textAlign: 'center' },
  form: { paddingHorizontal: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 6, marginTop: 4 },
  row: { flexDirection: 'row', gap: 10 },
  pickerRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  pickerChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 5,
  },
  pickerChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  pickerChipEmoji: { fontSize: 16 },
  pickerChipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  pickerChipTextActive: { color: Colors.white },
  catPicker: { gap: 8, paddingBottom: 14 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 5,
  },
  catChipEmoji: { fontSize: 14 },
  catChipText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  sourceInfo: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 6,
  },
  sourceInfoTitle: { fontSize: 13, fontWeight: '700', color: Colors.accent },
  sourceInfoText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitBtnText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
  disclaimer: { fontSize: 11, color: Colors.textLight, textAlign: 'center', lineHeight: 16 },
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  successEmoji: { fontSize: 64 },
  successTitle: { fontSize: 26, fontWeight: '800', color: Colors.text },
  successSubtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
