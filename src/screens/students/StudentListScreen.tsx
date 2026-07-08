import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { fetchStudents, StudentSummary } from '../../services/adminService';

const EMERALD = '#0F9D58';
const INK = '#1C1C1E';
const SUBTLE = '#8E8E93';

/**
 * Single list screen for an admin's students. There's no separate
 * "orphans only" mode: orphan status is set per-school (school_type),
 * not per-child, so an orphanage admin's list is already all orphan
 * children. The title adapts based on the logged-in admin's school.
 */
export default function StudentListScreen() {
  const navigation = useNavigation();
  const { token, user } = useAuth();

  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const data = await fetchStudents(token);
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load students.');
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

  const title = user?.is_orphan ? 'Children' : 'Students';

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
          <Text style={styles.emptyText}>No {title.toLowerCase()} found.</Text>
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
              {item.photo ? (
                <Image source={{ uri: item.photo }} style={styles.avatar} />
              ) : null}
              <View style={styles.cardBody}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.email}</Text>
                {item.orphan_id_number ? (
                  <Text style={styles.meta}>ID: {item.orphan_id_number}</Text>
                ) : null}
              </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: '#E5E5EA' },
  cardBody: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: INK },
  meta: { fontSize: 13, color: SUBTLE, marginTop: 2 },
});
