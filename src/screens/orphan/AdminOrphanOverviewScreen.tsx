import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { fetchReportOverview, ReportOverview } from '../../services/adminOrphanReportService';
import { Skeleton } from '../../components/Skeleton';

const EMERALD = '#0F9D58';
const EMERALD_SOFT = '#EAF7EF';
const INK = '#1C1C1E';
const SUBTLE = '#8E8E93';
const DANGER = '#E0637A';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function AdminOrphanOverviewScreen() {
  const navigation = useNavigation();
  const { token } = useAuth();

  const [overview, setOverview] = useState<ReportOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const data = await fetchReportOverview(token);
      setOverview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report overview.');
    }
  }, [token]);

  useEffect(() => {
    setIsLoading(true);
    load().finally(() => setIsLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  };

  const now = new Date();
  const monthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
  const progress = overview && overview.total_count > 0 ? overview.submitted_count / overview.total_count : 0;

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Monthly Reports</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.listContent}>
          <Skeleton width="100%" height={128} borderRadius={20} style={{ marginBottom: 20 }} />
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.childCard}>
              <View>
                <Skeleton width={140} height={14} style={{ marginBottom: 6 }} />
                <Skeleton width={100} height={11} />
              </View>
            </View>
          ))}
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={load} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={overview?.children ?? []}
          keyExtractor={(item) => String(item.student_id)}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={EMERALD} />}
          ListHeaderComponent={
            <View style={styles.progressCard}>
              <Text style={styles.progressMonth}>{monthLabel}</Text>
              <View style={styles.progressRow}>
                <Text style={styles.progressCount}>{overview?.submitted_count ?? 0}</Text>
                <Text style={styles.progressTotal}> / {overview?.total_count ?? 0} submitted</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.childCard}
              activeOpacity={0.8}
              onPress={() =>
                (navigation as any).navigate('AdminChildReportDetail', {
                  studentId: item.student_id,
                  studentName: item.name,
                })
              }
            >
              <View>
                <Text style={styles.childName}>{item.name}</Text>
                <Text style={item.submitted ? styles.statusSubmitted : styles.statusMissing}>
                  {item.submitted ? `Submitted by ${item.submitted_by ?? 'child'}` : 'Not submitted yet'}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  backText: { color: EMERALD, fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: INK },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  errorText: { color: '#D70015', textAlign: 'center', marginBottom: 12 },
  retryButton: { backgroundColor: '#F2F2F7', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  retryText: { color: INK, fontWeight: '600' },
  listContent: { padding: 16, paddingBottom: 40 },

  progressCard: {
    backgroundColor: EMERALD,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  progressMonth: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 14 },
  progressCount: { color: '#FFFFFF', fontSize: 32, fontWeight: '700' },
  progressTotal: { color: 'rgba(255,255,255,0.85)', fontSize: 15, marginBottom: 4 },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 4 },

  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: EMERALD_SOFT,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  childName: { fontSize: 15, fontWeight: '600', color: INK },
  statusSubmitted: { fontSize: 12, color: EMERALD, marginTop: 3, fontWeight: '600' },
  statusMissing: { fontSize: 12, color: DANGER, marginTop: 3, fontWeight: '600' },
  chevron: { fontSize: 24, color: SUBTLE, fontWeight: '300' },
});
