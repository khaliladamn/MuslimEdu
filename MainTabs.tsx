import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Line } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { getDashboardForRole } from './roleScreens';
import PlaceholderCardScreen from '../screens/common/PlaceholderCardScreen';
import MenuScreen from '../screens/common/MenuScreen';
import OrphanReportScreen from '../screens/orphan/OrphanReportScreen';
import AdminOrphanOverviewScreen from '../screens/orphan/AdminOrphanOverviewScreen';

const EMERALD = '#0F9D58';
const SUBTLE = '#9AA0A6';

const Tab = createBottomTabNavigator();

// --- Inline stroke icons (react-native-svg) ---
function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M3 10.5 12 3l9 7.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5.5 9.5V20h13V9.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9.5 20v-5h5v5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function AdmissionIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect x={5} y={4} width={14} height={17} rx={2} stroke={color} strokeWidth={2} />
      <Path d="M9 4h6v3H9z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M12 11v6M9 14h6" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function ReportsIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Line x1={6} y1={20} x2={6} y2={13} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={12} y1={20} x2={12} y2={8} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={18} y1={20} x2={18} y2={15} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function ChatIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M4 5h16v11H8l-4 4V5z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function MenuIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Line x1={4} y1={7} x2={20} y2={7} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={4} y1={12} x2={20} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={4} y1={17} x2={20} y2={17} stroke={color} strokeWidth={2} strokeLinecap="round" />
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

// Docked, full-width, icon-only tab bar (no floating pill, no labels).
// Active state = emerald icon + emerald indicator bar above it.
function DockedTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const iconRenderer = ICONS[route.name];
        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <View style={[styles.indicator, isFocused && styles.indicatorActive]} />
            {iconRenderer && iconRenderer(isFocused ? EMERALD : SUBTLE)}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function AdmissionPlaceholder() {
  return <PlaceholderCardScreen title="Admission" />;
}
function ChatPlaceholder() {
  return <PlaceholderCardScreen title="Chat" />;
}
function ReportsPlaceholder() {
  return <PlaceholderCardScreen title="Reports" />;
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
      tabBar={(props) => <DockedTabBar {...props} />}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EDEEF0',
    paddingTop: 8,
    // Docked to the bottom edge, full width. No absolute positioning,
    // no rounded pill, no drop shadow: it's part of the layout now.
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  indicator: {
    width: 24,
    height: 3,
    borderRadius: 2,
    marginBottom: 6,
    backgroundColor: 'transparent',
  },
  indicatorActive: { backgroundColor: EMERALD },
});
