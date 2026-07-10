import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path, Line } from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';
import { EMERALD, EMERALD_SOFT, INK, SUBTLE } from './DashboardShell';
import { fetchReportStatus, ReportStatus } from '../../services/orphanService';

// --- Depth layer sizing -----------------------------------------------
// The gradient hero covers the greeting + Profile card. It's a separate
// Animated layer sitting behind the ScrollView content, so it can move
// and fade independently of the cards scrolling on top of it.
const HERO_HEIGHT = 430;
const PARALLAX_FACTOR = 0.5; // background travels at half the content's scroll speed

const DARK_TOP = '#123F2E';
const DARK_BOTTOM = '#04140D';
const PALE_GREEN = '#8FD9AE';
const GLASS_BG = 'rgba(255,255,255,0.07)';
const GLASS_BORDER = 'rgba(255,255,255,0.14)';
const GLASS_DIVIDER = 'rgba(255,255,255,0.12)';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// --- Inline icons (react-native-svg, matches LoginScreen's approach) ---
function PersonIcon({ color = PALE_GREEN, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={3.6} stroke={color} strokeWidth={1.7} />
      <Path d="M5 20c0-3.6 3.1-6.2 7-6.2s7 2.6 7 6.2" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}
function MailIcon({ color = PALE_GREEN, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6.5C3 5.67 3.67 5 4.5 5h15c.83 0 1.5.67 1.5 1.5v11c0 .83-.67 1.5-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11Z" stroke={color} strokeWidth={1.6} />
      <Path d="M4 6.5 12 13l8-6.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IdCardIcon({ color = PALE_GREEN, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={5} width={18} height={14} rx={2} stroke={color} strokeWidth={1.6} />
      <Circle cx={8.5} cy={11} r={1.8} stroke={color} strokeWidth={1.4} />
      <Line x1={13} y1={10} x2={18} y2={10} stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      <Line x1={13} y1={13} x2={18} y2={13} stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}
function PencilIcon({ color = PALE_GREEN, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 20h4l10.5-10.5a1.5 1.5 0 0 0 0-2.1l-1.9-1.9a1.5 1.5 0 0 0-2.1 0L4 16v4Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Line x1={13.5} y1={7} x2={17} y2={10.5} stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}
function DocCheckIcon({ color = '#FFFFFF', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 3.5h7.5L18 7v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Path d="M9 13.2l2 2 4-4.4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function ArrowRightIcon({ color = EMERALD, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1={4} y1={12} x2={19} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M13.5 6.5 19 12l-5.5 5.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function ChevronRightIcon({ color = EMERALD, size = 15 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function ChevronDownIcon({ color = SUBTLE, size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function CalendarIcon({ color = EMERALD, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3.5} y={5} width={17} height={15} rx={2.5} stroke={color} strokeWidth={1.6} />
      <Line x1={3.5} y1={9.5} x2={20.5} y2={9.5} stroke={color} strokeWidth={1.6} />
      <Line x1={8} y1={3} x2={8} y2={6.5} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Line x1={16} y1={3} x2={16} y2={6.5} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}
function ProgressBarsIcon({ color = EMERALD, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={13} width={3.4} height={7} rx={1.2} stroke={color} strokeWidth={1.6} />
      <Rect x={10.3} y={8} width={3.4} height={12} rx={1.2} stroke={color} strokeWidth={1.6} />
      <Rect x={16.6} y={4} width={3.4} height={16} rx={1.2} stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}
function BellIcon({ color = EMERALD, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 10.5a6 6 0 0 1 12 0v4.2l1.6 2.3H4.4L6 14.7v-4.2Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Path d="M9.5 19.5a2.5 2.5 0 0 0 5 0" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}
function DocumentIcon({ color = EMERALD, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 3.5h7.5L18 7v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Line x1={9} y1={12} x2={15} y2={12} stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      <Line x1={9} y1={15.5} x2={13} y2={15.5} stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}
function StarIcon({ color = EMERALD, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.2-4.1 5.8-.8L12 3.5Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
function CheckCircleIcon({ color = EMERALD, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={1.6} />
      <Path d="M8.5 12.3l2.2 2.2 4.3-4.8" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function ClockIcon({ color = EMERALD, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={1.6} />
      <Path d="M12 7.5V12l3 2" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function GlassRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactElement;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <View style={styles.glassRow}>
      <View style={styles.glassRowLeft}>
        {icon}
        <Text style={styles.glassRowLabel}>{label}</Text>
      </View>
      <Text style={styles.glassRowValue}>{value}</Text>
    </View>
  );
}

function QuickActionCard({
  icon,
  title,
  description,
  badge,
  onPress,
}: {
  icon: React.ReactElement;
  title: string;
  description: string;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickCard} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.quickIconWrap}>
        {icon}
        {!!badge && badge > 0 ? (
          <View style={styles.quickBadge}>
            <Text style={styles.quickBadgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickDescription}>{description}</Text>
      <View style={styles.quickArrowButton}>
        <ArrowRightIcon color={EMERALD} size={15} />
      </View>
      <View style={styles.quickAccentBar} />
    </TouchableOpacity>
  );
}

function StatItem({
  icon,
  value,
  unit,
  label,
}: {
  icon: React.ReactElement;
  value: string;
  unit?: string;
  label: string;
}) {
  return (
    <View style={styles.statItem}>
      <View style={styles.statIconWrap}>{icon}</View>
      <View style={styles.statValueRow}>
        <Text style={styles.statValue}>{value}</Text>
        {unit ? <Text style={styles.statUnit}>{unit}</Text> : null}
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function StudentDashboard() {
  const { user, token } = useAuth();
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;

  const isOrphan = !!user?.is_orphan;
  const initial = user?.name?.trim()?.[0]?.toUpperCase() ?? '?';

  const [status, setStatus] = useState<ReportStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(isOrphan);

  useEffect(() => {
    if (!isOrphan || !token) {
      setIsLoadingStatus(false);
      return;
    }
    let cancelled = false;
    setIsLoadingStatus(true);
    fetchReportStatus(token)
      .then((data) => {
        if (!cancelled) setStatus(data);
      })
      .catch(() => {
        // Silent - the overview stats just fall back to placeholders below.
      })
      .finally(() => {
        if (!cancelled) setIsLoadingStatus(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOrphan, token]);

  const handleMonthlyReportPress = useCallback(() => {
    if (isOrphan) {
      (navigation as any).navigate('OrphanReport');
    } else {
      Alert.alert('Coming soon', 'Monthly reports for this account type are on the way.');
    }
  }, [isOrphan, navigation]);

  const handlePlaceholderPress = useCallback((title: string) => {
    Alert.alert('Coming soon', `${title} isn't wired up yet - tell me which to build out next.`);
  }, []);

  // --- Overview stats: wired to real submission history for orphan
  // students (the only report data the backend currently exposes).
  // Activities/Time Spent have no backing endpoint yet, so they stay as
  // an honest "-" instead of a made-up number.
  const history = status?.history ?? [];
  const reportsSubmitted = isOrphan ? String(history.length) : '0';
  const ratings = history.flatMap((r) =>
    [r.academic_rating, r.wellbeing_rating].filter((n): n is number => n != null),
  );
  const averageScore =
    isOrphan && ratings.length > 0
      ? `${Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length / 5) * 100)}`
      : '-';

  const now = new Date();
  const monthLabel = `${MONTH_NAMES[now.getMonth()].slice(0, 3)} ${now.getFullYear()}`;

  // --- Parallax + fade for the background layer only. Foreground content
  // (greeting, cards) scrolls in the ScrollView at normal speed, so it
  // visibly "moves over" this slower, fading layer underneath.
  const bgTranslateY = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT],
    outputRange: [0, -HERO_HEIGHT * PARALLAX_FACTOR],
    extrapolate: 'clamp',
  });
  const bgOpacity = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT * 0.55, HERO_HEIGHT],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.flex}>
      <Animated.View
        style={[
          styles.bgLayer,
          { height: HERO_HEIGHT, opacity: bgOpacity, transform: [{ translateY: bgTranslateY }] },
        ]}
        pointerEvents="none"
      >
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="heroGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={DARK_TOP} />
              <Stop offset="1" stopColor={DARK_BOTTOM} />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width="100%" height="100%" fill="url(#heroGradient)" />
          <Circle cx="88%" cy="10%" r={90} fill="#FFFFFF" opacity={0.04} />
          <Circle cx="8%" cy="34%" r={60} fill="#FFFFFF" opacity={0.03} />
          <Path
            d="M0 120 Q 90 90 180 120 T 360 110 T 540 130"
            stroke="#FFFFFF"
            strokeOpacity={0.05}
            strokeWidth={1.5}
            fill="none"
          />
        </Svg>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollFlex}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greetingSmall}>Assalamu Alaykum,</Text>
            <Text style={styles.greetingName}>{user?.name}</Text>
          </View>
          <TouchableOpacity onPress={() => (navigation as any).navigate('Menu')} hitSlop={10}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarInner}>
                <Text style={styles.avatarInitial}>{initial}</Text>
              </View>
              <View style={styles.avatarDot} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Profile - glass card over the dark hero */}
        <View style={styles.glassCard}>
          <View style={styles.glassHeaderRow}>
            <View style={styles.glassHeaderLeft}>
              <View style={styles.glassIconCircle}>
                <PersonIcon color={PALE_GREEN} size={20} />
              </View>
              <View>
                <Text style={styles.glassTitle}>Profile</Text>
                <Text style={styles.glassSubtitle}>Your personal information</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handlePlaceholderPress('Editing your profile')}
              hitSlop={8}
            >
              <PencilIcon />
            </TouchableOpacity>
          </View>

          <View style={styles.glassDivider} />
          <GlassRow icon={<PersonIcon />} label="Name" value={user?.name} />
          <View style={styles.glassDivider} />
          <GlassRow icon={<MailIcon />} label="Email" value={user?.email} />
          {user?.code ? (
            <>
              <View style={styles.glassDivider} />
              <GlassRow icon={<IdCardIcon />} label="Student Code" value={user.code} />
            </>
          ) : null}
        </View>

        {/* Monthly Report hero card */}
        <TouchableOpacity style={styles.reportCard} activeOpacity={0.9} onPress={handleMonthlyReportPress}>
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <LinearGradient id="reportGradient" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#1AAE6B" />
                <Stop offset="1" stopColor="#0B5C39" />
              </LinearGradient>
            </Defs>
            <Rect x={0} y={0} width="100%" height="100%" rx={22} fill="url(#reportGradient)" />
          </Svg>
          <View style={styles.reportIconCircle}>
            <DocCheckIcon />
          </View>
          <View style={styles.reportTextWrap}>
            <Text style={styles.reportTitle}>Monthly Report</Text>
            <Text style={styles.reportSubtitle}>
              {isOrphan && status?.submitted_this_month
                ? 'Submitted for this month - view your history any time'
                : 'Submit how your month went, and see your submission history'}
            </Text>
          </View>
          <View style={styles.reportArrowButton}>
            <ArrowRightIcon color={EMERALD} size={20} />
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.viewAllRow}
            onPress={() => handlePlaceholderPress('Viewing all quick actions')}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <ChevronRightIcon size={13} />
          </TouchableOpacity>
        </View>

        <View style={styles.quickRow}>
          <QuickActionCard
            icon={<CalendarIcon />}
            title="My Reports"
            description="View your report submissions"
            onPress={
              isOrphan
                ? () => (navigation as any).navigate('OrphanReport')
                : () => handlePlaceholderPress('My Reports')
            }
          />
          <QuickActionCard
            icon={<ProgressBarsIcon />}
            title="My Progress"
            description="Track your learning progress"
            onPress={() => handlePlaceholderPress('My Progress')}
          />
          <QuickActionCard
            icon={<BellIcon />}
            title="Notifications"
            description="Stay updated with important alerts"
            badge={0}
            onPress={() => handlePlaceholderPress('Notifications')}
          />
        </View>

        {/* This Month Overview */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewHeaderRow}>
            <Text style={styles.overviewTitle}>This Month Overview</Text>
            <TouchableOpacity
              style={styles.monthPill}
              onPress={() => handlePlaceholderPress('Choosing a different month')}
            >
              <Text style={styles.monthPillText}>{monthLabel}</Text>
              <ChevronDownIcon />
            </TouchableOpacity>
          </View>

          {isLoadingStatus ? (
            <View style={styles.overviewLoading}>
              <ActivityIndicator color={EMERALD} />
            </View>
          ) : (
            <View style={styles.statsRow}>
              <StatItem icon={<DocumentIcon />} value={reportsSubmitted} label="Reports Submitted" />
              <StatItem
                icon={<StarIcon />}
                value={averageScore}
                unit={averageScore !== '-' ? '%' : undefined}
                label="Average Score"
              />
              <StatItem icon={<CheckCircleIcon />} value="-" label="Activities Completed" />
              <StatItem icon={<ClockIcon />} value="-" label="Time Spent" />
            </View>
          )}
        </View>

        {isOrphan ? (
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              Reports Submitted and Average Score are wired to your real submission history.
              Activities Completed and Time Spent will connect once those features are built.
            </Text>
          </View>
        ) : null}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  bgLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  scrollFlex: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 130 },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 60,
    paddingBottom: 24,
  },
  greetingSmall: { fontSize: 14, color: PALE_GREEN },
  greetingName: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginTop: 4 },
  avatarRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: EMERALD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  avatarDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#5FE38A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  glassCard: {
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  glassHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  glassHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  glassIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  glassTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  glassSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassDivider: { height: 1, backgroundColor: GLASS_DIVIDER, marginVertical: 4 },
  glassRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  glassRowLeft: { flexDirection: 'row', alignItems: 'center' },
  glassRowLabel: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginLeft: 10 },
  glassRowValue: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', flexShrink: 1, textAlign: 'right', marginLeft: 12 },

  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    padding: 20,
    marginBottom: 28,
    overflow: 'hidden',
  },
  reportIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  reportTextWrap: { flex: 1 },
  reportTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  reportSubtitle: { color: 'rgba(255,255,255,0.82)', fontSize: 12, marginTop: 5, lineHeight: 17 },
  reportArrowButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 19, fontWeight: '700', color: INK },
  viewAllRow: { flexDirection: 'row', alignItems: 'center' },
  viewAllText: { fontSize: 13, fontWeight: '700', color: EMERALD, marginRight: 2 },

  quickRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    overflow: 'hidden',
  },
  quickIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: EMERALD_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: EMERALD,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  quickBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  quickTitle: { fontSize: 14, fontWeight: '700', color: INK, marginBottom: 4 },
  quickDescription: { fontSize: 11, color: SUBTLE, lineHeight: 15, marginBottom: 10 },
  quickArrowButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: EMERALD_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  quickAccentBar: {
    height: 3,
    backgroundColor: EMERALD,
    marginHorizontal: -14,
    marginBottom: -14,
    marginTop: 12,
  },

  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  overviewHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  overviewTitle: { fontSize: 16, fontWeight: '700', color: INK },
  monthPill: { flexDirection: 'row', alignItems: 'center' },
  monthPillText: { fontSize: 13, color: SUBTLE, fontWeight: '600', marginRight: 4 },
  overviewLoading: { paddingVertical: 24, alignItems: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { flex: 1, alignItems: 'center' },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: EMERALD_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValueRow: { flexDirection: 'row', alignItems: 'flex-end' },
  statValue: { fontSize: 22, fontWeight: '800', color: INK },
  statUnit: { fontSize: 12, fontWeight: '700', color: INK, marginLeft: 1, marginBottom: 2 },
  statLabel: { fontSize: 11, color: SUBTLE, textAlign: 'center', marginTop: 4, lineHeight: 14 },

  noteBox: {
    marginTop: 20,
    backgroundColor: EMERALD_SOFT,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: EMERALD,
  },
  noteText: { fontSize: 13, color: INK, lineHeight: 19 },
});
