import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import DashboardShell, { EMERALD, INK, SUBTLE } from './DashboardShell';

export default function StudentDashboard() {
  const { user } = useAuth();
  const orphan = user?.orphan_profile;

  return (
    <DashboardShell title="Student">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profile</Text>
        <Row label="Name" value={user?.name} />
        <Row label="Email" value={user?.email} />
        {user?.code ? <Row label="Student Code" value={user.code} /> : null}
      </View>

      {user?.is_orphan && orphan ? (
        <View style={styles.orphanCard}>
          <Text style={styles.orphanCardTitle}>Guardian &amp; Support Info</Text>
          {orphan.guardian_name ? (
            <Row
              label="Guardian"
              value={
                orphan.guardian_relation
                  ? `${orphan.guardian_name} (${orphan.guardian_relation})`
                  : orphan.guardian_name
              }
            />
          ) : null}
          {orphan.guardian_phone ? <Row label="Guardian Phone" value={orphan.guardian_phone} /> : null}
          {orphan.health_status ? <Row label="Health Status" value={orphan.health_status} /> : null}
          {orphan.special_needs ? <Row label="Special Needs" value={orphan.special_needs} /> : null}
        </View>
      ) : null}
    </DashboardShell>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F2F2F7',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 13, fontWeight: '600', color: SUBTLE, marginBottom: 10, textTransform: 'uppercase' },
  orphanCard: {
    backgroundColor: '#EAF7EF',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: EMERALD,
  },
  orphanCardTitle: { fontSize: 13, fontWeight: '600', color: INK, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rowLabel: { fontSize: 14, color: SUBTLE },
  rowValue: { fontSize: 14, color: INK, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
});
