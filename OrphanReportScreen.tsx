import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';
import {
  fetchReportStatus,
  submitReport,
  ReportStatus,
  PickedPhoto,
} from '../../services/orphanService';
import { Skeleton, SkeletonCircle } from '../../components/Skeleton';

const EMERALD = '#0F9D58';
const INK = '#111827';
const SUBTLE = '#8E8E93';
const CARD_BG = '#FFFFFF';
const FIELD_BG = '#F3F4F6';
const PAGE_BG = '#F5F6F8';
const BORDER = '#E7EAEE';
const AMBER = '#E7A400';
const RED = '#E0637A';

const MAX_PHOTOS = 5;
const NOTE_MAX = 500;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/* ------------------------------------------------------------------ *
 * Image picker is loaded lazily so the screen still renders even if
 * `react-native-image-picker` isn't installed yet. If it's missing we
 * fall back to a friendly alert instead of crashing.
 * ------------------------------------------------------------------ */
let launchImageLibrary: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  launchImageLibrary = require('react-native-image-picker').launchImageLibrary;
} catch {
  launchImageLibrary = null;
}

/* ------------------------------- Icons ------------------------------ */
function ChevronLeftIcon({ color = INK, size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 5l-7 7 7 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function CameraIcon({ color = SUBTLE, size = 30 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 8h3l1.5-2h7L17 8h3v11H4z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Circle cx="12" cy="13" r="3.4" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}
function PlusIcon({ color = EMERALD, size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function CloseIcon({ color = '#FFFFFF', size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
    </Svg>
  );
}

/* --------------------------- Rating chips --------------------------- */
function RatingSelector({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.ratingBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <RatingChip key={n} n={n} selected={value === n} onPress={() => onChange(n)} />
        ))}
      </View>
    </View>
  );
}

function RatingChip({ n, selected, onPress }: { n: number; selected: boolean; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.spring(scale, {
      toValue: selected ? 1.08 : 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [selected, scale]);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <Animated.View style={[styles.ratingPill, selected && styles.ratingPillSelected, { transform: [{ scale }] }]}>
        <Text style={[styles.ratingPillText, selected && styles.ratingPillTextSelected]}>{n}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

/* --------------------------- History card --------------------------- */
function HistoryCard({
  name,
  state,
  note,
  onView,
  onSubmit,
}: {
  name: string;
  state: 'submitted' | 'missing' | 'pending';
  note?: string | null;
  onView: () => void;
  onSubmit: () => void;
}) {
  const badge =
    state === 'submitted'
      ? { dot: EMERALD, text: 'Submitted', color: EMERALD, bg: 'rgba(15,157,88,0.1)' }
      : state === 'pending'
        ? { dot: AMBER, text: 'Pending', color: AMBER, bg: 'rgba(231,164,0,0.12)' }
        : { dot: RED, text: 'Missing', color: RED, bg: 'rgba(224,99,122,0.12)' };

  return (
    <View style={styles.historyCard}>
      <View style={styles.historyTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.historyMonth}>{name}</Text>
          {note ? (
            <Text style={styles.historyNote} numberOfLines={1}>
              {note}
            </Text>
          ) : null}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: badge.dot }]} />
          <Text style={[styles.statusBadgeText, { color: badge.color }]}>{badge.text}</Text>
        </View>
      </View>

      {state === 'submitted' ? (
        <TouchableOpacity style={styles.historyViewBtn} activeOpacity={0.85} onPress={onView}>
          <Text style={styles.historyViewText}>View Report</Text>
        </TouchableOpacity>
      ) : state === 'missing' ? (
        <TouchableOpacity style={styles.historySubmitBtn} activeOpacity={0.7} onPress={onSubmit}>
          <Text style={styles.historySubmitText}>Submit Now</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default function OrphanReportScreen() {
  const navigation = useNavigation();
  const { token } = useAuth();
  const scrollRef = useRef<ScrollView>(null);

  const [status, setStatus] = useState<ReportStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [note, setNote] = useState('');
  const [academicRating, setAcademicRating] = useState<number | null>(null);
  const [wellbeingRating, setWellbeingRating] = useState<number | null>(null);
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const data = await fetchReportStatus(token);
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report status.');
    }
  }, [token]);

  useEffect(() => {
    setIsLoading(true);
    load().finally(() => setIsLoading(false));
  }, [load]);

  const now = new Date();
  const currentMonthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  const pickImages = async () => {
    if (!launchImageLibrary) {
      Alert.alert(
        'Photo library unavailable',
        'Install react-native-image-picker to attach photos. The report still submits without them.',
      );
      return;
    }
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      Alert.alert('Limit reached', `You can attach up to ${MAX_PHOTOS} photos.`);
      return;
    }
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: remaining,
      quality: 0.8,
    });
    if (result?.didCancel || !result?.assets) return;
    const picked: PickedPhoto[] = result.assets.map((a: any) => ({
      uri: a.uri,
      fileName: a.fileName,
      type: a.type,
    }));
    setPhotos((prev) => [...prev, ...picked].slice(0, MAX_PHOTOS));
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const canSubmit = !!academicRating && !!wellbeingRating && !isSubmitting;

  const handleSubmit = async () => {
    if (!token) return;
    if (!academicRating || !wellbeingRating) {
      Alert.alert('Almost done', 'Please select both an academic and wellbeing rating.');
      return;
    }
    setIsSubmitting(true);
    try {
      await submitReport(
        token,
        { note, academic_rating: academicRating, wellbeing_rating: wellbeingRating },
        photos,
      );
      Alert.alert('Report submitted', 'Your monthly report has been sent to your school admin.');
      await load();
      setNote('');
      setAcademicRating(null);
      setWellbeingRating(null);
      setPhotos([]);
    } catch (err) {
      Alert.alert('Something went wrong', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => scrollRef.current?.scrollTo({ y: 0, animated: true });

  const formatMonthLabel = (reportMonth: string) => {
    const [year, month] = reportMonth.split('-').map(Number);
    return `${MONTH_NAMES[month - 1]} ${year}`;
  };

  const timeline = (status?.timeline ?? []).map((entry: any) => ({
    name: formatMonthLabel(entry.report_month),
    state: entry.submitted ? ('submitted' as const) : ('missing' as const),
    report: entry.report,
  }));

  const alreadySubmitted = status?.submitted_this_month ?? false;

  return (
    <View style={styles.flex}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={10} activeOpacity={0.8}>
          <ChevronLeftIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Monthly Report</Text>
        <View style={styles.backButton} />
      </View>

      {isLoading ? (
        <View style={styles.scrollContent}>
          <View style={styles.card}>
            <Skeleton width={200} height={22} />
            <Skeleton width={90} height={26} style={{ marginTop: 12, borderRadius: 13 }} />
            <Skeleton width={'100%'} height={120} style={{ marginTop: 20, borderRadius: 20 }} />
            <View style={[styles.ratingRow, { marginTop: 20 }]}>
              {[0, 1, 2, 3, 4].map((i) => (
                <SkeletonCircle key={i} size={52} />
              ))}
            </View>
          </View>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => load()}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form card */}
          <View style={styles.card}>
            {alreadySubmitted ? (
              <>
                <Text style={styles.cardTitle}>You're all set for {currentMonthLabel}</Text>
                <Text style={styles.cardDescription}>
                  Your report for this month has already been submitted. Check the history below
                  to see all your submissions.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.cardTitle}>Submit Your Monthly Report</Text>
                <View style={styles.monthPill}>
                  <Text style={styles.monthPillText}>{currentMonthLabel}</Text>
                </View>

                <Text style={styles.sectionQ}>How was your month?</Text>
                <Text style={styles.cardDescription}>
                  Tell us about your studies, activities, and how you are feeling.
                </Text>

                {/* Reflection */}
                <View style={styles.noteWrap}>
                  <TextInput
                    style={styles.noteInput}
                    placeholder="Share your achievements, activities, challenges, or reflections this month..."
                    placeholderTextColor={SUBTLE}
                    multiline
                    maxLength={NOTE_MAX}
                    value={note}
                    onChangeText={setNote}
                  />
                  <Text style={styles.charCounter}>
                    {note.length}/{NOTE_MAX}
                  </Text>
                </View>

                {/* Photos */}
                <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Attach Photos (Optional)</Text>
                {photos.length === 0 ? (
                  <TouchableOpacity style={styles.uploadArea} activeOpacity={0.8} onPress={pickImages}>
                    <CameraIcon />
                    <Text style={styles.uploadText}>Tap to upload images</Text>
                    <Text style={styles.uploadCaption}>Maximum {MAX_PHOTOS} photos</Text>
                  </TouchableOpacity>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.previewRow}
                  >
                    {photos.map((p, i) => (
                      <View key={`${p.uri}-${i}`} style={styles.previewWrap}>
                        <Image source={{ uri: p.uri }} style={styles.previewImg} />
                        <TouchableOpacity style={styles.previewRemove} onPress={() => removePhoto(i)} hitSlop={8}>
                          <CloseIcon />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {photos.length < MAX_PHOTOS ? (
                      <TouchableOpacity style={styles.addMore} activeOpacity={0.8} onPress={pickImages}>
                        <PlusIcon />
                        <Text style={styles.addMoreText}>Add More</Text>
                      </TouchableOpacity>
                    ) : null}
                  </ScrollView>
                )}

                {/* Ratings */}
                <View style={{ marginTop: 22 }}>
                  <RatingSelector label="Academic Rating" value={academicRating} onChange={setAcademicRating} />
                  <RatingSelector label="Wellbeing Rating" value={wellbeingRating} onChange={setWellbeingRating} />
                </View>

                {/* Submit */}
                <TouchableOpacity
                  style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                  activeOpacity={0.85}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Monthly Report</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* History */}
          <Text style={styles.sectionLabel}>Submission History</Text>
          {timeline.map((month, idx) => (
            <HistoryCard
              key={idx}
              name={month.name}
              state={month.state}
              note={month.report?.note}
              onView={() =>
                Alert.alert(
                  month.name,
                  month.report?.note ? month.report.note : 'Report submitted. No written note was added.',
                )
              }
              onSubmit={scrollToForm}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: PAGE_BG },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 58,
    paddingBottom: 14,
    backgroundColor: CARD_BG,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: INK },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  errorText: { color: '#D70015', textAlign: 'center', marginBottom: 12 },
  retryButton: { backgroundColor: '#F2F2F7', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12 },
  retryText: { color: INK, fontWeight: '700' },

  scrollContent: { padding: 20, paddingBottom: 48 },

  /* Card */
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 28,
    padding: 24,
    marginBottom: 26,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  cardTitle: { fontSize: 21, fontWeight: '800', color: INK },
  monthPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(15,157,88,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 10,
  },
  monthPillText: { fontSize: 13, fontWeight: '700', color: EMERALD },
  sectionQ: { fontSize: 16, fontWeight: '700', color: INK, marginTop: 22 },
  cardDescription: { fontSize: 13.5, color: SUBTLE, marginTop: 6, lineHeight: 19 },

  /* Reflection */
  noteWrap: { marginTop: 16 },
  noteInput: {
    backgroundColor: FIELD_BG,
    borderRadius: 20,
    padding: 16,
    paddingBottom: 30,
    fontSize: 15,
    color: INK,
    minHeight: 120,
    textAlignVertical: 'top',
    lineHeight: 21,
  },
  charCounter: {
    position: 'absolute',
    right: 14,
    bottom: 10,
    fontSize: 11.5,
    color: SUBTLE,
    fontWeight: '600',
  },

  /* Upload */
  uploadArea: {
    marginTop: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#D6DADF',
    borderStyle: 'dashed',
    backgroundColor: FIELD_BG,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: { fontSize: 14.5, fontWeight: '700', color: INK, marginTop: 12 },
  uploadCaption: { fontSize: 12, color: SUBTLE, marginTop: 4 },
  previewRow: { marginTop: 12, paddingRight: 4 },
  previewWrap: { marginRight: 12 },
  previewImg: { width: 84, height: 84, borderRadius: 16, backgroundColor: FIELD_BG },
  previewRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  addMore: {
    width: 84,
    height: 84,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#D6DADF',
    borderStyle: 'dashed',
    backgroundColor: FIELD_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoreText: { fontSize: 11.5, fontWeight: '700', color: EMERALD, marginTop: 4 },

  /* Ratings */
  ratingBlock: { marginBottom: 20 },
  fieldLabel: { fontSize: 15, fontWeight: '700', color: INK, marginBottom: 12 },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between' },
  ratingPill: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: FIELD_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingPillSelected: { backgroundColor: EMERALD },
  ratingPillText: { fontSize: 17, fontWeight: '700', color: INK },
  ratingPillTextSelected: { color: '#FFFFFF' },

  /* Submit */
  submitButton: {
    backgroundColor: EMERALD,
    borderRadius: 30,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: EMERALD,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  submitButtonDisabled: { opacity: 0.45, shadowOpacity: 0 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },

  /* History */
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: SUBTLE,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 14,
    marginLeft: 4,
  },
  historyCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  historyTop: { flexDirection: 'row', alignItems: 'center' },
  historyMonth: { fontSize: 16, fontWeight: '800', color: INK },
  historyNote: { fontSize: 12.5, color: SUBTLE, marginTop: 3, fontStyle: 'italic' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 10,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  statusBadgeText: { fontSize: 12, fontWeight: '800' },
  historyViewBtn: {
    alignSelf: 'flex-start',
    marginTop: 14,
    backgroundColor: 'rgba(15,157,88,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  historyViewText: { fontSize: 13, fontWeight: '800', color: EMERALD },
  historySubmitBtn: { alignSelf: 'flex-start', marginTop: 12, paddingVertical: 4 },
  historySubmitText: { fontSize: 13, fontWeight: '800', color: RED },
});
