import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';
import DashboardShell, { EMERALD, EMERALD_SOFT, INK, SUBTLE } from './DashboardShell';

// --- Inline stroke icons. `color` flips white on solid tiles, emerald on soft. ---
function PeopleIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={8} r={3.5} stroke={color} strokeWidth={2} />
      <Path d="M3 19c0-3 2.7-4.5 6-4.5s6 1.5 6 4.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M16 5.5a3.5 3.5 0 0 1 0 6.8M18 19c0-2.2-1-3.6-2.5-4.3" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function UserPlusIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={8} r={3.6} stroke={color} strokeWidth={2} />
      <Path d="M2.5 19c0-3 2.9-4.6 6.5-4.6s6.5 1.6 6.5 4.6" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={19.5} y1={7} x2={19.5} y2={13} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={16.5} y1={10} x2={22.5} y2={10} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function BookIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12 6c-1.8-1.2-4-1.8-6.5-1.8V17c2.5 0 4.7.6 6.5 1.8 1.8-1.2 4-1.8 6.5-1.8V4.2C16 4.2 13.8 4.8 12 6z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Line x1={12} y1={6} x2={12} y2={18.8} stroke={color} strokeWidth={2} />
    </Svg>
  );
}
function DocIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M7 3h7l4 4v14H7z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M14 3v4h4" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Line x1={10} y1={13} x2={15} y2={13} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={10} y1={16.5} x2={14} y2={16.5} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function CalendarCheckIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={5} width={16} height={16} rx={2} stroke={color} strokeWidth={2} />
      <Line x1={4} y1={9} x2={20} y2={9} stroke={color} strokeWidth={2} />
      <Line x1={8} y1={3} x2={8} y2={6} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={16} y1={3} x2={16} y2={6} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Polyline points="8.5 14.5 11 17 15.5 12.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function ArrowIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Line x1={4} y1={12} x2={19} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Polyline points="13 6 19 12 13 18" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

type Tile = {
  key: string;
  title: string;
  description: string;
  icon: (color: string) => React.ReactElement;
  route: string | null;
  params?: Record<string, any>;
  style: 'solid' | 'soft';
};

export default function AdminDashboard() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const isOrphan = !!user?.is_orphan;
  const studentsLabel = isOrphan ? 'Children' : 'Students';

  // Alternating solid/soft emerald tiles for rhythm. "Admission" replaces the
  // old Teachers tile and routes to the working admission form.
  const TILES: Tile[] = [
    {
      key: 'students',
      title: studentsLabel,
      description: `View and manage all ${studentsLabel.toLowerCase()}`,
      icon: (c) => <PeopleIcon color={c} />,
      route: 'StudentsList',
      params: {},
      style: 'solid',
    },
    {
      key: 'admission',
      title: 'Admission',
      description: 'Admit and enroll new students',
      icon: (c) => <UserPlusIcon color={c} />,
      route: 'Admission',
      params: {},
      style: 'soft',
    },
    {
      key: 'classes',
      title: 'Classes',
      description: 'Manage classes and sections',
      icon: (c) => <BookIcon color={c} />,
      route: null,
      style: 'soft',
    },
    {
      key: 'fees',
      title: 'Fee Reports',
      description: 'View and manage fee collections',
      icon: (c) => <DocIcon color={c} />,
      route: null,
      style: 'solid',
    },
    {
      key: 'attendance',
      title: 'Attendance',
      description: 'Track attendance records',
      icon: (c) => <CalendarCheckIcon color={c} />,
      route: null,
      style: 'soft',
    },
  ];

  return (
    <DashboardShell title="Admin">
      {isOrphan ? (
        <TouchableOpacity
          style={styles.reportsCard}
          activeOpacity={0.9}
          onPress={() => (navigation as any).navigate('AdminOrphanOverview')}
        >
          <View style={styles.reportsIconChip}>
            <DocIcon color="#7FD9A8" />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.reportsCardLabel}>MONTHLY REPORTS</Text>
            <Text style={styles.reportsCardTitle}>Track this month's submissions</Text>
            <Text style={styles.reportsCardSubtitle}>
              See who's submitted, review reports, or add one on a child's behalf
            </Text>
          </View>
          <View style={styles.reportsArrow}>
            <ArrowIcon color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      ) : null}

      <Text style={styles.sectionLabel}>Manage</Text>

      <View style={styles.grid}>
        {TILES.map((tile) => {
          const solid = tile.style === 'solid';
          const fg = solid ? '#FFFFFF' : EMERALD;
          const descColor = solid ? 'rgba(255,255,255,0.85)' : SUBTLE;
          return (
            <TouchableOpacity
              key={tile.key}
              style={[styles.card, solid ? styles.cardSolid : styles.cardSoft]}
              activeOpacity={0.88}
              onPress={() => {
                if (tile.route) (navigation as any).navigate(tile.route, tile.params ?? {});
              }}
            >
              <View style={[styles.cardIconChip, solid ? styles.chipSolid : styles.chipSoft]}>
                {tile.icon(fg)}
              </View>
              <Text style={[styles.cardTitle, { color: fg }]}>{tile.title}</Text>
              <View style={styles.cardFooter}>
                <Text style={[styles.cardDesc, { color: descColor }]}>{tile.description}</Text>
                <View style={[styles.cardArrow, solid ? styles.arrowSolid : styles.arrowSoft]}>
                  <ArrowIcon color={fg} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.noteBox}>
        <Text style={styles.noteText}>
          {studentsLabel}, Admission{isOrphan ? ' and Monthly Reports' : ''} are wired to real data.
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
    padding: 18,
    marginBottom: 24,
  },
  reportsIconChip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(127,217,168,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  reportsCardLabel: { color: '#7FD9A8', fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 5 },
  reportsCardTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', marginBottom: 5 },
  reportsCardSubtitle: { color: 'rgba(255,255,255,0.65)', fontSize: 12, lineHeight: 17 },
  reportsArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  sectionLabel: {
    fontSize: 13,
    color: SUBTLE,
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    minHeight: 168,
    justifyContent: 'space-between',
  },
  cardSolid: {
    backgroundColor: EMERALD,
    shadowColor: '#0B7C46',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardSoft: { backgroundColor: EMERALD_SOFT },
  cardIconChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  chipSolid: { backgroundColor: 'rgba(255,255,255,0.18)' },
  chipSoft: { backgroundColor: 'rgba(15,157,88,0.14)' },
  cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  cardFooter: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  cardDesc: { flex: 1, fontSize: 12.5, lineHeight: 17, marginRight: 8 },
  cardArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowSolid: { backgroundColor: 'rgba(255,255,255,0.18)' },
  arrowSoft: { backgroundColor: 'rgba(15,157,88,0.14)' },

  noteBox: {
    marginTop: 10,
    backgroundColor: EMERALD_SOFT,
    borderRadius: 14,
    padding: 16,
  },
  noteText: { fontSize: 13, color: INK, lineHeight: 19 },
});
