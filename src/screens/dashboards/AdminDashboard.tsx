import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';
import { EMERALD, EMERALD_SOFT, INK, SUBTLE } from './DashboardShell';

/* ------------------------------------------------------------------ *
 * Palette
 * ------------------------------------------------------------------ */
const DARK_TOP = '#0F4A34';
const DARK_BOTTOM = '#062418';
const PALE_GREEN = '#9FE3BC';
const WHITE = '#FFFFFF';

const HEADER_BG_H = 250;
const PARALLAX = 0.45;

/* ------------------------------- Icons ------------------------------ */
function ChildrenIcon({ color = WHITE, size = 26 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="8" r="3" stroke={color} strokeWidth={1.8} />
      <Path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M16 6a3 3 0 010 5.5M18 20c0-2.6-1-4.4-2.6-5.3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function TeacherIcon({ color = EMERALD, size = 26 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="12" rx="2" stroke={color} strokeWidth={1.8} />
      <Circle cx="9" cy="10" r="2" stroke={color} strokeWidth={1.6} />
      <Path d="M14 9h4M14 12h4M6 20l3-3 3 3" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function ClassesIcon({ color = EMERALD, size = 26 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 6C10 4.5 6.5 4.5 4 5v13c2.5-.5 6-.5 8 1 2-1.5 5.5-1.5 8-1V5c-2.5-.5-6-.5-8 1z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M12 6v13" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}
function FeeIcon({ color = WHITE, size = 26 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 3h7l4 4v14H7z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M10 12h5M10 15h5M10 9h2" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}
function AttendanceIcon({ color = EMERALD, size = 26 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="5" width="18" height="16" rx="3" stroke={color} strokeWidth={1.8} />
      <Path d="M3 9h18M8 3v3M16 3v3M9 15l2 2 4-4" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function DocIcon({ color = '#5FE38A', size = 30 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 3h7l4 4v14H7z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M10 12h6M10 16h6M10 8h3" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}
function ArrowRightIcon({ color = EMERALD, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h13M13 6l6 6-6 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function InfoIcon({ color = WHITE, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} />
      <Path d="M12 11v5M12 8h.01" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

/* --------------------------- Manage card --------------------------- */
function ManageCard({
  icon,
  title,
  description,
  solid,
  onPress,
}: {
  icon: (color: string) => React.ReactElement;
  title: string;
  description: string;
  solid?: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();

  const iconColor = solid ? WHITE : EMERALD;
  const titleColor = solid ? WHITE : INK;
  const descColor = solid ? 'rgba(255,255,255,0.85)' : SUBTLE;
  const arrowColor = solid ? WHITE : EMERALD;

  const Inner = (
    <>
      <View style={[styles.manageIconCircle, solid && styles.manageIconCircleSolid]}>{icon(iconColor)}</View>
      <Text style={[styles.manageTitle, { color: titleColor }]}>{title}</Text>
      <Text style={[styles.manageDesc, { color: descColor }]}>{description}</Text>
      <View style={[styles.manageArrow, solid && styles.manageArrowSolid]}>
        <ArrowRightIcon size={17} color={arrowColor} />
      </View>
    </>
  );

  return (
    <Animated.View style={[styles.manageCardWrap, { transform: [{ scale }] }]}>
      <TouchableOpacity activeOpacity={0.9} onPressIn={pressIn} onPressOut={pressOut} onPress={onPress}>
        {solid ? (
          <LinearGradient
            colors={['#17B368', '#0B7A46']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.manageCardInner}
          >
            {Inner}
          </LinearGradient>
        ) : (
          <View style={[styles.manageCardInner, styles.manageCardSoft]}>{Inner}</View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ---------------------------- Stat card ---------------------------- */
function StatCard({ icon, value, label }: { icon: React.ReactElement; value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIconCircle}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function AdminDashboard() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const scrollY = useRef(new Animated.Value(0)).current;

  const isOrphan = !!user?.is_orphan;
  const studentsLabel = isOrphan ? 'Children' : 'Students';
  const initial = user?.name?.trim()?.[0]?.toUpperCase() ?? '?';

  const goStudents = () => (navigation as any).navigate('StudentsList');
  const notWired = () => {};

  const bgTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_BG_H],
    outputRange: [0, -HEADER_BG_H * PARALLAX],
    extrapolate: 'clamp',
  });
  const bgOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_BG_H * 0.6, HEADER_BG_H],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.flex}>
      {/* -------- Parallax dark background layer -------- */}
      <Animated.View
        style={[styles.bgLayer, { height: HEADER_BG_H, opacity: bgOpacity, transform: [{ translateY: bgTranslate }] }]}
        pointerEvents="none"
      >
        <LinearGradient colors={[DARK_TOP, DARK_BOTTOM]} start={{ x: 0, y: 0 }} end={{ x: 0.4, y: 1 }} style={styles.bgGradient}>
          <Svg style={StyleSheet.absoluteFill} width={width} height={HEADER_BG_H}>
            <Circle cx={width - 40} cy={60} r={120} fill="#FFFFFF" opacity={0.03} />
            <Circle cx={width - 90} cy={20} r={64} fill="#FFFFFF" opacity={0.04} />
            <Path d={`M0 110 Q${width * 0.4} 50 ${width} 140`} stroke="#FFFFFF" strokeWidth={1.2} opacity={0.06} fill="none" />
          </Svg>
        </LinearGradient>
      </Animated.View>

      {/* -------- Scrolling content -------- */}
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
      >
        {/* Greeting */}
        <View style={styles.greetingRow}>
          <View style={styles.greetingTextWrap}>
            <Text style={styles.greetingSmall}>Assalamu Alaykum,</Text>
            <Text style={styles.greetingName} numberOfLines={2}>
              {user?.name}
            </Text>
          </View>
          <TouchableOpacity onPress={() => (navigation as any).navigate('Menu')} hitSlop={10} activeOpacity={0.85}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarInner}>
                <Text style={styles.avatarInitial}>{initial}</Text>
              </View>
              <View style={styles.avatarDot} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Monthly Reports (orphan admins only) */}
        {isOrphan ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => (navigation as any).navigate('AdminOrphanOverview')}
            style={styles.reportsShadow}
          >
            <LinearGradient colors={['#123F2E', '#08251A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.reportsCard}>
              <View style={styles.reportsIconCircle}>
                <DocIcon />
              </View>
              <View style={styles.reportsTextWrap}>
                <Text style={styles.reportsLabel}>MONTHLY REPORTS</Text>
                <Text style={styles.reportsTitle}>Track this month's submissions</Text>
                <Text style={styles.reportsSubtitle}>See who's submitted, review reports, or add one on a child's behalf</Text>
              </View>
              <View style={styles.reportsArrow}>
                <ArrowRightIcon size={19} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : null}

        {/* Manage */}
        <Text style={styles.sectionLabel}>Manage</Text>
        <View style={styles.grid}>
          <ManageCard
            icon={(c) => <ChildrenIcon color={c} />}
            title={studentsLabel}
            description={`View and manage all ${studentsLabel.toLowerCase()}`}
            solid
            onPress={goStudents}
          />
          <ManageCard icon={(c) => <TeacherIcon color={c} />} title="Teachers" description="Manage teachers and permissions" onPress={notWired} />
          <ManageCard icon={(c) => <ClassesIcon color={c} />} title="Classes" description="Manage classes and sections" onPress={notWired} />
          <ManageCard icon={(c) => <FeeIcon color={c} />} title="Fee Reports" description="View and manage fee collections" solid onPress={notWired} />
          <ManageCard icon={(c) => <AttendanceIcon color={c} />} title="Attendance" description="Track attendance records" onPress={notWired} />
        </View>

        {/* Important Notice */}
        <View style={styles.noticeCard}>
          <View style={styles.noticeAccent} />
          <View style={styles.noticeIconCircle}>
            <InfoIcon />
          </View>
          <View style={styles.noticeTextWrap}>
            <Text style={styles.noticeTitle}>Important Notice</Text>
            <Text style={styles.noticeText}>
              {studentsLabel} and Monthly Reports are wired to real data. The rest are placeholders,
              tell me which to build out next.
            </Text>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsRow}>
          <StatCard icon={<ChildrenIcon color={EMERALD} size={20} />} value="-" label={studentsLabel} />
          <StatCard icon={<TeacherIcon color={EMERALD} size={20} />} value="-" label="Teachers" />
          <StatCard icon={<ClassesIcon color={EMERALD} size={20} />} value="-" label="Classes" />
          <StatCard icon={<FeeIcon color={EMERALD} size={20} />} value="-" label="Reports" />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const H_PAD = 20;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 130 },

  /* Parallax background */
  bgLayer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 0 },
  bgGradient: { flex: 1, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' },

  /* Header */
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: H_PAD,
    paddingTop: 54,
    paddingBottom: 30,
  },
  greetingTextWrap: { flex: 1, paddingRight: 12 },
  greetingSmall: { fontSize: 15, color: PALE_GREEN, fontWeight: '500' },
  greetingName: { fontSize: 30, fontWeight: '800', color: '#FFFFFF', marginTop: 6, lineHeight: 36 },
  avatarRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: EMERALD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  avatarDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#5FE38A',
    borderWidth: 2,
    borderColor: '#0F4A34',
  },

  /* Monthly Reports */
  reportsShadow: {
    marginHorizontal: H_PAD,
    borderRadius: 24,
    backgroundColor: '#08251A',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  reportsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 20,
    minHeight: 120,
    overflow: 'hidden',
  },
  reportsIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  reportsTextWrap: { flex: 1, paddingRight: 10 },
  reportsLabel: { color: '#5FE38A', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 5 },
  reportsTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', marginBottom: 5 },
  reportsSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12.5, lineHeight: 18 },
  reportsArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  /* Manage */
  sectionLabel: {
    fontSize: 13,
    color: SUBTLE,
    marginTop: 30,
    marginBottom: 16,
    marginHorizontal: H_PAD,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: H_PAD },
  manageCardWrap: {
    width: '48.5%',
    marginBottom: 14,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  manageCardInner: {
    minHeight: 128,
    borderRadius: 22,
    padding: 16,
    overflow: 'hidden',
  },
  manageCardSoft: { backgroundColor: EMERALD_SOFT },
  manageIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(15,157,88,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  manageIconCircleSolid: { backgroundColor: 'rgba(255,255,255,0.18)' },
  manageTitle: { fontSize: 16, fontWeight: '800' },
  manageDesc: { fontSize: 12, marginTop: 4, lineHeight: 16, paddingRight: 36 },
  manageArrow: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(15,157,88,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageArrowSolid: { backgroundColor: 'rgba(255,255,255,0.2)' },

  /* Important Notice */
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: H_PAD,
    marginTop: 18,
    backgroundColor: EMERALD_SOFT,
    borderRadius: 20,
    padding: 18,
    overflow: 'hidden',
  },
  noticeAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: EMERALD },
  noticeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: EMERALD,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  noticeTextWrap: { flex: 1 },
  noticeTitle: { fontSize: 15, fontWeight: '800', color: EMERALD, marginBottom: 4 },
  noticeText: { fontSize: 12.5, color: INK, lineHeight: 18 },

  /* Statistics */
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: H_PAD, marginTop: 22 },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  statIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: EMERALD_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: INK },
  statLabel: { fontSize: 11, color: SUBTLE, marginTop: 3 },
});
