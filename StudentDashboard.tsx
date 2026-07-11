import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';
import { EMERALD, EMERALD_SOFT, INK, SUBTLE } from './DashboardShell';
import { fetchReportStatus, ReportStatus } from '../../services/orphanService';
import { Skeleton, SkeletonCircle } from '../../components/Skeleton';

/* ------------------------------------------------------------------ *
 * Palette
 * ------------------------------------------------------------------ */
const DARK_TOP = '#0F4A34';
const DARK_BOTTOM = '#062418';
const PALE_GREEN = '#9FE3BC';
const GLASS_BG = 'rgba(12,44,32,0.62)';
const GLASS_BORDER = 'rgba(255,255,255,0.14)';
const GLASS_DIVIDER = 'rgba(255,255,255,0.10)';
const WHITE = '#FFFFFF';

// Parallax: the dark header background scrolls at 45% of the content speed
// and fades out as it goes, so the cards glide over it and the header melts
// into the white page (Apple-style depth).
const HEADER_BG_H = 500;
const PARALLAX = 0.45;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/* ------------------------------- Icons ------------------------------ */
function PersonIcon({ color = PALE_GREEN, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="3.4" stroke={color} strokeWidth={1.8} />
      <Path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function MailIcon({ color = PALE_GREEN, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="5" width="18" height="14" rx="3" stroke={color} strokeWidth={1.8} />
      <Path d="M4 7l8 6 8-6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IdCardIcon({ color = PALE_GREEN, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="5" width="18" height="14" rx="3" stroke={color} strokeWidth={1.8} />
      <Circle cx="8.5" cy="11" r="2" stroke={color} strokeWidth={1.6} />
      <Path d="M13 10h5M13 13.5h5M5.5 15.5c.6-1.3 1.6-2 3-2s2.4.7 3 2" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}
function PencilIcon({ color = PALE_GREEN, size = 17 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 20h4L18.5 9.5a2 2 0 000-2.8l-1.2-1.2a2 2 0 00-2.8 0L4 16v4z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}
function DocCheckIcon({ color = WHITE, size = 26 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 3h8l4 4v14H6z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M9 13l2 2 4-4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
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
function ChevronRightIcon({ color = EMERALD, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 6l6 6-6 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function ChevronDownIcon({ color = SUBTLE, size = 15 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function CalendarIcon({ color = EMERALD, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="5" width="18" height="16" rx="3" stroke={color} strokeWidth={1.8} />
      <Path d="M3 9h18M8 3v3M16 3v3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function ProgressBarsIcon({ color = EMERALD, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 20V11M12 20V5M18 20v-6" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function BellIcon({ color = EMERALD, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M10 20a2 2 0 004 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function DocumentIcon({ color = EMERALD, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 3h7l4 4v14H7z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M10 12h6M10 16h6" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}
function StarIcon({ color = EMERALD, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  );
}
function CheckCircleIcon({ color = EMERALD, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} />
      <Path d="M8 12l3 3 5-6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function ClockIcon({ color = EMERALD, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} />
      <Path d="M12 7v5l3.5 2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/* --------------------------- Building blocks --------------------------- */
function GlassRow({
  icon,
  label,
  value,
  divider,
}: {
  icon: React.ReactElement;
  label: string;
  value?: string | null;
  divider?: boolean;
}) {
  if (!value) return null;
  return (
    <View>
      <View style={styles.glassRow}>
        <View style={styles.glassRowLeft}>
          {icon}
          <Text style={styles.glassRowLabel}>{label}</Text>
        </View>
        <Text style={styles.glassRowValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
      {divider ? <View style={styles.glassDivider} /> : null}
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
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={[styles.quickCardWrap, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={styles.quickCard}
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start()}
      >
        <View>
          <View style={styles.quickIconWrap}>{icon}</View>
          {!!badge && badge > 0 ? (
            <View style={styles.quickBadge}>
              <Text style={styles.quickBadgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.quickTitle}>{title}</Text>
        <Text style={styles.quickDescription}>{description}</Text>
        <View style={styles.quickArrowButton}>
          <ArrowRightIcon size={16} />
        </View>
        <View style={styles.quickAccentBar} />
      </TouchableOpacity>
    </Animated.View>
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
  const { width } = useWindowDimensions();
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
      .catch(() => {})
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
    Alert.alert('Coming soon', `${title} isn't wired up yet.`);
  }, []);

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

  // Parallax + fade for the dark background layer.
  const bgTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_BG_H],
    outputRange: [0, -HEADER_BG_H * PARALLAX],
    extrapolate: 'clamp',
  });
  const bgOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_BG_H * 0.62, HEADER_BG_H],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.flex}>
      {/* -------- Parallax dark background layer -------- */}
      <Animated.View
        style={[
          styles.bgLayer,
          { height: HEADER_BG_H, opacity: bgOpacity, transform: [{ translateY: bgTranslate }] },
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={[DARK_TOP, DARK_BOTTOM]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.4, y: 1 }}
          style={styles.bgGradient}
        >
          <Svg style={StyleSheet.absoluteFill} width={width} height={HEADER_BG_H}>
            <Circle cx={width - 40} cy={70} r={130} fill="#FFFFFF" opacity={0.03} />
            <Circle cx={width - 90} cy={30} r={70} fill="#FFFFFF" opacity={0.04} />
            <Path d={`M0 130 Q${width * 0.35} 70 ${width} 160`} stroke="#FFFFFF" strokeWidth={1.2} opacity={0.06} fill="none" />
            <Path d={`M0 185 Q${width * 0.45} 120 ${width} 215`} stroke="#FFFFFF" strokeWidth={1.2} opacity={0.05} fill="none" />
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

        {/* Profile glass card */}
        <View style={styles.glassCard}>
          <View style={styles.glassHeaderRow}>
            <View style={styles.glassHeaderLeft}>
              <View style={styles.glassIconCircle}>
                <PersonIcon />
              </View>
              <View>
                <Text style={styles.glassTitle}>Profile</Text>
                <Text style={styles.glassSubtitle}>Your personal information</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              hitSlop={8}
              activeOpacity={0.8}
              onPress={() => handlePlaceholderPress('Editing your profile')}
            >
              <PencilIcon />
            </TouchableOpacity>
          </View>

          <View style={styles.glassDivider} />

          <GlassRow icon={<PersonIcon size={19} />} label="Name" value={user?.name} divider />
          <GlassRow icon={<MailIcon size={19} />} label="Email" value={user?.email} divider={!!user?.code} />
          {user?.code ? <GlassRow icon={<IdCardIcon size={19} />} label="Student Code" value={user.code} /> : null}
        </View>

        {/* Monthly Report */}
        <TouchableOpacity activeOpacity={0.9} onPress={handleMonthlyReportPress} style={styles.reportShadow}>
          <LinearGradient
            colors={['#17B368', '#0B7A46']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.reportCard}
          >
            <View style={styles.reportIconCircle}>
              <DocCheckIcon />
            </View>
            <View style={styles.reportTextWrap}>
              <Text style={styles.reportTitle}>Monthly Report</Text>
              <Text style={styles.reportSubtitle}>
                {isOrphan && status?.submitted_this_month
                  ? 'Submitted for this month, view your history any time'
                  : 'Submit how your month went, and see your submission history'}
              </Text>
            </View>
            <View style={styles.reportArrowButton}>
              <ArrowRightIcon size={20} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.viewAllRow}
            onPress={() => handlePlaceholderPress('Viewing all quick actions')}
            activeOpacity={0.8}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <ChevronRightIcon size={15} />
          </TouchableOpacity>
        </View>

        <View style={styles.quickRow}>
          <QuickActionCard
            icon={<CalendarIcon />}
            title="My Reports"
            description="View your report submissions"
            onPress={
              isOrphan ? () => (navigation as any).navigate('OrphanReport') : () => handlePlaceholderPress('My Reports')
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
              activeOpacity={0.8}
            >
              <Text style={styles.monthPillText}>{monthLabel}</Text>
              <ChevronDownIcon />
            </TouchableOpacity>
          </View>

          {isLoadingStatus ? (
            <View style={styles.statsRow}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={styles.statItem}>
                  <SkeletonCircle size={42} />
                  <Skeleton width={34} height={20} style={styles.mb6} />
                  <Skeleton width={54} height={10} />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.statsRow}>
              <StatItem icon={<DocumentIcon />} value={reportsSubmitted} label="Reports Submitted" />
              <View style={styles.statDivider} />
              <StatItem
                icon={<StarIcon />}
                value={averageScore}
                unit={averageScore !== '-' ? '%' : undefined}
                label="Average Score"
              />
              <View style={styles.statDivider} />
              <StatItem icon={<CheckCircleIcon />} value="-" label="Activities Completed" />
              <View style={styles.statDivider} />
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

const H_PAD = 20;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 130 },

  /* Parallax background */
  bgLayer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 0 },
  bgGradient: { flex: 1, borderBottomLeftRadius: 44, borderBottomRightRadius: 44, overflow: 'hidden' },

  /* Greeting */
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: H_PAD,
    paddingTop: 54,
    paddingBottom: 20,
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

  /* Profile glass card */
  glassCard: {
    marginHorizontal: H_PAD,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: 26,
    padding: 22,
  },
  glassHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  glassHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  glassIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  glassTitle: { fontSize: 19, fontWeight: '800', color: '#FFFFFF' },
  glassSubtitle: { fontSize: 12.5, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassDivider: { height: 1, backgroundColor: GLASS_DIVIDER, marginVertical: 6 },
  glassRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  glassRowLeft: { flexDirection: 'row', alignItems: 'center' },
  glassRowLabel: { fontSize: 15, color: 'rgba(255,255,255,0.62)', marginLeft: 12 },
  glassRowValue: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', flexShrink: 1, textAlign: 'right', marginLeft: 12 },

  /* Monthly Report */
  reportShadow: {
    marginHorizontal: H_PAD,
    marginTop: 28,
    borderRadius: 24,
    backgroundColor: '#0B7A46',
    shadowColor: EMERALD,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 20,
    minHeight: 118,
    overflow: 'hidden',
  },
  reportIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  reportTextWrap: { flex: 1, paddingRight: 12 },
  reportTitle: { color: '#FFFFFF', fontSize: 19, fontWeight: '800' },
  reportSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12.5, marginTop: 6, lineHeight: 18 },
  reportArrowButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Section header */
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: H_PAD,
    marginTop: 34,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: INK },
  viewAllRow: { flexDirection: 'row', alignItems: 'center' },
  viewAllText: { fontSize: 14, fontWeight: '700', color: EMERALD, marginRight: 3 },

  /* Quick actions */
  quickRow: { flexDirection: 'row', paddingHorizontal: H_PAD - 5 },
  quickCardWrap: { flex: 1, marginHorizontal: 5 },
  quickCard: {
    minHeight: 188,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  quickIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: EMERALD_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  quickBadge: {
    position: 'absolute',
    top: -4,
    left: 32,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: EMERALD,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  quickBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  quickTitle: { fontSize: 15, fontWeight: '800', color: INK, marginBottom: 5 },
  quickDescription: { fontSize: 11.5, color: SUBTLE, lineHeight: 16 },
  quickArrowButton: {
    position: 'absolute',
    right: 15,
    bottom: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: EMERALD_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAccentBar: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, backgroundColor: EMERALD },

  /* Overview */
  overviewCard: {
    marginHorizontal: H_PAD,
    marginTop: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  overviewHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  overviewTitle: { fontSize: 17, fontWeight: '800', color: INK },
  monthPill: { flexDirection: 'row', alignItems: 'center' },
  monthPillText: { fontSize: 13.5, color: SUBTLE, fontWeight: '600', marginRight: 5 },
  mb6: { marginBottom: 6, marginTop: 10 },
  statsRow: { flexDirection: 'row', alignItems: 'flex-start' },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, alignSelf: 'stretch', backgroundColor: '#EEF1F4', marginHorizontal: 2 },
  statIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: EMERALD_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValueRow: { flexDirection: 'row', alignItems: 'flex-end' },
  statValue: { fontSize: 22, fontWeight: '800', color: INK },
  statUnit: { fontSize: 12, fontWeight: '700', color: INK, marginLeft: 1, marginBottom: 2 },
  statLabel: { fontSize: 10.5, color: SUBTLE, textAlign: 'center', marginTop: 5, lineHeight: 14 },

  /* Note */
  noteBox: { marginHorizontal: H_PAD, marginTop: 20, backgroundColor: EMERALD_SOFT, borderRadius: 16, padding: 16 },
  noteText: { fontSize: 13, color: INK, lineHeight: 19 },
});
