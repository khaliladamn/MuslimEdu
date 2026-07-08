import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DashboardShell, { EMERALD, INK, SUBTLE } from './DashboardShell';

// Menu items for things an admin manages. Each currently just shows an
// alert-free placeholder tap (no screen wired up yet) - Phase 5 will turn
// these into real screens hitting real endpoints (student lists, orphan
// records, fee reports, etc).
const MENU_ITEMS = [
  { key: 'students', label: 'Students' },
  { key: 'orphans', label: 'Orphan Students' },
  { key: 'teachers', label: 'Teachers' },
  { key: 'classes', label: 'Classes' },
  { key: 'fees', label: 'Fee Reports' },
  { key: 'attendance', label: 'Attendance' },
];

export default function AdminDashboard() {
  return (
    <DashboardShell title="Admin">
      <Text style={styles.sectionLabel}>Manage</Text>

      <View style={styles.grid}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => {
              // Phase 5: navigate to the real screen for this section.
              // Left intentionally inert for now.
            }}
          >
            <Text style={styles.cardText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.noteBox}>
        <Text style={styles.noteText}>
          These sections are placeholders for now. Tell me which one to build
          out first (e.g. Students or Orphan Students) and I'll wire it to
          real data next.
        </Text>
      </View>
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 13,
    color: SUBTLE,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#F2F2F7',
    borderRadius: 14,
    paddingVertical: 24,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  cardText: { fontSize: 14, fontWeight: '600', color: INK, textAlign: 'center' },
  noteBox: {
    marginTop: 16,
    backgroundColor: '#EAF7EF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: EMERALD,
  },
  noteText: { fontSize: 13, color: INK, lineHeight: 19 },
});
