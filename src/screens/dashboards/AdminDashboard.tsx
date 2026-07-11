import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import DashboardShell, { EMERALD, EMERALD_SOFT, INK, SUBTLE } from './DashboardShell';

type MenuItem = {
  key: string;
  label?: string;
  route: string | null;
  params?: Record<string, any>;
  style: 'solid' | 'soft';
};

// Alternating solid/soft emerald tiles for visual rhythm, all one color family.
// The old "Teachers" tile is now "Admission" and routes to the admission form.
const MENU_ITEMS: MenuItem[] = [
  { key: 'students', route: 'StudentsList', params: {}, style: 'solid' },
  { key: 'admission', label: 'Admission', route: 'Admission', params: {}, style: 'soft' },
  { key: 'classes', label: 'Classes', route: null, style: 'soft' },
  { key: 'fees', label: 'Fee Reports', route: null, style: 'solid' },
  { key: 'attendance', label: 'Attendance', route: null, style: 'soft' },
];

export default function AdminDashboard() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const studentsLabel = user?.is_orphan ? 'Children' : 'Students';

  return (
    <DashboardShell title="Admin">
      {user?.is_orphan ? (
        <TouchableOpacity
          style={styles.reportsCard}
          activeOpacity={0.9}
          onPress={() => (navigation as any).navigate('AdminOrphanOverview')}
        >
          <View style={styles.flex1}>
            <Text style={styles.reportsCardLabel}>MONTHLY REPORTS</Text>
            <Text style={styles.reportsCardTitle}>Track this month's submissions</Text>
            <Text style={styles.reportsCardSubtitle}>
              See who's submitted, review reports, or add one on a child's behalf
            </Text>
          </View>
          <Text style={styles.reportsCardArrow}>›</Text>
        </TouchableOpacity>
      ) : null}

      <Text style={styles.sectionLabel}>Manage</Text>

      <View style={styles.grid}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.card, item.style === 'solid' ? styles.cardSolid : styles.cardSoft]}
            activeOpacity={0.85}
            onPress={() => {
              if (item.route) {
                (navigation as any).navigate(item.route, item.params ?? {});
              }
            }}
          >
            <Text style={[styles.cardText, item.style === 'solid' && styles.cardTextSolid]}>
              {item.key === 'students' ? studentsLabel : item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.noteBox}>
        <Text style={styles.noteText}>
          {studentsLabel}, Admission and Monthly Reports are wired to real data.
          The rest are placeholders - tell me which to build out next.
        </Text>
      </View>
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  reportsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B2E22',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  reportsCardLabel: {
    color: '#7FD9A8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  reportsCardTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', marginBottom: 6 },
  reportsCardSubtitle: { color: 'rgba(255,255,255,0.65)', fontSize: 12, lineHeight: 17 },
  reportsCardArrow: { color: '#FFFFFF', fontSize: 28, fontWeight: '300', marginLeft: 8 },

  sectionLabel: {
    fontSize: 13,
    color: SUBTLE,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderRadius: 18,
    paddingVertical: 26,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  cardSolid: { backgroundColor: EMERALD },
  cardSoft: { backgroundColor: EMERALD_SOFT },
  cardText: { fontSize: 14, fontWeight: '700', color: EMERALD, textAlign: 'center' },
  cardTextSolid: { color: '#FFFFFF' },
  noteBox: {
    marginTop: 8,
    backgroundColor: EMERALD_SOFT,
    borderRadius: 14,
    padding: 16,
  },
  noteText: { fontSize: 13, color: INK, lineHeight: 19 },
});
