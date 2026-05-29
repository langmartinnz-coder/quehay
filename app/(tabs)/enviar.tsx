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
import { extractPosterData } from '../../lib/extractPoster';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../store/LanguageContext';

interface FormState {
  name: string;
  date: string;
  time: string;
  town: string;
  region: string;
  category: EventCategory | '';
  description: string;
  source: string;
  isFree: boolean;
  price: string;
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
  isFree: true,
  price: '',
};

export default function EnviarScreen() {
  const { t } = useLanguage();
  const { user } = useApp();
  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extracted, setExtracted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);

  function resetAll() {
    setImage(null);
    setImageBase64(null);
    setForm(EMPTY_FORM);
    setExtracted(false);
    setSubmitError(null);
    setExtractError(null);
  }

  async function pickImage(useCamera: boolean) {
    const opts = {
      quality: 0.8 as const,
      base64: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    };
    const result = useCamera
      ? await ImagePicker.launchCameraAsync(opts)
      : await ImagePicker.launchImageLibraryAsync(opts);

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      console.log('[enviar] image URI:', asset.uri);
      setImage(asset.uri);
      setImageBase64(asset.base64 ?? null);
      setImageMimeType(asset.mimeType ?? 'image/jpeg');
      setExtracted(false);
      setExtractError(null);
      setForm(EMPTY_FORM);
    }
  }

  async function extractFromPoster() {
    if (!imageBase64) return;
    setIsExtracting(true);
    setExtractError(null);
    try {
      const data = await extractPosterData(imageBase64, imageMimeType);
      setForm((prev) => ({
        ...prev,
        ...(data.name && { name: data.name }),
        ...(data.date && { date: data.date }),
        ...(data.time && { time: data.time }),
        ...(data.town && { town: data.town }),
        ...(data.description && { description: data.description }),
        ...(data.category && { category: data.category }),
        ...(data.isFree !== undefined && { isFree: data.isFree }),
        ...(data.price && { price: data.price }),
      }));
      setExtracted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[enviar] extractPosterData failed:', msg, err);
      setExtractError(msg || t.alertErrorMsg);
    } finally {
      setIsExtracting(false);
    }
  }

  async function uploadPosterImage(): Promise<string | null> {
    if (!image || !imageBase64) return null;
    const ext = imageMimeType.includes('png') ? 'png' : 'jpg';
    const path = `posters/usr_${Date.now()}.${ext}`;

    // Decode base64 to Uint8Array — avoids fetch(file://) which fails on Android
    const decoded = atob(imageBase64);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }

    const { error } = await supabase.storage
      .from('event-posters')
      .upload(path, bytes, { contentType: imageMimeType, upsert: false });

    if (error) {
      console.error('[enviar] Storage upload failed:', error.message);
      throw new Error(`${t.alertErrorMsg}: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('event-posters')
      .getPublicUrl(path);

    console.log('[enviar] Poster uploaded:', publicUrl);
    return publicUrl;
  }

  async function checkForDuplicates(name: string, date: string): Promise<{ name: string; date_start: string } | null> {
    const parsedDate = new Date(date + 'T00:00:00');
    const minDate = new Date(parsedDate.getTime() - 2 * 86400000).toISOString().slice(0, 10);
    const maxDate = new Date(parsedDate.getTime() + 2 * 86400000).toISOString().slice(0, 10);
    const { data } = await supabase
      .from('events')
      .select('name, date_start')
      .ilike('name', `%${name.trim()}%`)
      .gte('date_start', minDate)
      .lte('date_start', maxDate)
      .limit(1);
    return (data as { name: string; date_start: string }[] | null)?.[0] ?? null;
  }

  async function doSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const imageUrl = await uploadPosterImage();
      await submitEvent({
        name: form.name,
        dateStart: form.date,
        time: form.time,
        town: form.town,
        region: form.region,
        category: form.category,
        description: form.description,
        isFree: form.isFree,
        price: form.price || undefined,
        imageUrl: imageUrl ?? undefined,
      }, user?.id);
      setSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[enviar] submitEvent failed:', msg, err);
      setSubmitError(msg || t.alertErrorMsg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit() {
    const missing: string[] = [];
    if (!form.name.trim()) missing.push('nombre');
    if (!form.date.trim()) missing.push('fecha');
    if (!form.town.trim()) missing.push('municipio');
    if (!form.region) missing.push('región');
    if (!form.category) missing.push('categoría');

    if (missing.length > 0) {
      console.warn('[enviar] Submit blocked — empty fields:', missing);
      console.warn('[enviar] Full form state:', JSON.stringify(form));
      Alert.alert(t.alertMissingData, t.alertMissingDataMsg);
      return;
    }

    try {
      const duplicate = await checkForDuplicates(form.name, form.date);
      if (duplicate) {
        Alert.alert(
          t.duplicateTitle,
          t.duplicateMsg(duplicate.name, duplicate.date_start),
          [
            { text: t.duplicateCancel, style: 'cancel' },
            { text: t.duplicateSubmitAnyway, onPress: doSubmit },
          ],
        );
        return;
      }
    } catch {
      // duplicate check failed — proceed with submission
    }

    doSubmit();
  }

  if (submitted) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.successWrap}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.successTitle}>{t.successTitle}</Text>
          <Text style={styles.successSubtitle}>{t.successSubtitle}</Text>
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={() => {
              setSubmitted(false);
              setImage(null);
              setImageBase64(null);
              setForm(EMPTY_FORM);
              setExtracted(false);
            }}
          >
            <Text style={styles.submitBtnText}>{t.submitAnother}</Text>
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
          <Text style={styles.title}>{t.submitTitle}</Text>
          <Text style={styles.subtitle}>{t.submitSubtitle}</Text>
        </View>

        {/* Image preview — rendered directly when URI is set */}
        {image && (
          <Image
            source={{ uri: image }}
            style={{ width: '100%', height: 220 }}
            resizeMode="cover"
          />
        )}
        {image && (
          <TouchableOpacity style={styles.changeImgBtn} onPress={resetAll}>
            <Text style={styles.changeImgText}>{t.changeImage}</Text>
          </TouchableOpacity>
        )}

        {/* Upload box — shown when no image selected */}
        {!image && (
          <View style={styles.uploadSection}>
            <View style={styles.uploadBox}>
              <Text style={styles.uploadEmoji}>🖼️</Text>
              <Text style={styles.uploadTitle}>{t.uploadTitle}</Text>
              <Text style={styles.uploadSubtitle}>{t.uploadSubtitle}</Text>
              <View style={styles.uploadBtns}>
                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={() => pickImage(false)}
                >
                  <Text style={styles.uploadBtnText}>{t.galleryBtn}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.uploadBtn, styles.uploadBtnSecondary]}
                  onPress={() => pickImage(true)}
                >
                  <Text style={styles.uploadBtnText}>{t.cameraBtn}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Extract button — hidden while extracting or after any outcome */}
        {image && !extracted && !extractError && (
          <TouchableOpacity
            style={[styles.extractBtn, isExtracting && { opacity: 0.7 }]}
            onPress={extractFromPoster}
            disabled={isExtracting}
          >
            {isExtracting ? (
              <>
                <ActivityIndicator color={Colors.white} size="small" />
                <Text style={styles.extractBtnText}>{t.analyzing}</Text>
              </>
            ) : (
              <Text style={styles.extractBtnText}>{t.analyzeBtn}</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Extraction error banner */}
        {extractError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerTitle}>⚠️ {t.alertError}</Text>
            <Text style={styles.errorBannerMsg}>{extractError}</Text>
            <TouchableOpacity style={styles.retryBtnPrimary} onPress={resetAll}>
              <Text style={styles.retryBtnPrimaryText}>{t.retryPoster}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Extraction success note */}
        {extracted && (
          <View style={styles.extractedNote}>
            <Text style={[styles.extractedNoteText, { flex: 1 }]}>{t.extractedNote}</Text>
            <TouchableOpacity onPress={resetAll} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>{t.retryPoster}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          <FormField
            label={t.fieldEventName}
            value={form.name}
            onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
            placeholder={t.fieldEventNamePlaceholder}
            highlighted={extracted && !!form.name}
          />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <FormField
                label={t.fieldDateStart}
                value={form.date}
                onChangeText={(v) => setForm((p) => ({ ...p, date: v }))}
                placeholder="2026-07-10"
                highlighted={extracted && !!form.date}
              />
            </View>
            <View style={{ flex: 1 }}>
              <FormField
                label={t.fieldTime}
                value={form.time}
                onChangeText={(v) => setForm((p) => ({ ...p, time: v }))}
                placeholder="20:00"
                highlighted={extracted && !!form.time}
              />
            </View>
          </View>
          <FormField
            label={t.fieldTown}
            value={form.town}
            onChangeText={(v) => setForm((p) => ({ ...p, town: v }))}
            placeholder={t.fieldTownPlaceholder}
            highlighted={extracted && !!form.town}
          />

          {/* Region picker */}
          <Text style={styles.fieldLabel}>{t.fieldRegion}</Text>
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
          <Text style={styles.fieldLabel}>{t.fieldCategory}</Text>
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
                  form.category === cat.id && styles.catChipActive,
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
            label={t.fieldDescription}
            value={form.description}
            onChangeText={(v) => setForm((p) => ({ ...p, description: v }))}
            placeholder={t.fieldDescriptionPlaceholder}
            multiline
            highlighted={extracted && !!form.description}
          />

          {/* Free / paid toggle */}
          <Text style={styles.fieldLabel}>{t.fieldIsFree}</Text>
          <View style={[styles.pickerRow, { marginBottom: 14 }]}>
            <TouchableOpacity
              style={[styles.pickerChip, form.isFree && styles.pickerChipActive]}
              onPress={() => setForm((p) => ({ ...p, isFree: true, price: '' }))}
            >
              <Text style={styles.pickerChipEmoji}>🎟️</Text>
              <Text style={[styles.pickerChipText, form.isFree && styles.pickerChipTextActive]}>
                {t.fieldIsFreeYes}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pickerChip, !form.isFree && styles.pickerChipActive]}
              onPress={() => setForm((p) => ({ ...p, isFree: false }))}
            >
              <Text style={styles.pickerChipEmoji}>💶</Text>
              <Text style={[styles.pickerChipText, !form.isFree && styles.pickerChipTextActive]}>
                {t.fieldIsFreeNo}
              </Text>
            </TouchableOpacity>
          </View>
          {!form.isFree && (
            <FormField
              label={t.fieldPrice}
              value={form.price}
              onChangeText={(v) => setForm((p) => ({ ...p, price: v }))}
              placeholder="10€"
              highlighted={extracted && !!form.price}
            />
          )}

          {/* Source info */}
          <View style={styles.sourceInfo}>
            <Text style={styles.sourceInfoTitle}>{t.sourceInfoTitle}</Text>
            <Text style={styles.sourceInfoText}>{t.sourceInfoText}</Text>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.submitBtnText}>{t.submitBtn}</Text>}
          </TouchableOpacity>

          {submitError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerTitle}>⚠️ {t.alertError}</Text>
              <Text style={styles.errorBannerMsg}>{submitError}</Text>
              <TouchableOpacity style={styles.retryBtnPrimary} onPress={resetAll}>
                <Text style={styles.retryBtnPrimaryText}>{t.retryPoster}</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.disclaimer}>{t.submitDisclaimer}</Text>
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
    borderRadius: 12,
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
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    backgroundColor: Colors.primary,
  },
  uploadBtnSecondary: {
    backgroundColor: Colors.primaryDark,
  },
  uploadBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  previewWrap: { borderRadius: 16, overflow: 'hidden', width: '100%', height: 220 },
  previewImg: { width: '100%', height: 220 },
  changeImgBtn: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  changeImgText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  extractBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    backgroundColor: Colors.primaryDark,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginBottom: 12,
  },
  extractBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  extractedNote: { marginHorizontal: 16, backgroundColor: '#F0FFF4', borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  extractedNoteText: { fontSize: 13, color: Colors.success, fontWeight: '600' },
  retryBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
  retryBtnText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  errorBanner: { marginHorizontal: 16, backgroundColor: '#FFF0F0', borderRadius: 12, padding: 16, marginBottom: 12, gap: 10, borderWidth: 1, borderColor: '#FFCCCC' },
  errorBannerTitle: { fontSize: 14, fontWeight: '700', color: '#C0392B' },
  errorBannerMsg: { fontSize: 13, color: '#C0392B', lineHeight: 18 },
  retryBtnPrimary: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center' as const },
  retryBtnPrimaryText: { fontSize: 14, fontWeight: '700', color: Colors.white },
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
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 5,
  },
  pickerChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
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
  catChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catChipEmoji: { fontSize: 14 },
  catChipText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  sourceInfo: {
    backgroundColor: '#FEF0E8',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sourceInfoTitle: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  sourceInfoText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
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
