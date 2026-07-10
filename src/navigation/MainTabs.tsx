import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { getDashboardForRole } from './roleScreens';
import PlaceholderCardScreen from '../screens/common/PlaceholderCardScreen';
import MenuScreen from '../screens/common/MenuScreen';
import OrphanReportScreen from '../screens/orphan/OrphanReportScreen';
import AdminOrphanOverviewScreen from '../screens/orphan/AdminOrphanOverviewScreen';

const EMERALD = '#0F9D58';
const SUBTLE = '#9AA0A6';

const Tab = createBottomTabNavigator();

// --- Small inline tab icons (react-native-svg, matches LoginScreen's approach) ---
function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M4 10.5 12 4l8 6.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6 9.5V19a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1V9.5" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}
function AdmissionIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={5} y={3} width={14} height={18} rx={2} stroke={color} strokeWidth={1.8} />
      <Line x1={9} y1={8} x2={15} y2={8} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={9} y1={12} x2={15} y2={12} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={9} y1={16} x2={12} y2={16} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function ReportsIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Line x1={5} y1={20} x2={5} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={12} y1={20} x2={12} y2={7} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={19} y1={20} x2={19} y2={15} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function ChatIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 5.5C4 4.67 4.67 4 5.5 4h13c.83 0 1.5.67 1.5 1.5v10c0 .83-.67 1.5-1.5 1.5H9l-4 3.5v-3.5h-.5A1.5 1.5 0 0 1 3 15.5v-10Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
function MenuIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} />
      <Path d="M9 12h6M12 9v6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

const ICONS: Record<string, (color: string) => React.ReactElement> = {
  Home: (c) => <HomeIcon color={c} />,
  Admission: (c) => <AdmissionIcon color={c} />,
  Reports: (c) => <ReportsIcon color={c} />,
  Chat: (c) => <ChatIcon color={c} />,
  Menu: (c) => <MenuIcon color={c} />,
};

function FloatingTabBar({ state, navigation }: any) {
  return (
    <View style={styles.tabBarWrapper} pointerEvents="box-none">
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const iconRenderer = ICONS[route.name];

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={[styles.tabItem, isFocused && styles.tabItemActive]}
              activeOpacity={0.75}
            >
              {iconRenderer && iconRenderer(isFocused ? '#FFFFFF' : SUBTLE)}
              {isFocused && <Text style={styles.tabLabel}>{route.name}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function AdmissionPlaceholder() {
  return (
    <PlaceholderCardScreen
      title="Admission"
      emoji="🎓"
      description="New student admissions will be managed here - applications, approvals, and enrollment."
    />
  );
}
function ChatPlaceholder() {
  return (
    <PlaceholderCardScreen
      title="Chat"
      emoji="💬"
      description="Messaging between school staff, teachers, and families is coming soon."
    />
  );
}
function ReportsPlaceholder() {
  return (
    <PlaceholderCardScreen
      title="Reports"
      emoji="📊"
      description="Academic and activity reports for this role will appear here."
    />
  );
}

function HomeRouter() {
  const { user } = useAuth();
  if (!user) return null;
  return getDashboardForRole(user.role);
}

function ReportsRouter() {
  const { user } = useAuth();
  if (!user) return null;

  const isAdmin = user.role === 'admin' || user.role === 'superadmin';

  if (user.is_orphan) {
    return isAdmin ? <AdminOrphanOverviewScreen /> : <OrphanReportScreen />;
  }
  return <ReportsPlaceholder />;
}

export default function MainTabs() {
  const { user } = useAuth();
  if (!user) return null;

  const isAdminRole = user.role === 'admin' || user.role === 'superadmin';

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeRouter} />

      {isAdminRole && <Tab.Screen name="Admission" component={AdmissionPlaceholder} />}

      <Tab.Screen name="Reports" component={ReportsRouter} />

      <Tab.Screen name="Chat" component={ChatPlaceholder} />
      <Tab.Screen name="Menu" component={MenuScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingBottom: 28,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#EDEEF0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    // No `elevation` here on purpose - Android renders elevation shadows on
    // rounded views as a hard rectangular gray box instead of a soft shadow,
    // which showed up as a "strange bar" beneath the floating tab bar.
    // shadowColor/shadowOpacity/etc are iOS-only, so Android simply has no
    // shadow here - a clean tradeoff over the visual artifact.
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 2,
  },
  tabItemActive: { backgroundColor: EMERALD },
  tabLabel: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', marginLeft: 6 },
});
