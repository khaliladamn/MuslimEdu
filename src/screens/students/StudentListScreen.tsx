import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import {
  fetchStudents,
  fetchOrphanStudents,
  StudentSummary,
  OrphanStudentSummary,
} from '../../services/adminService';

const EMERALD = '#0F9D58';
const INK = '#1C1C1E';
const SUBTLE = '#8E8E93';

type Mode = 'all' | 'orphans';

/**
 * One screen, two modes: pass { mode: 'all' } to show every student,
 * or { mode: 'orphans' } to show only students with an orphan profile.
 * Avoids duplicating nearly-identical list screens.
 */
export default function StudentListScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { mode } = (route.params as { mode: Mode }) ?? { mode: 'all' };
  const { token } = useAuth();

  const [students, setStudents] = useState<(StudentSummary | OrphanStudentSummary)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const data = mode === 'orphans'
        ? await fetchOrphanStudents(token)
        : await fetchStudents(token);
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load students.');
    }
  }, [token, mode]);

  useEffect(() => {
    setIsLoading(true);
    load().finally(() => setIsLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  };

  const title = mode === 'orphans' ? 'Orphan Students' : 'Students';

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
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
      ) : students.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            {mode === 'orphans' ? 'No orphan students found.' : 'No students found.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={EMERALD} />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.email}</Text>
              {item.code ? <Text style={styles.meta}>Code: {item.code}</Text> : null}

              {'orphan_profile' in item && item.orphan_profile ? (
                <View style={styles.orphanBox}>
                  {item.orphan_profile.guardian_name ? (
                    <Text style={styles.orphanText}>
                      Guardian: {item.orphan_profile.guardian_name}
                      {item.orphan_profile.guardian_relation
                        ? ` (${item.orphan_profile.guardian_relation})`
                        : ''}
                    </Text>
                  ) : null}
                  {item.orphan_profile.health_status ? (
                    <Text style={styles.orphanText}>
                      Health: {item.orphan_profile.health_status}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
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
  title: { fontSize: 17, fontWeight: '600', color: INK },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  errorText: { color: '#D70015', textAlign: 'center', marginBottom: 12 },
  retryButton: { backgroundColor: '#F2F2F7', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  retryText: { color: INK, fontWeight: '600' },
  emptyText: { color: SUBTLE, fontSize: 15 },
  listContent: { padding: 16 },
  card: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  name: { fontSize: 16, fontWeight: '600', color: INK },
  meta: { fontSize: 13, color: SUBTLE, marginTop: 2 },
  orphanBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  orphanText: { fontSize: 13, color: INK, marginTop: 2 },
});
