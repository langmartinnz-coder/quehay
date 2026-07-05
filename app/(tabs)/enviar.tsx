import React, { useState, useEffect, useRef } from 'react';
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
  Modal,
  PanResponder,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/colors';
import { CATEGORIES, REGIONS } from '../../constants/categories';
import { EventCategory } from '../../types';
import { useApp } from '../../store/AppContext';
import { submitEvent } from '../../lib/api';
import { formatDateRange } from '../../data/mockData';
import { extractPosterData } from '../../lib/extractPoster';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../store/LanguageContext';
import { resolveCoordinates, coordsToRegion } from '../../lib/geocode';
import { useShareIntentContext } from 'expo-share-intent';
import { File as FSFile } from 'expo-file-system';
import { copyAsync, cacheDirectory } from 'expo-file-system/legacy';

type CropSource = { uri: string; base64: string | null; mime: string; width: number; height: number };

interface FormState {
  name: string;
  date: string;
  dateEnd: string;
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
  dateEnd: '',
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
  const [regionOpen, setRegionOpen] = useState(false);
  const [regionAutoFilled, setRegionAutoFilled] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [cropSource, setCropSource] = useState<CropSource | null>(null);

  // Share intent — app was opened via the OS share sheet with an image
  const { isReady: shareIntentReady, hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();
  const processedSharePath = useRef<string | null>(null);

  useEffect(() => {
    if (!shareIntentReady || !hasShareIntent) return;
    const file = shareIntent.files?.[0];
    if (!file || !file.mimeType.startsWith('image/')) return;
    if (processedSharePath.current === file.path) return;

    // Capture stable values before the async closure (avoids stale reference issues)
    const filePath = file.path;
    const fileMime = file.mimeType;
    processedSharePath.current = filePath;

    async function loadAndExtract() {
      try {
        // Normalize to a URI: raw paths get file:// prefix; content:// and file:// pass through
        let fileUri: string;
        if (filePath.startsWith('file://') || filePath.startsWith('content://')) {
          fileUri = filePath;
        } else {
          fileUri = `file://${filePath}`;
        }

        // Android shares often arrive as content:// URIs. The new File API only handles
        // file:// — copy to cache first so we can read base64.
        let readUri = fileUri;
        if (fileUri.startsWith('content://')) {
          const ext = fileMime.includes('png') ? 'png' : 'jpg';
          const dest = `${cacheDirectory}shared_${Date.now()}.${ext}`;
          await copyAsync({ from: fileUri, to: dest });
          readUri = dest;
        }

        const base64 = await new FSFile(readUri).base64();
        resetAll();
        setImage(fileUri);
        setImageBase64(base64);
        setImageMimeType(fileMime);
        resetShareIntent();
        extractFromPoster(base64, fileMime);
      } catch (err) {
        console.error('[enviar] Failed to load shared image:', err);
      }
    }

    loadAndExtract();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareIntentReady, hasShareIntent, shareIntent]);

  // Auto-detect region from geocoded town coordinates (debounced 800 ms).
  // Only fires when town has ≥3 characters; updates region unless the user
  // has manually overridden it (regionAutoFilled tracks who last set it).
  useEffect(() => {
    const town = form.town.trim();
    if (town.length < 3) return;
    const timer = setTimeout(async () => {
      try {
        const coords = await resolveCoordinates(town);
        if (coords.lat === 0 && coords.lng === 0) return;
        const detected = coordsToRegion(coords.lat, coords.lng);
        if (detected) {
          setForm((p) => ({ ...p, region: detected }));
          setRegionAutoFilled(true);
        }
      } catch {
        // silently ignore — user can pick manually
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [form.town]);

  function resetAll() {
    setImage(null);
    setImageBase64(null);
    setForm(EMPTY_FORM);
    setExtracted(false);
    setSubmitError(null);
    setExtractError(null);
    setRegionAutoFilled(false);
    processedSharePath.current = null;
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
      console.log('[enviar] image picked — uri:', asset.uri, 'size:', asset.width, 'x', asset.height);
      setCropSource({
        uri: asset.uri,
        base64: asset.base64 ?? null,
        mime: asset.mimeType ?? 'image/jpeg',
        width: asset.width,
        height: asset.height,
      });
      setCropMode(true);
      setExtracted(false);
      setExtractError(null);
      setForm(EMPTY_FORM);
      console.log('[enviar] cropMode → true, CropModal should appear');
    } else {
      console.log('[enviar] image picker cancelled or no asset');
    }
  }

  function handleCropDone(croppedUri: string, croppedBase64: string | null, mime: string) {
    setCropMode(false);
    setCropSource(null);
    setImage(croppedUri);
    setImageBase64(croppedBase64);
    setImageMimeType(mime);
  }

  function handleCropSkip() {
    if (!cropSource) return;
    setCropMode(false);
    setImage(cropSource.uri);
    setImageBase64(cropSource.base64);
    setImageMimeType(cropSource.mime);
    setCropSource(null);
  }

  async function extractFromPoster(base64Override?: string, mimeOverride?: string) {
    const b64 = base64Override ?? imageBase64;
    const mime = mimeOverride ?? imageMimeType;
    if (!b64) return;
    setIsExtracting(true);
    setExtractError(null);
    try {
      const data = await extractPosterData(b64, mime);
      setForm((prev) => ({
        ...prev,
        ...(data.name && { name: data.name }),
        ...(data.date && { date: data.date }),
        ...(data.dateEnd && { dateEnd: data.dateEnd }),
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
      const [imageUrl, coords] = await Promise.all([
        uploadPosterImage(),
        resolveCoordinates(form.town),
      ]);
      await submitEvent({
        name: form.name,
        dateStart: form.date,
        dateEnd: form.dateEnd || undefined,
        time: form.time,
        town: form.town,
        region: form.region,
        category: form.category,
        description: form.description,
        isFree: form.isFree,
        price: form.price || undefined,
        imageUrl: imageUrl ?? undefined,
        lat: coords.lat,
        lng: coords.lng,
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

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    // If there's an end date, check that; otherwise check the start date.
    // This allows ongoing events (e.g. exhibitions) that started in the past but end in the future.
    const dateToCheck = form.dateEnd.trim() || form.date.trim();
    const isPast = dateToCheck < todayStr;
    console.log('[enviar] date validation — today:', todayStr, '| checking:', dateToCheck, '| isPast:', isPast);
    if (isPast) {
      Alert.alert(t.pastDateTitle, t.pastDateMsg);
      return;
    }

    try {
      const duplicate = await checkForDuplicates(form.name, form.date);
      if (duplicate) {
        Alert.alert(
          t.duplicateTitle,
          t.duplicateMsg(duplicate.name, formatDateRange(duplicate.date_start)),
          [{ text: t.duplicateCancel, style: 'cancel' }],
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
    <>
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t.submitTitle}</Text>
          <Text style={styles.subtitle}>{t.submitSubtitle}</Text>
        </View>

        {/* Image preview with change-image overlay */}
        {image && (
          <View style={styles.previewWrap}>
            <Image source={{ uri: image }} style={styles.previewImg} resizeMode="cover" />
            {!isExtracting && !extracted && (
              <TouchableOpacity style={styles.changeImgBtn} onPress={resetAll}>
                <Text style={styles.changeImgText}>{t.changeImage}</Text>
              </TouchableOpacity>
            )}
          </View>
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
            onPress={() => extractFromPoster()}
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
                label={t.fieldDateEnd}
                value={form.dateEnd}
                onChangeText={(v) => setForm((p) => ({ ...p, dateEnd: v }))}
                placeholder="2026-07-14"
                highlighted={extracted && !!form.dateEnd}
              />
            </View>
          </View>
          <FormField
            label={t.fieldTime}
            value={form.time}
            onChangeText={(v) => setForm((p) => ({ ...p, time: v }))}
            placeholder="20:00"
            highlighted={extracted && !!form.time}
          />
          <FormField
            label={t.fieldTown}
            value={form.town}
            onChangeText={(v) => setForm((p) => ({ ...p, town: v }))}
            placeholder={t.fieldTownPlaceholder}
            highlighted={extracted && !!form.town}
          />

          {/* Region picker */}
          <Text style={styles.fieldLabel}>{t.fieldRegion}</Text>
          <TouchableOpacity
            style={[styles.dropdownTrigger, regionOpen && styles.dropdownTriggerOpen]}
            onPress={() => setRegionOpen(true)}
            activeOpacity={0.7}
          >
            {form.region ? (
              <View style={styles.dropdownValue}>
                <Text style={styles.dropdownValueFlag}>
                  {REGIONS.find((r) => r.id === form.region)?.flag}
                </Text>
                <Text style={styles.dropdownValueText}>
                  {REGIONS.find((r) => r.id === form.region)?.label}
                </Text>
                {regionAutoFilled && (
                  <View style={styles.autoTag}>
                    <Text style={styles.autoTagText}>auto</Text>
                  </View>
                )}
              </View>
            ) : (
              <Text style={styles.dropdownPlaceholder}>{t.fieldRegionSelect}</Text>
            )}
            <Text style={styles.dropdownChevron}>{regionOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          <Modal
            visible={regionOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setRegionOpen(false)}
          >
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setRegionOpen(false)}
            />
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t.fieldRegion}</Text>
                <TouchableOpacity onPress={() => setRegionOpen(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {REGIONS.filter((r) => r.id !== 'todas').map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={[
                      styles.modalOption,
                      form.region === r.id && styles.modalOptionActive,
                    ]}
                    onPress={() => {
                      setForm((p) => ({ ...p, region: r.id }));
                      setRegionAutoFilled(false);
                      setRegionOpen(false);
                    }}
                  >
                    <Text style={styles.modalOptionFlag}>{r.flag}</Text>
                    <Text
                      style={[
                        styles.modalOptionText,
                        form.region === r.id && styles.modalOptionTextActive,
                      ]}
                    >
                      {r.label}
                    </Text>
                    {form.region === r.id && (
                      <Text style={styles.modalOptionCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Modal>

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
    <CropModal
      visible={cropMode && !!cropSource}
      uri={cropSource?.uri ?? ''}
      imgWidth={cropSource?.width ?? 0}
      imgHeight={cropSource?.height ?? 0}
      onConfirm={handleCropDone}
      onSkip={handleCropSkip}
    />
    </>
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

function CropModal({
  visible,
  uri,
  imgWidth,
  imgHeight,
  onConfirm,
  onSkip,
}: {
  visible: boolean;
  uri: string;
  imgWidth: number;
  imgHeight: number;
  onConfirm: (croppedUri: string, base64: string | null, mime: string) => void;
  onSkip: () => void;
}) {
  const { width: W, height: H } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const HANDLE_SZ = 30;
  const HS = HANDLE_SZ / 2;
  const MIN_SIZE = 60;
  const BUTTON_H = 110 + insets.bottom;
  const IMG_H = H - BUTTON_H;

  const [rect, setRect] = useState({ x1: W * 0.05, y1: IMG_H * 0.05, x2: W * 0.95, y2: IMG_H * 0.95 });
  const [applying, setApplying] = useState(false);
  const rectRef = React.useRef(rect);
  rectRef.current = rect;

  function makePan(corner: 'TL' | 'TR' | 'BL' | 'BR') {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        setRect((prev) => {
          let { x1, y1, x2, y2 } = prev;
          const nx = Math.max(0, Math.min(W, gs.moveX));
          const ny = Math.max(0, Math.min(IMG_H, gs.moveY));
          if (corner === 'TL') {
            x1 = Math.min(nx, x2 - MIN_SIZE);
            y1 = Math.min(ny, y2 - MIN_SIZE);
          } else if (corner === 'TR') {
            x2 = Math.max(nx, x1 + MIN_SIZE);
            y1 = Math.min(ny, y2 - MIN_SIZE);
          } else if (corner === 'BL') {
            x1 = Math.min(nx, x2 - MIN_SIZE);
            y2 = Math.max(ny, y1 + MIN_SIZE);
          } else {
            x2 = Math.max(nx, x1 + MIN_SIZE);
            y2 = Math.max(ny, y1 + MIN_SIZE);
          }
          return { x1, y1, x2, y2 };
        });
      },
    });
  }

  const panTL = React.useRef(makePan('TL')).current;
  const panTR = React.useRef(makePan('TR')).current;
  const panBL = React.useRef(makePan('BL')).current;
  const panBR = React.useRef(makePan('BR')).current;

  async function applyCrop() {
    setApplying(true);
    try {
      const { x1, y1, x2, y2 } = rectRef.current;

      // Map screen crop rect → image pixel rect (contain-mode transform)
      const scale = Math.min(W / imgWidth, IMG_H / imgHeight);
      const dW = imgWidth * scale;
      const dH = imgHeight * scale;
      const ox = (W - dW) / 2;
      const oy = (IMG_H - dH) / 2;

      const imgX1 = Math.max(0, (x1 - ox) / scale);
      const imgY1 = Math.max(0, (y1 - oy) / scale);
      const imgX2 = Math.min(imgWidth, (x2 - ox) / scale);
      const imgY2 = Math.min(imgHeight, (y2 - oy) / scale);

      const cropW = Math.round(imgX2 - imgX1);
      const cropH = Math.round(imgY2 - imgY1);

      if (cropW < 20 || cropH < 20) { onSkip(); return; }

      const result = await manipulateAsync(
        uri,
        [{ crop: { originX: Math.round(imgX1), originY: Math.round(imgY1), width: cropW, height: cropH } }],
        { compress: 0.85, format: SaveFormat.JPEG, base64: true },
      );
      onConfirm(result.uri, result.base64 ?? null, 'image/jpeg');
    } catch (err) {
      console.error('[crop] manipulateAsync error:', err);
      onSkip();
    } finally {
      setApplying(false);
    }
  }

  const { x1, y1, x2, y2 } = rect;
  const cropW = x2 - x1;
  const cropH = y2 - y1;

  return (
    <Modal visible={visible} transparent={false} animationType="slide" statusBarTranslucent onRequestClose={onSkip}>
      <StatusBar hidden />
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {/* Image display */}
        <View style={{ width: W, height: IMG_H }}>
          <Image source={{ uri }} style={{ width: W, height: IMG_H }} resizeMode="contain" />

          {/* Dark mask outside crop area */}
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: y1, backgroundColor: 'rgba(0,0,0,0.55)' }} />
            <View style={{ position: 'absolute', top: y2, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)' }} />
            <View style={{ position: 'absolute', top: y1, left: 0, width: x1, height: cropH, backgroundColor: 'rgba(0,0,0,0.55)' }} />
            <View style={{ position: 'absolute', top: y1, left: x2, right: 0, height: cropH, backgroundColor: 'rgba(0,0,0,0.55)' }} />
          </View>

          {/* Crop border */}
          <View pointerEvents="none" style={{ position: 'absolute', left: x1, top: y1, width: cropW, height: cropH, borderWidth: 1.5, borderColor: '#fff' }} />

          {/* Rule-of-thirds grid */}
          <View pointerEvents="none" style={{ position: 'absolute', left: x1 + cropW / 3, top: y1, width: 1, height: cropH, backgroundColor: 'rgba(255,255,255,0.28)' }} />
          <View pointerEvents="none" style={{ position: 'absolute', left: x1 + (2 * cropW) / 3, top: y1, width: 1, height: cropH, backgroundColor: 'rgba(255,255,255,0.28)' }} />
          <View pointerEvents="none" style={{ position: 'absolute', left: x1, top: y1 + cropH / 3, width: cropW, height: 1, backgroundColor: 'rgba(255,255,255,0.28)' }} />
          <View pointerEvents="none" style={{ position: 'absolute', left: x1, top: y1 + (2 * cropH) / 3, width: cropW, height: 1, backgroundColor: 'rgba(255,255,255,0.28)' }} />

          {/* Corner handles — terracotta L-shapes */}
          <View {...panTL.panHandlers} style={{ position: 'absolute', left: x1 - HS, top: y1 - HS, width: HANDLE_SZ, height: HANDLE_SZ }}>
            <View style={{ position: 'absolute', top: 0, left: 0, width: HANDLE_SZ, height: 4, backgroundColor: Colors.primary, borderRadius: 2 }} />
            <View style={{ position: 'absolute', top: 0, left: 0, width: 4, height: HANDLE_SZ, backgroundColor: Colors.primary, borderRadius: 2 }} />
          </View>
          <View {...panTR.panHandlers} style={{ position: 'absolute', left: x2 - HS, top: y1 - HS, width: HANDLE_SZ, height: HANDLE_SZ }}>
            <View style={{ position: 'absolute', top: 0, right: 0, width: HANDLE_SZ, height: 4, backgroundColor: Colors.primary, borderRadius: 2 }} />
            <View style={{ position: 'absolute', top: 0, right: 0, width: 4, height: HANDLE_SZ, backgroundColor: Colors.primary, borderRadius: 2 }} />
          </View>
          <View {...panBL.panHandlers} style={{ position: 'absolute', left: x1 - HS, top: y2 - HS, width: HANDLE_SZ, height: HANDLE_SZ }}>
            <View style={{ position: 'absolute', bottom: 0, left: 0, width: HANDLE_SZ, height: 4, backgroundColor: Colors.primary, borderRadius: 2 }} />
            <View style={{ position: 'absolute', bottom: 0, left: 0, width: 4, height: HANDLE_SZ, backgroundColor: Colors.primary, borderRadius: 2 }} />
          </View>
          <View {...panBR.panHandlers} style={{ position: 'absolute', left: x2 - HS, top: y2 - HS, width: HANDLE_SZ, height: HANDLE_SZ }}>
            <View style={{ position: 'absolute', bottom: 0, right: 0, width: HANDLE_SZ, height: 4, backgroundColor: Colors.primary, borderRadius: 2 }} />
            <View style={{ position: 'absolute', bottom: 0, right: 0, width: 4, height: HANDLE_SZ, backgroundColor: Colors.primary, borderRadius: 2 }} />
          </View>
        </View>

        {/* Controls */}
        <View style={{ height: BUTTON_H, backgroundColor: '#111', paddingHorizontal: 16, paddingTop: 14, paddingBottom: insets.bottom + 14, gap: 10 }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', fontSize: 13 }}>
            Arrastra las esquinas para recortar el póster
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={onSkip}
              style={{ flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)' }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Sin recorte</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={applyCrop}
              disabled={applying}
              style={{ flex: 2, borderRadius: 12, paddingVertical: 13, alignItems: 'center', backgroundColor: Colors.primary, opacity: applying ? 0.7 : 1 }}
            >
              {applying
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>✓ Confirmar recorte</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
  previewWrap: { width: '100%', height: 220 },
  previewImg: { width: '100%', height: 220 },
  changeImgBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
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
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 14,
  },
  dropdownTriggerOpen: {
    borderColor: Colors.primary,
  },
  dropdownValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  dropdownValueFlag: { fontSize: 16 },
  dropdownValueText: { fontSize: 14, fontWeight: '600', color: Colors.text },
  dropdownPlaceholder: { fontSize: 14, color: Colors.textLight, flex: 1 },
  autoTag: {
    backgroundColor: '#FEF0E8',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: Colors.secondaryLight,
  },
  autoTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdownChevron: { fontSize: 10, color: Colors.textSecondary, marginLeft: 8 },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  modalClose: { fontSize: 16, color: Colors.textLight, fontWeight: '700', padding: 4 },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalOptionActive: { backgroundColor: '#FEF5EF' },
  modalOptionFlag: { fontSize: 20 },
  modalOptionText: { fontSize: 15, color: Colors.text, flex: 1 },
  modalOptionTextActive: { fontWeight: '700', color: Colors.primary },
  modalOptionCheck: { fontSize: 16, color: Colors.primary, fontWeight: '700' },
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  successEmoji: { fontSize: 64 },
  successTitle: { fontSize: 26, fontWeight: '800', color: Colors.text },
  successSubtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
