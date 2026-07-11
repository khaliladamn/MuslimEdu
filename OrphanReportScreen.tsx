import React, { useCallback, useEffect, useState } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import {
  fetchReportStatus,
  submitReport,
  ReportStatus,
  TimelineEntry,
  PickedPhoto,
} from '../../services/orphanService';
import { Skeleton, SkeletonCircle } from '../../components/Skeleton';

const EMERALD = '#0F9D58';
const EMERALD_SOFT = '#E7F5EC';
const INK = '#1C1C1E';
const SUBTLE = '#8A9099';
const HAIRLINE = '#EDEEF0';
const CANVAS = '#F6F7F9';
const DANGER = '#E5484D';
const DANGER_SOFT = '#FCEDED';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const MAX_NOTE = 500;
const MAX_PHOTOS = 5;

// --- Inline stroke icons ---
function IconDoc({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M6 3h8l4 4v14H6z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M14 3v4h4" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Line x1={9} y1={12} x2={15} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={9} y1={16} x2={13} y2={16} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function IconEdit({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M4 20h4L18 10l-4-4L4 16v4z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Line x1={13} y1={7} x2={17} y2={11} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function IconCap({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M2 9l10-4 10 4-10 4L2 9z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M6 11v4c0 1.1 2.7 2.5 6 2.5s6-1.4 6-2.5v-4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconHeart({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 20s-7-4.35-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.65 12 20 12 20z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
function IconImage({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={5} width={18} height={14} rx={2} stroke={color} strokeWidth={2} />
      <Circle cx={8.5} cy={10} r={1.5} fill={color} />
      <Path d="M5 17l4.5-4.5L13 16l3-3 3 3.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconSend({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M21 3L10.5 13.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 3l-6.5 18-4-8-8-4L21 3z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconCalendar({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={5} width={16} height={16} rx={2} stroke={color} strokeWidth={2} />
      <Line x1={4} y1={9} x2={20} y2={9} stroke={color} strokeWidth={2} />
      <Line x1={8} y1={3} x2={8} y2={6} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={16} y1={3} x2={16} y2={6} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function IconClock({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
      <Polyline points="12 7 12 12 15 14" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconPlus({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Line x1={12} y1={5} x2={12} y2={19} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={5} y1={12} x2={19} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function SectionHead({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.sectionHead}>
      <View style={styles.iconChip}>{icon}</View>
      <View style={styles.flex1}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSub}>{subtitle}</Text>
      </View>
    </View>
  );
}

function RatingSelector({
  value,
  onChange,
  labels,
}: {
  value: number | null;
  onChange: (v: number) => void;
  labels: Record<number, string>;
}) {
  return (
    <View style={styles.ratingRow}>
      {[1, 2, 3, 4, 5].map((n) => {
        const selected = value === n;
        return (
          <TouchableOpacity key={n} style={styles.ratingCell} onPress={() => onChange(n)} activeOpacity={0.8}>
            <View style={[styles.ratingCircle, selected && styles.ratingCircleActive]}>
              <Text style={[styles.ratingNum, selected && styles.ratingNumActive]}>{n}</Text>
            </View>
            {labels[n] ? <Text style={styles.ratingLabel}>{labels[n]}</Text> : <View style={styles.ratingLabelSpacer} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function OrphanReportScreen() {
  const navigation = useNavigation();
  const { token } = useAuth();

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

  const pickPhotos = async () => {
    if (photos.length >= MAX_PHOTOS) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access to attach images to your report.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
      quality: 0.7,
    });
    if (result.canceled) return;
    const picked: PickedPhoto[] = result.assets.map((a) => ({
      uri: a.uri,
      fileName: a.fileName,
      type: a.mimeType,
    }));
    setPhotos((prev) => [...prev, ...picked].slice(0, MAX_PHOTOS));
  };

  const removePhoto = (uri: string) => setPhotos((prev) => prev.filter((p) => p.uri !== uri));

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

  // Normalize the status into a timeline regardless of whether the backend
  // returns a rolling `timeline` (preferred) or only a `history` array of
  // submitted reports. This is what previously broke the screen: it read
  // `status.timeline` while the service typed the response as `history`.
  const timeline: {
    key: string;
    name: string;
    submitted: boolean;
    submittedOn: string | null;
  }[] = (() => {
    const raw: TimelineEntry[] =
      status?.timeline ??
      (status?.history ?? []).map((r) => ({
        report_month: r.report_month,
        submitted: true,
        report: r,
      }));

    return raw.map((entry) => {
      const [year, month] = entry.report_month.split('-').map(Number);
      const submittedOn = entry.report?.submitted_at ?? entry.report?.created_at ?? null;
      let onLabel: string | null = null;
      if (submittedOn) {
        const d = new Date(submittedOn);
        if (!isNaN(d.getTime())) onLabel = `${MONTH_ABBR[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
      }
      return {
        key: entry.report_month,
        name: `${MONTH_NAMES[month - 1]} ${year}`,
        submitted: entry.submitted,
        submittedOn: onLabel,
      };
    });
  })();

  const alreadySubmitted = status?.submitted_this_month ?? false;
  const visibleTimeline = timeline.slice(0, 4);

  return (
    <View style={styles.flex}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={12}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Polyline points="15 5 8 12 15 19" stroke={EMERALD} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Monthly Report</Text>
        <View style={styles.backBtn} />
      </View>

      {isLoading ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.card}>
            <Skeleton width={180} height={22} style={{ marginBottom: 8 }} />
            <Skeleton width={100} height={14} style={{ marginBottom: 20 }} />
            <Skeleton width={'100%'} height={90} style={{ marginBottom: 20, borderRadius: 14 }} />
            <View style={styles.ratingRow}>
              {[0, 1, 2, 3, 4].map((i) => (
                <SkeletonCircle key={i} size={44} />
              ))}
            </View>
          </View>
        </ScrollView>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={load}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Submission form card */}
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.iconChip}>
                <IconDoc color={EMERALD} />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.cardTitle}>Submit Your Monthly Report</Text>
                <Text style={styles.cardMonth}>{currentMonthLabel}</Text>
              </View>
            </View>
            <View style={styles.divider} />

            {alreadySubmitted ? (
              <View style={styles.doneBox}>
                <Text style={styles.doneTitle}>You're all set for {currentMonthLabel}</Text>
                <Text style={styles.doneBody}>
                  Your report for this month is submitted. Check your submission history below.
                </Text>
              </View>
            ) : (
              <>
                <SectionHead
                  icon={<IconEdit color={EMERALD} />}
                  title="How was your month?"
                  subtitle="Tell us about your studies, activities, and how you are feeling."
                />
                <View style={styles.noteWrap}>
                  <TextInput
                    style={styles.noteInput}
                    placeholder="Write a short note about your month..."
                    placeholderTextColor={SUBTLE}
                    value={note}
                    onChangeText={(t) => setNote(t.slice(0, MAX_NOTE))}
                    multiline
                    maxLength={MAX_NOTE}
                  />
                  <Text style={styles.counter}>{note.length}/{MAX_NOTE}</Text>
                </View>

                <SectionHead
                  icon={<IconCap color={EMERALD} />}
                  title="Academic Rating"
                  subtitle="Rate your academic performance this month."
                />
                <RatingSelector
                  value={academicRating}
                  onChange={setAcademicRating}
                  labels={{ 1: 'Poor', 3: 'Average', 5: 'Excellent' }}
                />

                <SectionHead
                  icon={<IconHeart color={EMERALD} />}
                  title="Wellbeing Rating"
                  subtitle="Rate your overall wellbeing this month."
                />
                <RatingSelector
                  value={wellbeingRating}
                  onChange={setWellbeingRating}
                  labels={{ 1: 'Very Low', 3: 'Average', 5: 'Very High' }}
                />

                <SectionHead
                  icon={<IconImage color={EMERALD} />}
                  title="Add Photos (Optional)"
                  subtitle="Add photos of your activities, achievements or study progress."
                />
                <TouchableOpacity
                  style={styles.dropzone}
                  onPress={pickPhotos}
                  activeOpacity={0.85}
                  disabled={photos.length >= MAX_PHOTOS}
                >
                  <IconImage color={EMERALD} />
                  <Text style={styles.dropTitle}>
                    {photos.length >= MAX_PHOTOS ? 'Photo limit reached' : 'Tap to add photos'}
                  </Text>
                  <Text style={styles.dropSub}>You can select up to {MAX_PHOTOS} images</Text>
                </TouchableOpacity>

                <View style={styles.thumbRow}>
                  {Array.from({ length: MAX_PHOTOS }).map((_, i) => {
                    const photo = photos[i];
                    if (photo) {
                      return (
                        <TouchableOpacity
                          key={photo.uri}
                          style={styles.thumb}
                          onPress={() => removePhoto(photo.uri)}
                          activeOpacity={0.8}
                        >
                          <Image source={{ uri: photo.uri }} style={styles.thumbImg} />
                          <View style={styles.thumbRemove}>
                            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                              <Line x1={6} y1={6} x2={18} y2={18} stroke="#FFF" strokeWidth={2.6} strokeLinecap="round" />
                              <Line x1={18} y1={6} x2={6} y2={18} stroke="#FFF" strokeWidth={2.6} strokeLinecap="round" />
                            </Svg>
                          </View>
                        </TouchableOpacity>
                      );
                    }
                    return (
                      <TouchableOpacity
                        key={`slot-${i}`}
                        style={styles.thumbEmpty}
                        onPress={pickPhotos}
                        activeOpacity={0.7}
                      >
                        <IconPlus color={SUBTLE} />
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  activeOpacity={0.9}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <IconSend color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>Submit Report</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Submission history */}
          <View style={styles.card}>
            <View style={styles.historyHead}>
              <View style={styles.sectionHeadInline}>
                <IconClock color={INK} />
                <Text style={styles.historyTitle}>Submission History</Text>
              </View>
              {timeline.length > 4 ? (
                <TouchableOpacity hitSlop={8}>
                  <Text style={styles.viewAll}>View All ›</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {visibleTimeline.length === 0 ? (
              <Text style={styles.emptyHistory}>No reports yet. Your first submission will show up here.</Text>
            ) : (
              visibleTimeline.map((m, idx) => (
                <View key={m.key} style={[styles.historyRow, idx < visibleTimeline.length - 1 && styles.historyRowBorder]}>
                  <View style={[styles.statusDot, { backgroundColor: m.submitted ? EMERALD : DANGER }]} />
                  <View style={[styles.calChip, { backgroundColor: m.submitted ? EMERALD_SOFT : DANGER_SOFT }]}>
                    <IconCalendar color={m.submitted ? EMERALD : DANGER} />
                  </View>
                  <View style={styles.flex1}>
                    <Text style={styles.historyMonth}>{m.name}</Text>
                    {m.submitted ? (
                      <Text style={styles.historySubmittedOn}>
                        {m.submittedOn ? `Submitted on ${m.submittedOn}` : 'Submitted'}
                      </Text>
                    ) : (
                      <Text style={styles.historyMissing}>Missing</Text>
                    )}
                  </View>
                  {m.submitted ? (
                    <View style={styles.submittedBadge}>
                      <Text style={styles.submittedBadgeText}>Submitted</Text>
                    </View>
                  ) : null}
                  <Text style={styles.chevron}>›</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: CANVAS },
  flex1: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 58,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', minWidth: 72 },
  backText: { color: EMERALD, fontSize: 16, fontWeight: '600', marginLeft: 2 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: INK },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  errorText: { color: DANGER, textAlign: 'center', marginBottom: 12 },
  retryButton: { backgroundColor: '#EEF0F2', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  retryText: { color: INK, fontWeight: '600' },
  scroll: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: HAIRLINE,
    shadowColor: '#0B1F13',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  cardHead: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 19, fontWeight: '700', color: INK, lineHeight: 24 },
  cardMonth: { fontSize: 14, color: EMERALD, fontWeight: '600', marginTop: 2 },
  divider: { height: 1, backgroundColor: HAIRLINE, marginVertical: 18 },

  iconChip: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: EMERALD_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  sectionHead: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 4, marginBottom: 14 },
  sectionHeadInline: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: INK },
  sectionSub: { fontSize: 13, color: SUBTLE, marginTop: 3, lineHeight: 18 },

  noteWrap: { marginBottom: 24 },
  noteInput: {
    backgroundColor: '#FBFCFD',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: HAIRLINE,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 30,
    fontSize: 15,
    color: INK,
    minHeight: 108,
    textAlignVertical: 'top',
  },
  counter: { position: 'absolute', right: 14, bottom: 10, fontSize: 12, color: SUBTLE },

  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  ratingCell: { alignItems: 'center', width: 56 },
  ratingCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: '#E2E5E9',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingCircleActive: { backgroundColor: EMERALD, borderColor: EMERALD },
  ratingNum: { fontSize: 16, fontWeight: '700', color: INK },
  ratingNumActive: { color: '#FFFFFF' },
  ratingLabel: { fontSize: 11, color: SUBTLE, marginTop: 8, textAlign: 'center' },
  ratingLabelSpacer: { height: 11, marginTop: 8 },

  dropzone: {
    borderWidth: 1.5,
    borderColor: '#BFE4CD',
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: '#F4FBF6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    marginBottom: 12,
  },
  dropTitle: { color: EMERALD, fontSize: 15, fontWeight: '700', marginTop: 8 },
  dropSub: { color: SUBTLE, fontSize: 12, marginTop: 3 },

  thumbRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  thumb: { width: 56, height: 56, borderRadius: 12, overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%' },
  thumbRemove: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbEmpty: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F2F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitButton: {
    backgroundColor: EMERALD,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  doneBox: { paddingVertical: 8 },
  doneTitle: { fontSize: 16, fontWeight: '700', color: EMERALD, marginBottom: 6 },
  doneBody: { fontSize: 14, color: SUBTLE, lineHeight: 20 },

  historyHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  historyTitle: { fontSize: 17, fontWeight: '700', color: INK, marginLeft: 8 },
  viewAll: { color: EMERALD, fontSize: 14, fontWeight: '600' },
  emptyHistory: { fontSize: 13, color: SUBTLE, paddingVertical: 14, lineHeight: 19 },

  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  historyRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  calChip: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  historyMonth: { fontSize: 15, fontWeight: '700', color: INK },
  historySubmittedOn: { fontSize: 12.5, color: SUBTLE, marginTop: 2 },
  historyMissing: { fontSize: 12.5, color: DANGER, fontWeight: '600', marginTop: 2 },
  submittedBadge: {
    backgroundColor: EMERALD_SOFT,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 6,
  },
  submittedBadgeText: { color: EMERALD, fontSize: 11.5, fontWeight: '700' },
  chevron: { fontSize: 22, color: '#C4C9CF', fontWeight: '400' },
});
