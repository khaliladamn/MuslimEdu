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
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { fetchReportStatus, submitReport, ReportStatus } from '../../services/orphanService';

const EMERALD = '#0F9D58';
const INK = '#1C1C1E';
const SUBTLE = '#8E8E93';
const CARD_BG = '#FFFFFF';
const TRACK_BG = '#F4F5F7';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

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
          <TouchableOpacity
            key={n}
            style={[styles.ratingPill, value === n && styles.ratingPillSelected]}
            onPress={() => onChange(n)}
          >
            <Text style={[styles.ratingPillText, value === n && styles.ratingPillTextSelected]}>
              {n}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
  const [photos, setPhotos] = useState<Asset[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_PHOTOS = 5;

  const pickPhotos = async () => {
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      Alert.alert('Limit reached', `You can attach up to ${MAX_PHOTOS} photos.`);
      return;
    }

    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: remaining,
      quality: 0.7,
    });

    if (result.didCancel || !result.assets) return;

    setPhotos((prev) => [...prev, ...result.assets!].slice(0, MAX_PHOTOS));
  };

  const removePhoto = (uri?: string) => {
    setPhotos((prev) => prev.filter((p) => p.uri !== uri));
  };

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
        {
          note,
          academic_rating: academicRating,
          wellbeing_rating: wellbeingRating,
        },
        photos.map((p) => ({ uri: p.uri!, fileName: p.fileName, type: p.type })),
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

  // Build a Jan-Dec timeline for the current year, marking each month as
  // submitted / missing / not due yet, by matching against the reports
  // returned from the backend (current_report + history).
  const buildYearTimeline = (data: ReportStatus | null) => {
    const year = now.getFullYear();
    const currentMonthIndex = now.getMonth(); // 0-11

    const allReports = data ? [...data.history, ...(data.current_report ? [data.current_report] : [])] : [];

    return MONTH_NAMES.map((name, index) => {
      const monthDateStr = `${year}-${String(index + 1).padStart(2, '0')}-01`;
      const report = allReports.find((r) => r.report_month === monthDateStr);

      let state: 'submitted' | 'missing' | 'upcoming';
      if (report) {
        state = 'submitted';
      } else if (index < currentMonthIndex) {
        state = 'missing';
      } else if (index === currentMonthIndex) {
        state = data?.submitted_this_month ? 'submitted' : 'missing';
      } else {
        state = 'upcoming';
      }

      return { name, index, state, report };
    });
  };

  const timeline = buildYearTimeline(status);
  const alreadySubmitted = status?.submitted_this_month ?? false;

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Monthly Report</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={EMERALD} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={load} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Submission form card */}
          <View style={styles.card}>
            {alreadySubmitted ? (
              <>
                <Text style={styles.cardTitle}>You're all set for {currentMonthLabel} ✅</Text>
                <Text style={styles.cardSubtitle}>
                  Your report for this month has already been submitted. Check the
                  timeline below to see your history for the year.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.cardTitle}>Submit Your Monthly Report</Text>
                <Text style={styles.cardMonth}>{currentMonthLabel}</Text>
                <Text style={styles.cardSubtitle}>How was your month?</Text>
                <Text style={styles.cardDescription}>
                  Tell us about your studies, activities, and how you are feeling.
                </Text>

                <TextInput
                  style={styles.noteInput}
                  placeholder="Write a short note about your month..."
                  placeholderTextColor={SUBTLE}
                  multiline
                  value={note}
                  onChangeText={setNote}
                />

                <RatingSelector label="Academic Rating" value={academicRating} onChange={setAcademicRating} />
                <RatingSelector label="Wellbeing Rating" value={wellbeingRating} onChange={setWellbeingRating} />

                <View style={styles.photoBlock}>
                  <Text style={styles.fieldLabel}>Photos</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {photos.map((photo) => (
                      <View key={photo.uri} style={styles.photoThumbWrapper}>
                        <Image source={{ uri: photo.uri }} style={styles.photoThumb} />
                        <TouchableOpacity
                          style={styles.photoRemoveBadge}
                          onPress={() => removePhoto(photo.uri)}
                          hitSlop={8}
                        >
                          <Text style={styles.photoRemoveBadgeText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}

                    {photos.length < MAX_PHOTOS && (
                      <TouchableOpacity style={styles.photoAddTile} onPress={pickPhotos}>
                        <Text style={styles.photoAddPlus}>+</Text>
                        <Text style={styles.photoAddLabel}>Add</Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                  {photos.length === 0 ? (
                    <Text style={styles.photoHint}>No photos added yet</Text>
                  ) : (
                    <Text style={styles.photoHint}>
                      {photos.length} of {MAX_PHOTOS} photos added
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Report</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Year timeline */}
          <Text style={styles.sectionLabel}>{now.getFullYear()} Overview</Text>
          <View style={styles.card}>
            {timeline.map((month, idx) => (
              <View key={month.name} style={styles.timelineRow}>
                <View style={styles.timelineTrack}>
                  <View
                    style={[
                      styles.timelineDot,
                      month.state === 'submitted' && styles.dotSubmitted,
                      month.state === 'missing' && styles.dotMissing,
                      month.state === 'upcoming' && styles.dotUpcoming,
                    ]}
                  />
                  {idx < timeline.length - 1 && <View style={styles.timelineLine} />}
                </View>

                <View style={styles.timelineContent}>
                  <Text style={styles.timelineMonth}>{month.name}</Text>
                  <Text
                    style={[
                      styles.timelineStatus,
                      month.state === 'submitted' && styles.statusSubmitted,
                      month.state === 'missing' && styles.statusMissing,
                    ]}
                  >
                    {month.state === 'submitted'
                      ? 'Submitted'
                      : month.state === 'missing'
                      ? 'Missing'
                      : 'Not due yet'}
                  </Text>
                  {month.report?.note ? (
                    <Text style={styles.timelineNote} numberOfLines={2}>
                      {month.report.note}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: TRACK_BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: CARD_BG,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backText: { color: EMERALD, fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: INK },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  errorText: { color: '#D70015', textAlign: 'center', marginBottom: 12 },
  retryButton: { backgroundColor: '#F2F2F7', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  retryText: { color: INK, fontWeight: '600' },
  scrollContent: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: { fontSize: 19, fontWeight: '700', color: INK },
  cardMonth: { fontSize: 14, color: EMERALD, fontWeight: '600', marginTop: 4, marginBottom: 14 },
  cardSubtitle: { fontSize: 15, fontWeight: '600', color: INK, marginBottom: 4 },
  cardDescription: { fontSize: 13, color: SUBTLE, marginBottom: 16, lineHeight: 18 },

  noteInput: {
    backgroundColor: TRACK_BG,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: INK,
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 18,
  },

  ratingBlock: { marginBottom: 18 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: INK, marginBottom: 10 },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between' },
  ratingPill: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: TRACK_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingPillSelected: { backgroundColor: EMERALD },
  ratingPillText: { fontSize: 16, fontWeight: '600', color: INK },
  ratingPillTextSelected: { color: '#FFFFFF' },

  photoBlock: { marginBottom: 22 },
  photoThumbWrapper: { marginRight: 12, position: 'relative' },
  photoThumb: {
    width: 74,
    height: 74,
    borderRadius: 16,
    backgroundColor: TRACK_BG,
  },
  photoRemoveBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E0637A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  photoRemoveBadgeText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', lineHeight: 16 },
  photoAddTile: {
    width: 74,
    height: 74,
    borderRadius: 16,
    backgroundColor: TRACK_BG,
    borderWidth: 1.5,
    borderColor: '#D9DCE1',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAddPlus: { fontSize: 22, color: EMERALD, fontWeight: '300', lineHeight: 24 },
  photoAddLabel: { fontSize: 11, color: SUBTLE, marginTop: 2 },
  photoHint: { fontSize: 12, color: SUBTLE, marginTop: 10 },

  submitButton: {
    backgroundColor: EMERALD,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: SUBTLE,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },

  timelineRow: { flexDirection: 'row' },
  timelineTrack: { width: 28, alignItems: 'center' },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 4,
  },
  dotSubmitted: { backgroundColor: EMERALD },
  dotMissing: { backgroundColor: '#E0637A' },
  dotUpcoming: { backgroundColor: '#D9DCE1' },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 2,
  },
  timelineContent: { flex: 1, paddingBottom: 20 },
  timelineMonth: { fontSize: 15, fontWeight: '600', color: INK },
  timelineStatus: { fontSize: 12, color: SUBTLE, marginTop: 2 },
  statusSubmitted: { color: EMERALD, fontWeight: '600' },
  statusMissing: { color: '#E0637A', fontWeight: '600' },
  timelineNote: { fontSize: 12, color: SUBTLE, marginTop: 4, fontStyle: 'italic' },
});
