import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import DashboardShell, { EMERALD, EMERALD_SOFT, INK, SUBTLE } from './DashboardShell';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const orphan = user?.orphan_profile;

  return (
    <DashboardShell title="Student">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profile</Text>
        <Row label="Name" value={user?.name} />
        <Row label="Email" value={user?.email} />
        {user?.code ? <Row label="Student Code" value={user.code} /> : null}
      </View>

      {user?.is_orphan ? (
        <>
          {orphan ? (
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

          <TouchableOpacity
            style={styles.reportCard}
            activeOpacity={0.85}
            onPress={() => (navigation as any).navigate('OrphanReport')}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.reportCardTitle}>Monthly Report</Text>
              <Text style={styles.reportCardSubtitle}>
                Submit how your month went, and see your submission history
              </Text>
            </View>
            <Text style={styles.reportCardArrow}>›</Text>
          </TouchableOpacity>
        </>
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
    backgroundColor: EMERALD_SOFT,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 12, fontWeight: '700', color: EMERALD, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  orphanCard: {
    backgroundColor: EMERALD_SOFT,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: EMERALD,
  },
  orphanCardTitle: { fontSize: 13, fontWeight: '700', color: INK, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rowLabel: { fontSize: 14, color: SUBTLE },
  rowValue: { fontSize: 14, color: INK, fontWeight: '600', flexShrink: 1, textAlign: 'right' },

  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: EMERALD,
    borderRadius: 18,
    padding: 18,
  },
  reportCardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  reportCardSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4 },
  reportCardArrow: { color: '#FFFFFF', fontSize: 28, fontWeight: '300', marginLeft: 8 },
});
