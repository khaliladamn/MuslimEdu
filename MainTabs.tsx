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
const NAV_BG = '#0E0F12';
const ACTIVE = '#FFFFFF';
const INACTIVE = '#8A8F98';

const Tab = createBottomTabNavigator();

/* ------------------------- Tab icons ------------------------- */
function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M4 11l8-6 8 6v8a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z" stroke={color} strokeWidth={1.9} strokeLinejoin="round" />
    </Svg>
  );
}
function AdmissionIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M7 3h7l4 4v14H7z" stroke={color} strokeWidth={1.9} strokeLinejoin="round" />
      <Path d="M10 12h6M10 16h6M10 8h3" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}
function ReportsIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M6 20V11M12 20V5M18 20v-6" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function ChatIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M4 5h16v11H9l-5 4z" stroke={color} strokeWidth={1.9} strokeLinejoin="round" />
    </Svg>
  );
}
function MenuIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="4" width="7" height="7" rx="2" stroke={color} strokeWidth={1.9} />
      <Rect x="13" y="4" width="7" height="7" rx="2" stroke={color} strokeWidth={1.9} />
      <Rect x="4" y="13" width="7" height="7" rx="2" stroke={color} strokeWidth={1.9} />
      <Rect x="13" y="13" width="7" height="7" rx="2" stroke={color} strokeWidth={1.9} />
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
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={() => navigation.navigate(route.name)}
              style={[styles.tabItem, isFocused && styles.tabItemActive]}
              activeOpacity={0.8}
            >
              {iconRenderer && iconRenderer(isFocused ? ACTIVE : INACTIVE)}
              {isFocused && <Text style={styles.tabLabel}>{route.name}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: NAV_BG,
    borderRadius: 34,
    paddingVertical: 12,
    paddingHorizontal: 14,
    // Soft floating shadow (iOS). Android uses elevation.
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 24,
    marginHorizontal: 3,
  },
  tabItemActive: {
    backgroundColor: EMERALD,
    paddingHorizontal: 18,
  },
  tabLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', marginLeft: 8 },
});
